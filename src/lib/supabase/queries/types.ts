//===============================================
// 🧱 Types
// ================================================

export interface Expense {
  id: string
  storeid: string
  category: string
  amount: number
  description?: string | null
  expense_date?: string
  createdby?: string | null
  createdat?: string
  deleted_at?: string | null
}

export type NewExpense = Omit<Expense, 'id' | 'createdat' | 'deleted_at'>
export type UpdateExpense = Partial<Omit<Expense, 'id' | 'createdat'>>
