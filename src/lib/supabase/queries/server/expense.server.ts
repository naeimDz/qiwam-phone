// lib/supabase/queries/server/expense.server.ts
import { Expense } from "@/types"
import { createClientServer } from "../../supabaseServer"

export const ExpenseServerRepo = {
  async getAll(storeid: string) {
    const supabase = await createClientServer()
    const { data, error } = await supabase
      .from('expense')
      .select('*')
      .eq('storeid', storeid)
      .is('deleted_at', null)
      .order('expense_date', { ascending: false })

    if (error) throw new Error(error.message)
    return data as Expense[]
  },
  
}
