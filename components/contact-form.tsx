'use client'

import { useState } from 'react'
import { site } from '@/lib/site'
import { Field } from './field'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'offline' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setStatus('sending')
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'Contact form', ...Object.fromEntries(new FormData(form)) }),
    })
      .then((r) => r.json())
      .catch(() => ({ error: 'Connection problem. Please try again.' }))
    if (res.error === 'not_configured') return setStatus('offline')
    if (res.error) return setError(res.error), setStatus('error')
    form.reset()
    setStatus('sent')
  }

  if (status === 'sent')
    return (
      <div role="status" className="grid gap-4">
        <p className="display text-5xl">Message received.</p>
        <p className="text-ash">Thank you. {site.contact.name} will reply by email.</p>
      </div>
    )

  return (
    <form onSubmit={submit} className="grid gap-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="c-name" name="name" label="Name" autoComplete="name" />
        <Field id="c-email" name="email" label="Email" type="email" autoComplete="email" error="Enter a valid email address." />
      </div>
      <Field id="c-phone" name="phone" label="Phone (optional)" type="tel" autoComplete="tel" required={false} />
      <div className="field">
        <label htmlFor="c-message">Message <span className="text-ember" aria-hidden="true">*</span></label>
        <textarea id="c-message" name="message" required maxLength={2000} aria-errormessage="c-message-err" />
        <p id="c-message-err" className="err">Please add a message.</p>
      </div>

      {status === 'offline' && (
        <p role="alert" className="border-l-2 border-champagne pl-4 text-sm text-ash">
          The online form isn&rsquo;t connected yet, so your message was not sent. Please email{' '}
          <a className="ulink text-bone" href={`mailto:${site.contact.email}`}>{site.contact.email}</a> or call{' '}
          <a className="ulink text-bone" href={`tel:${site.contact.tel}`}>{site.contact.phone}</a>.
        </p>
      )}
      {status === 'error' && <p role="alert" className="border-l-2 border-[#ff7a4d] pl-4 text-sm text-[#ffb190]">{error}</p>}

      <button type="submit" className="btn w-full sm:w-fit" disabled={status === 'sending'} data-magnetic>
        {status === 'sending' ? 'Sending…' : 'Send message'} <span className="btn-arrow" aria-hidden="true">→</span>
      </button>
    </form>
  )
}

