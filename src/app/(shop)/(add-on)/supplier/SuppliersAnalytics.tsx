// app/(dashboard)/admin/suppliers/SuppliersAnalytics.tsx
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { TrendingUp, AlertTriangle, Clock, DollarSign } from 'lucide-react'
import { StatsCard } from '@/components/ui/StatsCard'
import {
  getTopSuppliersAction,
  getSupplierDebtsAction,
} from '@/lib/actions/suppliers'
import type { TopSupplier, SupplierDebt } from '@/lib/supabase/db/suppliers'

interface SuppliersAnalyticsProps {
  onLoadComplete?: () => void
}

export function SuppliersAnalytics({ onLoadComplete }: SuppliersAnalyticsProps) {
  const [mounted, setMounted] = useState(false)
  const [topSuppliers, setTopSuppliers] = useState<TopSupplier[]>([])
  const [debts, setDebts] = useState<SupplierDebt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [topRes, debtsRes] = await Promise.all([
          getTopSuppliersAction(10),
          getSupplierDebtsAction()
        ])

        if (topRes.success) {
          setTopSuppliers(topRes.data)
        } else {
          setError(topRes.error)
        }

        if (debtsRes.success) {
          setDebts(debtsRes.data)
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ')
      } finally {
        setLoading(false)
        onLoadComplete?.()
      }
    }

    loadData()
  }, [mounted, onLoadComplete])

  // Memoized calculations
  const stats = useMemo(() => {
    const totalDebt = debts.reduce((sum, d) => sum + (d.total_debt || 0), 0)
    const suppliersWithDebt = debts.filter(d => (d.total_debt || 0) > 0).length
    const highRiskDebts = debts.filter(d => (d.total_debt || 0) > 5000)
    
    return { totalDebt, suppliersWithDebt, highRiskDebts }
  }, [debts])

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="إجمالي الديون"
          value={`${stats.totalDebt.toLocaleString()} دج`}
          icon={DollarSign}
          variant="danger"
          withGradient
        />
        <StatsCard
          title="موردون عليهم ديون"
          value={stats.suppliersWithDebt}
          icon={AlertTriangle}
          variant="accent"
        />
        <StatsCard
          title="ديون عالية المخاطر"
          value={stats.highRiskDebts.length}
          icon={AlertTriangle}
          variant="danger"
        />
        <StatsCard
          title="أفضل موردين"
          value={topSuppliers.length}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Suppliers */}
        <TopSuppliersCard suppliers={topSuppliers} loading={loading} />

        {/* High-Risk Debts */}
        <HighRiskDebtsCard debts={stats.highRiskDebts} loading={loading} />
      </div>

      {/* All Debts Table */}
      <AllDebtsTable debts={debts} loading={loading} />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}

// ============ Top Suppliers Card ============
function TopSuppliersCard({ suppliers, loading }: { suppliers: TopSupplier[], loading: boolean }) {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
        <TrendingUp className="text-green-500" size={20} />
        أفضل الموردين
      </h3>
      {loading ? (
        <p className="text-text-secondary text-sm">جاري التحميل...</p>
      ) : suppliers.length === 0 ? (
        <p className="text-text-secondary text-sm">لا توجد بيانات</p>
      ) : (
        <div className="space-y-3">
          {suppliers.slice(0, 5).map((supplier, idx) => (
            <div key={supplier.id} className="flex items-center justify-between p-3 bg-bg-primary rounded-lg hover:bg-bg-light transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{supplier.name}</p>
                  <p className="text-xs text-text-secondary">{supplier.purchase_count} عقد</p>
                </div>
              </div>
              <span className="text-sm font-bold text-primary ml-2">
                {supplier.total_purchase_amount.toLocaleString()} دج
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ High-Risk Debts Card ============
function HighRiskDebtsCard({ debts, loading }: { debts: SupplierDebt[], loading: boolean }) {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
        <AlertTriangle className="text-red-500" size={20} />
        ديون عالية المخاطر
      </h3>
      {loading ? (
        <p className="text-text-secondary text-sm">جاري التحميل...</p>
      ) : debts.length === 0 ? (
        <p className="text-green-600 text-sm font-medium">✓ لا توجد ديون عالية المخاطر</p>
      ) : (
        <div className="space-y-3">
          {debts.slice(0, 5).map((debt) => (
            <div key={debt.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-text-primary">{debt.name}</p>
                <span className="text-red-600 font-bold">{debt.total_debt.toLocaleString()} دج</span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>{debt.pending_invoices} فاتورة معلقة</span>
                {debt.last_purchase_date && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(debt.last_purchase_date).toLocaleDateString('ar-EG')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ All Debts Table ============
function AllDebtsTable({ debts, loading }: { debts: SupplierDebt[], loading: boolean }) {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-bold text-text-primary">جميع ديون الموردين</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-light">
            <tr>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">المورد</th>
              <th className="text-center px-4 py-3 text-text-secondary font-semibold">الديون</th>
              <th className="text-center px-4 py-3 text-text-secondary font-semibold">الفواتير المعلقة</th>
              <th className="text-center px-4 py-3 text-text-secondary font-semibold">آخر عملية</th>
              <th className="text-center px-4 py-3 text-text-secondary font-semibold">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-text-secondary">
                  جاري التحميل...
                </td>
              </tr>
            ) : debts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-text-secondary">
                  لا توجد ديون
                </td>
              </tr>
            ) : (
              debts.map((debt) => (
                <tr key={debt.id} className="hover:bg-bg-light transition-colors">
                  <td className="px-4 py-4 text-text-primary font-medium">{debt.name}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`font-bold ${debt.total_debt > 5000 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {debt.total_debt.toLocaleString()} دج
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-text-primary">
                    {debt.pending_invoices}
                  </td>
                  <td className="px-4 py-4 text-center text-text-secondary text-sm">
                    {debt.last_purchase_date
                      ? new Date(debt.last_purchase_date).toLocaleDateString('ar-EG')
                      : '-'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      debt.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {debt.active ? 'نشط' : 'معطّل'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}