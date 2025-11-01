'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Info, Smartphone, Headphones, AlertCircle, CheckCircle, Loader, Zap, FileText, Save } from 'lucide-react'
import { QuickMode } from '@/components/ui/QuickModeBulkItems'
import { DraftManager } from '@/components/ui/DraftManager'


// ==================== MOCK DATA - Can be replaced easily ====================
const MOCK_SUPPLIERS = [
  { id: '1', name: 'Tech Supplies Co' },
  { id: '2', name: 'Global Electronics' },
  { id: '3', name: 'Direct Import' },
]

const MOCK_BRANDS = [
  { id: 'apple', name: 'Apple' },
  { id: 'samsung', name: 'Samsung' },
  { id: 'xiaomi', name: 'Xiaomi' },
  { id: 'generic', name: 'Generic' },
  { id: 'anker', name: 'Anker' },
]

const MOCK_CATEGORIES = [
  { id: 'case', name: 'Cases' },
  { id: 'cable', name: 'Cables' },
  { id: 'charger', name: 'Chargers' },
  { id: 'earphones', name: 'Earphones' },
]

const MOCK_PRODUCTS = {
  phones: [
    { id: '1', name: 'iPhone 15 Pro', brandid: 'apple', brandname: 'Apple', buyprice: 25000 },
    { id: '2', name: 'Samsung S24', brandid: 'samsung', brandname: 'Samsung', buyprice: 20000 },
    { id: '3', name: 'iPhone 15', brandid: 'apple', brandname: 'Apple', buyprice: 20000 },
  ],
  accessories: [
    { id: '4', name: 'Phone Case', brandid: 'generic', brandname: 'Generic', categoryid: 'case', buyprice: 500 },
    { id: '5', name: 'USB-C Cable', brandid: 'anker', brandname: 'Anker', categoryid: 'cable', buyprice: 300 },
  ]
}

// ==================== TYPES ====================
type PurchaseItem = {
  id: string | number
  productId?: string
  productName: string
  productType: 'phone' | 'accessory'
  brand: string
  category: string | null
  qty: number
  unitprice: number
  linetotal: number
  imei: string | null
  isNew: boolean
}

type ParserMode = 'search' | 'type' | 'brands' | 'categories' | 'complete'

type SubmitMessage = { type: 'success' | 'error'; text: string } | null

