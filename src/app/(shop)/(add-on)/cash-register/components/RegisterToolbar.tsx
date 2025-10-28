// ==================== FILE 4: components/RegisterToolbar.tsx ====================
// Toolbar with Actions

'use client'

import { useState } from 'react'
import { Unlock, Lock, Download } from 'lucide-react'
import { CashRegister } from '@/lib/types/types'
import { OpenRegisterModal } from './modals/OpenRegisterModal'
import { CloseRegisterModal } from './modals/CloseRegisterModal'

interface Props {
  activeTab: string
  currentRegister: CashRegister | null
  storeId: string
  userId: string
  onRegisterOpened: (register: CashRegister) => void
  onRegisterClosed: (register: CashRegister) => void
}

export function RegisterToolbar({ 
  activeTab,
  currentRegister, 
  storeId,
  userId,
  onRegisterOpened,
  onRegisterClosed
}: Props) {
  const [showOpenModal, setShowOpenModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)

  return (
    <>
      <div className="flex gap-2">
        {activeTab === 'current' && (
          <>
            {!currentRegister ? (
              <button
                onClick={() => setShowOpenModal(true)}
                className="px-4 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center gap-2 font-semibold"
              >
                <Unlock size={20} />
                <span>فتح الصندوق</span>
              </button>
            ) : (
              <button
                onClick={() => setShowCloseModal(true)}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white hover:opacity-90 transition-all flex items-center gap-2 font-semibold"
              >
                <Lock size={20} />
                <span>إغلاق الصندوق</span>
              </button>
            )}
          </>
        )}
        <button className="px-4 py-2.5 rounded-xl border border-border text-text-primary hover:bg-bg-light transition-all flex items-center gap-2">
          <Download size={20} />
          <span className="hidden md:inline">تصدير</span>
        </button>
      </div>

      {showOpenModal && (
        <OpenRegisterModal
          storeId={storeId}
          userId={userId}
          onClose={() => setShowOpenModal(false)}
          onSuccess={onRegisterOpened}
        />
      )}

      {showCloseModal && currentRegister && (
        <CloseRegisterModal
          register={currentRegister}
          userId={userId}
          onClose={() => setShowCloseModal(false)}
          onSuccess={onRegisterClosed}
        />
      )}
    </>
  )
}

