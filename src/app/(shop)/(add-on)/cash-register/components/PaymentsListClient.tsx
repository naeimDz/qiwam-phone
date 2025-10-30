// ==================== FILE 3: components/PaymentsListClient.tsx (Client Component) ====================
'use client'

import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { CashMovement } from '@/lib/types/index'
import { memo } from 'react'

interface Props {
  movements: CashMovement[]
  registerId: string
}

export function PaymentsListClient({ movements }: Props) {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border bg-bg-light">
        <h3 className="font-bold text-text-primary">
          حركات الصندوق اليوم ({movements.length})
        </h3>
      </div>
      
      <div className="divide-y divide-border">
        {movements.map(movement => (
          <MovementItem key={movement.id} movement={movement} />
        ))}
      </div>
    </div>
  )
}

const MovementItem = memo(({ movement }: { movement: CashMovement }) => {
  const isIncome = movement.movement_type === 'in'
  const label = getMovementLabel(movement)
  const reference = movement.meta?.reference || movement.id.slice(0, 8)
  const time = new Date(movement.createdat).toLocaleTimeString('ar-DZ', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
  const methodLabel = movement.method === 'cash' ? 'نقدي' : movement.method

  return (
    <div className="p-4 hover:bg-bg-light transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg ${
            isIncome 
              ? 'bg-green-100 dark:bg-green-900/20' 
              : 'bg-red-100 dark:bg-red-900/20'
          }`}>
            {isIncome ? (
              <TrendingUp className="text-green-600" size={20} />
            ) : (
              <TrendingDown className="text-red-600" size={20} />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-text-primary">{label}</span>
              <span className="text-text-secondary text-sm">#{reference}</span>
            </div>
            
            <div className="flex gap-3 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {time}
              </span>
              <span>{methodLabel}</span>
            </div>
          </div>
        </div>
        
        <div className={`font-bold text-lg ${
          isIncome ? 'text-green-600' : 'text-red-600'
        }`}>
          {isIncome ? '+' : '-'}
          {movement.amount.toLocaleString()} دج
        </div>
      </div>
    </div>
  )
})
MovementItem.displayName = 'MovementItem'

function getMovementLabel(movement: CashMovement): string {
  if (movement.related_sale) return 'بيع'
  if (movement.related_purchase) return 'شراء'
  if (movement.related_expense) return 'مصروف'
  
  switch (movement.source_table) {
    case 'sale': return 'بيع'
    case 'purchase': return 'شراء'
    case 'expense': return 'مصروف'
    default: return 'حركة نقدية'
  }
}

