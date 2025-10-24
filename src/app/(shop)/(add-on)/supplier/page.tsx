// app/(dashboard)/admin/suppliers/page.tsx
import React, { Suspense } from 'react'
import SuppliersClient from './SuppliersClient'
import { SuppliersAnalytics } from './SuppliersAnalytics'
import { getSuppliersAction } from '@/lib/actions/suppliers'
import type { Supplier } from '@/lib/types'
import SuppliersPageClient from './SuppliersPageClient'

export default async function SuppliersPage() {
  // جلب الموردين عبر الـ server action
  const res = await getSuppliersAction(false)
  const suppliers: Supplier[] = res.success ? res.data : []

  return (
    <div className="min-h-screen">
      <SuppliersPageClient initialSuppliers={suppliers} />
    </div>
  )
}