'use client'

import { usePathname } from 'next/navigation'

// Storefront chrome (loader, nav, footer, cursor, motion) stays off the admin dashboard.
export function PublicOnly({ children }: { children: React.ReactNode }) {
  return usePathname().startsWith('/admin') ? null : children
}
