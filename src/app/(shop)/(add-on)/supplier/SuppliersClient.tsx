// app/(dashboard)/admin/suppliers/SuppliersClient.tsx
'use client'

import React, { useEffect, useState, Fragment } from 'react'
import { Plus, Users, DollarSign, AlertCircle, Search, Edit2, Trash2, X, Check, Phone, MapPin } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { StatsCard } from '@/components/ui/StatsCard'
import type { Supplier } from '@/lib/types'
import {
  createSupplierFormAction,
  updateSupplierFormAction,
  deleteSupplierFormAction,
  toggleSupplierActiveFormAction
} from './actions'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

interface Props {
  initialSuppliers: Supplier[]
}

export default function SuppliersClient({ initialSuppliers }: Props) {
  const [mounted, setMounted] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers || [])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterActive, setFilterActive] = useState<string>('all')

  // form controlled state for client-side preview (optional)
  const [formState, setFormState] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  })

  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setSuppliers(initialSuppliers || [])
  }, [initialSuppliers])

  if (!mounted) return null

  // filtering
  const filtered = suppliers.filter(s => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone?.includes(searchQuery)
    const matchesFilter =
      filterActive === 'all' ? true :
      filterActive === 'active' ? s.active === true :
      s.active === false
    return matchesSearch && matchesFilter
  })

  // stats
  const total = suppliers.length
  //const withDebt = suppliers.filter(s => (s.balance || 0) > 0).length
 // const totalDebt = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0)

  // modal handlers
  const openModal = (s?: Supplier) => {
    if (s) {
      setEditing(s)
      setFormState({
        name: s.name || '',
        contact_person: s.contact_person || '',
        phone: s.phone || '',
        email: s.email || '',
        address: s.address || '',
        notes: s.notes || ''
      })
    } else {
      setEditing(null)
      setFormState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
      })
    }
    setShowAddModal(true)
  }

  // after server action completes, we refresh the server props by router.refresh()
  // We'll call router.refresh() after forms submit using onSubmit handler (client-side) — but because we use native form action, behavior is streaming.
  // To be safe, we trigger a refresh after a short transition to reflect DB changes.
  const handlePostActionRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
    setShowAddModal(false)
    setEditing(null)
  }

  // Toolbar UI
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
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
        >
          <option value="all">كل الموردين</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
      </div>

      <button
        onClick={() => openModal()}
        className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center gap-2 font-semibold shadow-lg"
      >
        <Plus size={20} />
        <span>مورد جديد</span>
      </button>
    </>
  )

  const statsCard = (
    <>
      <StatsCard title="موردين غير نشطين" value={suppliers.filter(s => !s.active).length} icon={AlertCircle} variant="danger" withGradient />
      <StatsCard title="إجمالي الرصيد" value={`1000 دج`} icon={DollarSign} variant="primary" />
      <StatsCard title="إجمالي الموردين" value={total} icon={Users} variant="accent" />
    </>
  )

  // ---- UI content (table) ----
  const content = (
    <>
      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-light">
              <tr>
                <th className="text-right px-4 py-3 text-text-secondary font-semibold">الاسم</th>
                <th className="text-right px-4 py-3 text-text-secondary font-semibold">الهاتف</th>
                <th className="text-right px-4 py-3 text-text-secondary font-semibold">العنوان</th>
                <th className="text-right px-4 py-3 text-text-secondary font-semibold">الرصيد</th>
                <th className="text-center px-4 py-3 text-text-secondary font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-secondary">
                    <Users className="mx-auto mb-3 opacity-30" size={48} />
                    <p>لا يوجد موردين</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-bg-light transition-colors">
                    <td className="px-4 py-4 text-text-primary font-medium">{s.name}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-text-primary">
                        <Phone className="text-text-secondary" size={16} />
                        {s.phone}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {s.address ? (
                        <div className="flex items-center gap-2 text-text-primary">
                          <MapPin className="text-text-secondary" size={16} />
                          {s.address}
                        </div>
                      ) : (
                        <span className="text-text-secondary text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                        {/**
                      <span className={`font-bold ${ (s.balance || 0) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {(s.balance || 0).toLocaleString()} دج
                      </span>
                     */}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(s)}
                          className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-primary"
                          title="تعديل"
                        >
                          <Edit2 size={18} />
                        </button>

                        {/* Delete form (server action) */}
                        <form
                          action={async (formData: FormData) => {
                            await deleteSupplierFormAction(formData);
                          }}
                          onSubmit={() => { handlePostActionRefresh() }}
                          className="inline-block"
                        >
                          <input type="hidden" name="supplierId" value={s.id} />
                          <button
                            type="submit"
                            className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-red-500"
                            title="حذف"
                            onClick={(e) => {
                              if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) e.preventDefault()
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </form>

                        {/* Toggle active form */}
                        <form
                          action={async (formData: FormData) => {
                            await toggleSupplierActiveFormAction(formData);
                            handlePostActionRefresh();
                          }}
                          onSubmit={() => { handlePostActionRefresh() }}
                        >
                          <input type="hidden" name="supplierId" value={s.id} />
                          <input type="hidden" name="active" value={!s.active ? 'true' : 'false'} />
                          <button
                            type="submit"
                            className={`p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary ${s.active ? 'hover:text-amber-400' : 'hover:text-green-400'}`}
                            title={s.active ? 'تعطيل المورد' : 'تفعيل المورد'}
                          >
                            {s.active ? 'تعطيل' : 'تفعيل'}
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
    </>
  )

  return (
    <DashboardLayout toolbar={toolbar} StatsCard={statsCard}>
      {content}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-primary border border-border rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">
                {editing ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
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
                  await createSupplierFormAction(formData);
                  handlePostActionRefresh();
                }}
              >
                <div>
                  <label className="block text-text-primary font-medium mb-2">
                    اسم المورد <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="مثال: شركة سمير"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-text-primary font-medium mb-2">مسؤول التواصل</label>
                  <input
                    name="contact_person"
                    type="text"
                    placeholder="مثال: أحمد"
                    value={formState.contact_person}
                    onChange={(e) => setFormState({ ...formState, contact_person: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
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
                  <label className="block text-text-primary font-medium mb-2">البريد الإلكتروني</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
                  />
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
                    <span>إضافة المورد</span>
                  </button>
                </div>
              </form>
            )}

            {/* Update form */}
            {editing && (
              <form
                action={async (formData: FormData) => {
                  await updateSupplierFormAction(formData);
                }}
                onSubmit={() => handlePostActionRefresh()}
              >
                <input type="hidden" name="supplierId" value={editing.id} />
                <div>
                  <label className="block text-text-primary font-medium mb-2">
                    اسم المورد <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="مثال: شركة سمير"
                    defaultValue={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-text-primary font-medium mb-2">مسؤول التواصل</label>
                  <input
                    name="contact_person"
                    type="text"
                    placeholder="مثال: أحمد"
                    defaultValue={formState.contact_person}
                    onChange={(e) => setFormState({ ...formState, contact_person: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
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
                  <label className="block text-text-primary font-medium mb-2">البريد الإلكتروني</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    defaultValue={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
                  />
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
    </DashboardLayout>
  )
}
