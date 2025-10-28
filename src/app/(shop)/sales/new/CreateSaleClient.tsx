// app/sales/new/CreateSaleClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Customer } from '@/lib/types'
import { createSaleAction } from '@/lib/actions/sales'

type Props = {
  customers: Customer[]
}

export default function CreateSaleClient({ customers }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createSaleAction(formData)

    if (result.success) {
      router.push(`/sales/${result.data.id}`)
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/sales"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">فاتورة مبيعات جديدة</h1>
              <p className="text-gray-600 text-sm mt-1">إنشاء فاتورة جديدة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العميل
              </label>
              <select
                name="customerid"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                disabled={loading}
              >
                <option value="">عميل عام (بدون تحديد)</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.fullname} {customer.phone && `- ${customer.phone}`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                يمكنك إضافة عميل جديد لاحقاً من صفحة العملاء
              </p>
            </div>

            {/* Sale Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع البيع *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition">
                  <input
                    type="radio"
                    name="saletype"
                    value="cash"
                    defaultChecked
                    className="mr-3"
                    disabled={loading}
                  />
                  <div>
                    <div className="font-semibold text-gray-900">نقدي</div>
                    <div className="text-xs text-gray-500">الدفع فوراً</div>
                  </div>
                </label>

                <label className="relative flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition">
                  <input
                    type="radio"
                    name="saletype"
                    value="credit"
                    className="mr-3"
                    disabled={loading}
                  />
                  <div>
                    <div className="font-semibold text-gray-900">آجل</div>
                    <div className="text-xs text-gray-500">الدفع لاحقاً</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Invoice Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الفاتورة *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition">
                  <input
                    type="radio"
                    name="invoice_type"
                    value="full_invoice"
                    defaultChecked
                    className="mr-3"
                    disabled={loading}
                  />
                  <div>
                    <div className="font-semibold text-gray-900">فاتورة كاملة</div>
                    <div className="text-xs text-gray-500">مع كل التفاصيل</div>
                  </div>
                </label>

                <label className="relative flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition">
                  <input
                    type="radio"
                    name="invoice_type"
                    value="quick_sale"
                    className="mr-3"
                    disabled={loading}
                  />
                  <div>
                    <div className="font-semibold text-gray-900">بيع سريع</div>
                    <div className="text-xs text-gray-500">إيصال مبسط</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات
              </label>
              <textarea
                name="notes"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="أي ملاحظات إضافية..."
                disabled={loading}
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">ملاحظة:</p>
                  <p>سيتم إنشاء الفاتورة كمسودة. يمكنك إضافة المنتجات ثم نشر الفاتورة.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Link
                href="/sales"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center font-medium"
              >
                إلغاء
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium"
              >
                {loading ? 'جاري الإنشاء...' : 'إنشاء الفاتورة'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}