// ==================== FILE 5: components/CurrentRegisterTab.tsx ====================
// Current Register Content

'use client'

import { Lock, Unlock } from 'lucide-react'
import { CashRegister } from '@/lib/types/types'
import { PaymentsList } from './PaymentsList'

interface Props {
  currentRegister: CashRegister | null
  storeId: string
  userId: string
  onOpenRegister: () => void
}

export function CurrentRegisterTab({ 
  currentRegister,
  storeId,
  userId,
  onOpenRegister 
}: Props) {
  if (!currentRegister) {
    return (
      <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center">
        <Lock className="mx-auto mb-4 opacity-30" size={64} />
        <h3 className="text-xl font-bold text-text-primary mb-2">الصندوق مغلق</h3>
        <p className="text-text-secondary mb-6">قم بفتح الصندوق لبدء العمل اليومي</p>
        <button
          onClick={onOpenRegister}
          className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center gap-2 font-semibold mx-auto"
        >
          <Unlock size={20} />
          <span>فتح الصندوق</span>
        </button>
      </div>
    )
  }

  return <PaymentsList registerId={currentRegister.id} />
}

