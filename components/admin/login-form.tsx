'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { api } from './ui'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    const f = new FormData(e.currentTarget)
    try {
      await api('/api/admin/login', { method: 'POST', body: { email: f.get('email'), password: f.get('password') } })
      router.replace('/admin')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-10 grid gap-8">
      <div className="field">
        <label htmlFor="a-email">Email</label>
        <input id="a-email" name="email" type="email" autoComplete="username" required maxLength={200} />
      </div>
      <div className="field">
        <label htmlFor="a-password">Password</label>
        <input id="a-password" name="password" type="password" autoComplete="current-password" required maxLength={200} />
      </div>
      {error && <p role="alert" className="border-l-2 border-[#ff7a4d] pl-4 text-sm text-[#ffb190]">{error}</p>}
      <button type="submit" className="btn w-full" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'} <span className="btn-arrow" aria-hidden="true">→</span>
      </button>
    </form>
  )
}
