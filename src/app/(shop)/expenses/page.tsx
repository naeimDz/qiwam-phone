// app/expenses/page.tsx (Server Component)

import { getExpensesAction } from '@/lib/actions/expenses.actions'
import ExpensesPage from './ExpensesPage'
import { getCurrentUser } from '@/lib/supabase/db/auth'
import { redirect } from 'next/navigation'

export default async function ExpensesPageWrapper() {
  // Fetch initial data on server
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
  const result = await getExpensesAction(user?.storeid, 100, 0)
  return (
    <ExpensesPage 
      initialExpenses={result.success ? result.data || [] : []} 
      storeId={user.storeid}
      userid={user.id}
    />
  )
}