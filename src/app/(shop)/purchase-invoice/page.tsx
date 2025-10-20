'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Package,
  Plus,
  X,
  Save,
  FileText,
  Zap,
  AlertTriangle,
  Check,
  Edit2,
  Trash2,
  ChevronDown,
  User,
  Calendar,
  DollarSign,
  List,
  FileInput
} from 'lucide-react'

// Types
interface PurchaseItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
  imei?: string
  needsImei: boolean
}

interface Supplier {
  id: string
  name: string
}

interface DraftInvoice {
  id: string
  supplierName: string
  date: string
  itemsCount: number
  total: number
}

export default function PurchaseInvoicePage() {
  const [mounted, setMounted] = useState(false)
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: '1', name: 'قيس للتجارة' },
    { id: '2', name: 'Samsung Algeria' },
    { id: '3', name: 'Apple Distributor' },
    { id: '4', name: 'Xiaomi Store' }
  ])

  // Form states
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  
  // Item form
  const [itemForm, setItemForm] = useState({
    productName: '',
    quantity: '',
    unitPrice: '',
    imei: '',
    needsImei: false
  })

  // Modals
  const [showAddSupplier, setShowAddSupplier] = useState(false)
  const [showQuickMode, setShowQuickMode] = useState(false)
  const [showDrafts, setShowDrafts] = useState(false)
  const [newSupplierName, setNewSupplierName] = useState('')
  const [quickText, setQuickText] = useState('')

  // Drafts
  const [drafts, setDrafts] = useState<DraftInvoice[]>([
    {
      id: '1',
      supplierName: 'قيس للتجارة',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      itemsCount: 5,
      total: 125000
    },
    {
      id: '2',
      supplierName: 'Samsung Algeria',
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      itemsCount: 3,
      total: 89000
    }
  ])

  const quickTextRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // حساب المجموع
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const itemsNeedingImei = items.filter(item => item.needsImei && !item.imei).length

  // إضافة منتج
  const handleAddItem = () => {
    if (!itemForm.productName || !itemForm.quantity || !itemForm.unitPrice) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      productName: itemForm.productName,
      quantity: parseInt(itemForm.quantity),
      unitPrice: parseFloat(itemForm.unitPrice),
      total: parseInt(itemForm.quantity) * parseFloat(itemForm.unitPrice),
      imei: itemForm.imei || undefined,
      needsImei: itemForm.needsImei
    }

    setItems([...items, newItem])
    setItemForm({
      productName: '',
      quantity: '',
      unitPrice: '',
      imei: '',
      needsImei: false
    })
  }

  // حذف منتج
  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  // إضافة مورد جديد
  const handleAddSupplier = () => {
    if (!newSupplierName.trim()) return

    const newSupplier: Supplier = {
      id: Date.now().toString(),
      name: newSupplierName
    }

    setSuppliers([...suppliers, newSupplier])
    setSelectedSupplier(newSupplier.id)
    setNewSupplierName('')
    setShowAddSupplier(false)
  }

  // معالجة النص السريع
  const handleQuickTextParse = () => {
    if (!quickText.trim()) return

    const lines = quickText.split('\n').filter(line => line.trim())
    const newItems: PurchaseItem[] = []

    lines.forEach(line => {
      // تحليل النص: اسم المنتج x الكمية @ السعر
      // مثال: "A54 x5 @36000" أو "كوفر A54 x10 @250"
      const match = line.match(/^(.+?)\s*x\s*(\d+)\s*@\s*(\d+(?:\.\d+)?)$/i)
      
      if (match) {
        const [, productName, quantity, unitPrice] = match
        const qty = parseInt(quantity)
        const price = parseFloat(unitPrice)

        newItems.push({
          id: Date.now().toString() + Math.random(),
          productName: productName.trim(),
          quantity: qty,
          unitPrice: price,
          total: qty * price,
          needsImei: false
        })
      }
    })

    if (newItems.length > 0) {
      setItems([...items, ...newItems])
      setQuickText('')
      setShowQuickMode(false)
    } else {
      alert('تنسيق غير صحيح! استخدم: اسم المنتج x الكمية @ السعر\nمثال: كوفر A54 x10 @250')
    }
  }

  // حفظ كمسودة
  const handleSaveDraft = () => {
    if (items.length === 0 || !selectedSupplier) {
      alert('لا يمكن حفظ فاتورة فارغة')
      return
    }

    const supplierName = suppliers.find(s => s.id === selectedSupplier)?.name || 'غير محدد'

    const draft: DraftInvoice = {
      id: Date.now().toString(),
      supplierName,
      date: invoiceDate,
      itemsCount: totalItems,
      total: totalAmount
    }

    setDrafts([draft, ...drafts])
    alert('تم حفظ الفاتورة كمسودة ✓')
  }

  // حفظ الفاتورة النهائي
  const handleSaveInvoice = () => {
    if (items.length === 0) {
      alert('لا يمكن حفظ فاتورة فارغة')
      return
    }

    if (!selectedSupplier) {
      alert('يرجى اختيار المورد')
      return
    }

    if (itemsNeedingImei > 0) {
      const confirm = window.confirm(
        `هناك ${itemsNeedingImei} منتج يحتاج إلى IMEI. هل تريد الحفظ الآن وإضافة IMEI لاحقاً؟`
      )
      if (!confirm) return
    }

    // هنا يتم الحفظ الفعلي في قاعدة البيانات
    alert('✓ تم حفظ الفاتورة وتحديث المخزون بنجاح!')
    
    // إعادة تعيين النموذج
    setItems([])
    setSelectedSupplier('')
    setNotes('')
    setItemForm({
      productName: '',
      quantity: '',
      unitPrice: '',
      imei: '',
      needsImei: false
    })
  }

  // حذف مسودة
  const handleDeleteDraft = (id: string) => {
    if (confirm('هل تريد حذف هذه المسودة؟')) {
      setDrafts(drafts.filter(d => d.id !== id))
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary bg-opacity-10">
            <FileInput className="text-primary" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">إضافة فاتورة شراء</h1>
            <p className="text-text-secondary text-sm">إدخال وصل استلام من المورد</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowDrafts(true)}
            className="px-4 py-2.5 rounded-xl border border-border text-text-primary hover:bg-bg-light transition-all flex items-center gap-2"
          >
            <List size={20} />
            <span>المسودات ({drafts.length})</span>
          </button>
          <button
            onClick={() => setShowQuickMode(true)}
            className="px-4 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-2"
          >
            <Zap size={20} />
            <span>الوضع السريع</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قسم المعلومات الأساسية */}
        <div className="lg:col-span-1 space-y-4">
          {/* معلومات الفاتورة */}
          <div className="bg-bg-secondary border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-text-primary flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              معلومات الفاتورة
            </h3>

            {/* المورد */}
            <div>
              <label className="block text-text-primary font-medium mb-2">المورد *</label>
              <div className="flex gap-2">
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
                >
                  <option value="">اختر المورد</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAddSupplier(true)}
                  className="p-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* التاريخ */}
            <div>
              <label className="block text-text-primary font-medium mb-2">تاريخ الفاتورة</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            {/* ملاحظات */}
            <div>
              <label className="block text-text-primary font-medium mb-2">ملاحظات</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ملاحظات إضافية..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* الملخص */}
          <div className="bg-bg-secondary border border-border rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-text-primary flex items-center gap-2">
              <DollarSign size={20} className="text-accent" />
              ملخص الفاتورة
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-text-secondary">
                <span>عدد الأصناف:</span>
                <span className="font-semibold">{items.length}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>إجمالي الكمية:</span>
                <span className="font-semibold">{totalItems}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between text-text-primary text-lg">
                <span className="font-bold">المجموع الكلي:</span>
                <span className="font-bold text-primary">{totalAmount.toLocaleString()} دج</span>
              </div>
            </div>

            {itemsNeedingImei > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300/30">
                <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  {itemsNeedingImei} منتج يحتاج إلى IMEI
                </p>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={handleSaveDraft}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-text-primary hover:bg-bg-light transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} />
                <span>حفظ كمسودة</span>
              </button>
              <button
                onClick={handleSaveInvoice}
                className="w-full px-4 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <Check size={20} />
                <span>حفظ وتحديث المخزون</span>
              </button>
            </div>
          </div>
        </div>

        {/* قسم المنتجات */}
        <div className="lg:col-span-2 space-y-4">
          {/* نموذج إضافة منتج */}
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h3 className="font-bold text-text-primary flex items-center gap-2 mb-4">
              <Package size={20} className="text-accent" />
              إضافة منتج
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* اسم المنتج */}
              <div className="md:col-span-2">
                <label className="block text-text-primary font-medium mb-2">اسم المنتج *</label>
                <input
                  type="text"
                  placeholder="مثال: Samsung Galaxy A54"
                  value={itemForm.productName}
                  onChange={(e) => setItemForm({...itemForm, productName: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
                />
              </div>

              {/* الكمية */}
              <div>
                <label className="block text-text-primary font-medium mb-2">الكمية *</label>
                <input
                  type="number"
                  placeholder="10"
                  value={itemForm.quantity}
                  onChange={(e) => setItemForm({...itemForm, quantity: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
                />
              </div>

              {/* سعر الوحدة */}
              <div>
                <label className="block text-text-primary font-medium mb-2">سعر الوحدة (دج) *</label>
                <input
                  type="number"
                  placeholder="36000"
                  value={itemForm.unitPrice}
                  onChange={(e) => setItemForm({...itemForm, unitPrice: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
                />
              </div>

              {/* IMEI */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-text-primary font-medium">IMEI (اختياري)</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemForm.needsImei}
                      onChange={(e) => setItemForm({...itemForm, needsImei: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-text-secondary">يحتاج IMEI</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="يمكن إضافته لاحقاً"
                  value={itemForm.imei}
                  onChange={(e) => setItemForm({...itemForm, imei: e.target.value})}
                  disabled={!itemForm.needsImei}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* زر الإضافة */}
              <div className="md:col-span-2">
                <button
                  onClick={handleAddItem}
                  className="w-full px-4 py-3 rounded-xl bg-accent text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Plus size={20} />
                  <span>أضف إلى القائمة</span>
                </button>
              </div>
            </div>
          </div>

          {/* قائمة المنتجات */}
          <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-text-primary">المنتجات المضافة ({items.length})</h3>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <Package className="mx-auto mb-3 opacity-30" size={48} />
                <p>لم يتم إضافة أي منتج بعد</p>
                <p className="text-sm mt-1">استخدم النموذج أعلاه أو الوضع السريع</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {items.map(item => (
                  <div key={item.id} className="p-4 hover:bg-bg-light transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-primary mb-1">{item.productName}</h4>
                        <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
                          <span>الكمية: <strong>{item.quantity}</strong></span>
                          <span>السعر: <strong>{item.unitPrice.toLocaleString()} دج</strong></span>
                          <span className="text-primary font-bold">المجموع: {item.total.toLocaleString()} دج</span>
                        </div>
                        {item.needsImei && !item.imei && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                            <AlertTriangle size={14} />
                            <span>يحتاج إلى IMEI</span>
                          </div>
                        )}
                        {item.imei && (
                          <div className="mt-2 text-xs">
                            <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-mono">
                              IMEI: {item.imei}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-primary">
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* نافذة إضافة مورد */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-primary border border-border rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">إضافة مورد جديد</h3>
              <button
                onClick={() => setShowAddSupplier(false)}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-text-primary font-medium mb-2">اسم المورد</label>
                <input
                  type="text"
                  placeholder="مثال: قيس للتجارة"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSupplier()}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddSupplier(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-border text-text-primary hover:bg-bg-secondary transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddSupplier}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Check size={20} />
                  <span>إضافة</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الوضع السريع */}
      {showQuickMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-primary border border-border rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary bg-opacity-10">
                  <Zap className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">الوضع السريع للإدخال</h3>
                  <p className="text-text-secondary text-sm">أدخل المنتجات بسرعة باستخدام نص مختصر</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickMode(false)}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* شرح التنسيق */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-300/30">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  طريقة الاستخدام
                </h4>
                <p className="text-blue-800 dark:text-blue-300 text-sm mb-2">
                  اكتب كل منتج في سطر بالصيغة التالية:
                </p>
                <code className="block bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 p-3 rounded-lg text-sm font-mono">
                  اسم المنتج x الكمية @ السعر
                </code>
                <div className="mt-3 space-y-1 text-sm text-blue-800 dark:text-blue-300">
                  <p><strong>مثال 1:</strong> <code className="bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded">A54 x5 @36000</code></p>
                  <p><strong>مثال 2:</strong> <code className="bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded">كوفر A54 x10 @250</code></p>
                  <p><strong>مثال 3:</strong> <code className="bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded">شاحن سامسونج x20 @800</code></p>
                </div>
              </div>

              {/* حقل الإدخال */}
              <div>
                <textarea
                  ref={quickTextRef}
                  value={quickText}
                  onChange={(e) => setQuickText(e.target.value)}
                  placeholder="A54 x5 @36000&#10;كوفر A54 x10 @250&#10;شاحن سامسونج x20 @800"
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors resize-none font-mono"
                  autoFocus
                />
              </div>

              {/* أزرار الإجراء */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuickMode(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-border text-text-primary hover:bg-bg-secondary transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleQuickTextParse}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Zap size={20} />
                  <span>تحويل وإضافة ({quickText.split('\n').filter(l => l.trim()).length} سطر)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة المسودات */}
      {showDrafts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-primary border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent bg-opacity-10">
                  <List className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">المسودات المحفوظة</h3>
                  <p className="text-text-secondary text-sm">الفواتير الغير مكتملة</p>
                </div>
              </div>
              <button
                onClick={() => setShowDrafts(false)}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {drafts.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                  <List className="mx-auto mb-3 opacity-30" size={48} />
                  <p>لا توجد مسودات محفوظة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {drafts.map(draft => (
                    <div
                      key={draft.id}
                      className="p-4 rounded-xl border border-border bg-bg-secondary hover:bg-bg-light transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="text-primary" size={18} />
                            <h4 className="font-semibold text-text-primary">{draft.supplierName}</h4>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(draft.date).toLocaleDateString('ar-DZ')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package size={14} />
                              {draft.itemsCount} منتج
                            </span>
                            <span className="flex items-center gap-1 text-primary font-semibold">
                              <DollarSign size={14} />
                              {draft.total.toLocaleString()} دج
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-primary">
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteDraft(draft.id)}
                            className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border">
              <button
                onClick={() => setShowDrafts(false)}
                className="w-full px-4 py-3 rounded-xl border border-border text-text-primary hover:bg-bg-secondary transition-all font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}