// ==================== FILE 3: components/RegisterStats.tsx ====================
// Stats Cards Component

'use client'

import { CashRegister } from '@/lib/types/types'
import { StatsCard } from '@/components/ui/StatsCard'
import { Unlock, TrendingUp, FileText } from 'lucide-react'

interface Props {
  currentRegister: CashRegister | null
}

export function RegisterStats({ currentRegister }: Props) {
  const expectedBalance = currentRegister?.expected_balance || 0
  const totalIn = currentRegister?.total_cash_in || 0
  const totalOut = currentRegister?.total_cash_out || 0
  const paymentCount = (currentRegister?.payment_count_in || 0) + 
                       (currentRegister?.payment_count_out || 0)

  return (
    <>
      <StatsCard
        title="رصيد الافتتاح"
        value={`${currentRegister?.opening_balance.toLocaleString() || 0} دج`}
        icon={Unlock}
        variant="primary"
        description={
          currentRegister 
            ? `فُتح في ${new Date(currentRegister.opened_at).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}`
            : 'لم يتم فتح الصندوق'
        }
      />
      <StatsCard
        title="الرصيد المتوقع"
        value={`${expectedBalance.toLocaleString()} دج`}
        icon={TrendingUp}
        variant="success"
        description={`دخل: ${totalIn.toLocaleString()} | خرج: ${totalOut.toLocaleString()}`}
      />
      <StatsCard
        title="عدد العمليات"
        value={paymentCount}
        icon={FileText}
        variant="accent"
        description="إجمالي حركات اليوم"
      />
    </>
  )
}

