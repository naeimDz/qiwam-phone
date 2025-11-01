import React, { useState, useRef } from 'react'
import { Plus, Trash2, Zap, X, AlertCircle, CheckCircle } from 'lucide-react'

interface QuickItem {
  id: string | number
  productName: string
  qty: number
  unitprice: number
  linetotal: number
}

interface QuickModeProps {
  isOpen: boolean
  onClose: () => void
  onAddItems: (items: QuickItem[]) => void
}

export function QuickMode({ isOpen, onClose, onAddItems }: QuickModeProps) {
  const [quickText, setQuickText] = useState<string>('')
  const [parsedItems, setParsedItems] = useState<QuickItem[]>([])
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const quickTextRef = useRef<HTMLTextAreaElement>(null)

  // ==================== Parser للنص السريع ====================
  const parseQuickText = (text: string): QuickItem[] => {
    const lines = text.split('\n').filter(line => line.trim())
    const items: QuickItem[] = []

    for (const line of lines) {
      // Format: "product_name x quantity @price"
      const match = line.match(/^(.+?)\s+x(\d+)\s+@(\d+(?:\.\d+)?)$/)

      if (!match) {
        setMessage({ 
          type: 'error', 
          text: `❌ صيغة خاطئة: "${line}"` 
        })
        return []
      }

      const [, productName, qtyStr, priceStr] = match
      const qty = parseInt(qtyStr, 10)
      const unitprice = parseFloat(priceStr)
      const linetotal = parseFloat((qty * unitprice).toFixed(2))

      items.push({
        id: `quick-${Date.now()}-${Math.random()}`,
        productName: productName.trim(),
        qty,
        unitprice,
        linetotal
      })
    }

    return items
  }

  // ==================== معالجة النص ====================
  const handleParseQuickText = (): void => {
    if (!quickText.trim()) {
      setMessage({ type: 'error', text: '❌ اكتب المنتجات!' })
      return
    }

    const parsed = parseQuickText(quickText)

    if (parsed.length === 0) {
      return
    }

    setParsedItems(parsed)
    setShowPreview(true)
    setMessage({ 
      type: 'success', 
      text: `✅ تم تحليل ${parsed.length} منتج` 
    })

    setTimeout(() => setMessage(null), 2000)
  }

  // ==================== إضافة المنتجات ====================
  const handleAddItems = (): void => {
    if (parsedItems.length === 0) {
      setMessage({ type: 'error', text: '❌ ما في منتجات للإضافة!' })
      return
    }

    onAddItems(parsedItems)
    
    setMessage({ 
      type: 'success', 
      text: `✅ تم إضافة ${parsedItems.length} منتج بنجاح!` 
    })

    setTimeout(() => {
      setQuickText('')
      setParsedItems([])
      setShowPreview(false)
      setMessage(null)
      onClose()
    }, 1500)
  }

  // ==================== حذف منتج من المعاينة ====================
  const removeItem = (id: string | number): void => {
    const updated = parsedItems.filter(item => item.id !== id)
    setParsedItems(updated)
    
    if (updated.length === 0) {
      setShowPreview(false)
    }
  }

  if (!isOpen) return null

  const totalAmount = parsedItems.reduce((sum, item) => sum + item.linetotal, 0).toFixed(2)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white bg-opacity-20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">الإدخال السريع للمنتجات</h3>
              <p className="text-sm text-amber-100">أضف منتجات بالجملة بسرعة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Messages */}
          {message && (
            <div className={`rounded-xl p-4 flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border-2 border-green-300'
                : 'bg-red-50 border-2 border-red-300'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <p className={message.type === 'success' ? 'text-green-800 font-bold' : 'text-red-800 font-bold'}>
                {message.text}
              </p>
            </div>
          )}

          {/* Format Guide */}
          <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-300">
            <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              📋 طريقة الاستخدام
            </h4>
            <p className="text-blue-800 text-sm mb-3">اكتب كل منتج في سطر واحد:</p>
            <code className="block bg-blue-100 text-blue-900 p-3 rounded-lg text-sm font-mono mb-3 border border-blue-300">
              اسم المنتج x الكمية @السعر
            </code>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>✓ مثال 1:</strong> <code className="bg-white px-2 py-1 rounded border border-blue-300">A54 x5 @36000</code></p>
              <p><strong>✓ مثال 2:</strong> <code className="bg-white px-2 py-1 rounded border border-blue-300">كوفر A54 x10 @250</code></p>
              <p><strong>✓ مثال 3:</strong> <code className="bg-white px-2 py-1 rounded border border-blue-300">شاحن سامسونج x20 @800</code></p>
            </div>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">أدخل المنتجات:</label>
            <textarea
              ref={quickTextRef}
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              placeholder={`A54 x5 @36000\nكوفر A54 x10 @250\nشاحن سامسونج x20 @800`}
              rows={8}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-amber-600 outline-none transition-colors resize-none font-mono bg-gray-50"
              dir="ltr"
            />
            <p className="text-xs text-gray-500 mt-2">
              {quickText.split('\n').filter(l => l.trim()).length} سطر
            </p>
          </div>

          {/* Preview Table */}
          {showPreview && parsedItems.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-800 mb-3">📊 معاينة المنتجات ({parsedItems.length})</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="text-right px-4 py-3 font-bold text-gray-700">المنتج</th>
                      <th className="text-center px-4 py-3 font-bold text-gray-700">السعر</th>
                      <th className="text-center px-4 py-3 font-bold text-gray-700">الكمية</th>
                      <th className="text-center px-4 py-3 font-bold text-gray-700">المجموع</th>
                      <th className="text-center px-4 py-3 font-bold text-gray-700">حذف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800 font-semibold">{item.productName}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{item.unitprice} دج</td>
                        <td className="px-4 py-3 text-center text-gray-700">{item.qty}</td>
                        <td className="px-4 py-3 text-center font-bold text-green-600">
                          {item.linetotal.toFixed(2)} دج
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-5 h-5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-900 text-lg">المجموع الكلي:</span>
                  <span className="text-2xl font-bold text-green-700">{totalAmount} دج</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t-2 border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-bold"
          >
            إلغاء
          </button>

          {!showPreview ? (
            <button
              onClick={handleParseQuickText}
              disabled={!quickText.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white transition-colors font-bold flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              تحليل وعرض ({quickText.split('\n').filter(l => l.trim()).length})
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-amber-600 text-amber-600 hover:bg-amber-50 transition-colors font-bold"
              >
                تعديل
              </button>
              <button
                onClick={handleAddItems}
                className="flex-1 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors font-bold flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                إضافة {parsedItems.length} منتج
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}