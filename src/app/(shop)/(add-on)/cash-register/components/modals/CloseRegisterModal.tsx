// ==================== FILE 8: components/modals/CloseRegisterModal.tsx ====================
// Close Register Modal

'use client'

import { useState } from 'react'
import { Lock, AlertCircle, X } from 'lucide-react'
import { CashRegister } from '@/lib/types/index'
import { closeCashRegisterAction } from '@/lib/actions/cashRegister.actions'

interface Props {
  register: CashRegister
  onClose: () => void
  onSuccess: (register: any) => void
}

export function CloseRegisterModal({ register, onClose, onSuccess }: Props) {
  const [actualBalance, setActualBalance] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const expectedBalance = register.expected_balance || 0
  const difference = actualBalance 
    ? parseFloat(actualBalance) - expectedBalance 
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!actualBalance) {
      alert('يرجى إدخال النقد الفعلي')
      return
    }

    setLoading(true)
    
    const result = await closeCashRegisterAction(
      register.id,
      parseFloat(actualBalance),
      notes || undefined
    )

    setLoading(false)

    if (result.success && result.data) {
      alert('✓ تم إغلاق الصندوق بنجاح')
      onSuccess(result.data)
      onClose()
    } else {
      alert('فشل إغلاق الصندوق')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-bg-primary border border-border rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-600 bg-opacity-10">
              <Lock className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">إغلاق الصندوق</h3>
              <p className="text-text-secondary text-sm">إنهاء يوم العمل</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-bg-secondary">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* الرصيد المتوقع */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-300/30">
            <p className="text-blue-900 dark:text-blue-300 text-sm font-medium mb-1">
              الرصيد المتوقع
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold">
              {expectedBalance.toLocaleString()} دج
            </p>
          </div>

          {/* النقد الفعلي */}
          <div>
            <label className="block text-text-primary font-medium mb-2">
              النقد الفعلي في الصندوق (دج) *
            </label>
            <input
              type="number"
              placeholder="قم بعد النقد الموجود"
              value={actualBalance}
              onChange={(e) => setActualBalance(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary text-2xl font-bold text-center focus:border-primary outline-none"
              autoFocus
              disabled={loading}
            />
            
            {actualBalance && (
              <div className={`mt-2 p-2 rounded-lg text-sm font-medium text-center ${
                difference === 0 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : difference > 0
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}>
                {difference === 0 
                  ? '✓ متوازن تماماً'
                  : `فرق: ${difference.toLocaleString()} دج ${difference > 0 ? '(زيادة)' : '(نقص)'}`
                }
              </div>
            )}
          </div>

          {/* ملاحظات */}
          <div>
            <label className="block text-text-primary font-medium mb-2">
              ملاحظات (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات عن يوم العمل..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none resize-none"
              disabled={loading}
            />
          </div>

          {/* تحذير */}
          {actualBalance && difference !== 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300/30">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                هناك فرق بين المتوقع والفعلي. تأكد من عد النقد بدقة.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-border text-text-primary hover:bg-bg-secondary transition-all"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                'جاري الإغلاق...'
              ) : (
                <>
                  <Lock size={20} />
                  <span>إغلاق نهائي</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}