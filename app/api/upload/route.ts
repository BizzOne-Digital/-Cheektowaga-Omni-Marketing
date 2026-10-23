import { randomBytes } from 'node:crypto'
import { Binary, ObjectId } from 'mongodb'
import { adminRoute } from '@/lib/admin-api'
import { cols } from '@/lib/db'
import { MAX_UPLOAD_BYTES, UPLOAD_FOLDERS, UPLOAD_PREFIX, type UploadFolder } from '@/lib/uploads'
import { HttpError, ok } from '@/lib/validate'

export const runtime = 'nodejs'

const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }

// The declared MIME type must match the file's actual bytes, so a renamed file can't slip through.
function sniff(b: Buffer) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  if (/^GIF8[79]a$/.test(b.toString('ascii', 0, 6))) return 'image/gif'
  return null
}

// Admin-only. Stores the image in MongoDB (stored_uploads) and returns the URL to save on the product/banner.
export const POST = adminRoute(async (req) => {
  const form = await req.formData().catch(() => null)
  if (!form) throw new HttpError(400, 'Send the image as form data.')
  const file = form.get('file')
  const folder = form.get('folder')
  if (!UPLOAD_FOLDERS.includes(folder as UploadFolder)) throw new HttpError(400, `Folder must be one of: ${UPLOAD_FOLDERS.join(', ')}.`)
  if (!(file instanceof File) || !file.size) throw new HttpError(400, 'Choose an image to upload.')
  if (!TYPES[file.type]) throw new HttpError(415, 'Use a JPG, PNG, WebP or GIF image.')
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(413, 'Images must be 8 MB or smaller.')

  const data = Buffer.from(await file.arrayBuffer())
  if (sniff(data) !== file.type) throw new HttpError(415, "This file isn't a valid image of the type it claims to be.")

  const filename = `${Date.now()}-${randomBytes(8).toString('hex')}.${TYPES[file.type]}`
  const now = new Date()
  await (await cols()).uploads.insertOne({
    _id: new ObjectId(),
    folder: folder as UploadFolder,
    filename,
    mimeType: file.type,
    size: data.length,
    data: new Binary(data),
    createdAt: now,
    updatedAt: now,
  })
  return ok({ success: true, url: `${UPLOAD_PREFIX}${folder}/${filename}`, filename, size: data.length, folder }, 201)
})
