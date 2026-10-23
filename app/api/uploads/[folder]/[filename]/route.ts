import { cols, dbConfigured } from '@/lib/db'
import { FILENAME, UPLOAD_FOLDERS, type UploadFolder } from '@/lib/uploads'

export const runtime = 'nodejs'

// Public: serves an uploaded image from MongoDB. Filenames are unique and never reused, so responses are
// cached for a year; a replaced image gets a new URL.
export async function GET(_req: Request, { params }: { params: Promise<{ folder: string; filename: string }> }) {
  const { folder, filename } = await params
  // Whitelisted folder + generated-filename pattern: no "..", "/" or other path tricks reach the query.
  if (!UPLOAD_FOLDERS.includes(folder as UploadFolder) || !FILENAME.test(filename) || !dbConfigured) return notFound()

  try {
    const doc = await (await cols()).uploads.findOne({ folder, filename }, { projection: { data: 1, mimeType: 1, size: 1 } })
    if (!doc) return notFound()
    const body = doc.data.buffer
    return new Response(body as Uint8Array<ArrayBuffer>, {
      headers: {
        'content-type': doc.mimeType,
        'content-length': String(body.byteLength),
        'cache-control': 'public, max-age=31536000, immutable',
        'x-content-type-options': 'nosniff',
      },
    })
  } catch (err) {
    console.error('[uploads] read failed:', (err as Error).message)
    return new Response('Unavailable', { status: 503, headers: { 'cache-control': 'no-store' } })
  }
}

const notFound = () => new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } })
