// app/sales/new/page.tsx
import { getCurrentUser } from '@/lib/supabase/db/auth'
import { getCustomersByStore } from '@/lib/supabase/db/customers'
import { redirect } from 'next/navigation'
import CreateSaleClient from './CreateSaleClient'


export default async function NewSalePage() {
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

  // Fetch customers
  const customers = await getCustomersByStore(user.storeid)

  return <CreateSaleClient customers={customers} />
}