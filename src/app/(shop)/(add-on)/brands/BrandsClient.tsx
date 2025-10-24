// app/admin/brands/BrandsClient.tsx
'use client'

import { useState } from 'react'
import { Brand, UserProfile } from '@/lib/types'
import { createBrandAction, updateBrandAction, deleteBrandAction } from '@/lib/actions/brands'
import { useRouter } from 'next/navigation'

type Props = {
  brands: Brand[]
  userRole: UserProfile['role']
}

export default function BrandsClient({ brands, userRole }: Props) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canDelete = userRole === 'owner'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    const result = editingBrand
      ? await updateBrandAction(editingBrand.id, formData)
      : await createBrandAction(formData)

    if (result.success) {
      setIsModalOpen(false)
      setEditingBrand(null)
      router.refresh()
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  async function handleDelete(brandId: string) {
    if (!confirm('هل أنت متأكد من حذف هذه العلامة التجارية؟')) return

    setLoading(true)
    const result = await deleteBrandAction(brandId)
    
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  function openCreateModal() {
    setEditingBrand(null)
    setError(null)
    setIsModalOpen(true)
  }

  function openEditModal(brand: Brand) {
    setEditingBrand(brand)
    setError(null)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">العلامات التجارية</h1>
            <p className="text-gray-600 text-sm mt-1">إدارة علامات الهواتف والإكسسوارات</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة علامة تجارية
          </button>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="text-sm text-gray-600">إجمالي العلامات التجارية</div>
          <div className="text-3xl font-bold text-indigo-600 mt-1">{brands.length}</div>
        </div>

        {/* Brands List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {brands.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">لا توجد علامات تجارية</p>
              <p className="text-gray-500 text-sm mt-2">ابدأ بإضافة علامة تجارية جديدة</p>
            </div>
          ) : (
            <div className="divide-y">
              {brands.map((brand) => (
                <div key={brand.id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-600 font-bold">{brand.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{brand.name}</p>
                      <p className="text-xs text-gray-500">
                        تم الإضافة: {new Date(brand.createdat).toLocaleDateString('ar-DZ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(brand)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="تعديل"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(brand.id)}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingBrand ? 'تعديل علامة تجارية' : 'إضافة علامة تجارية جديدة'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  اسم العلامة التجارية
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={editingBrand?.name || ''}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="مثال: Samsung, Apple, Xiaomi"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'جاري الحفظ...' : editingBrand ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}