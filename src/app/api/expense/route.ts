// lib/api/expenses.ts

import { createClientBrowser } from '@/lib/supabase/supabaseClient';
import type { Expense, NewExpense, UpdateExpense } from '@/lib/types/expense'

const supabase = createClientBrowser()

export const expensesApi = {
  // 📖 Read
  async getAll(storeId: string, filters?: { category?: string; dateRange?: string }) {
    let query = supabase
      .from('expense')
      .select('*')
      .eq('storeid', storeId)
      .is('deleted_at', null)
      .order('expense_date', { ascending: false })

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    if (filters?.dateRange) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (filters.dateRange === 'today') {
        query = query.gte('expense_date', today.toISOString())
      } else if (filters.dateRange === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        query = query.gte('expense_date', weekAgo.toISOString())
      } else if (filters.dateRange === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        query = query.gte('expense_date', monthStart.toISOString())
      }
    }

    const { data, error } = await query
    if (error) throw error
    return data as Expense[]
  },

  // ➕ Create
  async create(expense: NewExpense) {
    const { data, error } = await supabase
      .from('expense')
      .insert(expense)
      .select()
      .single()
    
    if (error) throw error
    return data as Expense
  },

  // ✏️ Update
  async update(id: string, updates: UpdateExpense) {
    const { data, error } = await supabase
      .from('expense')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Expense
  },

  // 🗑️ Soft Delete
  async softDelete(id: string) {
    const { error } = await supabase
      .from('expense')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  }
}