import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto'

// scrypt (memory-hard KDF from Node's standard library). Stored as scrypt$N$r$p$salt$hash.
// No server-only import: scripts/seed.mjs uses this too.
const N = 2 ** 15
const r = 8
const p = 1
const KEYLEN = 64

const derive = (password: string, salt: Buffer, opts: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password.normalize('NFKC'), salt, KEYLEN, { ...opts, maxmem: 256 * 1024 * 1024 }, (err, key) => (err ? reject(err) : resolve(key))),
  )

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const key = await derive(password, salt, { N, r, p })
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${key.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, n, rr, pp, salt, hash] = stored.split('$')
  if (alg !== 'scrypt' || !salt || !hash) return false
  const expected = Buffer.from(hash, 'base64')
  const key = await derive(password, Buffer.from(salt, 'base64'), { N: Number(n), r: Number(rr), p: Number(pp) })
  return key.length === expected.length && timingSafeEqual(key, expected)
}

// Initial admin password rules (ADMIN_PASSWORD).
export const passwordProblem = (pw: string | undefined) =>
  !pw ? 'ADMIN_PASSWORD is not set' : pw.length < 12 ? 'ADMIN_PASSWORD must be at least 12 characters' : null
