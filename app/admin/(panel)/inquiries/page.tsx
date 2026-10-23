'use client'

import { useEffect, useState } from 'react'
import { useAdmin } from '@/components/admin/shell'
import { api, Field, fmtDate, inquiryTone, PageHead, Pager, Panel, qs, Status, Tag, Toolbar, useApi, useDebounced } from '@/components/admin/ui'
import { INQUIRY_STATUSES, inquiryLabel, type InquiryStatus } from '@/lib/statuses'

type Inquiry = {
  id: string
  name: string
  email: string
  phone: string
  message: string
  source: string
  status: InquiryStatus
  notes: string
  delivery: 'sent' | 'failed' | 'not_configured' | 'pending'
  createdAt: string
}
type List = { items: Inquiry[]; unread: number; total: number; page: number; pages: number }

export default function InquiriesPage() {
  const { toast, confirm } = useAdmin()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState<string | null>(null)
  const query = useDebounced(q)
  const filter = <T,>(set: (v: T) => void) => (v: T) => (set(v), setPage(1))
  const { data, error, loading, reload } = useApi<List>(`/api/admin/inquiries?${qs({ q: query, status, from, to, page })}`)
  const [items, setItems] = useState<Inquiry[]>([])
  useEffect(() => setItems(data?.items ?? []), [data])
  const current = items.find((i) => i.id === openId)

  async function patch(id: string, body: Partial<Pick<Inquiry, 'status' | 'notes'>>, done?: string) {
    try {
      await api(`/api/admin/inquiries/${id}`, { method: 'PATCH', body })
      setItems((list) => list.map((i) => (i.id === id ? { ...i, ...body } : i)))
      if (done) toast(done)
    } catch (e) {
      toast((e as Error).message, 'bad')
    }
  }

  function open(i: Inquiry) {
    setOpenId(i.id)
    if (i.status === 'new') patch(i.id, { status: 'read' })
  }

  async function remove(i: Inquiry) {
    if (!(await confirm({ title: 'Delete this enquiry?', body: `The message from ${i.name} will be permanently deleted. Use this for spam.`, confirm: 'Delete', danger: true }))) return
    try {
      await api(`/api/admin/inquiries/${i.id}`, { method: 'DELETE' })
      toast('Enquiry deleted.')
      setOpenId(null)
      reload()
    } catch (e) {
      toast((e as Error).message, 'bad')
    }
  }

  return (
    <>
      <PageHead eyebrow={data ? `${data.unread} new` : 'Contact form'} title="Enquiries" />
      <Toolbar>
        <Field label="Search" className="lg:w-72">
          <input className="ainput" type="search" value={q} onChange={(e) => filter(setQ)(e.target.value)} placeholder="Name, email, phone or message" />
        </Field>
        <Field label="Status">
          <select className="ainput" value={status} onChange={(e) => filter(setStatus)(e.target.value)}>
            <option value="">All</option>
            {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{inquiryLabel[s]}</option>)}
          </select>
        </Field>
        <Field label="From"><input className="ainput" type="date" value={from} onChange={(e) => filter(setFrom)(e.target.value)} /></Field>
        <Field label="To"><input className="ainput" type="date" value={to} onChange={(e) => filter(setTo)(e.target.value)} /></Field>
      </Toolbar>

      <Status loading={loading} error={error} retry={reload} empty={!items.length} emptyText="No enquiries match these filters. Contact form messages appear here.">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <div>
            <ul className="border-t border-line">
              {items.map((i) => (
                <li key={i.id}>
                  <button
                    type="button"
                    onClick={() => open(i)}
                    aria-current={i.id === openId ? 'true' : undefined}
                    className={`grid w-full gap-1 border-b border-l-2 border-b-line px-4 py-4 text-left transition-colors hover:bg-ink-2 ${i.id === openId ? 'border-l-ember bg-ink-2' : 'border-l-transparent'}`}
                  >
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className={i.status === 'new' ? 'font-semibold' : ''}>{i.name}</span>
                      <Tag tone={inquiryTone[i.status]}>{inquiryLabel[i.status]}</Tag>
                    </span>
                    <span className="truncate text-sm text-ash">{i.message}</span>
                    <span className="text-xs text-ash/70">{fmtDate(i.createdAt)} · {i.email}</span>
                  </button>
                </li>
              ))}
            </ul>
            {data && <Pager page={data.page} pages={data.pages} total={data.total} onPage={setPage} />}
          </div>

          <div className="order-first lg:sticky lg:top-8 lg:order-none">
            {current ? (
              <Detail key={current.id} inquiry={current} onStatus={(s) => patch(current.id, { status: s }, 'Status updated.')} onNotes={(n) => patch(current.id, { notes: n }, 'Notes saved.')} onDelete={() => remove(current)} />
            ) : (
              <p className="hidden border border-dashed border-line-strong px-6 py-10 text-center text-sm text-ash lg:block">Select an enquiry to read it.</p>
            )}
          </div>
        </div>
      </Status>
    </>
  )
}

function Detail({ inquiry: i, onStatus, onNotes, onDelete }: { inquiry: Inquiry; onStatus: (s: InquiryStatus) => void; onNotes: (n: string) => void; onDelete: () => void }) {
  const [notes, setNotes] = useState(i.notes)
  return (
    <Panel title={i.source}>
      <div className="grid gap-5 text-sm">
        <div className="grid gap-1">
          <p className="display text-3xl">{i.name}</p>
          <a className="ulink w-fit text-ash" href={`mailto:${i.email}`}>{i.email}</a>
          {i.phone && <a className="ulink w-fit text-ash" href={`tel:${i.phone}`}>{i.phone}</a>}
          <p className="text-xs text-ash">{fmtDate(i.createdAt)}</p>
        </div>
        <p className="whitespace-pre-wrap border-y border-line py-4 leading-relaxed">{i.message}</p>
        {i.delivery === 'failed' && <p className="text-xs text-champagne">Email forward failed. This dashboard copy is the only record, so reply from here.</p>}
        <Field label="Status">
          <select className="ainput" value={i.status} onChange={(e) => onStatus(e.target.value as InquiryStatus)}>
            {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{inquiryLabel[s]}</option>)}
          </select>
        </Field>
        <Field label="Internal notes" hint="Only visible to admins.">
          <textarea className="ainput" maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <div className="flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-danger btn-sm" onClick={onDelete}>Delete</button>
          <div className="flex gap-3">
            <a className="btn btn-ghost btn-sm" href={`mailto:${i.email}?subject=${encodeURIComponent('Re: your message')}`}>Reply</a>
            <button type="button" className="btn btn-sm" disabled={notes === i.notes} onClick={() => onNotes(notes)}>Save notes</button>
          </div>
        </div>
      </div>
    </Panel>
  )
}
