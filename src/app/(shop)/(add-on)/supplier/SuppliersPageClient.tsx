// app/(dashboard)/admin/suppliers/SuppliersPageClient.tsx
'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import SuppliersClient from './SuppliersClient'
import { SuppliersAnalytics } from './SuppliersAnalytics'
import type { Supplier } from '@/lib/types'

interface SuppliersPageClientProps {
  initialSuppliers: Supplier[]
}

export default function SuppliersPageClient({ initialSuppliers }: SuppliersPageClientProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'management'>('analytics')

  const tabs = [
    { key: 'analytics', label: '📊 التحليلات والإحصائيات' },
    { key: 'management', label: '👥 إدارة الموردين' },
  ]

  // Header
  const toolbar = (
    <div className="w-full">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">الموردين</h1>
        <p className="text-text-secondary">إدارة وتحليل الموردين والديون</p>
      </div>
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
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <React.Suspense fallback={
            <div className="p-8 text-center text-text-secondary">
              جاري تحميل التحليلات...
            </div>
          }>
            <SuppliersAnalytics />
          </React.Suspense>
        )}

        {/* Management Tab */}
        {activeTab === 'management' && (
          <React.Suspense fallback={
            <div className="p-8 text-center text-text-secondary">
              جاري تحميل الموردين...
            </div>
          }>
            <SuppliersClient initialSuppliers={initialSuppliers} />
          </React.Suspense>
        )}
      </div>
    </DashboardLayout>
  )
}