'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Plus,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Tag
} from 'lucide-react'
import { StatsCard } from '@/components/ui/StatsCard'
import DashboardLayout from '@/components/DashboardLayout'
import { CategoriesBrandsModal, Item } from '@/components/modal/CategoriesBrandsModal'
import { AddProductModal } from '@/components/modal/AddProductModal'
import { AccessoryWithDetails, Brand, Category, PhoneWithDetails, Supplier } from '@/lib/types'
import { AddAccessoryModal } from '@/components/modal/AddAccessoryModal'


// أنواع TypeScript
interface Product {
  id: string
  name: string
  category: string
  sku: string
  quantity: number
  minStock: number
  price: number
  cost: number
  supplier: string
  lastRestocked: string
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}

interface InventoryClientProps {
  accessories?: AccessoryWithDetails[]
  phones?: PhoneWithDetails[]
  suppliers?: Supplier[]
  categories: Category[]
  brands: Brand[]
  stats?: {
    totalPhones: number
    totalAccessories: number
    accessories?: any
    phones?: any
    totalValue: {
      phones: number
      accessories: number
    }
  }
  warnings?: string[]
}
export const InventoryClient:React.FC<InventoryClientProps> = ({
  categories,
  brands
}) => {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10


  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sku: '',
    quantity: '',
    minStock: '',
    price: '',
    cost: '',
    supplier: '',
    notes:''
  })

  useEffect(() => {
    setMounted(true)
    // بيانات تجريبية
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Samsung Galaxy S24 Ultra',
        category: 'phones',
        sku: 'SAM-S24U-512',
        quantity: 5,
        minStock: 3,
        price: 180000,
        cost: 150000,
        supplier: 'Samsung Algeria',
        lastRestocked: new Date().toISOString(),
        status: 'in-stock'
      },
      {
        id: '2',
        name: 'iPhone 15 Pro Max',
        category: 'phones',
        sku: 'APL-15PM-256',
        quantity: 2,
        minStock: 3,
        price: 250000,
        cost: 220000,
        supplier: 'Apple Distributor',
        lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'low-stock'
      },
      {
        id: '3',
        name: 'Xiaomi Redmi Note 13',
        category: 'phones',
        sku: 'XIA-RN13-128',
        quantity: 0,
        minStock: 5,
        price: 45000,
        cost: 38000,
        supplier: 'Xiaomi Store',
        lastRestocked: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'out-of-stock'
      },
      {
        id: '4',
        name: 'AirPods Pro 2',
        category: 'headphones',
        sku: 'APL-APP2-WHT',
        quantity: 12,
        minStock: 5,
        price: 35000,
        cost: 28000,
        supplier: 'Apple Distributor',
        lastRestocked: new Date().toISOString(),
        status: 'in-stock'
      },
      {
        id: '5',
        name: 'Samsung Fast Charger 45W',
        category: 'chargers',
        sku: 'SAM-CH45W',
        quantity: 25,
        minStock: 10,
        price: 8000,
        cost: 5500,
        supplier: 'Samsung Algeria',
        lastRestocked: new Date().toISOString(),
        status: 'in-stock'
      }
    ]
    setProducts(mockProducts)
    setFilteredProducts(mockProducts)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let filtered = products

    // فلترة حسب التبويب
    if (activeTab === 'low-stock') {
      filtered = filtered.filter(p => p.status === 'low-stock')
    } else if (activeTab === 'out-of-stock') {
      filtered = filtered.filter(p => p.status === 'out-of-stock')
    }

    // فلترة حسب الفئة
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // فلترة حسب البحث
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }, [activeTab, selectedCategory, searchQuery, products, mounted])

  if (!mounted) return null

  // حساب الإحصائيات
  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.cost), 0)
  const lowStockCount = products.filter(p => p.status === 'low-stock').length
  const outOfStockCount = products.filter(p => p.status === 'out-of-stock').length

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const handleAddProduct = () => {
    if (!formData.name || !formData.category || !formData.quantity) {
      alert('يرجى ملء الحقول المطلوبة')
      return
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      sku: formData.sku || `PRD-${Date.now()}`,
      quantity: parseInt(formData.quantity),
      minStock: parseInt(formData.minStock) || 5,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      supplier: formData.supplier,
      lastRestocked: new Date().toISOString(),
      status: parseInt(formData.quantity) === 0 
        ? 'out-of-stock' 
        : parseInt(formData.quantity) <= parseInt(formData.minStock || '5')
        ? 'low-stock'
        : 'in-stock'
    }

    setProducts([newProduct, ...products])
    setFormData({
      name: '',
      category: '',
      sku: '',
      quantity: '',
      minStock: '',
      price: '',
      cost: '',
      supplier: '',
      notes: ''
    })
    setShowAddModal(false)
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm('هل تريد حذف هذا المنتج؟')) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const getStatusBadge = (status: Product['status']) => {
    const styles = {
      'in-stock': 'bg-green-100 text-green-700 border-green-300',
      'low-stock': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'out-of-stock': 'bg-red-100 text-red-700 border-red-300'
    }
    const labels = {
      'in-stock': 'متوفر',
      'low-stock': 'مخزون منخفض',
      'out-of-stock': 'نفذ المخزون'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId
  }


  // Tabs
  const tabs = [
    { key: 'all', label: `الكل (${totalProducts})` },
    { key: 'low-stock', label: `مخزون منخفض (${lowStockCount})` },
    { key: 'out-of-stock', label: `نفذ المخزون (${outOfStockCount})` }
  ]

  // Stats Cards
  const statsCards = (
    <>
      <StatsCard
        title="إجمالي المنتجات"
        value={totalProducts}
        icon={Package}
        variant="primary"
        description="عدد المنتجات المسجلة"
      />
      <StatsCard
        title="قيمة المخزون"
        value={`${totalValue.toLocaleString()} دج`}
        icon={TrendingUp}
        variant="success"
        description="القيمة الإجمالية للمخزون"
      />
      <StatsCard
        title="تحذيرات المخزون"
        value={lowStockCount + outOfStockCount}
        icon={AlertTriangle}
        variant={lowStockCount + outOfStockCount > 0 ? "danger" : "default"}
        description={`${lowStockCount} منخفض، ${outOfStockCount} نفذ`}
      />
    </>
  )

  // Toolbar
  const toolbar = (
    <>
      <div className="flex flex-col md:flex-row gap-3 flex-1">
        {/* بحث */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
          <input
            type="text"
            placeholder=""
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
          />
        </div>

        {/* فلتر الفئة */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors min-w-[180px]"
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowCategoriesModal(true)}
          className="px-4 py-2.5 rounded-xl border border-border text-text-primary hover:bg-bg-light transition-all flex items-center gap-2"
        >
          <FolderTree size={20} />
          <span>الفئات والعلامات</span>
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center gap-2 font-semibold whitespace-nowrap"
        >
          <Plus size={20} />
          <span>إضافة منتج</span>
        </button>
        {/** 
        <button className="px-4 py-2.5 rounded-xl border border-border text-text-primary hover:bg-bg-light transition-all flex items-center gap-2">
          <Download size={20} />
          <span className="hidden md:inline">تصدير</span>
        </button>
      */}
      </div>
    </>
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
        {/* جدول المنتجات */}
        <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-light">
                <tr>
                  <th className="text-right px-4 py-3 text-text-secondary font-semibold">المنتج</th>
                  <th className="text-right px-4 py-3 text-text-secondary font-semibold">الفئة</th>
                  <th className="text-right px-4 py-3 text-text-secondary font-semibold">الكود</th>
                  <th className="text-right px-4 py-3 text-text-secondary font-semibold">الكمية</th>
                  <th className="text-right px-4 py-3 text-text-secondary font-semibold">السعر</th>
                  <th className="text-right px-4 py-3 text-text-secondary font-semibold">الحالة</th>
                  <th className="text-center px-4 py-3 text-text-secondary font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-text-secondary">
                      <Package className="mx-auto mb-3 opacity-30" size={48} />
                      <p>لا توجد منتجات لعرضها</p>
                    </td>
                  </tr>
                ) : (
                  currentProducts.map(product => (
                    <tr key={product.id} className="hover:bg-bg-light transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-text-primary font-semibold">{product.name}</p>
                          <p className="text-text-secondary text-xs mt-1">المورد: {product.supplier}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-text-primary">{getCategoryName(product.category)}</td>
                      <td className="px-4 py-4">
                        <code className="px-2 py-1 bg-bg-primary rounded text-xs font-mono text-text-secondary">
                          {product.sku}
                        </code>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-text-primary font-bold">{product.quantity}</span>
                          {product.quantity <= product.minStock && (
                            <AlertTriangle className="text-yellow-500" size={16} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-text-primary font-semibold">
                        {product.price.toLocaleString()} دج
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-primary">
                            <Eye size={18} />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-primary">
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-text-secondary text-sm">
                عرض {startIndex + 1} - {Math.min(endIndex, filteredProducts.length)} من {filteredProducts.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-border text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-border text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>

{/* نافذة إضافة منتج (يدوي أو متقدم) */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProduct}
        categories={categories}
      />
      <AddAccessoryModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProduct} categories={[]} suppliers={[]}      />

      {/* نافذة إدارة الفئات والعلامات التجارية */}
      <CategoriesBrandsModal
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        initialCategories={categories}
        initialBrands={brands}

        />

    </>
  )
}