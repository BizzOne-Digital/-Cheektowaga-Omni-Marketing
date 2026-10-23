import 'server-only'
import { getAdmin, sameOrigin, type Admin } from './auth'
import { fail, HttpError } from './validate'

/**
 * Wraps every /api/admin/* handler: same-origin check on writes, server-side session check,
 * and safe errors (details go to the server log, never to the response).
 */
export function adminRoute<P = object>(handler: (req: Request, params: P, admin: Admin) => Promise<Response>) {
  return async (req: Request, ctx: { params: Promise<P> }) => {
    if (req.method !== 'GET' && !sameOrigin(req)) return fail(403, 'Forbidden.')
    const admin = await getAdmin()
    if (!admin) return fail(401, 'Please sign in again.')
    try {
      return await handler(req, await ctx.params, admin)
    } catch (err) {
      if (err instanceof HttpError) return fail(err.status, err.message)
      console.error(`[admin api] ${req.method} ${new URL(req.url).pathname}:`, err)
      return fail(500, 'Something went wrong. Please try again.')
    }
  }
}
