// ==================== FILE 6: components/PaymentsList.tsx ====================
// Payments Display (Server Component would be better)

'use client'

import { useEffect, useState } from 'react'
import { FileText, TrendingUp, TrendingDown, Clock, User } from 'lucide-react'
import { Payment } from '@/lib/types/index'
// في الواقع: import { getRegisterPayments } from '@/lib/db/payments'

interface Props {
  registerId: string
}

export function PaymentsList({ registerId }: Props) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: جلب من Server Action
    // const data = await getRegisterPaymentsAction(registerId)
    
    // Mock data للتوضيح
    const mockPayments: Payment[] = [
      {
        id: '1',
        amount: 180000,
        method: 'cash',
        direction: 'in',
        reference: 'SAL-001',
        createdat: new Date(),
        sale_id: 'sale1',
        storeid: 'store1',
        createdbyid: 'user1',
        status: 'captured',
        captured_at: new Date(),
        is_reconciled: false,
        purchase_id: null,
        expense_id: null,
        register_id: null,
        cancelled_at: null,
        cancellation_reason: null,
        doc_sequence: null,
        notes: null,
        reconciled_at: null,
        reconciled_by: null
      }
    ]
    
    setPayments(mockPayments)
    setLoading(false)
  }, [registerId])

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>
  }

  if (payments.length === 0) {
    return (
      <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center">
        <FileText className="mx-auto mb-3 opacity-30" size={48} />
        <p className="text-text-secondary">لا توجد حركات لعرضها</p>
      </div>
    )
  }

  return (
    <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border bg-bg-light">
        <h3 className="font-bold text-text-primary">
          حركات الصندوق اليوم ({payments.length})
        </h3>
      </div>

      <div className="divide-y divide-border">
        {payments.map(payment => (
          <div key={payment.id} className="p-4 hover:bg-bg-light transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-lg ${
                  payment.direction === 'in' 
                    ? 'bg-green-100 dark:bg-green-900/20' 
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  {payment.direction === 'in' ? (
                    <TrendingUp className="text-green-600" size={20} />
                  ) : (
                    <TrendingDown className="text-red-600" size={20} />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-text-primary">
                      {payment.sale_id ? 'بيع' : payment.purchase_id ? 'شراء' : 'مصروف'}
                    </span>
                    <span className="text-text-secondary text-sm">
                      #{payment.reference || payment.id.slice(0, 8)}
                    </span>
                  </div>
                  
                  <div className="flex gap-3 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(payment.createdat).toLocaleTimeString('ar-DZ', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <span>{payment.method === 'cash' ? 'نقدي' : payment.method}</span>
                  </div>
                </div>
              </div>
              
              <div className={`font-bold text-lg ${
                payment.direction === 'in' ? 'text-green-600' : 'text-red-600'
              }`}>
                {payment.direction === 'in' ? '+' : '-'}
                {payment.amount.toLocaleString()} دج
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

