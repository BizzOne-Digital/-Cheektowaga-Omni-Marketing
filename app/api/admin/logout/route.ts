import { destroySession, sameOrigin } from '@/lib/auth'
import { fail, ok } from '@/lib/validate'

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, 'Forbidden.')
  await destroySession()
  return ok({ ok: true })
}
