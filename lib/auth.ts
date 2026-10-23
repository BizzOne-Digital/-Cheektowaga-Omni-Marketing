import 'server-only'
import { createHmac, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'
import { cols, dbConfigured } from './db'
import { hashPassword, passwordProblem } from './password'

// Admin sessions: a random token in an HTTP-only cookie; MongoDB keeps only its HMAC, so a database
// leak can't be replayed as a login. Logout deletes the record; a TTL index purges expired ones.
const secret = process.env.SESSION_SECRET?.trim() ?? ''
export const authConfigured = dbConfigured && secret.length >= 32
if (process.env.SESSION_SECRET && secret.length < 32) console.error('[auth] SESSION_SECRET must be at least 32 characters — admin login disabled.')

export const SESSION_COOKIE = 'asw_admin'
const SESSION_HOURS = 8

const hmac = (value: string) => createHmac('sha256', secret || 'asw').update(value).digest('hex')

export type Admin = { id: string; email: string }

export async function createSession(adminId: ObjectId) {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600_000)
  await (await cols()).sessions.insertOne({ _id: hmac(token), adminId, expiresAt, createdAt: new Date() })
  ;(await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // also the CSRF defence, with the Origin check in sameOrigin()
    path: '/',
    expires: expiresAt,
  })
}

/** The signed-in admin, or null. Every admin page and API route goes through this. */
export async function getAdmin(): Promise<Admin | null> {
  if (!authConfigured) return null
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token || token.length > 64) return null
  try {
    const c = await cols()
    const session = await c.sessions.findOne({ _id: hmac(token), expiresAt: { $gt: new Date() } })
    if (!session) return null
    const admin = await c.admins.findOne({ _id: session.adminId }, { projection: { email: 1 } })
    return admin ? { id: admin._id.toHexString(), email: admin.email } : null
  } catch (err) {
    console.error('[auth] session lookup failed:', (err as Error).message)
    return null
  }
}

export async function destroySession() {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  jar.delete(SESSION_COOKIE)
  if (token && token.length <= 64) await (await cols()).sessions.deleteOne({ _id: hmac(token) }).catch(() => {})
}

/**
 * Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD if that account doesn't exist yet
 * (same rule as `pnpm seed`). Never changes an existing admin's password.
 */
export async function ensureInitialAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!email || passwordProblem(password)) return
  const { admins } = await cols()
  if (await admins.findOne({ email }, { projection: { _id: 1 } })) return
  const passwordHash = await hashPassword(password!)
  await admins
    .updateOne({ email }, { $setOnInsert: { _id: new ObjectId(), email, passwordHash, createdAt: new Date() } }, { upsert: true })
    .catch((err) => {
      if (err.code !== 11000) throw err // another request created it first
    })
}

/** Client IP from Vercel's proxy header. Falls back to a shared bucket locally. */
export const clientIp = (req: Request) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'

/**
 * Fixed-window counter in MongoDB (works across serverless instances).
 * Returns false once `limit` hits within `windowSec`. Keys are hashed, so no raw IPs or emails are stored.
 */
export async function rateLimit(name: string, id: string, limit: number, windowSec: number) {
  const window = Math.floor(Date.now() / 1000 / windowSec)
  const doc = await (await cols()).rateLimits.findOneAndUpdate(
    { _id: `${name}:${hmac(id).slice(0, 32)}:${window}` },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 1) * windowSec * 1000) } },
    { upsert: true, returnDocument: 'after' },
  )
  return (doc?.count ?? 0) <= limit
}

/** Rejects cross-site writes: the browser's Origin must match the host it's posting to. */
export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  if (!origin || !host) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}
