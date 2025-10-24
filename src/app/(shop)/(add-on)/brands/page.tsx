// app/admin/brands/page.tsx
import { getCurrentUser } from '@/lib/supabase/db/auth'
import { getBrandsByStore } from '@/lib/supabase/db/brands'
import { redirect } from 'next/navigation'
import BrandsClient from './BrandsClient'


export default async function BrandsPage() {
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

  // Fetch brands
  const brands = await getBrandsByStore(user.storeid)

  return <BrandsClient brands={brands} userRole={user.role} />
}