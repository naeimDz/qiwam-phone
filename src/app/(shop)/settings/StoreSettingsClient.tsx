// app/admin/settings/StoreSettingsClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StoreSettings } from '@/lib/types'
import { updateStoreSettingsAction } from '@/lib/actions/stores'

type Props = {
  settings: StoreSettings
}

export default function StoreSettingsClient({ settings }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    
    // Convert to updates object
    const updates = {
      invoice_footer: formData.get('invoice_footer') as string,
      receipt_footer: formData.get('receipt_footer') as string,
      phone: formData.get('phone') as string,
      tax_number: formData.get('tax_number') as string | null,
      currency: formData.get('currency') as 'DZD' | 'EUR' | 'USD' | 'SAR' | 'AED',
      locale: formData.get('locale') as 'ar-DZ' | 'fr-DZ' | 'en-US',
      print_logo: formData.get('print_logo') === 'on',
      print_qr: formData.get('print_qr') === 'on',
      auto_print_invoice: formData.get('auto_print_invoice') === 'on',
      notify_low_stock: formData.get('notify_low_stock') === 'on',
      notify_warranty_expiry: formData.get('notify_warranty_expiry') === 'on',
      notify_daily_report: formData.get('notify_daily_report') === 'on'
    }

    const result = await updateStoreSettingsAction(updates)

    if (result.success) {
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">إعدادات المتجر</h1>
          <p className="text-gray-600 text-sm mt-1">إدارة إعدادات المتجر والفواتير</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800 font-medium">تم حفظ الإعدادات بنجاح</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات الاتصال</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={settings.phone}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم التعريف الضريبي
                </label>
                <input
                  type="text"
                  name="tax_number"
                  defaultValue={settings.tax_number || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Invoice Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">إعدادات الفواتير</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تذييل الفاتورة
                </label>
                <textarea
                  name="invoice_footer"
                  rows={2}
                  defaultValue={settings.invoice_footer}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تذييل الإيصال
                </label>
                <textarea
                  name="receipt_footer"
                  rows={2}
                  defaultValue={settings.receipt_footer}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">الإعدادات الإقليمية</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العملة
                </label>
                <select
                  name="currency"
                  defaultValue={settings.currency}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={loading}
                >
                  <option value="DZD">دينار جزائري (DZD)</option>
                  <option value="EUR">يورو (EUR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="AED">درهم إماراتي (AED)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اللغة
                </label>
                <select
                  name="locale"
                  defaultValue={settings.locale}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={loading}
                >
                  <option value="ar-DZ">العربية (الجزائر)</option>
                  <option value="fr-DZ">الفرنسية (الجزائر)</option>
                  <option value="en-US">الإنجليزية (أمريكا)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Print Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">إعدادات الطباعة</h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  name="print_logo"
                  defaultChecked={settings.print_logo}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  disabled={loading}
                />
                <div>
                  <div className="font-medium text-gray-900">طباعة الشعار</div>
                  <div className="text-xs text-gray-500">إظهار شعار المتجر في الفواتير</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  name="print_qr"
                  defaultChecked={settings.print_qr}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  disabled={loading}
                />
                <div>
                  <div className="font-medium text-gray-900">طباعة رمز QR</div>
                  <div className="text-xs text-gray-500">إضافة رمز QR للفاتورة</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  name="auto_print_invoice"
                  defaultChecked={settings.auto_print_invoice}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  disabled={loading}
                />
                <div>
                  <div className="font-medium text-gray-900">طباعة تلقائية</div>
                  <div className="text-xs text-gray-500">طباعة الفاتورة تلقائياً بعد الحفظ</div>
                </div>
              </label>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">إعدادات الإشعارات</h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  name="notify_low_stock"
                  defaultChecked={settings.notify_low_stock}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  disabled={loading}
                />
                <div>
                  <div className="font-medium text-gray-900">تنبيه المخزون المنخفض</div>
                  <div className="text-xs text-gray-500">إشعار عند انخفاض كمية المنتجات</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  name="notify_warranty_expiry"
                  defaultChecked={settings.notify_warranty_expiry}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  disabled={loading}
                />
                <div>
                  <div className="font-medium text-gray-900">تنبيه انتهاء الضمان</div>
                  <div className="text-xs text-gray-500">إشعار قبل انتهاء ضمان الهواتف</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  name="notify_daily_report"
                  defaultChecked={settings.notify_daily_report}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  disabled={loading}
                />
                <div>
                  <div className="font-medium text-gray-900">التقرير اليومي</div>
                  <div className="text-xs text-gray-500">إرسال تقرير يومي بالمبيعات</div>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Info (Display Only) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">طرق الدفع المتاحة</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>💵 نقدي (Cash) - الطريقة الافتراضية</p>
                  <p>💳 بطاقة (Card) - بطاقات الائتمان والخصم</p>
                  <p>🏦 تحويل بنكي (Bank Transfer)</p>
                  <p>📝 شيك (Cheque)</p>
                </div>
                <p className="text-xs text-blue-700 mt-3">
                  معظم المعاملات نقدية - النظام يدعم جميع الطرق تلقائياً
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}