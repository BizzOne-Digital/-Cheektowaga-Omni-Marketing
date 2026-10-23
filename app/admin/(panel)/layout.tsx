import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/admin/shell'
import { getAdmin } from '@/lib/auth'

export const metadata: Metadata = { title: { default: 'Admin', template: '%s | Admin' }, robots: { index: false, follow: false } }

// Server-side gate for every dashboard page. The APIs check the session again on each request.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin()
  if (!admin) redirect('/admin/login')
  return <AdminShell email={admin.email}>{children}</AdminShell>
}
