// app/admin/settings/page.tsx
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/db/auth'
import { getStoreSettings } from '@/lib/supabase/db/stores'
import StoreSettingsClient from './StoreSettingsClient'

export default async function StoreSettingsPage() {
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

  // Only owner and manager can access settings
  if (user.role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">غير مصرح</h1>
          <p className="text-gray-600 mt-2">غير مصرح لك بالوصول إلى الإعدادات</p>
        </div>
      </div>
    )
  }

  const settings = await getStoreSettings(user.storeid)

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">خطأ</h1>
          <p className="text-gray-600 mt-2">إعدادات المتجر غير موجودة</p>
        </div>
      </div>
    )
  }

  return <StoreSettingsClient settings={settings} />
}