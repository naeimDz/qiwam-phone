'use client'

import { useState, useEffect } from 'react'
import { CashRegister, CashRegisterSnapshot } from '@/lib/types/index'
import { getCashSnapshotsAction } from '@/lib/actions/cashRegister.actions'
import { Clock, TrendingUp, FileText, ChevronDown } from 'lucide-react'

interface Props {
  registerHistory: CashRegister[]
}

export function HistoryTab({ registerHistory }: Props) {
  const [selectedRegisterId, setSelectedRegisterId] = useState<string | null>(
    registerHistory[0]?.id || null
  )
  const [snapshots, setSnapshots] = useState<CashRegisterSnapshot[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch snapshots when register is selected
  useEffect(() => {
    if (!selectedRegisterId) return

    setLoading(true)
    getCashSnapshotsAction(selectedRegisterId).then(result => {
      if (result.success) {
        setSnapshots(result.data || [])
      }
      setLoading(false)
    })
  }, [selectedRegisterId])

  if (registerHistory.length === 0) {
    return (
      <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center">
        <FileText className="mx-auto mb-3 opacity-30" size={48} />
        <p className="text-text-secondary">لا يوجد سجل سابق</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Register History List */}
      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-bg-light">
          <h3 className="font-bold text-text-primary">سجل الصناديق المغلقة</h3>
        </div>
        
        <div className="divide-y divide-border">
          {registerHistory.map(register => (
            <RegisterHistoryItem
              key={register.id}
              register={register}
              isSelected={register.id === selectedRegisterId}
              onSelect={setSelectedRegisterId}
            />
          ))}
        </div>
      </div>

      {/* Snapshots for selected register */}
      {selectedRegisterId && (
        <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-bg-light">
            <h3 className="font-bold text-text-primary">
              اللقطات ({snapshots.length})
              {loading && <span className="text-sm text-text-secondary ml-2">جاري التحميل...</span>}
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-bg-light rounded animate-pulse" />
              ))}
            </div>
          ) : snapshots.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">
              لا توجد لقطات مسجلة
            </div>
          ) : (
            <div className="divide-y divide-border">
              {snapshots.map(snapshot => (
                <SnapshotItem key={snapshot.id} snapshot={snapshot} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RegisterHistoryItem({ 
  register, 
  isSelected, 
  onSelect 
}: { 
  register: CashRegister
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const openedDate = new Date(register.opened_at)
  const closedDate = register.closed_at ? new Date(register.closed_at) : null
  const variance = register.closing_balance 
    ? register.closing_balance - (register.expected_balance ?? 0)
    : 0

  return (
    <button
      onClick={() => onSelect(register.id)}
      className={`w-full p-4 text-right hover:bg-bg-light transition-colors ${
        isSelected ? 'bg-bg-light' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-text-secondary" />
            <span className="font-semibold text-text-primary">
              {openedDate.toLocaleDateString('ar-DZ')}
            </span>
            <span className="text-text-secondary text-sm">
              {openedDate.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
              {closedDate && ` - ${closedDate.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}`}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-text-secondary">الافتتاح: </span>
              <span className="font-semibold">{register.opening_balance.toLocaleString()} دج</span>
            </div>
            <div>
              <span className="text-text-secondary">المتوقع: </span>
              <span className="font-semibold">{register.expected_balance?.toLocaleString() ?? 0} دج</span>
            </div>
            {register.closing_balance !== null && (
              <div>
                <span className="text-text-secondary">الفعلي: </span>
                <span className={`font-semibold ${variance !== 0 ? 'text-orange-600' : ''}`}>
                  {register.closing_balance.toLocaleString()} دج
                </span>
              </div>
            )}
          </div>
        </div>
        
        <ChevronDown 
          size={20} 
          className={`text-text-secondary transition-transform ${isSelected ? 'rotate-180' : ''}`}
        />
      </div>
    </button>
  )
}

function SnapshotItem({ snapshot }: { snapshot: CashRegisterSnapshot }) {
  const snapshotDate = new Date(snapshot.snapshot_time)
  const typeLabels = {
    automatic: 'تلقائية',
    manual: 'يدوية',
    reconciliation: 'تسوية',
    shift_close: 'إغلاق وردية'
  }

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <TrendingUp className="text-blue-600" size={20} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-text-primary">
                {typeLabels[snapshot.snapshot_type]}
              </span>
              {snapshot.transactions_count && (
                <span className="text-text-secondary text-xs">
                  ({snapshot.transactions_count} عملية)
                </span>
              )}
            </div>
            
            <div className="flex gap-3 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {snapshotDate.toLocaleTimeString('ar-DZ', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            
            {snapshot.notes && (
              <p className="text-sm text-text-secondary mt-2">{snapshot.notes}</p>
            )}
          </div>
        </div>
        
        <div className="font-bold text-lg text-text-primary">
          {snapshot.balance_at_time.toLocaleString()} دج
        </div>
      </div>
    </div>
  )
}