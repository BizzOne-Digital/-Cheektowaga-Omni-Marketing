import { authConfigured, clientIp, createSession, ensureInitialAdmin, rateLimit, sameOrigin } from '@/lib/auth'
import { cols } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password'
import { fail, ok } from '@/lib/validate'

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
let dummyHash: Promise<string> | undefined

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, 'Forbidden.')
  if (!authConfigured) {
    console.error('[admin login] needs MONGODB_URI and SESSION_SECRET (32+ characters)')
    return fail(503, 'Admin sign-in is not configured on this server.')
  }

  const b = (await req.json().catch(() => null)) as { email?: unknown; password?: unknown } | null
  const email = typeof b?.email === 'string' ? b.email.trim().toLowerCase().slice(0, 200) : ''
  const password = typeof b?.password === 'string' ? b.password.slice(0, 200) : ''
  if (!email || !password) return fail(400, 'Enter your email and password.')

  try {
    // 10 tries per IP and 5 per account every 15 minutes.
    const [ipOk, emailOk] = await Promise.all([rateLimit('login-ip', clientIp(req), 10, 900), rateLimit('login-email', email, 5, 900)])
    if (!ipOk || !emailOk) return fail(429, 'Too many sign-in attempts. Please wait 15 minutes and try again.')

    await ensureInitialAdmin()
    const { admins } = await cols()
    const admin = await admins.findOne({ email })
    dummyHash ??= hashPassword('not-a-real-password')
    const valid = await verifyPassword(password, admin?.passwordHash ?? (await dummyHash))
    if (!admin || !valid) return fail(401, 'Email or password is incorrect.')

    await admins.updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } })
    await createSession(admin._id)
    return ok({ ok: true })
  } catch (err) {
    console.error('[admin login] failed:', (err as Error).message)
    return fail(503, 'Sign-in is temporarily unavailable. Please try again shortly.')
  }
}
