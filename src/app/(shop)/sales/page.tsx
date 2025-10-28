// app/sales/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/supabase/db/auth'
import { getSalesByStore, getSalesSummary } from '@/lib/supabase/db/sales'
import SalesListClient from './SalesListClient'

export default async function SalesPage() {
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
  const [sales, summary] = await Promise.all([
    getSalesByStore(user.storeid, 50),
    getSalesSummary(user.storeid, 30)
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">المبيعات</h1>
              <p className="text-gray-600 text-sm mt-1">إدارة فواتير المبيعات</p>
            </div>
            <Link
              href="/sales/new"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              فاتورة جديدة
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-sm text-gray-600">إجمالي المبيعات</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{summary.total_sales}</div>
            <div className="text-xs text-gray-500 mt-1">آخر 30 يوم</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="text-sm text-green-600 font-semibold">إجمالي المبلغ</div>
            <div className="text-2xl font-bold text-green-900 mt-1">
              {summary.total_amount.toLocaleString()} دج
            </div>
            <div className="text-xs text-green-700 mt-1">نقدي: {summary.cash_sales} | آجل: {summary.credit_sales}</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-semibold">المدفوع</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              {summary.total_paid.toLocaleString()} دج
            </div>
            <div className="text-xs text-blue-700 mt-1">
              {((summary.total_paid / summary.total_amount) * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-semibold">المتبقي</div>
            <div className="text-2xl font-bold text-orange-900 mt-1">
              {summary.total_remaining.toLocaleString()} دج
            </div>
            <div className="text-xs text-orange-700 mt-1">ديون العملاء</div>
          </div>
        </div>

        {/* Sales Table */}
        <SalesListClient sales={sales} userRole={user.role} />
      </div>
    </div>
  )
}