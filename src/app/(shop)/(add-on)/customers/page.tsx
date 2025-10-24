// app/(dashboard)/admin/customers/page.tsx
import React from 'react'
import CustomersPageClient from './CustomersPageClient'
import { getCustomersAction } from '@/lib/actions/customers'
import type { Customer } from '@/lib/types'

export default async function CustomersPage() {
  // جلب العملاء على الـ Server بس
  const res = await getCustomersAction(false)
  const customers: Customer[] = res.success ? res.data : []

  return (
    <div className="min-h-screen">
      <CustomersPageClient initialCustomers={customers} />
    </div>
  )
}