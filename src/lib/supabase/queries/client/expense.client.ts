// lib/supabase/queries/client/expense.client.ts

import { createClientBrowser } from "../../supabaseClient"
import { Expense, NewExpense, UpdateExpense } from "../types"

export const ExpenseClientRepo = {
  async create(newExpense: NewExpense) {
    const supabase = createClientBrowser()
    const { data, error } = await supabase
      .from('expense')
      .insert(newExpense)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data as Expense
  },

  async update(id: string, updates: UpdateExpense) {
    const supabase = createClientBrowser()
    const { data, error } = await supabase
      .from('expense')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data as Expense
  },
}
