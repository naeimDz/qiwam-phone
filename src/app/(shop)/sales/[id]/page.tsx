// app/sales/[id]/page.tsx
import { getAccessoriesInStock } from '@/lib/supabase/db/accessories'
import { getCurrentUser } from '@/lib/supabase/db/auth'
import { getAvailablePhones } from '@/lib/supabase/db/phones'
import { getSaleItems } from '@/lib/supabase/db/saleItems'
import { getSaleById } from '@/lib/supabase/db/sales'
import { redirect, notFound } from 'next/navigation'
import SaleDetailClient from './SaleDetailClient'


type Props = {
  params: { id: string }
}

export default async function SaleDetailPage({ params }: Props) {
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

  // Fetch sale and items
  const [sale, items, phones, accessories] = await Promise.all([
    getSaleById(params.id),
    getSaleItems(params.id),
    getAvailablePhones(user.storeid),
    getAccessoriesInStock(user.storeid)
  ])

  if (!sale) {
    notFound()
  }

  return (
    <SaleDetailClient 
      sale={sale} 
      items={items}
      phones={phones}
      accessories={accessories}
      userRole={user.role}
    />
  )
}