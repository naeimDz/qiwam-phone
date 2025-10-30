// app/(dashboard)/admin/customers/CustomersAnalytics.tsx
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { TrendingUp, AlertTriangle, Clock, DollarSign } from 'lucide-react'
import { StatsCard } from '@/components/ui/StatsCard'
import {
  getTopCustomersAction,
  getCustomerDebtsAction,
  getHighRiskCustomersAction
} from '@/lib/actions/customers'

import type { TopCustomer, CustomerDebt } from '@/lib/supabase/db/customers'

export default function CustomersAnalytics() {
  const [mounted, setMounted] = useState(false)
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])
  const [debts, setDebts] = useState<CustomerDebt[]>([])
  const [highRiskCustomers, setHighRiskCustomers] = useState<TopCustomer[]>([])
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

        const [topRes, debtsRes, riskRes] = await Promise.all([
          getTopCustomersAction(10),
          getCustomerDebtsAction(),
          getHighRiskCustomersAction(0.5)
        ])

        if (topRes.success) {
          setTopCustomers(topRes.data)
        } else {
          setError(topRes.error)
        }

        if (debtsRes.success) {
          setDebts(debtsRes.data)
        }

        if (riskRes.success) {
          setHighRiskCustomers(riskRes.data)
        }
      } catch (err: any) {
        console.error('Analytics load error:', err)
        setError(err.message || 'حدث خطأ')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [mounted])

  // ✅ Memoize calculations
  const stats = useMemo(() => {
    const totalDebt = debts.reduce((sum, d) => sum + (d.total_debt || 0), 0)
    const totalSpent = topCustomers.reduce((sum, c) => sum + (c.total_spent || 0), 0)
    const customersWithDebt = debts.length
    const avgDebt = customersWithDebt > 0 ? totalDebt / customersWithDebt : 0

    return {
      totalDebt,
      totalSpent,
      customersWithDebt,
      avgDebt,
    }
  }, [debts, topCustomers])

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="إجمالي المبيعات"
          value={`${stats.totalSpent.toLocaleString()} دج`}
          icon={TrendingUp}
          variant="success"
          withGradient
        />
        <StatsCard
          title="إجمالي الديون"
          value={`${stats.totalDebt.toLocaleString()} دج`}
          icon={DollarSign}
          variant="accent"
        />
        <StatsCard
          title="عملاء عليهم ديون"
          value={stats.customersWithDebt}
          icon={AlertTriangle}
          variant="danger"
        />
        <StatsCard
          title="متوسط الدين"
          value={`${stats.avgDebt.toLocaleString()} دج`}
          icon={Clock}
          variant="secondary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <TopCustomersCard customers={topCustomers} loading={loading} />

        {/* High-Risk Customers */}
        <HighRiskCustomersCard customers={highRiskCustomers} loading={loading} />
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

// ============ Top Customers Card ============
function TopCustomersCard({ customers, loading }: { customers: TopCustomer[], loading: boolean }) {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
        <TrendingUp className="text-green-500" size={20} />
        أفضل العملاء
      </h3>
      {loading ? (
        <p className="text-text-secondary text-sm">جاري التحميل...</p>
      ) : customers.length === 0 ? (
        <p className="text-text-secondary text-sm">لا توجد بيانات</p>
      ) : (
        <div className="space-y-3">
          {customers.slice(0, 5).map((customer, idx) => (
            <div key={customer.id} className="flex items-center justify-between p-3 bg-bg-primary rounded-lg hover:bg-bg-light transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{customer.fullname}</p>
                  <p className="text-xs text-text-secondary">{customer.total_purchases} عملية شراء</p>
                </div>
              </div>
              <span className="text-sm font-bold text-primary ml-2">
                {customer.total_spent.toLocaleString()} دج
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ High-Risk Customers Card ============
function HighRiskCustomersCard({ customers, loading }: { customers: TopCustomer[], loading: boolean }) {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
        <AlertTriangle className="text-red-500" size={20} />
        عملاء عالي المخاطرة
      </h3>
      {loading ? (
        <p className="text-text-secondary text-sm">جاري التحميل...</p>
      ) : customers.length === 0 ? (
        <p className="text-green-600 text-sm font-medium">✓ لا توجد عملاء عالي المخاطرة</p>
      ) : (
        <div className="space-y-3">
          {customers.slice(0, 5).map((customer) => {
            const riskRatio = ((customer.outstanding_balance / customer.total_spent) * 100).toFixed(0)
            return (
              <div key={customer.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-text-primary">{customer.fullname}</p>
                  <span className="text-red-600 font-bold">{riskRatio}% دين</span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>{customer.outstanding_balance.toLocaleString()} دج متبقي</span>
                  {customer.last_purchase_date && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(customer.last_purchase_date).toLocaleDateString('ar-EG')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============ All Debts Table ============
function AllDebtsTable({ debts, loading }: { debts: CustomerDebt[], loading: boolean }) {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-bold text-text-primary">جميع ديون العملاء</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-light">
            <tr>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">العميل</th>
              <th className="text-center px-4 py-3 text-text-secondary font-semibold">الديون</th>
              <th className="text-center px-4 py-3 text-text-secondary font-semibold">الفواتير المعلقة</th>
              <th className="text-center px-4 py-3 text-text-secondary font-semibold">أيام التأخير</th>
              <th className="text-center px-4 py-3 text-text-secondary font-semibold">آخر عملية</th>
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
                <tr key={debt.customer_id} className="hover:bg-bg-light transition-colors">
                  <td className="px-4 py-4 text-text-primary font-medium">{debt.customer_name}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`font-bold ${debt.total_debt > 5000 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {debt.total_debt.toLocaleString()} دج
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-text-primary">
                    {debt.unpaid_invoices}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      (debt.days_overdue || 0) > 30
                        ? 'bg-red-100 text-red-700'
                        : (debt.days_overdue || 0) > 7
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {debt.days_overdue || 0} يوم
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-text-secondary text-sm">
                    {debt.latest_invoice_date
                      ? new Date(debt.latest_invoice_date).toLocaleDateString('ar-EG')
                      : '-'}
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