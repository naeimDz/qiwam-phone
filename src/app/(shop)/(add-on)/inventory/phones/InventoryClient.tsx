'use client'

import { useState } from 'react'
import {
  Smartphone,
  Package,
  TrendingUp,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { StatsCard } from '@/components/ui/StatsCard'
import DashboardLayout from '@/components/DashboardLayout'
import {
  AccessoryWithDetails,
  PhoneWithDetails,
  Brand,
  Category,
  Supplier,
} from '@/lib/types'
import { ConfirmDialog, useConfirm } from '@/components/modal/ConfirmDialog'
import { deleteAccessoryAction } from '@/lib/actions/accessories'
import { deletePhoneAction } from '@/lib/actions/phones'
import { useInventoryModal } from '@/lib/hooks/useInventoryModal'
import { BaseProductModal, ProductModalMode } from '@/components/modal/BaseProductModal'

interface InventoryClientProps {
  accessories: AccessoryWithDetails[]
  phones: PhoneWithDetails[]
  categories: Category[]
  brands: Brand[]
  suppliers: Supplier[]
  stats: {
    totalPhones: number
    totalAccessories: number
    accessories: any
    phones: any
    totalValue: {
      phones: number
      accessories: number
    }
  }
  warnings?: string[]
}

const ITEMS_PER_PAGE = 10

export function InventoryClient({
  accessories,
  phones,
  categories,
  brands,
  stats,
  warnings = [],
}: InventoryClientProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [phonesPage, setPhonesPAge] = useState(1)
  const [accessoriesPage, setAccessoriesPage] = useState(1)

  // 📊 الإحصائيات
  const lowStockAccessories = accessories.filter((a) => a.is_low_stock).length
  const availablePhones = phones.filter((p) => p.status === 'available').length
  const soldPhones = phones.filter((p) => p.status === 'sold').length
  const totalInventoryValue =
    stats.totalValue.phones + stats.totalValue.accessories

  // 🔍 البحث والفلترة للهواتف
  const filteredPhones = phones.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.imei.includes(searchQuery)
  )

  // 🔍 البحث والفلترة للإكسسوارات
  const filteredAccessories = accessories.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination للهواتف
  const phonesTotalPages = Math.ceil(filteredPhones.length / ITEMS_PER_PAGE)
  const phonesStart = (phonesPage - 1) * ITEMS_PER_PAGE
  const phonesEnd = phonesStart + ITEMS_PER_PAGE
  const currentPhones = filteredPhones.slice(phonesStart, phonesEnd)
const { modal, openAdd, openEdit, openCount } = useInventoryModal()

  // Pagination للإكسسوارات
  const accessoriesTotalPages = Math.ceil(
    filteredAccessories.length / ITEMS_PER_PAGE
  )
  const accessoriesStart = (accessoriesPage - 1) * ITEMS_PER_PAGE
  const accessoriesEnd = accessoriesStart + ITEMS_PER_PAGE
  const currentAccessories = filteredAccessories.slice(
    accessoriesStart,
    accessoriesEnd
  )

  const { state: confirmState, confirm, close } = useConfirm()

  // 🗑️ حذف الهاتف
  const handleDeletePhone = (phone: PhoneWithDetails) => {
    confirm({
      title: 'حذف الهاتف؟',
      message: `هل تريد حذف "${phone.name}" (IMEI: ${phone.imei})?`,
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      variant: 'danger',
      isDangerous: false,
      onConfirm: async () => {
        const result = await deletePhoneAction(phone.id)
        if (result.success) {
          // تحديث الصفحة أو إزالة من الـ state
          window.location.reload()
        }
      },
    })
  }

  // 🗑️ حذف الإكسسوار
  const handleDeleteAccessory = (accessory: AccessoryWithDetails) => {
    confirm({
      title: 'حذف الإكسسوار؟',
      message: `هل تريد حذف "${accessory.name}"؟`,
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      variant: 'danger',
      isDangerous: false,
      onConfirm: async () => {
        const result = await deleteAccessoryAction(accessory.id)
        if (result.success) {
          window.location.reload()
        }
      },
    })
  }
  // 📊 Stats Cards
  const statsCards = (
    <>
      <StatsCard
        title="إجمالي الهواتف"
        value={stats.totalPhones}
        icon={Smartphone}
        variant="primary"
        description={`${availablePhones} متاح`}
      />
      <StatsCard
        title="إجمالي الإكسسوارات"
        value={accessories.reduce((sum, a) => sum + a.quantity, 0)}
        icon={Package}
        variant="success"
        description={`${lowStockAccessories} منخفض المخزون`}
      />
      <StatsCard
        title="قيمة المخزون"
        value={`${(totalInventoryValue / 1000).toFixed(1)}K`}
        icon={TrendingUp}
        variant="accent"
        description="القيمة الإجمالية"
      />
    </>
  )

  // 🔧 Toolbar
  const toolbar = (
    <>
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
        <input
          type="text"
          placeholder="ابحث عن اسم أو IMEI أو SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
        />
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => openAdd("phone")}
          className="px-4 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center gap-2 font-semibold whitespace-nowrap">
          <Plus size={20} />
          <span>إضافة منتج</span>
        </button>
      </div>
    </>
  )

  // 🎯 Tabs
  const tabs = [
    { key: 'overview', label: '📊 نظرة عامة' },
    {
      key: 'phones',
      label: `📱 الهواتف (${filteredPhones.length})`,
    },
    {
      key: 'accessories',
      label: `📦 الإكسسوارات (${filteredAccessories.length})`,
    },
    {
      key: 'stats',
      label: '📈 الإحصائيات',
    },
  ]

  // ====== COMPONENTS ======

  // جدول الهواتف
  const PhonesTable = () => (
    <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-light">
            <tr>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">
                الهاتف
              </th>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">
                IMEI
              </th>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">
                العلامة
              </th>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">
                السعر
              </th>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">
                الحالة
              </th>
              <th className="text-center px-4 py-3 text-text-secondary font-semibold">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentPhones.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-text-secondary">
                  <Smartphone className="mx-auto mb-3 opacity-30" size={48} />
                  <p>لا توجد هواتف</p>
                </td>
              </tr>
            ) : (
              currentPhones.map((phone) => (
                <tr key={phone.id} className="hover:bg-bg-light transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-text-primary font-semibold">
                        {phone.name}
                      </p>
                      <p className="text-text-secondary text-xs mt-1">
                        {phone.brand_name}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <code className="px-2 py-1 bg-bg-primary rounded text-xs font-mono text-text-secondary">
                      {phone.imei}
                    </code>
                  </td>
                  <td className="px-4 py-4 text-text-primary">
                    {phone.brand_name || '-'}
                  </td>
                  <td className="px-4 py-4 text-text-primary font-semibold">
                    {phone.sellprice.toLocaleString()} دج
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        phone.status === 'available'
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      {phone.status === 'available' ? 'متاح' : 'مباع'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-primary">
                        <Eye size={18} />
                      </button>
                      <button 
                         onClick={() => openCount(phone, 'phone')}
                        className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-primary">
                        <Edit2 size={18} />
                      </button>
                      <button 
                          className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-red-500"
                          onClick={() => handleDeletePhone(phone)}
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

      {/* Pagination */}
      {phonesTotalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-text-secondary text-sm">
            عرض {phonesStart + 1} - {Math.min(phonesEnd, filteredPhones.length)} من{' '}
            {filteredPhones.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPhonesPAge((p) => Math.max(1, p - 1))}
              disabled={phonesPage === 1}
              className="p-2 rounded-lg border border-border text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() =>
                setPhonesPAge((p) => Math.min(phonesTotalPages, p + 1))
              }
              disabled={phonesPage === phonesTotalPages}
              className="p-2 rounded-lg border border-border text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // جدول الإكسسوارات
  const AccessoriesTable = () => (
    <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-light">
            <tr>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">
                الإكسسوار
              </th>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">
                الفئة
              </th>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">
                الكمية
              </th>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">
                السعر
              </th>
              <th className="text-right px-4 py-3 text-text-secondary font-semibold">
                الحالة
              </th>
              <th className="text-center px-4 py-3 text-text-secondary font-semibold">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentAccessories.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-text-secondary">
                  <Package className="mx-auto mb-3 opacity-30" size={48} />
                  <p>لا توجد إكسسوارات</p>
                </td>
              </tr>
            ) : (
              currentAccessories.map((acc) => (
                <tr key={acc.id} className="hover:bg-bg-light transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-text-primary font-semibold">
                        {acc.name}
                      </p>
                      <p className="text-text-secondary text-xs mt-1">
                        {acc.sku || '-'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-text-primary">
                    {acc.category_name || '-'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary font-bold">
                        {acc.quantity}
                      </span>
                      {acc.is_low_stock && (
                        <AlertCircle
                          className="text-yellow-500"
                          size={16}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-text-primary font-semibold">
                    {acc.sellprice.toLocaleString()} دج
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        acc.is_low_stock
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                          : 'bg-green-100 text-green-700 border-green-300'
                      }`}
                    >
                      {acc.is_low_stock ? 'منخفض' : 'جيد'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-primary">
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => openCount(acc, 'accessory')}
                        className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-primary">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteAccessory(acc)}
                        className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-red-500">
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

      {/* Pagination */}
      {accessoriesTotalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-text-secondary text-sm">
            عرض {accessoriesStart + 1} - {Math.min(accessoriesEnd, filteredAccessories.length)} من{' '}
            {filteredAccessories.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setAccessoriesPage((p) => Math.max(1, p - 1))}
              disabled={accessoriesPage === 1}
              className="p-2 rounded-lg border border-border text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() =>
                setAccessoriesPage((p) =>
                  Math.min(accessoriesTotalPages, p + 1)
                )
              }
              disabled={accessoriesPage === accessoriesTotalPages}
              className="p-2 rounded-lg border border-border text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // النظرة العامة
  const OverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* أحدث الهواتف */}
      <div className="bg-bg-secondary border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          أحدث الهواتف
        </h3>
        {phones.slice(0, 5).length === 0 ? (
          <p className="text-text-secondary text-sm">لا توجد هواتف</p>
        ) : (
          <div className="space-y-2">
            {phones.slice(0, 5).map((phone) => (
              <div
                key={phone.id}
                className="flex items-center justify-between p-2 hover:bg-bg-light rounded transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">
                    {phone.name}
                  </p>
                  <p className="text-xs text-text-secondary">{phone.imei}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${
                    phone.status === 'available'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {phone.status === 'available' ? 'متاح' : 'مباع'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مخزون منخفض */}
      <div className="bg-bg-secondary border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          مخزون منخفض
        </h3>
        {lowStockAccessories === 0 ? (
          <p className="text-text-secondary text-sm">
            جميع الإكسسوارات بمستوى جيد ✅
          </p>
        ) : (
          <div className="space-y-2">
            {accessories
              .filter((a) => a.is_low_stock)
              .slice(0, 5)
              .map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-2 hover:bg-red-50 rounded transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">
                      {acc.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {acc.quantity} / {acc.minqty}
                    </p>
                  </div>
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2">
                    ⚠️
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )

  // الإحصائيات
  const StatsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-bg-secondary border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          إحصائيات الهواتف
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-text-secondary">إجمالي الهواتف</span>
            <span className="font-bold text-text-primary">{stats.totalPhones}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-text-secondary">المتاحة</span>
            <span className="font-bold text-green-600">{availablePhones}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-text-secondary">المباعة</span>
            <span className="font-bold text-gray-600">{soldPhones}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">القيمة الإجمالية</span>
            <span className="font-bold text-text-primary">
              {(stats.totalValue.phones / 1000).toFixed(1)}K دج
            </span>
          </div>
        </div>
      </div>

      <div className="bg-bg-secondary border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          إحصائيات الإكسسوارات
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-text-secondary">إجمالي العناصر</span>
            <span className="font-bold text-text-primary">
              {accessories.reduce((sum, a) => sum + a.quantity, 0)}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-text-secondary">أنواع مختلفة</span>
            <span className="font-bold text-text-primary">
              {accessories.length}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-text-secondary">مخزون منخفض</span>
            <span className="font-bold text-yellow-600">{lowStockAccessories}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">القيمة الإجمالية</span>
            <span className="font-bold text-text-primary">
              {(stats.totalValue.accessories / 1000).toFixed(1)}K دج
            </span>
          </div>
        </div>
      </div>
    </div>
  )


  
  return (
    <>
    <DashboardLayout
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      StatsCard={statsCards}
      toolbar={toolbar}
    >
      {/* تحذيرات إن وجدت */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">تنبيهات</p>
              <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                {warnings.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* المحتوى حسب الـ Tab */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'phones' && <PhonesTable />}
      {activeTab === 'accessories' && <AccessoriesTable />}
      {activeTab === 'stats' && <StatsTab />}
      {/* 🗑️ Confirm Dialog */}
      <ConfirmDialog state={confirmState} onClose={close} />
    </DashboardLayout>
  
<BaseProductModal
        isOpen={modal.isOpen}
        mode={modal.mode}
        product={modal.product}
        productType={modal.productType}

        onClose={close} onSubmit={function (data: {}, mode: ProductModalMode): Promise<void> {
          throw new Error('Function not implemented.')
        } }/>
</>)


  
}