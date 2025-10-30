// ==================== FILE 7: components/modals/OpenRegisterModal.tsx ====================
// Open Register Modal
'use client'

import { useState } from 'react'
import { Unlock, X } from 'lucide-react'
import { openCashRegisterAction } from '@/lib/actions/cashRegister.actions'

interface Props {
  storeId: string
  userId: string
  onClose: () => void
  onSuccess: (register: any) => void
}

export function OpenRegisterModal({ storeId, userId, onClose, onSuccess }: Props) {
  const [openingBalance, setOpeningBalance] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!openingBalance || parseFloat(openingBalance) < 0) {
      alert('يرجى إدخال رصيد افتتاح صحيح')
      return
    }

    setLoading(true)
    
    const result = await openCashRegisterAction(
      parseFloat(openingBalance)
    )

    setLoading(false)

    if (result.success && result.data) {
      alert('✓ تم فتح الصندوق بنجاح')
      onSuccess(result.data)
      onClose()
    } else {
      alert('فشل فتح الصندوق')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-bg-primary border border-border rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary bg-opacity-10">
              <Unlock className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">فتح الصندوق</h3>
              <p className="text-text-secondary text-sm">بداية يوم عمل جديد</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text-primary font-medium mb-2">
              رصيد الافتتاح (دج) *
            </label>
            <input
              type="number"
              placeholder="50000"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary text-2xl font-bold text-center focus:border-primary outline-none transition-colors"
              autoFocus
              disabled={loading}
            />
            <p className="text-text-secondary text-xs mt-2">
              المبلغ النقدي الموجود في الصندوق
            </p>
          </div>

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
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                'جاري الفتح...'
              ) : (
                <>
                  <Unlock size={20} />
                  <span>فتح الصندوق</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