// ==================== COMPONENT ====================
export default function PurchaseEntry() {
  // Form state
  const [supplier, setSupplier] = useState<string>('')
  const [docNumber, setDocNumber] = useState<string>('')
  const [docDate, setDocDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState<string>('')
  const [showDraftManager, setShowDraftManager] = useState(false)
  const [drafts, setDrafts] = useState<any[]>([])

const handleLoadDraft = (draft: any): void => {
  if (purchaseItems.length > 0) {
    if (!window.confirm('⚠️ هتحذف البيانات الحالية، متأكد؟')) {
      return
    }
  }

  setSupplier(draft.supplier)
  setDocNumber(draft.docNumber)
  setDocDate(draft.docDate)
  setNotes(draft.notes)
  setPurchaseItems(draft.purchaseItems)
  setPaidAmount(draft.paidAmount)

  setSubmitMessage({ 
    type: 'success', 
    text: `✅ تم تحميل: "${draft.name}"` 
  })

  setTimeout(() => setSubmitMessage(null), 2000)
}

// ==================== تحميل المسودات عند الفتح ====================
useEffect(() => {
  const saved = localStorage.getItem('purchase_drafts')
  if (saved) {
    try {
      setDrafts(JSON.parse(saved))
    } catch (error) {
      console.error('خطأ في تحميل المسودات:', error)
    }
  }
}, [])
const handleSaveDraft = (): void => {
  if (purchaseItems.length === 0) {
    setSubmitMessage({ type: 'error', text: '❌ ما في منتجات لحفظ!' })
    return
  }

  // سؤال عن اسم المسودة
  const draftName = window.prompt('📝 اكتب اسم المسودة:', 
    `مسودة - ${new Date().toLocaleDateString('ar-DZ')}`
  )

  if (!draftName) return

  const newDraft = {
    id: Date.now(),
    name: draftName,
    supplier,
    docNumber,
    docDate,
    notes,
    purchaseItems,
    paidAmount,
    createdAt: new Date().toISOString()
  }

  const updatedDrafts = [...drafts, newDraft]
  setDrafts(updatedDrafts)
  localStorage.setItem('purchase_drafts', JSON.stringify(updatedDrafts))

  setSubmitMessage({ 
    type: 'success', 
    text: `✅ تم حفظ المسودة: "${draftName}"` 
  })

  setTimeout(() => setSubmitMessage(null), 2000)
}

  const [showQuickMode, setShowQuickMode] = useState(false)
  const handleAddQuickItems = (items: any[]) => {
    items.forEach(item => {
      addPurchaseItem({
        id: item.id,
        name: item.productName,
        type: 'accessory', // أو phone حسب ما تحتاج
        brandname: 'Generic',
        qty: item.qty,
        unitprice: item.unitprice,
        isNew: true
      })
    })
  }
  // Parser state
  const [parserInput, setParserInput] = useState<string>('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [parserMode, setParserMode] = useState<ParserMode>('search')
  const [selectedType, setSelectedType] = useState<'phone' | 'accessory' | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isNewProduct, setIsNewProduct] = useState<boolean>(false)

  // Items and payment
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [paidAmount, setPaidAmount] = useState<string>('0')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [submitMessage, setSubmitMessage] = useState<SubmitMessage>(null)

  const parserRef = useRef<HTMLInputElement>(null)

  // ==================== PARSING LOGIC ====================
  const parseInput = (input: string) => {
    const isNew = input.startsWith('!')
    const cleanInput = isNew ? input.substring(1) : input
    const parts = cleanInput.trim().split(/\s+/)

    let productName = ''
    let type: 'phone' | 'accessory' | null = null
    let brand: string | null = null
    let category: string | null = null
    let price: number | null = null
    let qty = 1
    let imei: string | null = null

    for (const part of parts) {
      if (part.startsWith('$')) {
        const t = part.substring(1).toLowerCase()
        if (t === 'phone' || t === 'p') type = 'phone'
        else if (t === 'accessory' || t === 'acc' || t === 'a') type = 'accessory'
      } else if (part.startsWith('@')) {
        brand = part.substring(1)
      } else if (part.startsWith('%')) {
        category = part.substring(1)
      } else if (part.startsWith('#')) {
        price = parseFloat(part.substring(1))
      } else if (part.toLowerCase().startsWith('x')) {
        qty = parseInt(part.substring(1), 10) || 1
      } else if (part.toLowerCase().startsWith('imei:')) {
        imei = part.substring(5)
      } else {
        productName += (productName ? ' ' : '') + part
      }
    }

    return { isNew, productName, type, brand, category, price, qty, imei }
  }

  // ==================== PARSER LOGIC ====================
  useEffect(() => {
    if (!parserInput.trim()) {
      resetSuggestions()
      return
    }

    const parsed = parseInput(parserInput)
    setIsNewProduct(parsed.isNew)

    // Mode 1: Select TYPE
    if (parsed.productName && parserInput.includes('$') && !parsed.type) {
      setParserMode('type')
      setSuggestions([
        { type: 'phone', label: '📱 Phone', icon: Smartphone },
        { type: 'accessory', label: '🎧 Accessory', icon: Headphones }
      ])
      setShowSuggestions(true)
      return
    }

    // Mode 2: Select BRAND
    if (parsed.type && parserInput.includes('@') && !parsed.brand) {
      setSelectedType(parsed.type)
      setParserMode('brands')
      const query = parserInput.split('@')[1]?.toLowerCase() || ''
      const filtered = MOCK_BRANDS.filter(b =>
        b.name.toLowerCase().includes(query)
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
      return
    }

    // Mode 3: For ACCESSORY only - Select CATEGORY
    if (parsed.type === 'accessory' && parsed.brand && parserInput.includes('%') && !parsed.category) {
      setSelectedBrand(parsed.brand)
      setParserMode('categories')
      const query = parserInput.split('%')[1]?.toLowerCase() || ''
      const filtered = MOCK_CATEGORIES.filter(c =>
        c.name.toLowerCase().includes(query)
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
      return
    }

    // Search existing products
    if (parsed.productName && !parsed.isNew && !parsed.type) {
      const query = parsed.productName.toLowerCase()
      const allProducts = [
        ...MOCK_PRODUCTS.phones.map(p => ({ ...p, type: 'phone' })),
        ...MOCK_PRODUCTS.accessories.map(p => ({ ...p, type: 'accessory' }))
      ]

      const filtered = allProducts
        .filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.brandname.toLowerCase().includes(query)
        )
        .slice(0, 5)

      if (filtered.length > 0) {
        setSuggestions(filtered)
        setShowSuggestions(true)
        setParserMode('search')
      } else {
        setParserMode('complete')
        setSuggestions([])
        setShowSuggestions(false)
      }
    } else {
      setParserMode('complete')
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [parserInput])

  const resetSuggestions = (): void => {
    setSuggestions([])
    setShowSuggestions(false)
    setParserMode('search')
    setSelectedType(null)
    setSelectedBrand(null)
    setSelectedCategory(null)
    setIsNewProduct(false)
  }

  const handleSelectProduct = (product: any): void => {
    const parsed = parseInput(parserInput)
    const price = parsed.price || product.buyprice
    const qty = parsed.qty || 1

    addPurchaseItem({
      ...product,
      qty,
      unitprice: price,
      isNew: false
    })

    resetParser()
  }

  const handleSelectType = (typeObj: any): void => {
    const parsed = parseInput(parserInput)
    const baseInput = parsed.isNew ? '!' + parsed.productName : parsed.productName
    setSelectedType(typeObj.type)
    setParserInput(`${baseInput} $${typeObj.type} @`)
    parserRef.current?.focus()
  }

  const handleSelectBrand = (brand: any): void => {
    const parsed = parseInput(parserInput)
    const baseInput = parsed.isNew ? '!' + parsed.productName : parsed.productName
    setSelectedBrand(brand.name)

    if (parsed.type === 'accessory') {
      setParserInput(`${baseInput} $${parsed.type} @${brand.name.toLowerCase()} %`)
    } else {
      setParserInput(`${baseInput} $${parsed.type} @${brand.name.toLowerCase()} #`)
    }
    parserRef.current?.focus()
  }

  const handleSelectCategory = (category: any): void => {
    const parsed = parseInput(parserInput)
    const baseInput = parsed.isNew ? '!' + parsed.productName : parsed.productName
    setSelectedCategory(category.name)
    setParserInput(`${baseInput} $${parsed.type} @${parsed.brand} %${category.name.toLowerCase()} #`)
    parserRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault()

      if (suggestions.length > 0) {
        if (parserMode === 'search') {
          handleSelectProduct(suggestions[0])
        } else if (parserMode === 'type') {
          handleSelectType(suggestions[0])
        } else if (parserMode === 'brands') {
          handleSelectBrand(suggestions[0])
        } else if (parserMode === 'categories') {
          handleSelectCategory(suggestions[0])
        }
      } else if (parserMode === 'complete') {
        handleAddNewProduct()
      }
    }
  }

  const handleAddNewProduct = (): void => {
    const parsed = parseInput(parserInput)

    if (!parsed.productName.trim()) {
      setSubmitMessage({ type: 'error', text: '❌ اكتب اسم المنتج!' })
      return
    }
    if (!parsed.type) {
      setSubmitMessage({ type: 'error', text: '❌ اختر النوع ($phone او $accessory)!' })
      return
    }
    if (!parsed.brand) {
      setSubmitMessage({ type: 'error', text: '❌ اختر الماركة (@brand)!' })
      return
    }
    if (parsed.type === 'accessory' && !parsed.category) {
      setSubmitMessage({ type: 'error', text: '❌ اختر الفئة للإكسسوار (%category)!' })
      return
    }
    if (!parsed.price || parsed.price <= 0) {
      setSubmitMessage({ type: 'error', text: '❌ اكتب السعر (#price)!' })
      return
    }

    const finalQty = parsed.type === 'phone' ? 1 : (parsed.qty || 1)

    addPurchaseItem({
      id: `new-${Date.now()}`,
      name: parsed.productName,
      type: parsed.type,
      brandname: parsed.brand,
      categoryname: parsed.category,
      qty: finalQty,
      unitprice: parsed.price,
      imei: parsed.imei || null,
      isNew: true
    })

    resetParser()
  }

  const resetParser = (): void => {
    setParserInput('')
    resetSuggestions()
    parserRef.current?.focus()
  }

  const addPurchaseItem = (product: any): void => {
    const linetotal = (product.qty * product.unitprice).toFixed(2)

    const newItem: PurchaseItem = {
      id: product.id || Date.now(),
      productId: product.id,
      productName: product.name,
      productType: product.type,
      brand: product.brandname,
      category: product.categoryname || null,
      qty: product.qty,
      unitprice: product.unitprice,
      linetotal: parseFloat(linetotal),
      imei: product.imei || null,
      isNew: product.isNew || false
    }

    setPurchaseItems([...purchaseItems, newItem])
  }

  const removeItem = (id: string | number): void => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== id))
  }

  const updateItem = (id: string | number, field: string, value: any): void => {
    setPurchaseItems(purchaseItems.map(item => {
      if (item.id === id) {
        const updated: PurchaseItem = {
          ...item,
          [field]: field === 'qty' || field === 'unitprice' ? parseFloat(value) : value
        }
        updated.linetotal = parseFloat((updated.qty * updated.unitprice).toFixed(2))
        return updated
      }
      return item
    }))
  }

  const totalAmount = purchaseItems.reduce((sum, item) => sum + item.linetotal, 0).toFixed(2)
  const remainingAmount = (parseFloat(totalAmount) - parseFloat(paidAmount || "0")).toFixed(2)

  const handleSubmit = async (): Promise<void> => {
    if (!supplier) {
      setSubmitMessage({ type: 'error', text: '❌ اختر المورّد!' })
      return
    }
    if (purchaseItems.length === 0) {
      setSubmitMessage({ type: 'error', text: '❌ أضف منتج واحد على الأقل!' })
      return
    }

    const phonesWithoutIMEI = purchaseItems.filter(
      item => item.productType === 'phone' && !item.imei
    )

    if (phonesWithoutIMEI.length > 0) {
      const shouldContinue = window.confirm(
        `⚠️ عندك ${phonesWithoutIMEI.length} هاتف بدون IMEI!\n\nممكن تضيفهم لاحقاً، نكمل الحفظ؟`
      )
      if (!shouldContinue) return
    }

    setIsLoading(true)
    try {
      // ============= READY TO USE REAL ACTIONS =============
      // import { createPurchaseAction, addItemToPurchaseAction } from '@/lib/actions/purchase'
      
      const purchaseData = {
        supplierid: supplier,
        docnumber: docNumber || `DOC-${Date.now()}`,
        docdate: docDate,
        notes,
        items: purchaseItems.map(item => ({
          item_type: item.productType,
          phone_id: item.productType === 'phone' ? item.productId : null,
          accessory_id: item.productType === 'accessory' ? item.productId : null,
          qty: item.qty,
          unitprice: item.unitprice,
          linetotal: item.linetotal,
          ...(item.isNew && {
            new_product: {
              name: item.productName,
              type: item.productType,
              brand: item.brand,
              category: item.category,
              imei: item.imei
            }
          })
        })),
        total: parseFloat(totalAmount),
        paidamount: parseFloat(paidAmount),
        remainingamount: parseFloat(remainingAmount)
      }

      console.log('📦 Purchase Data Ready:', purchaseData)
      
      // TODO: Uncomment when ready to use real actions
      // const result = await createPurchaseAction(new FormData(/* ... */))
      // if (!result.success) throw new Error(result.error)

      setSubmitMessage({ type: 'success', text: '✅ تم الحفظ بنجاح!' })

      setTimeout(() => {
        setPurchaseItems([])
        setSupplier('')
        setDocNumber('')
        setNotes('')
        setPaidAmount('0')
        setSubmitMessage(null)
      }, 2000)
    } catch (error) {
      console.error('Submit error:', error)
      setSubmitMessage({ type: 'error', text: '❌ حدث خطأ أثناء الحفظ' })
    } finally {
      setIsLoading(false)
    }
  }

  const getMissingFields = (): string[] => {
    const parsed = parseInput(parserInput)
    const missing: string[] = []

    if (!parsed.type && (parsed.isNew || parserMode === 'complete')) missing.push('$type')
    if (!parsed.brand && parsed.type && parserMode === 'complete') missing.push('@brand')
    if (parsed.type === 'accessory' && parsed.brand && !parsed.category && parserMode === 'complete') {
      missing.push('%category')
    }
    if (!parsed.price && parsed.type && parsed.brand && parserMode === 'complete') missing.push('#price')

    return missing
  }

  const getPlaceholder = (): string => {
    if (parserMode === 'type') return 'اختر النوع: $phone أو $accessory'
    if (parserMode === 'brands') return 'اختر الماركة... (أو اكتب @)'
    if (parserMode === 'categories') return 'اختر الفئة... (أو اكتب %)'
    if (isNewProduct && selectedType === 'phone') return '!phone_name $p @brand #price imei:123456'
    if (isNewProduct && selectedType === 'accessory') return '!accessory_name $a @brand %category #price x5'
    if (isNewProduct) return '!product_name $ → type → @ → brand...'
    return 'ابحث أو اكتب ! للجديد'
  }

  const getBorderColor = (): string => {
    if (isNewProduct) return 'border-green-400 bg-gradient-to-r from-white to-green-50'
    if (parserMode === 'type') return 'border-purple-400 bg-gradient-to-r from-white to-purple-50'
    if (parserMode === 'categories') return 'border-pink-400 bg-gradient-to-r from-white to-pink-50'
    if (parserMode === 'complete') return 'border-amber-400 bg-gradient-to-r from-white to-amber-50'
    return 'border-blue-200'
  }

  const phonesWithoutIMEI = purchaseItems.filter(
    item => item.productType === 'phone' && !item.imei
  ).length

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">إدخال المشتريات</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">المورّد *</label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">اختر المورّد...</option>
                {MOCK_SUPPLIERS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الوثيقة</label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="تلقائي"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">التاريخ</label>
              <input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ملاحظات</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ملاحظات إضافية..."
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        {submitMessage && (
          <div className={`rounded-xl p-4 flex items-center gap-3 ${
            submitMessage.type === 'success'
              ? 'bg-green-50 border-2 border-green-300'
              : 'bg-red-50 border-2 border-red-300'
          }`}>
            {submitMessage.type === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600" />
            )}
            <p className={submitMessage.type === 'success' ? 'text-green-800 font-bold' : 'text-red-800 font-bold'}>
              {submitMessage.text}
            </p>
          </div>
        )}

        {/* IMEI Warning */}
        {phonesWithoutIMEI > 0 && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            <div className="flex-1">
              <p className="font-bold text-orange-800">⚠️ تنبيه: عندك {phonesWithoutIMEI} هاتف بدون IMEI</p>
              <p className="text-sm text-orange-700">ما تنساش تضيف IMEI لاحقاً من الجدول!</p>
            </div>
          </div>
        )}

        {/* Smart Parser */}
        <div className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 border-2 ${getBorderColor()}`}>
          <div className="flex items-center gap-3 mb-2">
            {parserMode === 'type' && <Info className="w-6 h-6 text-purple-600 animate-pulse" />}
            {isNewProduct && <Plus className="w-6 h-6 text-green-600" />}
            <h2 className="text-xl font-bold text-gray-800">
              {parserMode === 'type' ? '📦 اختر النوع أولاً' :
               parserMode === 'categories' ? '📂 اختر الفئة' :
               isNewProduct ? '✨ منتج جديد' :
               parserMode === 'search' ? '⚡ بحث سريع' :
               '✍️ إكمال البيانات'}
            </h2>
          </div>

          <div className="relative">
            <input
              ref={parserRef}
              type="text"
              value={parserInput}
              onChange={(e) => setParserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              className={`w-full px-6 py-4 text-lg bg-gray-50 border-2 rounded-lg focus:ring-2 outline-none transition-all ${
                isNewProduct ? 'border-green-300 focus:ring-green-500' :
                parserMode === 'type' ? 'border-purple-300 focus:ring-purple-500' :
                parserMode === 'categories' ? 'border-pink-300 focus:ring-pink-500' :
                parserMode === 'complete' ? 'border-amber-300 focus:ring-amber-500' :
                'border-gray-300 focus:ring-blue-500'
              }`}
            />

            {getMissingFields().length > 0 && (
              <div className="absolute -bottom-7 right-6 flex gap-2 flex-wrap">
                {getMissingFields().map((field, idx) => (
                  <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold animate-pulse">
                    ⚠️ يحتاج: {field}
                  </span>
                ))}
              </div>
            )}

            {parserMode === 'complete' && isNewProduct && getMissingFields().length === 0 && (
              <button
                onClick={handleAddNewProduct}
                className="absolute left-2 top-2 bottom-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                أضف
              </button>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full right-0 left-0 mt-2 bg-white border-2 border-blue-300 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                <div className={`p-2 border-b font-semibold text-sm sticky top-0 ${
                  parserMode === 'type' ? 'bg-purple-50 text-purple-800' :
                  parserMode === 'categories' ? 'bg-pink-50 text-pink-800' :
                  parserMode === 'brands' ? 'bg-blue-50 text-blue-800' :
                  'bg-green-50 text-green-800'
                }`}>
                  {parserMode === 'type' && '📦 اختر النوع (الأهم!)'}
                  {parserMode === 'brands' && '🏷️ اختر الماركة'}
                  {parserMode === 'categories' && '📂 اختر الفئة (للإكسسوارات)'}
                  {parserMode === 'search' && '✓ منتجات موجودة (Enter للاختيار)'}
                </div>

                {parserMode === 'type' && suggestions.map((typeObj: any, idx: number) => {
                  const Icon = typeObj.icon
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectType(typeObj)}
                      className="w-full text-right px-4 py-4 hover:bg-purple-50 transition-colors border-b last:border-b-0 flex items-center gap-3"
                    >
                      <Icon className="w-6 h-6 text-purple-600" />
                      <p className="font-bold text-gray-800 text-lg">{typeObj.label}</p>
                    </button>
                  )
                })}

                {parserMode === 'brands' && suggestions.map((brand: any) => (
                  <button
                    key={brand.id}
                    onClick={() => handleSelectBrand(brand)}
                    className="w-full text-right px-4 py-3 hover:bg-blue-50 transition-colors border-b last:border-b-0"
                  >
                    <p className="font-semibold text-gray-800">{brand.name}</p>
                  </button>
                ))}

                {parserMode === 'categories' && suggestions.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat)}
                    className="w-full text-right px-4 py-3 hover:bg-pink-50 transition-colors border-b last:border-b-0"
                  >
                    <p className="font-semibold text-gray-800">{cat.name}</p>
                  </button>
                ))}

                {parserMode === 'search' && suggestions.map((product: any) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full text-right px-4 py-3 hover:bg-blue-50 transition-colors border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      {product.type === 'phone' ?
                        <Smartphone className="w-5 h-5 text-blue-600" />:
                        <Headphones className="w-5 h-5 text-purple-600" />
                      }
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.brandname} • {product.type} • {product.buyprice} دج</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Help Guide */}
          <div className="mt-6 pt-4 border-t-2 border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-semibold text-gray-700">الترتيب الصحيح:</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
              <div className="bg-green-50 p-2 rounded border border-green-300">
                <span className="font-bold text-green-700">! جديد</span>
                <p className="text-green-600">اختياري</p>
              </div>
              <div className="bg-purple-50 p-2 rounded border-2 border-purple-300">
                <span className="font-bold text-purple-700 text-base">$type</span>
                <p className="text-purple-600 font-bold">الأهم!</p>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <span className="font-bold text-blue-700">@brand</span>
                <p className="text-blue-600">الماركة</p>
              </div>
              <div className="bg-pink-50 p-2 rounded">
                <span className="font-bold text-pink-700">%category</span>
                <p className="text-pink-600">للإكسسوار</p>
              </div>
              <div className="bg-amber-50 p-2 rounded">
                <span className="font-bold text-amber-700">#price</span>
                <p className="text-amber-600">السعر</p>
              </div>
              <div className="bg-orange-50 p-2 rounded">
                <span className="font-bold text-orange-700">xqty</span>
                <p className="text-orange-600">الكمية</p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-gray-600">
                <span className="font-bold">Phone:</span>
                <code className="bg-gray-100 px-2 py-1 rounded mr-1">!iphone16 $p @apple #30000 imei:123456</code>
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-bold">Accessory:</span>
                <code className="bg-gray-100 px-2 py-1 rounded mr-1">!cable $a @anker %cables #500 x10</code>
              </p>
              <p className="text-xs text-red-600 font-semibold mt-2">
                💡 IMEI اختياري، ممكن تضيفو لاحقاً!
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">المنتجات ({purchaseItems.length})</h2>

          {purchaseItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
              ابدأ بإضافة منتجات من الأعلى
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="text-right px-4 py-3 font-bold text-gray-700">المنتج</th>
                    <th className="text-right px-4 py-3 font-bold text-gray-700">النوع</th>
                    <th className="text-right px-4 py-3 font-bold text-gray-700">الماركة</th>
                    <th className="text-right px-4 py-3 font-bold text-gray-700">IMEI</th>
                    <th className="text-center px-4 py-3 font-bold text-gray-700">السعر</th>
                    <th className="text-center px-4 py-3 font-bold text-gray-700">الكمية</th>
                    <th className="text-center px-4 py-3 font-bold text-gray-700">المجموع</th>
                    <th className="text-center px-4 py-3 font-bold text-gray-700">حذف</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-800 font-semibold">{item.productName}</span>
                          {item.isNew && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">
                              جديد
                            </span>
                          )}
                        </div>
                        {item.category && (
                          <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-3 py-1 rounded font-bold flex items-center gap-1 w-fit ${
                          item.productType === 'phone'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.productType === 'phone' ?
                            <Smartphone className="w-3 h-3" /> :
                            <Headphones className="w-3 h-3" />
                          }
                          {item.productType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{item.brand}</td>
                      <td className="px-4 py-3">
                        {item.productType === 'phone' ? (
                          <input
                            type="text"
                            value={item.imei || ''}
                            onChange={(e) => updateItem(item.id, 'imei', e.target.value)}
                            placeholder="اختياري"
                            className={`w-32 px-2 py-1 border rounded text-sm ${
                              item.imei
                                ? 'border-green-300 bg-green-50'
                                : 'border-orange-300 bg-orange-50'
                            }`}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          value={item.unitprice}
                          onChange={(e) => updateItem(item.id, 'unitprice', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.productType === 'phone' ? (
                          <span className="text-gray-600 font-semibold">1</span>
                        ) : (
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                            min="1"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-800 font-bold">
                        {item.linetotal.toFixed(2)} دج
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-blue-600">
            <p className="text-sm text-gray-600 mb-2">المجموع الكلي</p>
            <p className="text-4xl font-bold text-gray-800">{totalAmount} دج</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-600">
            <label className="block text-sm text-gray-600 mb-2 font-semibold">المبلغ المدفوع</label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full px-3 py-2 text-2xl font-bold border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-orange-600">
            <p className="text-sm text-gray-600 mb-2">المتبقي</p>
            <p className={`text-4xl font-bold ${parseFloat(remainingAmount) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {remainingAmount} دج
            </p>
          </div>
        </div>
        {/* Bottom Actions */}
        <div className="flex gap-3 justify-start flex-wrap ">
          
          {/* حفظ مسودة */}
          <button
            onClick={handleSaveDraft}
            disabled={purchaseItems.length === 0}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg font-bold transition-colors flex items-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            💾 حفظ مسودة
          </button>

          {/* عرض المسودات */}
          <button
            onClick={() => setShowDraftManager(true)}
            className={`px-6 py-2 text-white rounded-lg font-bold transition-colors flex items-center gap-2 text-sm ${
              drafts.length > 0
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={drafts.length === 0}
          >
            <FileText className="w-4 h-4" />
            📝 المسودات ({drafts.length})
          </button>

          {/* الإدخال السريع */}
          <button
            onClick={() => setShowQuickMode(true)}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2 text-sm"
          >
            <Zap className="w-4 h-4" />
            ⚡ إدخال سريع
          </button>
        </div>


        {/* Actions */}
        <div className="flex gap-3 justify-start pt-2 border-t border-gray-300 flex-wrap">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>حفظ وتحديث المخزون</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              setPurchaseItems([])
              setSupplier('')
              setDocNumber('')
              setNotes('')
              setPaidAmount('0')
              setSubmitMessage(null)
            }}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white rounded-lg font-bold transition-colors"
          >
            مسح الكل
          </button>
        </div>

            
        <QuickMode
            isOpen={showQuickMode}
            onClose={() => setShowQuickMode(false)}
            onAddItems={handleAddQuickItems}
          />
        <DraftManager
            isOpen={showDraftManager}
            onClose={() => setShowDraftManager(false)}
            onLoadDraft={handleLoadDraft}
            currentItems={purchaseItems}
            currentSupplier={supplier}
            currentDocNumber={docNumber}
            currentDocDate={docDate}
            currentNotes={notes}
            currentPaidAmount={paidAmount}
          />
      </div>


  )
}