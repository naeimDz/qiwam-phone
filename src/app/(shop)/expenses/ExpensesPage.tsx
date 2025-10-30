'use client'

import { useState, useCallback } from 'react'
import { Plus, TrendingDown, Calendar, Search, Edit2, Trash2, X, Check, Loader } from 'lucide-react'
import { StatsCard } from '@/components/ui/StatsCard'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  createExpenseAction, 
  deleteExpenseAction, 
  getExpensesAction 
} from '@/lib/actions/expenses.actions'
import { Expense } from '@/lib/types/expense'

interface CategoryType {
  id: string
  label: string
  icon: string
}

const categories: CategoryType[] = [
  { id: 'rent', label: 'كراء المحل', icon: '🏪' },
  { id: 'electricity', label: 'فواتير الكهرباء', icon: '⚡' },
  { id: 'phone', label: 'شحن الرصيد', icon: '📱' },
  { id: 'coffee', label: 'قهوة وضيافة', icon: '☕' },
  { id: 'fuel', label: 'بنزين ونقل', icon: '⛽' },
  { id: 'supplies', label: 'مستلزمات', icon: '📦' },
  { id: 'maintenance', label: 'صيانة وإصلاح', icon: '🔧' },
  { id: 'other', label: 'أخرى', icon: '💼' }
]

export default function ExpensesPage({ initialExpenses = [] }: { initialExpenses?: Expense[] }) {
  const storeId = '550e8400-e29b-41d4-a716-446655440000'
  
  // State
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState('today')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: ''
  })

  const getExpenseDate = (expense: Expense): Date | null => {
    const dateStr = expense.expense_date || expense.createdat
    return dateStr ? new Date(dateStr) : null
  }

  // 🔍 Filter logic
  const filteredExpenses = expenses.filter(exp => {
    const matchCategory = selectedCategory === 'all' || exp.category === selectedCategory
    const matchSearch = exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true
    
    const expDate = getExpenseDate(exp)
    if (!expDate) return matchCategory && matchSearch
    
    const today = new Date()
    let matchDate = true

    if (selectedDate === 'today') {
      matchDate = expDate.toDateString() === today.toDateString()
    } else if (selectedDate === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      matchDate = expDate >= weekAgo
    } else if (selectedDate === 'month') {
      matchDate = expDate.getMonth() === today.getMonth() && 
                  expDate.getFullYear() === today.getFullYear()
    }

    return matchCategory && matchSearch && matchDate
  })

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const todayExpenses = filteredExpenses
    .filter(e => {
      const expDate = getExpenseDate(e)
      return expDate ? expDate.toDateString() === new Date().toDateString() : false
    })
    .reduce((s, e) => s + e.amount, 0)

  // ➕ Add expense
  const handleAddExpense = useCallback(async () => {
    if (!formData.amount || !formData.category || !formData.description.trim()) {
      alert('يرجى ملء جميع الحقول')
      return
    }

    setSubmitting(true)
    try {
      const result = await createExpenseAction({
        storeid: storeId,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        createdby: 'current-user', // Replace with actual user ID
        payment_method: 'cash',
        expense_date: new Date()
      })

      if (result.success && result.data) {
        setExpenses([result.data, ...expenses])
        setFormData({ amount: '', category: '', description: '' })
        setShowAddModal(false)
      } else {
        alert(result.error || 'فشل إضافة المصروف')
      }
    } catch (error) {
      console.error('Add expense error:', error)
      alert('خطأ في إضافة المصروف')
    } finally {
      setSubmitting(false)
    }
  }, [formData, expenses, storeId])

  // 🗑️ Delete expense
  const handleDeleteExpense = useCallback(async (id: string) => {
    if (!confirm('هل تريد حذف هذا المصروف؟')) return

    try {
      setLoading(true)
      const result = await deleteExpenseAction(id)
      
      if (result.success) {
        setExpenses(expenses.filter(exp => exp.id !== id))
      } else {
        alert(result.error || 'فشل حذف المصروف')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('خطأ في حذف المصروف')
    } finally {
      setLoading(false)
    }
  }, [expenses])

  const getCategoryInfo = (categoryId: string) =>
    categories.find(c => c.id === categoryId) || categories[7]

  // ========= Toolbar =========
  const toolbar = (
    <>
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="relative w-full md:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
          <input
            type="text"
            placeholder="بحث في المصاريف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
          />
        </div>

        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
        >
          <option value="today">اليوم</option>
          <option value="week">هذا الأسبوع</option>
          <option value="month">هذا الشهر</option>
          <option value="all">الكل</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
        >
          <option value="all">جميع التصنيفات</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center gap-2 font-semibold shadow-lg"
      >
        <Plus size={20} />
        <span>إضافة مصروف</span>
      </button>
    </>
  )

  const statsCardExpenses = (
    <>
      <StatsCard
        title="إجمالي اليوم"
        value={`${todayExpenses.toLocaleString()} دج`}
        icon={TrendingDown}
        variant="danger"
        withGradient
      />

      <StatsCard
        title="الفترة المحددة"
        value={`${totalExpenses.toLocaleString()} دج`}
        icon={Calendar}
        variant="primary"
      />

      <StatsCard
        title="عدد العمليات"
        value={filteredExpenses.length}
        icon={TrendingDown}
        variant="accent"
      />
    </>
  )

  const content = (
    <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-light">
            <tr>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">التصنيف</th>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">الوصف</th>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">المبلغ</th>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">التاريخ</th>
              <th className="text-center px-4 py-3 text-text-secondary font-semibold">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-text-secondary">
                  <TrendingDown className="mx-auto mb-3 opacity-30" size={48} />
                  <p>لا توجد مصاريف لعرضها</p>
                </td>
              </tr>
            ) : (
              filteredExpenses.map(expense => {
                const category = getCategoryInfo(expense.category)
                return (
                  <tr key={expense.id} className="hover:bg-bg-light transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{category.icon}</span>
                        <span className="text-text-primary font-medium">{category.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-text-primary">{expense.description || '-'}</td>
                    <td className="px-4 py-4">
                      <span className="text-red-500 font-bold">{expense.amount.toLocaleString()} دج</span>
                    </td>
                    <td className="px-4 py-4 text-text-secondary text-sm">
                      {getExpenseDate(expense)?.toLocaleDateString('ar-DZ') || 'غير محدد'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-primary" disabled>
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          disabled={loading}
                          className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-red-500 disabled:opacity-50"
                        >
                          {loading ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <DashboardLayout toolbar={toolbar} StatsCard={statsCardExpenses}>
      {content}

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-primary border border-border rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">إضافة مصروف جديد</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setFormData({ amount: '', category: '', description: '' })
                }}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="block text-text-primary font-medium mb-2">المبلغ (دج)</label>
              <input
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary text-2xl font-bold text-center focus:border-primary outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-text-primary font-medium mb-2">التصنيف</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`p-3 rounded-xl border transition-all text-right ${
                      formData.category === cat.id
                        ? 'border-primary bg-primary bg-opacity-10'
                        : 'border-border bg-bg-secondary hover:border-primary'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">{cat.icon}</span>
                    <span className="text-text-primary text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-text-primary font-medium mb-2">الوصف</label>
              <input
                type="text"
                placeholder="مثال: كراء 3 أيام"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setFormData({ amount: '', category: '', description: '' })
                }}
                disabled={submitting}
                className="flex-1 px-4 py-3 rounded-xl border border-border text-text-primary hover:bg-bg-secondary transition-all disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddExpense}
                disabled={submitting}
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
              >
                {submitting ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  <>
                    <Check size={20} />
                    <span>حفظ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}