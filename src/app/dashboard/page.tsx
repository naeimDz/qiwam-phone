// app/dashboard/page.tsx
import { getCurrentUser, getUsersByStore } from '@/lib/supabase/db/auth'
import { getStoreWithSettings } from '@/lib/supabase/db/stores'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import { User } from '@/lib/types'


export default async function DashboardPage() {
  // 1. Check authentication
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

  // 2. Fetch store data
  const { store, settings } = await getStoreWithSettings(user.storeid)
  
  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">خطأ</h1>
          <p className="text-gray-600 mt-2">المتجر غير موجود</p>
        </div>
      </div>
    )
  }

  // 3. Fetch users (only if owner/manager)
  let users: User[] = []
  if (user.role === 'owner') {
    users = await getUsersByStore(user.storeid)
  }

  // 4. Pass data to client component
  return (
    <DashboardClient 
      user={user} 
      store={store} 
      settings={settings} 
      users={users}
    />
  )
}