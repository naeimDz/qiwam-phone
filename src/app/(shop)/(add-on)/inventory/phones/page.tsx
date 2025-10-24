// app/inventory/phones/page.tsx
import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/supabase/db/auth'
import { getPhonesByStore, getPhonesCountByStatus } from '@/lib/supabase/db/phones'
import { getBrandsByStore } from '@/lib/supabase/db/brands'
import { getSuppliersByStore } from '@/lib/supabase/db/suppliers'
import PhonesClient from './PhonesClient'

export default async function PhonesPage() {
  // Check authentication
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  if (!user.storeid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">خطأ</h1>
          <p className="text-gray-600 mt-2">لا يوجد متجر مرتبط بحسابك</p>
        </div>
      </div>
    )
  }

  // Fetch data
  const [phones, stats, brands, suppliers] = await Promise.all([
    getPhonesByStore(user.storeid),
    getPhonesCountByStatus(user.storeid),
    getBrandsByStore(user.storeid),
    getSuppliersByStore(user.storeid, true) // Active only
  ])

  return (
    <PhonesClient 
      phones={phones} 
      stats={stats}
      brands={brands}
      suppliers={suppliers}
      userRole={user.role} 
    />
  )
}