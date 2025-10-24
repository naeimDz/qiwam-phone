// app/(dashboard)/admin/customers/CustomersManagement.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Users, AlertCircle, Search, Edit2, Trash2, X, Check, Phone, MapPin } from 'lucide-react'
import { StatsCard } from '@/components/ui/StatsCard'
import type { Customer } from '@/lib/types'
import {
  createCustomerFormAction,
  updateCustomerFormAction,
  deleteCustomerFormAction,
  toggleCustomerActiveFormAction
} from './actions'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

interface CustomersManagementProps {
  initialCustomers: Customer[]
}

export default function CustomersManagement({ initialCustomers }: CustomersManagementProps) {
  const [mounted, setMounted] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers || [])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterActive, setFilterActive] = useState<string>('all')

  const [formState, setFormState] = useState({
    fullname: '',
    phone: '',
    address: '',
    notes: ''
  })

  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setCustomers(initialCustomers || [])
  }, [initialCustomers])

  if (!mounted) return null

  // Filtering
  const filtered = customers.filter(c => {
    const matchesSearch =
      c.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery)
    const matchesFilter =
      filterActive === 'all' ? true :
      filterActive === 'active' ? c.active === true :
      c.active === false
    return matchesSearch && matchesFilter
  })

  // Stats
  const total = customers.length
  const inactive = customers.filter(c => !c.active).length

  // Modal handlers
  const openModal = (c?: Customer) => {
    if (c) {
      setEditing(c)
      setFormState({
        fullname: c.fullname || '',
        phone: c.phone || '',
        address: c.address || '',
        notes: c.notes || ''
      })
    } else {
      setEditing(null)
      setFormState({
        fullname: '',
        phone: '',
        address: '',
        notes: ''
      })
    }
    setShowAddModal(true)
  }

  const handlePostActionRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
    setShowAddModal(false)
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard 
          title="عملاء غير نشطين" 
          value={inactive} 
          icon={AlertCircle} 
          variant="danger" 
          withGradient 
        />
        <StatsCard 
          title="إجمالي العملاء" 
          value={total} 
          icon={Users} 
          variant="accent" 
        />
      </div>

      {/* Toolbar */}
      <div className="bg-bg-secondary border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
          >
            <option value="all">كل العملاء</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>

        <button
          onClick={() => openModal()}
          className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center gap-2 font-semibold shadow-lg"
        >
          <Plus size={20} />
          <span>عميل جديد</span>
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-light">
              <tr>
                <th className="text-right px-4 py-3 text-text-secondary font-semibold">الاسم</th>
                <th className="text-right px-4 py-3 text-text-secondary font-semibold">الهاتف</th>
                <th className="text-right px-4 py-3 text-text-secondary font-semibold">العنوان</th>
                <th className="text-center px-4 py-3 text-text-secondary font-semibold">الحالة</th>
                <th className="text-center px-4 py-3 text-text-secondary font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-secondary">
                    <Users className="mx-auto mb-3 opacity-30" size={48} />
                    <p>لا يوجد عملاء</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-bg-light transition-colors">
                    <td className="px-4 py-4 text-text-primary font-medium">{c.fullname}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-text-primary">
                        <Phone className="text-text-secondary" size={16} />
                        {c.phone || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {c.address ? (
                        <div className="flex items-center gap-2 text-text-primary">
                          <MapPin className="text-text-secondary" size={16} />
                          {c.address}
                        </div>
                      ) : (
                        <span className="text-text-secondary text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        c.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {c.active ? 'نشط' : 'معطّل'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(c)}
                          className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-primary"
                          title="تعديل"
                        >
                          <Edit2 size={18} />
                        </button>

                        {/* Delete form */}
                        <form
                          action={async (formData: FormData) => {
                            await deleteCustomerFormAction(formData);
                          }}
                          onSubmit={() => { handlePostActionRefresh() }}
                          className="inline-block"
                        >
                          <input type="hidden" name="customerId" value={c.id} />
                          <button
                            type="submit"
                            className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-red-500"
                            title="حذف"
                            onClick={(e) => {
                              if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) e.preventDefault()
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </form>

                        {/* Toggle active form */}
                        <form
                          action={async (formData: FormData) => {
                            await toggleCustomerActiveFormAction(formData);
                            handlePostActionRefresh();
                          }}
                          onSubmit={() => { handlePostActionRefresh() }}
                        >
                          <input type="hidden" name="customerId" value={c.id} />
                          <input type="hidden" name="active" value={!c.active ? 'true' : 'false'} />
                          <button
                            type="submit"
                            className={`p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary ${c.active ? 'hover:text-amber-400' : 'hover:text-green-400'}`}
                            title={c.active ? 'تعطيل العميل' : 'تفعيل العميل'}
                          >
                            {c.active ? 'تعطيل' : 'تفعيل'}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-primary border border-border rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">
                {editing ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary"
              >
                <X size={20} />
              </button>
            </div>

            {/* Create form */}
            {!editing && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  await createCustomerFormAction(formData);
                  handlePostActionRefresh();
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-text-primary font-medium mb-2">
                      اسم العميل <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="fullname"
                      type="text"
                      placeholder="مثال: أحمد محمد"
                      value={formState.fullname}
                      onChange={(e) => setFormState({ ...formState, fullname: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-text-primary font-medium mb-2">رقم الهاتف</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                      <input
                        name="phone"
                        type="tel"
                        placeholder="مثال: 0551234567"
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        className="w-full pr-10 px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-primary font-medium mb-2">العنوان</label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                      <input
                        name="address"
                        type="text"
                        placeholder="مثال: حي النصر، قسنطينة"
                        value={formState.address}
                        onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                        className="w-full pr-10 px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-primary font-medium mb-2">ملاحظات</label>
                    <textarea
                      name="notes"
                      placeholder="أي ملاحظات إضافية..."
                      value={formState.notes}
                      onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-border text-text-primary hover:bg-bg-secondary transition-all"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    <Check size={20} />
                    <span>إضافة العميل</span>
                  </button>
                </div>
              </form>
            )}

            {/* Update form */}
            {editing && (
              <form
                action={async (formData: FormData) => {
                  await updateCustomerFormAction(formData);
                }}
                onSubmit={() => handlePostActionRefresh()}
              >
                <input type="hidden" name="customerId" value={editing.id} />
                <div className="space-y-4">
                  <div>
                    <label className="block text-text-primary font-medium mb-2">
                      اسم العميل <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="fullname"
                      type="text"
                      placeholder="مثال: أحمد محمد"
                      defaultValue={formState.fullname}
                      onChange={(e) => setFormState({ ...formState, fullname: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-text-primary font-medium mb-2">رقم الهاتف</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                      <input
                        name="phone"
                        type="tel"
                        placeholder="مثال: 0551234567"
                        defaultValue={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        className="w-full pr-10 px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-primary font-medium mb-2">العنوان</label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                      <input
                        name="address"
                        type="text"
                        placeholder="مثال: حي النصر، قسنطينة"
                        defaultValue={formState.address}
                        onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                        className="w-full pr-10 px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-primary font-medium mb-2">ملاحظات</label>
                    <textarea
                      name="notes"
                      placeholder="أي ملاحظات إضافية..."
                      defaultValue={formState.notes}
                      onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditing(null) }}
                    className="flex-1 px-4 py-3 rounded-xl border border-border text-text-primary hover:bg-bg-secondary transition-all"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    <Check size={20} />
                    <span>حفظ التعديلات</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}