'use client'

import { useState } from 'react'
import { useAdmin } from './shell'
import { api } from './ui'

export type UploadFolder = 'products' | 'gallery' | 'pages' | 'misc'
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_MB = 8
const PLACEHOLDER = '/media/placeholder.svg'

/** POSTs to /api/upload (stored in MongoDB) and returns the public URL to save on the record. */
export async function uploadImage(file: File, folder: UploadFolder) {
  if (!ACCEPT.split(',').includes(file.type)) throw new Error(`${file.name}: use a JPG, PNG, WebP or GIF image.`)
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`${file.name}: images must be ${MAX_MB} MB or smaller.`)
  const body = new FormData()
  body.set('file', file)
  body.set('folder', folder)
  const res = await api<{ success: true; url: string }>('/api/upload', { method: 'POST', body }).catch((e: Error) => {
    // Vercel rejects request bodies over 4.5 MB before they reach the route.
    throw new Error(/413|too large/i.test(e.message) ? `${file.name} is too large for the server. Try an image under 4 MB.` : e.message)
  })
  return res.url
}

/** Preview for any admin thumbnail: legacy /uploads/ paths (local disk) and broken images show a placeholder. */
export function Thumb({ src, className = '' }: { src: string; className?: string }) {
  return (
    <img
      src={src.startsWith('/uploads/') ? PLACEHOLDER : src}
      alt=""
      className={className}
      onError={(e) => {
        if (!e.currentTarget.src.endsWith(PLACEHOLDER)) e.currentTarget.src = PLACEHOLDER
      }}
    />
  )
}

/**
 * Image picker: preview, Upload / Replace, Remove. onChange gets the saved URL ('' when removed) and,
 * after an upload, the File (e.g. to read its pixel size). The old image is deleted server-side when the
 * record is saved without it.
 */
export function ImageField({
  value,
  onChange,
  folder,
  removable = true,
  previewClass = 'aspect-square w-24 bg-white p-1',
}: {
  value: string
  onChange: (url: string, file?: File) => void
  folder: UploadFolder
  removable?: boolean
  previewClass?: string
}) {
  const { toast } = useAdmin()
  const [busy, setBusy] = useState(false)

  async function pick(file?: File) {
    if (!file) return
    setBusy(true)
    try {
      onChange(await uploadImage(file, folder), file)
      toast('Image uploaded. Save to publish it.')
    } catch (e) {
      toast((e as Error).message, 'bad')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {value && (
        <div className={`shrink-0 overflow-hidden ${previewClass}`}>
          <Thumb src={value} className="size-full object-contain" />
        </div>
      )}
      <label className={`btn btn-ghost btn-sm ${busy ? 'pointer-events-none opacity-60' : ''}`} aria-busy={busy}>
        {busy ? 'Uploading…' : value ? 'Replace' : 'Upload image'}
        <input type="file" accept={ACCEPT} className="sr-only" disabled={busy} onChange={(e) => (pick(e.target.files?.[0]), (e.target.value = ''))} />
      </label>
      {value && removable && (
        <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={() => onChange('')}>Remove</button>
      )}
    </div>
  )
}
