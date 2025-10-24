// app/(dashboard)/admin/customers/CustomersPageClient.tsx
'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import CustomersAnalytics from './CustomersAnalytics'
import CustomersManagement from './CustomersManagement'
import type { Customer } from '@/lib/types'

interface CustomersPageClientProps {
  initialCustomers: Customer[]
}

export default function CustomersPageClient({ initialCustomers }: CustomersPageClientProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'management'>('analytics')

  const tabs = [
    { key: 'analytics', label: '📊 التحليلات والإحصائيات' },
    { key: 'management', label: '👥 إدارة العملاء' },
  ]

  const toolbar = (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-text-primary mb-2">العملاء</h1>
      <p className="text-text-secondary">إدارة وتحليل العملاء والديون المستحقة</p>
    </div>
  )

  return (
    <DashboardLayout
      toolbar={toolbar}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(key) => setActiveTab(key as 'analytics' | 'management')}
    >
      <div className="space-y-6">
        {activeTab === 'analytics' && (
          <React.Suspense fallback={<LoadingFallback />}>
            <CustomersAnalytics />
          </React.Suspense>
        )}

        {activeTab === 'management' && (
          <React.Suspense fallback={<LoadingFallback />}>
            <CustomersManagement initialCustomers={initialCustomers} />
          </React.Suspense>
        )}
      </div>
    </DashboardLayout>
  )
}

function LoadingFallback() {
  return (
    <div className="p-8 text-center text-text-secondary">
      جاري التحميل...
    </div>
  )
}