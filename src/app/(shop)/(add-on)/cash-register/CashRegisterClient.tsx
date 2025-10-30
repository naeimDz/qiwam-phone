// ==================== FILE 6: CashRegisterClient.tsx (Updated) ====================
'use client'

import { useState, Suspense } from 'react'
import { CashRegister } from '@/lib/types/index'
import DashboardLayout from '@/components/DashboardLayout'
import { RegisterStats } from './components/RegisterStats'
import { RegisterToolbar } from './components/RegisterToolbar'
import { CurrentRegisterTab } from './components/CurrentRegisterTab'
import { HistoryTab } from './components/HistoryTab'

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
        <RegisterStats currentRegister={currentRegister} />
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
        <Suspense fallback={<LoadingSkeleton />}>
          <CurrentRegisterTab
            currentRegister={currentRegister}
            storeId={storeId}
            userId={userId}
            onOpenRegister={() => {/* من Toolbar */}}
          />
        </Suspense>
      ) : (
        <Suspense fallback={<LoadingSkeleton />}>
          <HistoryTab registerHistory={registerHistory} />
        </Suspense>
      )}
    </DashboardLayout>
  )
}

function LoadingSkeleton() {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border bg-bg-light">
        <div className="h-6 bg-bg-light rounded w-48 animate-pulse" />
      </div>
      <div className="p-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-bg-light rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}