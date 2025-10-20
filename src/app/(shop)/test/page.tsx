'use client'

import { useState, useEffect } from 'react'
import { ExpenseClientRepo } from '@/lib/supabase/queries/client/expense.client'
import { NewExpense } from '@/lib/types/expense'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [form, setForm] = useState<NewExpense>({
    storeid: '550e8400-e29b-41d4-a716-446655440000',
    category: '',
    amount: 0,
    description: '',
  })

  async function fetchExpenses() {
    const res = await fetch(`/api/expense?storeid=${form.storeid}`)
    const data = await res.json()
    setExpenses(data)
  }

  async function handleAdd() {
    const added = await ExpenseClientRepo.create(form)
    setExpenses((prev) => [added, ...prev])
    setForm({ ...form, category: '', amount: 0, description: '' })
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Expenses</h1>

      <div className="flex gap-2">
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
          className="border p-2"
        />
        <button onClick={handleAdd} className="bg-green-600 text-white px-3 py-2 rounded">
          Add
        </button>
      </div>

      <ul>
        {expenses.map((ex) => (
          <li key={ex.id}>
            {ex.category} - {ex.amount} DA
          </li>
        ))}
      </ul>
    </div>
  )
}
