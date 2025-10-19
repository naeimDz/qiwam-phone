'use client'

import { useState, useEffect, ReactNode } from 'react'
import { Plus, Users, DollarSign, AlertCircle, Search, Edit2, Trash2, X, Check, Phone, MapPin } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { StatsCard } from '@/components/ui/StatsCard'

// ==================== TYPES ====================
interface Customer {
  id: string
  name: string
  phone: string
  address?: string
  debt: number
  notes?: string
  createdAt: Date
  lastPurchase?: Date
}

// ==================== MOCK DATA ====================
const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'أحمد بن محمد',
    phone: '0551234567',
    address: 'حي النصر، الخروب',
    debt: 15000,
    notes: 'عميل دائم',
    createdAt: new Date('2024-01-15'),
    lastPurchase: new Date('2024-10-10')
  },
  {
    id: '2',
    name: 'فاطمة الزهراء',
    phone: '0661234567',
    address: 'وسط المدينة، قسنطينة',
    debt: 0,
    createdAt: new Date('2024-02-20'),
    lastPurchase: new Date('2024-10-15')
  },
  {
    id: '3',
    name: 'محمد العيد',
    phone: '0771234567',
    debt: 25000,
    notes: 'يفضل التقسيط',
    createdAt: new Date('2024-03-10'),
    lastPurchase: new Date('2024-09-20')
  }
]

// ==================== MAIN COMPONENT ====================
export default function CustomersPage() {
  const [mounted, setMounted] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDebt, setFilterDebt] = useState<string>('all')

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    debt: '',
    notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // ========= FILTERING =========
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery)
    
    const matchesFilter = filterDebt === 'all' ? true :
                         filterDebt === 'withDebt' ? customer.debt > 0 :
                         customer.debt === 0
    
    return matchesSearch && matchesFilter
  })

  // ========= STATS =========
  const totalCustomers = customers.length
  const totalDebt = customers.reduce((sum, c) => sum + c.debt, 0)
  const customersWithDebt = customers.filter(c => c.debt > 0).length

  // ========= FORM VALIDATION =========
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب'
    } else if (!/^0[5-7]\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'رقم هاتف غير صحيح (مثال: 0551234567)'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ========= MODAL HANDLERS =========
  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer)
      setFormData({
        name: customer.name,
        phone: customer.phone,
        address: customer.address || '',
        debt: customer.debt.toString(),
        notes: customer.notes || ''
      })
    } else {
      setEditingCustomer(null)
      setFormData({
        name: '',
        phone: '',
        address: '',
        debt: '0',
        notes: ''
      })
    }
    setErrors({})
    setShowAddModal(true)
  }

  const handleSave = () => {
    if (!validateForm()) return

    const customerData: Customer = {
      id: editingCustomer?.id || Date.now().toString(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim() || undefined,
      debt: parseFloat(formData.debt) || 0,
      notes: formData.notes.trim() || undefined,
      createdAt: editingCustomer?.createdAt || new Date(),
      lastPurchase: editingCustomer?.lastPurchase
    }

    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? customerData : c))
    } else {
      setCustomers([customerData, ...customers])
    }

    setShowAddModal(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      setCustomers(customers.filter(c => c.id !== id))
    }
  }

  // ========= TOOLBAR =========
  const toolbar = (
    <>
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="relative w-full md:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
          <input
            type="text"
            placeholder="ابحث بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
          />
        </div>

        <select
          value={filterDebt}
          onChange={(e) => setFilterDebt(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
        >
          <option value="all">كل العملاء</option>
          <option value="withDebt">عليهم ديون</option>
          <option value="noDebt">بدون ديون</option>
        </select>
      </div>

      <button
        onClick={() => openModal()}
        className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center gap-2 font-semibold shadow-lg"
      >
        <Plus size={20} />
        <span>عميل جديد</span>
      </button>
    </>
  )
  const statsCardExpenses = 
  <>
        <StatsCard
        title="عملاء عليهم ديون"
        value={customersWithDebt}
        icon={AlertCircle}
        variant="danger"
        withGradient
      />

          <StatsCard
        title="إجمالي الديون"
        value={`${totalDebt.toLocaleString()} دج`}
        icon={DollarSign}
        variant="primary"
      />
          
          <StatsCard
            title="إجمالي العملاء"

            value=              {totalCustomers} 
        icon={Users}
        variant="accent"

      />
  </>
  // ========= CONTENT =========
  const content: ReactNode = (
    <>
      {/* Table */}
      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-light">
              <tr>
                <th className="text-right px-4 py-3 text-text-secondary font-semibold">الاسم</th>
                <th className="text-right px-4 py-3 text-text-secondary font-semibold">الهاتف</th>
                <th className="text-right px-4 py-3 text-text-secondary font-semibold">العنوان</th>
                <th className="text-right px-4 py-3 text-text-secondary font-semibold">الدين</th>
                <th className="text-center px-4 py-3 text-text-secondary font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-secondary">
                    <Users className="mx-auto mb-3 opacity-30" size={48} />
                    <p>لا يوجد عملاء</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-bg-light transition-colors">
                    <td className="px-4 py-4 text-text-primary font-medium">{customer.name}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-text-primary">
                        <Phone className="text-text-secondary" size={16} />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {customer.address ? (
                        <div className="flex items-center gap-2 text-text-primary">
                          <MapPin className="text-text-secondary" size={16} />
                          {customer.address}
                        </div>
                      ) : (
                        <span className="text-text-secondary text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-bold ${customer.debt > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {customer.debt.toLocaleString()} دج
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(customer)}
                          className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-primary"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )

  return (
    <DashboardLayout toolbar={toolbar} StatsCard={statsCardExpenses} >
      {content}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-primary border border-border rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">
                {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="block text-text-primary font-medium mb-2">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="مثال: أحمد بن محمد"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name ? 'border-red-500' : 'border-border'
                } bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-text-primary font-medium mb-2">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                <input
                  type="tel"
                  placeholder="مثال: 0551234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full pr-10 px-4 py-3 rounded-xl border ${
                    errors.phone ? 'border-red-500' : 'border-border'
                  } bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-text-primary font-medium mb-2">العنوان</label>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                <input
                  type="text"
                  placeholder="مثال: حي النصر، قسنطينة"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pr-10 px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-primary font-medium mb-2">الدين (دج)</label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                <input
                  type="number"
                  placeholder="0"
                  value={formData.debt}
                  onChange={(e) => setFormData({ ...formData, debt: e.target.value })}
                  className="w-full pr-10 px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-primary font-medium mb-2">ملاحظات</label>
              <textarea
                placeholder="أي ملاحظات إضافية..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-border text-text-primary hover:bg-bg-secondary transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <Check size={20} />
                <span>{editingCustomer ? 'حفظ التعديلات' : 'إضافة العميل'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}