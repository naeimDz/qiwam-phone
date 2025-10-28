// app/sales/[id]/SaleDetailClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SaleWithDetails, SaleItemWithDetails, PhoneWithDetails, AccessoryWithDetails, UserProfile } from '@/lib/types'
import { addItemToSaleAction, removeItemFromSaleAction, postSaleAction, cancelSaleAction } from '@/lib/actions/sales'

type Props = {
  sale: SaleWithDetails
  items: SaleItemWithDetails[]
  phones: PhoneWithDetails[]
  accessories: AccessoryWithDetails[]
  userRole: UserProfile['role']
}

export default function SaleDetailClient({ sale, items, phones, accessories, userRole }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedProductType, setSelectedProductType] = useState<'phone' | 'accessory'>('phone')
  const [selectedProductId, setSelectedProductId] = useState('')

  const isDraft = sale.status === 'draft'
  const isPosted = sale.status === 'posted'
  const isCancelled = sale.status === 'cancelled'
  const canModify = isDraft
  const canPost = isDraft && items.length > 0
  const canCancel = isPosted && (userRole === 'owner')
  const hasRemaining = sale.remainingamount > 0
  const canPay = isPosted && hasRemaining

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

  // Get selected product details
  const selectedProduct = selectedProductType === 'phone'
    ? phones.find(p => p.id === selectedProductId)
    : accessories.find(a => a.id === selectedProductId)

  async function handleAddItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await addItemToSaleAction(sale.id, formData)

    if (result.success) {
      setIsAddModalOpen(false)
      setSelectedProductId('')
      router.refresh()
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  async function handleRemoveItem(itemId: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return

    setLoading(true)
    const result = await removeItemFromSaleAction(itemId)
    
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
    
    setLoading(false)
  }

  async function handlePost() {
    if (!confirm('هل أنت متأكد من نشر الفاتورة؟ لن يمكنك التعديل بعد النشر.')) return

    setLoading(true)
    const result = await postSaleAction(sale.id)
    
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
    
    setLoading(false)
  }

  async function handleCancel() {
    if (!confirm('هل أنت متأكد من إلغاء الفاتورة؟ سيتم إرجاع جميع المنتجات للمخزون.')) return

    setLoading(true)
    const result = await cancelSaleAction(sale.id)
    
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{sale.docnumber}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[sale.status]}`}>
                    {statusLabels[sale.status]}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  {new Date(sale.docdate).toLocaleDateString('ar-DZ', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {canModify && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  إضافة منتج
                </button>
              )}

              {canPost && (
                <button
                  onClick={handlePost}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  نشر الفاتورة
                </button>
              )}

              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  إلغاء الفاتورة
                </button>
              )}

              {canPay && (
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  تسجيل دفعة
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">المنتجات</h2>
              </div>

              {items.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">لا توجد منتجات</p>
                  <p className="text-gray-500 text-sm mt-2">ابدأ بإضافة منتج إلى الفاتورة</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">المنتج</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الكمية</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">السعر</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الخصم</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">المجموع</th>
                        {canModify && (
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">إجراء</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{item.product_name}</div>
                            {item.brand_name && (
                              <div className="text-xs text-gray-500">{item.brand_name}</div>
                            )}
                            {item.imei_snapshot && (
                              <div className="text-xs text-gray-500 font-mono">IMEI: {item.imei_snapshot}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.qty}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {item.unitprice.toLocaleString()} دج
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {item.discount > 0 ? `${item.discount.toLocaleString()} دج` : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">
                              {item.linetotal.toLocaleString()} دج
                            </div>
                          </td>
                          {canModify && (
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={loading}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                title="حذف"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">معلومات العميل</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">الاسم:</span>
                  <span className="font-medium text-gray-900">{sale.customer_name || 'عميل عام'}</span>
                </div>
                {sale.customer_phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">الهاتف:</span>
                    <span className="font-medium text-gray-900">{sale.customer_phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">النوع:</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    sale.saletype === 'cash' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {sale.saletype === 'cash' ? 'نقدي' : 'آجل'}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">ملخص الفاتورة</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">عدد المنتجات:</span>
                  <span className="font-medium text-gray-900">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span className="font-medium text-gray-900">
                    {items.reduce((sum, item) => sum + item.linetotal, 0).toLocaleString()} دج
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">الإجمالي:</span>
                    <span className="font-bold text-xl text-indigo-600">
                      {sale.total.toLocaleString()} دج
                    </span>
                  </div>
                </div>

                {sale.saletype === 'credit' && (
                  <>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">المدفوع:</span>
                        <span className="font-medium text-green-600">
                          {sale.paidamount.toLocaleString()} دج
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-600">المتبقي:</span>
                        <span className="font-medium text-orange-600">
                          {sale.remainingamount.toLocaleString()} دج
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            {sale.notes && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-2">ملاحظات</h3>
                <p className="text-sm text-gray-600">{sale.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">إضافة منتج</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAddItem} className="space-y-4">
              {/* Product Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع المنتج</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProductType('phone')
                      setSelectedProductId('')
                    }}
                    className={`p-4 border-2 rounded-lg transition ${
                      selectedProductType === 'phone'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">هاتف</div>
                    <div className="text-xs text-gray-500 mt-1">{phones.length} متاح</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProductType('accessory')
                      setSelectedProductId('')
                    }}
                    className={`p-4 border-2 rounded-lg transition ${
                      selectedProductType === 'accessory'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">إكسسوار</div>
                    <div className="text-xs text-gray-500 mt-1">{accessories.length} متاح</div>
                  </button>
                </div>
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المنتج *</label>
                <select
                  name="product_id"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={loading}
                >
                  <option value="">اختر المنتج</option>
                  {selectedProductType === 'phone' ? (
                    phones.map(phone => (
                      <option key={phone.id} value={phone.id}>
                        {phone.name} - {phone.imei} - {phone.sellprice.toLocaleString()} دج
                      </option>
                    ))
                  ) : (
                    accessories.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} - متوفر: {acc.quantity} - {acc.sellprice.toLocaleString()} دج
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Hidden fields */}
              <input type="hidden" name="item_type" value={selectedProductType} />
              
              {selectedProduct && (
                <>
                  <input type="hidden" name="base_price" value={
                    selectedProductType === 'phone' 
                      ? (selectedProduct as PhoneWithDetails).sellprice
                      : (selectedProduct as AccessoryWithDetails).sellprice
                  } />

                  {/* Quantity (for accessories only) */}
                  {selectedProductType === 'accessory' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الكمية *</label>
                      <input
                        type="number"
                        name="qty"
                        defaultValue={1}
                        min={1}
                        max={(selectedProduct as AccessoryWithDetails).quantity}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        متوفر: {(selectedProduct as AccessoryWithDetails).quantity}
                      </p>
                    </div>
                  )}

                  {selectedProductType === 'phone' && (
                    <input type="hidden" name="qty" value="1" />
                  )}

                  {/* Unit Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">سعر البيع *</label>
                    <input
                      type="number"
                      name="unitprice"
                      defaultValue={
                        selectedProductType === 'phone' 
                          ? (selectedProduct as PhoneWithDetails).sellprice
                          : (selectedProduct as AccessoryWithDetails).sellprice
                      }
                      min={0}
                      step="0.01"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      disabled={loading}
                    />
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الخصم</label>
                    <input
                      type="number"
                      name="discount"
                      defaultValue={0}
                      min={0}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setError(null)
                    setSelectedProductId('')
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedProductId}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'جاري الإضافة...' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">تسجيل دفعة</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault()
              setLoading(true)
              setError(null)

              const formData = new FormData(e.currentTarget)
              const { recordSalePaymentAction } = await import('@/lib/actions/payments')

              const result = await recordSalePaymentAction(sale.id, formData)

              if (result.success) {
                setIsPaymentModalOpen(false)
                router.refresh()
              } else {
                setError(result.error)
              }
              
              setLoading(false)
            }} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المبلغ المدفوع *
                </label>
                <input
                  type="number"
                  name="amount"
                  max={sale.remainingamount}
                  min={0}
                  step="0.01"
                  required
                  defaultValue={sale.remainingamount}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  المتبقي: {sale.remainingamount.toLocaleString()} دج
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  طريقة الدفع *
                </label>
                <select
                  name="method"
                  required
                  defaultValue="cash"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={loading}
                >
                  <option value="cash">💵 نقدي</option>
                  <option value="card">💳 بطاقة</option>
                  <option value="bank_transfer">🏦 تحويل بنكي</option>
                  <option value="cheque">📝 شيك</option>
                </select>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المرجع / رقم العملية
                </label>
                <input
                  type="text"
                  name="reference"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="اختياري"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsPaymentModalOpen(false)
                    setError(null)
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'جاري التسجيل...' : 'تسجيل الدفعة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}