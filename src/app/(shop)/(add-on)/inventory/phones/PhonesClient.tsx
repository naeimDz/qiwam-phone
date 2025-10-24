// app/inventory/phones/PhonesClient.tsx
'use client'

import { useState } from 'react'
import { PhoneWithDetails, Brand, Supplier, UserProfile } from '@/lib/types'
import { addPhoneAction, updatePhoneAction, deletePhoneAction, searchPhoneByImeiAction } from '@/lib/actions/phones'
import { useRouter } from 'next/navigation'
import { AddPhoneModal } from '@/components/modal/addPhonemodal'

type Props = {
  phones: PhoneWithDetails[]
  stats: {
    available: number
    sold: number
    returned: number
    damaged: number
    total: number
  }
  brands: Brand[]
  suppliers: Supplier[]
  userRole: UserProfile['role']
}

type FilterStatus = 'all' | 'available' | 'sold' | 'returned' | 'damaged'

export default function PhonesClient({ phones, stats, brands, suppliers, userRole }: Props) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPhone, setEditingPhone] = useState<PhoneWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchImei, setSearchImei] = useState('')
  const [searchResult, setSearchResult] = useState<PhoneWithDetails | null>(null)

  const canDelete = userRole === 'owner'

  const filteredPhones = filterStatus === 'all' 
    ? phones 
    : phones.filter(p => p.status === filterStatus)

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    sold: 'bg-blue-100 text-blue-800',
    returned: 'bg-yellow-100 text-yellow-800',
    damaged: 'bg-red-100 text-red-800',
    reserved: 'bg-purple-100 text-purple-800'
  }

  const statusLabels = {
    available: 'متاح',
    sold: 'مباع',
    returned: 'مرتجع',
    damaged: 'تالف',
    reserved: 'محجوز'
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    const result = editingPhone
      ? await updatePhoneAction(editingPhone.id, formData)
      : await addPhoneAction(formData)

    if (result.success) {
      setIsModalOpen(false)
      setEditingPhone(null)
      router.refresh()
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  async function handleDelete(phoneId: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الهاتف؟')) return

    setLoading(true)
    const result = await deletePhoneAction(phoneId)
    
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
    
    setLoading(false)
  }

  async function handleSearch() {
    if (!searchImei.trim()) return
    
    setLoading(true)
    const result = await searchPhoneByImeiAction(searchImei.trim())
    
    if (result.success) {
      setSearchResult(result.data)
    } else {
      alert(result.error)
    }
    
    setLoading(false)
  }

  function openCreateModal() {
    setEditingPhone(null)
    setError(null)
    setIsModalOpen(true)
  }

  function openEditModal(phone: PhoneWithDetails) {
    setEditingPhone(phone)
    setError(null)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الهواتف</h1>
            <p className="text-gray-600 text-sm mt-1">إدارة مخزون الهواتف</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة هاتف
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-sm text-gray-600">الإجمالي</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 cursor-pointer" onClick={() => setFilterStatus('available')}>
            <div className="text-sm text-green-600 font-semibold">متاح</div>
            <div className="text-2xl font-bold text-green-900">{stats.available}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 cursor-pointer" onClick={() => setFilterStatus('sold')}>
            <div className="text-sm text-blue-600 font-semibold">مباع</div>
            <div className="text-2xl font-bold text-blue-900">{stats.sold}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 cursor-pointer" onClick={() => setFilterStatus('returned')}>
            <div className="text-sm text-yellow-600 font-semibold">مرتجع</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.returned}</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 cursor-pointer" onClick={() => setFilterStatus('damaged')}>
            <div className="text-sm text-red-600 font-semibold">تالف</div>
            <div className="text-2xl font-bold text-red-900">{stats.damaged}</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="البحث بـ IMEI..."
              value={searchImei}
              onChange={(e) => setSearchImei(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              بحث
            </button>
            {filterStatus !== 'all' && (
              <button
                onClick={() => setFilterStatus('all')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                إظهار الكل
              </button>
            )}
          </div>
          {searchResult && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-indigo-900">{searchResult.name}</p>
                  <p className="text-sm text-indigo-700">IMEI: {searchResult.imei}</p>
                  <p className="text-sm text-indigo-600">
                    {searchResult.brand_name} • {statusLabels[searchResult.status]}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchResult(null)
                    setSearchImei('')
                  }}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Phones Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredPhones.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">لا توجد هواتف</p>
              <p className="text-gray-500 text-sm mt-2">ابدأ بإضافة هاتف جديد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">اسم الهاتف</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">العلامة</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">IMEI</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الحالة</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">سعر الشراء</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">سعر البيع</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الربح</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPhones.map((phone) => {
                    const profit = phone.sellprice - phone.buyprice
                    const profitMargin = ((profit / phone.buyprice) * 100).toFixed(1)
                    
                    return (
                      <tr key={phone.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{phone.name}</div>
                          <div className="text-xs text-gray-500">{phone.model || '-'}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{phone.brand_name || '-'}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-700">{phone.imei}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[phone.status]}`}>
                            {statusLabels[phone.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{phone.buyprice.toLocaleString()} دج</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{phone.sellprice.toLocaleString()} دج</td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-green-600">+{profit.toLocaleString()} دج</div>
                          <div className="text-xs text-gray-500">{profitMargin}%</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {phone.status !== 'sold' && (
                              <button
                                onClick={() => openEditModal(phone)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="تعديل"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            {canDelete && phone.status !== 'sold' && (
                              <button
                                onClick={() => handleDelete(phone.id)}
                                disabled={loading}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                title="حذف"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AddPhoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={()=>handleSubmit} brands={[]} suppliers={[]}      />
    </div>
  )
}