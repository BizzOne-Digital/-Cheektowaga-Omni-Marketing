import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/login-form'
import { authConfigured, getAdmin } from '@/lib/auth'
import { site } from '@/lib/site'

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false, follow: false } }

export default async function LoginPage() {
  if (await getAdmin()) redirect('/admin')
  return (
    <section className="grid min-h-svh place-items-center px-4 py-16">
      <div className="w-full max-w-md border border-line bg-ink-2/70 p-8 sm:p-10">
        <img src={site.logo.full} alt={site.name} width={802} height={700} className="h-auto w-28" />
        <p className="eyebrow mt-10">Admin</p>
        <h1 className="display mt-4 text-5xl">Sign in.</h1>
        {authConfigured ? (
          <LoginForm />
        ) : (
          <p role="alert" className="mt-8 border-l-2 border-champagne pl-4 text-sm text-ash">
            Admin sign-in isn&rsquo;t configured on this server yet. Set <code>MONGODB_URI</code>, <code>SESSION_SECRET</code>,{' '}
            <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code>, then redeploy.
          </p>
        )}
      </div>
    </section>
  )
}
