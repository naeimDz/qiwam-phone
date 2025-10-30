// app/(dashboard)/admin/customers/page.tsx
import React from 'react'
import CustomersPageClient from './CustomersPageClient'
import type { Customer } from '@/lib/types'
import { getCurrentUser } from '@/lib/supabase/db/auth'
import { redirect } from 'next/navigation'
import { getCustomersByStore } from '@/lib/supabase/db/customers'

export default async function CustomersPage() {
  const user = await getCurrentUser() 
  
  if (!user) {
    redirect('/login') // حماية إضافية على مستوى الصفحة
  }
  
  if (!user.storeid) {
    // عرض رسالة خطأ المتجر
    return <div>خطأ: لا يوجد متجر مرتبط.</div>
  }

  // 2. جلب البيانات باستخدام storeid (استدعاء مباشر لدوال الـ DB)
  // ⚠️ يجب التأكد أن getCustomersByStore مغلفة بـ cache أيضاً!
  const customers: Customer[] = await getCustomersByStore(user.storeid, false)
  return (
    <div className="min-h-screen">
      <CustomersPageClient 
        initialCustomers={customers} />
    </div>
  )
}