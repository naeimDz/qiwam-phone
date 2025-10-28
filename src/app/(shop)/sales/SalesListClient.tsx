// app/sales/SalesListClient.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SaleWithDetails, UserProfile } from '@/lib/types'
import { cancelSaleAction } from '@/lib/actions/sales'
import { useRouter } from 'next/navigation'

type Props = {
  sales: SaleWithDetails[]
  userRole: UserProfile['role']
}

export default function SalesListClient({ sales, userRole }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'posted' | 'cancelled'>('all')

  const canCancel = userRole === 'owner'

  const filteredSales = filterStatus === 'all' 
    ? sales 
    : sales.filter(s => s.status === filterStatus)

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800',
    posted: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const statusLabels = {
    draft: 'مسودة',
    posted: 'منشور',
    cancelled: 'ملغي'
  }

  const saletypeLabels = {
    cash: 'نقدي',
    credit: 'آجل'
  }

  async function handleCancel(saleId: string, docnumber: string) {
    if (!confirm(`هل أنت متأكد من إلغاء الفاتورة ${docnumber}؟`)) return

    setLoading(true)
    const result = await cancelSaleAction(saleId)
    
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterStatus === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            الكل ({sales.length})
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterStatus === 'draft'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            مسودات ({sales.filter(s => s.status === 'draft').length})
          </button>
          <button
            onClick={() => setFilterStatus('posted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterStatus === 'posted'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            منشورة ({sales.filter(s => s.status === 'posted').length})
          </button>
          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterStatus === 'cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ملغاة ({sales.filter(s => s.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Table */}
      {filteredSales.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">لا توجد فواتير</p>
          <p className="text-gray-500 text-sm mt-2">ابدأ بإنشاء فاتورة جديدة</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">رقم الفاتورة</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">التاريخ</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">العميل</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">النوع</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">العدد</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">المبلغ</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">المدفوع</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الحالة</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link 
                      href={`/sales/${sale.id}`}
                      className="font-mono text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {sale.docnumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(sale.docdate).toLocaleDateString('ar-DZ')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{sale.customer_name || 'عميل عام'}</div>
                    {sale.customer_phone && (
                      <div className="text-xs text-gray-500">{sale.customer_phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      sale.saletype === 'cash' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {saletypeLabels[sale.saletype]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{sale.items_count}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {sale.total.toLocaleString()} دج
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {sale.paidamount.toLocaleString()} دج
                    </div>
                    {sale.remainingamount > 0 && (
                      <div className="text-xs text-orange-600">
                        باقي: {sale.remainingamount.toLocaleString()} دج
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[sale.status]}`}>
                      {statusLabels[sale.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/sales/${sale.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="عرض"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      
                      {canCancel && sale.status === 'posted' && (
                        <button
                          onClick={() => handleCancel(sale.id, sale.docnumber || '')}
                          disabled={loading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="إلغاء"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}