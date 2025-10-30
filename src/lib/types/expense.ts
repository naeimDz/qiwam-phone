// ==================== Expense (المصروفات) ====================

export type ExpenseStatus = 'pending' | 'paid' | 'cancelled'
export type ExpensePaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'other'

export type Expense = {
  id: string
  storeid: string
  category: string
  amount: number
  description: string | null
  expense_date: Date
  createdby: string | null
  status: ExpenseStatus
  payment_method: ExpensePaymentMethod
  register_id: string | null
  paid_at: Date | null
  paid_by: string | null
  createdat: Date
  deleted_at: Date | null
}

export type ExpenseWithDetails = Expense & {
  created_by_name: string | null
  paid_by_name: string | null
}

export type ExpenseInsert = Omit<Expense, 'id' | 'createdat' | 'deleted_at'>
export type ExpenseUpdate = Partial<Omit<Expense, 'id' | 'storeid' | 'createdat' | 'deleted_at'>>
