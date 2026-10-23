import 'server-only'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

// Server-side input checks for the admin API. Each helper returns a clean value or throws HttpError(400).
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}
const bad = (msg: string) => new HttpError(400, msg)

// Strips control characters (keeps newlines and tabs) and trims.
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()

export function text(v: unknown, field: string, max: number, { required = true, multiline = false } = {}) {
  if (v == null || v === '') {
    if (required) throw bad(`${field} is required.`)
    return ''
  }
  if (typeof v !== 'string') throw bad(`${field} must be text.`)
  const s = multiline ? clean(v) : clean(v).replace(/\s+/g, ' ')
  if (required && !s) throw bad(`${field} is required.`)
  if (s.length > max) throw bad(`${field} must be ${max} characters or fewer.`)
  return s
}

export function int(v: unknown, field: string, min: number, max: number) {
  const n = typeof v === 'string' && v.trim() ? Number(v) : v
  if (typeof n !== 'number' || !Number.isInteger(n)) throw bad(`${field} must be a whole number.`)
  if (n < min || n > max) throw bad(`${field} must be between ${min} and ${max}.`)
  return n
}

export function bool(v: unknown, field: string) {
  if (typeof v !== 'boolean') throw bad(`${field} must be true or false.`)
  return v
}

export function oneOf<T extends string>(v: unknown, field: string, values: readonly T[]): T {
  if (!values.includes(v as T)) throw bad(`${field} is not a valid option.`)
  return v as T
}

export function list(v: unknown, field: string, min: number, max: number) {
  if (!Array.isArray(v)) throw bad(`${field} must be a list.`)
  if (v.length < min || v.length > max) throw bad(`${field} needs ${min === max ? min : `${min} to ${max}`} item${max === 1 ? '' : 's'}.`)
  return v as unknown[]
}

/** Site path ("/watches", "/media/x.jpg") or an https URL. Blocks javascript:, data: and protocol-relative //. */
export function link(v: unknown, field: string, { required = true } = {}) {
  const s = text(v, field, 500, { required })
  if (!s) return s
  if (/^\/(?!\/)[^\s\\]*$/.test(s)) return s
  try {
    if (new URL(s).protocol === 'https:') return s
  } catch {}
  throw bad(`${field} must start with / or https://.`)
}

export function objectId(v: string) {
  if (!/^[a-f0-9]{24}$/i.test(v)) throw new HttpError(404, 'Not found.')
  return new ObjectId(v)
}

export async function body(req: Request): Promise<Record<string, unknown>> {
  const b = await req.json().catch(() => null)
  if (!b || typeof b !== 'object' || Array.isArray(b)) throw bad('Invalid request body.')
  return b
}

export function paging(sp: URLSearchParams, limit = 20) {
  const page = Math.min(Math.max(Number.parseInt(sp.get('page') ?? '1') || 1, 1), 10_000)
  return { page, limit, skip: (page - 1) * limit }
}

/** Case-insensitive "contains" regex from user search text, with regex characters escaped. */
export function search(sp: URLSearchParams) {
  const q = sp.get('q')?.trim().slice(0, 100)
  return q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null
}

/** createdAt range from ?from=YYYY-MM-DD&to=YYYY-MM-DD (inclusive, UTC days). */
export function dateRange(sp: URLSearchParams) {
  const day = (s: string | null, end: boolean) => {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
    const d = new Date(`${s}T00:00:00Z`)
    if (Number.isNaN(+d)) return null
    return end ? new Date(+d + 86_400_000) : d
  }
  const from = day(sp.get('from'), false)
  const to = day(sp.get('to'), true)
  return from || to ? { createdAt: { ...(from && { $gte: from }), ...(to && { $lt: to }) } } : {}
}

const noStore = { 'cache-control': 'no-store' }
export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: noStore })
export const fail = (status: number, error: string) => NextResponse.json({ error }, { status, headers: noStore })
