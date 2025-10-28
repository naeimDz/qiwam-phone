// ==================== FILE 2: app/(dashboard)/cash-register/CashRegisterClient.tsx ====================
// Client Component - Main Logic

'use client'

import { useState } from 'react'
import { CashRegister } from '@/lib/types/index'
import DashboardLayout from '@/components/DashboardLayout'
import { RegisterStats } from './components/RegisterStats'
import { RegisterToolbar } from './components/RegisterToolbar'
import { CurrentRegisterTab } from './components/CurrentRegisterTab'

interface Props {
  storeId: string
  userId: string
  initialOpenRegister: CashRegister | null
  initialHistory: CashRegister[]
}

export function CashRegisterClient({ 
  storeId, 
  userId, 
  initialOpenRegister, 
  initialHistory 
}: Props) {
  const [activeTab, setActiveTab] = useState('current')
  const [currentRegister, setCurrentRegister] = useState(initialOpenRegister)
  const [registerHistory, setRegisterHistory] = useState(initialHistory)

  const tabs = [
    { key: 'current', label: 'الصندوق الحالي' },
    { key: 'history', label: `السجل (${registerHistory.length})` }
  ]

  return (
    <DashboardLayout
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      StatsCard={
        <RegisterStats 
          currentRegister={currentRegister}
        />
      }
      toolbar={
        <RegisterToolbar
          activeTab={activeTab}
          currentRegister={currentRegister}
          storeId={storeId}
          userId={userId}
          onRegisterOpened={setCurrentRegister}
          onRegisterClosed={(closed) => {
            setCurrentRegister(null)
            setRegisterHistory([closed, ...registerHistory])
          }}
        />
      }
    >
      {activeTab === 'current' ? (
        <CurrentRegisterTab
          currentRegister={currentRegister}
          storeId={storeId}
          userId={userId}
          onOpenRegister={() => {/* من Toolbar */}}
        />
      ) : (
        //<HistoryTab registerHistory={registerHistory} />
        <h1>History</h1>
      )}
    </DashboardLayout>
  )
}