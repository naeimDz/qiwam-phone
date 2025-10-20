// app/components/purchase/PurchaseForm.tsx
'use client'

import { useState } from 'react'
import { handleCreatePurchase } from './purchase';


interface PurchaseFormProps {
  storeId: string
  suppliers: Array<{ id: string; name: string }>
  onRefresh?: () => void
}

interface LineItem {
  item_type: 'phone' | 'accessory'
  phone_id?: string
  accessory_id?: string
  qty: number
  unitprice: number
}

// ============================================
// Wrapper Component - للـ Server Props
// ============================================
export function PurchaseFormContainer({ 
  storeId, 
  suppliers 
}: { 
  storeId: string
  suppliers: Array<{ id: string; name: string }>
}) {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <>
      <PurchaseForm 
        storeId={storeId} 
        suppliers={suppliers}
        onRefresh={() => setRefreshKey(k => k + 1)}
      />
    </>
  )
}

export function PurchaseForm({ storeId, suppliers, onRefresh }: PurchaseFormProps & { onRefresh?: () => void }) {
  const [docnumber, setDocnumber] = useState('')
  const [supplierid, setSupplierid] = useState('')
  const [items, setItems] = useState<LineItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addItem = () => {
    setItems([...items, { item_type: 'phone', qty: 1, unitprice: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!docnumber || !supplierid || items.length === 0) {
        throw new Error('الرجاء ملء جميع الحقول')
      }

      await handleCreatePurchase({
        storeId,
        docnumber,
        supplierid,
        docdate: new Date().toISOString(),
        items,
      })

      // Reset form
      setDocnumber('')
      setSupplierid('')
      setItems([])
      onRefresh?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const total = items.reduce((sum, item) => sum + (item.qty * item.unitprice), 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">رقم الفاتورة</label>
          <input
            type="text"
            value={docnumber}
            onChange={(e) => setDocnumber(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">المورد</label>
          <select
            value={supplierid}
            onChange={(e) => setSupplierid(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">اختر مورد</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">العناصر</h3>
          <button
            type="button"
            onClick={addItem}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + إضافة عنصر
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-2 items-end">
              <select
                value={item.item_type}
                onChange={(e) => updateItem(idx, 'item_type', e.target.value as 'phone' | 'accessory')}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="phone">هاتف</option>
                <option value="accessory">إكسسوار</option>
              </select>
              <input
                type="number"
                placeholder="الكمية"
                value={item.qty}
                onChange={(e) => updateItem(idx, 'qty', parseInt(e.target.value) || 0)}
                className="px-2 py-1 border rounded text-sm"
                min="1"
              />
              <input
                type="number"
                placeholder="السعر"
                value={item.unitprice}
                onChange={(e) => updateItem(idx, 'unitprice', parseFloat(e.target.value) || 0)}
                className="px-2 py-1 border rounded text-sm"
                min="0"
                step="0.01"
              />
              <div className="px-2 py-1 bg-gray-100 rounded text-sm">
                {(item.qty * item.unitprice).toFixed(2)}
              </div>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end text-lg font-bold border-t pt-3">
        الإجمالي: {total.toFixed(2)}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? 'جاري الحفظ...' : 'إنشاء فاتورة'}
      </button>
    </form>
  )
}