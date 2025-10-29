// app/test/stock-movements/page.tsx
// Test UI for Stock Movements - Server Components

import { Suspense } from 'react'
import {
  getStockMovementsAction,
  getStockStatsAction,
  getFilteredMovementsAction
} from '@/lib/actions/stockMovements.actions'

// ==================== Test Data ====================
const TEST_STORE_ID = 'your-store-id-here' // Replace with real store ID

// ==================== Loading Components ====================
function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  )
}

// ==================== Stats Card Component ====================
async function StatsCard() {
  const result = await getStockStatsAction(TEST_STORE_ID, 30)

  if (!result.success || !result.data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">❌ {result.error}</p>
      </div>
    )
  }

  const stats = result.data

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-900">إجمالي الدخول</h3>
        <p className="text-2xl font-bold text-green-700 mt-2">
          {stats.total_in}
        </p>
        <p className="text-xs text-green-600 mt-1">
          آخر {stats.days_with_activity} يوم
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-red-900">إجمالي الخروج</h3>
        <p className="text-2xl font-bold text-red-700 mt-2">
          {stats.total_out}
        </p>
        <p className="text-xs text-red-600 mt-1">
          بضاعة مباعة
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900">الحركة الصافية</h3>
        <p className="text-2xl font-bold text-blue-700 mt-2">
          {stats.net_movement > 0 ? '+' : ''}{stats.net_movement}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          تعديلات: {stats.total_adjustments} | إرجاع: {stats.total_returns}
        </p>
      </div>
    </div>
  )
}

// ==================== Recent Movements Table ====================
async function RecentMovementsTable() {
  const result = await getStockMovementsAction(TEST_STORE_ID, 20, 0)

  if (!result.success || !result.data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">❌ {result.error}</p>
      </div>
    )
  }

  const movements = result.data

  if (movements.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">لا توجد حركات مخزون</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              التاريخ
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              المنتج
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              النوع
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              الحركة
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              الكمية
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              المستخدم
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              المصدر
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {movements.map((movement) => {
            const isIncoming = movement.movement_type === 'in' || movement.movement_type === 'return'
            const isOutgoing = movement.movement_type === 'out'
            const isAdjustment = movement.movement_type === 'adjustment'

            return (
              <tr key={movement.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {new Date(movement.createdat).toLocaleString('ar-DZ', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  })}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {movement.product_name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {movement.item_type === 'phone' ? '📱 هاتف' : '🔌 إكسسوار'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      isIncoming
                        ? 'bg-green-100 text-green-800'
                        : isOutgoing
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {movement.movement_type === 'in'
                      ? 'دخول'
                      : movement.movement_type === 'out'
                      ? 'خروج'
                      : movement.movement_type === 'return'
                      ? 'إرجاع'
                      : 'تعديل'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`font-semibold ${
                      isIncoming
                        ? 'text-green-600'
                        : isOutgoing
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {isIncoming ? '+' : isOutgoing ? '-' : ''}
                    {movement.qty}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {movement.created_by_name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {movement.source_table}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ==================== Filtered Movements (Example) ====================
async function FilteredMovements() {
  // Example: Get only phone movements
  const result = await getFilteredMovementsAction(TEST_STORE_ID, {
    itemType: 'phone',
    movementType: 'out',
    limit: 10
  })

  if (!result.success || !result.data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">❌ {result.error}</p>
      </div>
    )
  }

  const movements = result.data

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-900">
        🔍 حركات الهواتف المباعة (آخر 10)
      </h3>
      {movements.length === 0 ? (
        <p className="text-gray-500 text-sm">لا توجد نتائج</p>
      ) : (
        <div className="space-y-2">
          {movements.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div>
                <p className="font-medium text-gray-900">{m.product_name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(m.createdat).toLocaleDateString('ar-DZ')}
                </p>
              </div>
              <span className="text-red-600 font-semibold">-{m.qty}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== Main Page ====================
export default function StockMovementsTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔄 اختبار حركات المخزون
          </h1>
          <p className="text-gray-600">
            صفحة تجريبية لاختبار جميع وظائف Stock Movements
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">ملاحظة:</span> تأكد من تغيير{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">
                TEST_STORE_ID
              </code>{' '}
              في الكود إلى store ID حقيقي
            </p>
          </div>
        </div>

        {/* Statistics Section */}
        <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📊 إحصائيات آخر 30 يوم
          </h2>
          <Suspense fallback={<LoadingSkeleton />}>
            <StatsCard />
          </Suspense>
        </section>

        {/* Recent Movements Section */}
        <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              📋 آخر الحركات (20 حركة)
            </h2>
            <span className="text-sm text-gray-500">
              يتم التحديث تلقائياً
            </span>
          </div>
          <Suspense fallback={<LoadingSkeleton />}>
            <RecentMovementsTable />
          </Suspense>
        </section>

        {/* Filtered Example */}
        <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <Suspense fallback={<LoadingSkeleton />}>
            <FilteredMovements />
          </Suspense>
        </section>

        {/* Action Buttons - Link to Interactive Page */}
        <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🎯 إجراءات تفاعلية
          </h2>
          <p className="text-gray-600 mb-4">
            للإجراءات التفاعلية (إضافة تعديلات، تصدير CSV)، افتح صفحة التفاعل:
          </p>
          <a
            href="/test/stock-movements/interactive"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            افتح الصفحة التفاعلية ←
          </a>
        </section>

        {/* API Testing Guide */}
        <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🧪 دليل الاختبار
          </h2>
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                ✅ الوظائف التي تم اختبارها:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>
                  <code>getStockMovementsAction()</code> - جلب الحركات
                </li>
                <li>
                  <code>getStockStatsAction()</code> - الإحصائيات
                </li>
                <li>
                  <code>getFilteredMovementsAction()</code> - الفلترة
                </li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-2">
                ⚠️ يجب اختبارها يدوياً:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-yellow-800">
                <li>
                  <code>getProductMovementsAction()</code> - حركات منتج محدد
                </li>
                <li>
                  <code>getMovementsByDateAction()</code> - حسب التاريخ
                </li>
                <li>
                  <code>getGroupedMovementsAction()</code> - التجميع
                </li>
                <li>
                  <code>createStockAdjustmentAction()</code> - تعديل يدوي
                </li>
                <li>
                  <code>createBatchAdjustmentsAction()</code> - تعديلات متعددة
                </li>
                <li>
                  <code>exportMovementsToCSVAction()</code> - تصدير CSV
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}