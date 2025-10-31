'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  X,
  Plus,
  Edit2,
  Check,
  AlertCircle,
  Package,
  DollarSign,
  Barcode,
  BarChart3,
  Info,
} from 'lucide-react'
import { AccessoryWithDetails, PhoneWithDetails, Brand, Category, Supplier } from '@/lib/types'

export type ProductModalMode = 'add' | 'edit' | 'count' | 'manual'

interface ProductFormData {
  name: string
  categoryid?: string
  brandid?: string
  quantity: string
  buyprice?: string
  sellprice?: string
  supplierid?: string
  notes: string
  imei?: string // للهواتف
  sku?: string // للإكسسوارات
  adjustment_reason?: string // للجرد
  current_quantity?: number // للجرد (قراءة فقط)
}

interface BaseProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProductFormData, mode: ProductModalMode) => Promise<void>
  mode: ProductModalMode
  product?: AccessoryWithDetails | PhoneWithDetails | null
  categories?: Category[]
  brands?: Brand[]
  suppliers?: Supplier[]
  title?: string
  isLoading?: boolean
  productType?: 'phone' | 'accessory'
}

const InputField: React.FC<{
  label: string
  placeholder: string
  value: string | number
  onChange: (value: string) => void
  type?: 'text' | 'number' | 'textarea' | 'email'
  hint?: string
  required?: boolean
  error?: string
  disabled?: boolean
  icon?: React.ComponentType<{ size?: number; className?: string }>
  colSpan?: 1 | 2
}> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  hint,
  required = false,
  error,
  disabled = false,
  icon: Icon,
  colSpan = 1,
}) => {
  const inputClasses = `w-full px-4 py-3 rounded-xl border transition-all outline-none placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed
    ${
      error
        ? 'border-red-500 bg-red-50 focus:border-red-600'
        : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
    }`

  return (
    <div className={colSpan === 2 ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-blue-600" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${inputClasses} h-20 resize-none`}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={inputClasses}
        />
      )}

      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-start gap-1">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
          <Info size={12} className="mt-0.5 shrink-0" />
          {hint}
        </p>
      )}
    </div>
  )
}

const SelectField: React.FC<{
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ id: string; name: string }>
  required?: boolean
  error?: string
  placeholder?: string
  disabled?: boolean
}> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  error,
  placeholder = 'اختر...',
  disabled = false,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-xl border transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed
        ${
          error
            ? 'border-red-500 bg-red-50 focus:border-red-600'
            : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
        }`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-xs text-red-600 mt-1 flex items-start gap-1">
        <AlertCircle size={12} className="mt-0.5 shrink-0" />
        {error}
      </p>
    )}
  </div>
)

export function BaseProductModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  product,
  categories = [],
  brands = [],
  suppliers = [],
  title,
  isLoading = false,
  productType = 'accessory',
}: BaseProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    categoryid: '',
    brandid: '',
    quantity: '',
    buyprice: '',
    sellprice: '',
    supplierid: '',
    notes: '',
    imei: '',
    sku: '',
    adjustment_reason: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const nameInputRef = useRef<HTMLInputElement>(null)

  // 🔄 تعبئة النموذج عند الفتح
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && product) {
        // ملء البيانات الموجودة للتعديل
        setFormData({
          name: product.name,
          categoryid: 'categoryid' in product ? (product.categoryid ?? '') : '',
          brandid: product.brandid || '',
          quantity: 'quantity' in product ? String(product.quantity) : '',
          buyprice: String(product.buyprice || ''),
          sellprice: String(product.sellprice || ''),
          supplierid: product.supplierid || '',
          notes: product.notes || '',
          imei: 'imei' in product ? product.imei : '',
          sku: 'sku' in product ? (product.sku ?? '') : '',
        })
      } else if (mode === 'count' && product) {
        // جرد سريع - إظهار البيانات الحالية
        setFormData({
          name: product.name,
          quantity: 'quantity' in product ? String(product.quantity) : '0',
          current_quantity: 'quantity' in product ? product.quantity : 0,
          imei: 'imei' in product ? product.imei : '',
          sku: 'sku' in product ? (product.sku ?? '') : '',
          notes: '',
          adjustment_reason: '',
        })
      } else {
        // إضافة جديد - فارغ
        setFormData({
          name: '',
          categoryid: '',
          brandid: '',
          quantity: '',
          buyprice: '',
          sellprice: '',
          supplierid: '',
          notes: '',
          imei: '',
          sku: '',
          adjustment_reason: '',
        })
      }

      setErrors({})
      setTimeout(() => nameInputRef.current?.focus(), 100)
    }
  }, [isOpen, mode, product])

  // إغلاق عند ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, isLoading])

  const updateField = (field: keyof ProductFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // ✅ التحقق من الصحة
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'الاسم مطلوب'
    }

    if (mode === 'add' || mode === 'edit') {
      if (!formData.categoryid && productType === 'accessory') {
        newErrors.categoryid = 'الفئة مطلوبة'
      }

      if (!formData.quantity || parseInt(String(formData.quantity)) < 0) {
        newErrors.quantity = 'كمية صحيحة مطلوبة'
      }

      // التحقق من الأسعار في الوضع المالي
      if (formData.buyprice) {
        if (isNaN(parseFloat(String(formData.buyprice))) || parseFloat(String(formData.buyprice)) < 0) {
          newErrors.buyprice = 'سعر صحيح مطلوب'
        }
      }

      if (formData.sellprice) {
        if (
          isNaN(parseFloat(String(formData.sellprice))) ||
          parseFloat(String(formData.sellprice)) < 0
        ) {
          newErrors.sellprice = 'سعر صحيح مطلوب'
        }
        if (
          formData.buyprice &&
          parseFloat(String(formData.sellprice)) < parseFloat(String(formData.buyprice))
        ) {
          newErrors.sellprice = 'سعر البيع يجب أن يكون ≥ سعر الشراء'
        }
      }
    }

    if (mode === 'count') {
      if (!formData.quantity) {
        newErrors.quantity = 'الكمية الفعلية مطلوبة'
      }

      if (!formData.adjustment_reason) {
        newErrors.adjustment_reason = 'السبب مطلوب'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await onSubmit(formData, mode)
        onClose()
      } catch (error) {
        console.error('Form submission error:', error)
      }
    }
  }

  if (!isOpen) return null

  // 🎨 الألوان والأيقونات حسب الـ mode
  const modeConfig = {
    add: {
      title: title || '➕ إضافة منتج جديد',
      bgColor: 'from-blue-50 to-transparent',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      buttonText: 'حفظ المنتج',
      icon: Plus,
    },
    edit: {
      title: title || '✏️ تعديل المنتج',
      bgColor: 'from-amber-50 to-transparent',
      buttonColor: 'bg-amber-600 hover:bg-amber-700',
      buttonText: 'تحديث المنتج',
      icon: Edit2,
    },
    count: {
      title: title || '📊 جرد سريع',
      bgColor: 'from-green-50 to-transparent',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      buttonText: 'حفظ الجرد',
      icon: BarChart3,
    },
    manual: {
      title: title || '📝 إضافة يدوية',
      bgColor: 'from-purple-50 to-transparent',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      buttonText: 'حفظ',
      icon: Package,
    },
  }

  const config = modeConfig[mode]
  const Icon = config.icon

  return (
    <>
      {/* الخلفية */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* الـ Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white border border-gray-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r ${config.bgColor}`}
          >
            <div className="flex items-center gap-3">
              <Icon size={28} className="text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
                {mode === 'count' && (
                  <p className="text-sm text-gray-600 mt-1">
                    المنتج: {formData.name}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* ADD/EDIT MODE */}
            {(mode === 'add' || mode === 'edit') && (
              <>
                {/* البيانات الأساسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* الاسم */}
                  <div className="md:col-span-2">
                    <InputField
                      //ref={nameInputRef}
                      label="اسم المنتج"
                      placeholder="مثال: iPhone 15 Pro"
                      value={formData.name}
                      onChange={(v) => updateField('name', v)}
                      required
                      error={errors.name}
                    />
                  </div>

                  {/* الفئة (للإكسسوارات) */}
                  {productType === 'accessory' && categories.length > 0 && (
                    <SelectField
                      label="الفئة"
                      value={formData.categoryid || ''}
                      onChange={(v) => updateField('categoryid', v)}
                      options={categories}
                      required
                      error={errors.categoryid}
                    />
                  )}

                  {/* الماركة (للهواتف) */}
                  {productType === 'phone' && brands.length > 0 && (
                    <SelectField
                      label="الماركة"
                      value={formData.brandid || ''}
                      onChange={(v) => updateField('brandid', v)}
                      options={brands}
                      required
                      error={errors.brandid}
                    />
                  )}

                  {/* الكمية */}
                  <InputField
                    label="الكمية"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(v) => updateField('quantity', v)}
                    type="number"
                    required
                    error={errors.quantity}
                  />

                  {/* IMEI (للهواتف) */}
                  {productType === 'phone' && (
                    <InputField
                      label="IMEI"
                      placeholder="15-17 رقم"
                      value={formData.imei || ''}
                      onChange={(v) => updateField('imei', v)}
                      required
                      hint="فريد لكل هاتف"
                    />
                  )}

                  {/* الأسعار */}
                  <InputField
                    label="سعر الشراء (دج)"
                    placeholder="87000"
                    value={formData.buyprice || ''}
                    onChange={(v) => updateField('buyprice', v)}
                    type="number"
                    error={errors.buyprice}
                    icon={DollarSign}
                  />

                  <InputField
                    label="سعر البيع (دج)"
                    placeholder="95000"
                    value={formData.sellprice || ''}
                    onChange={(v) => updateField('sellprice', v)}
                    type="number"
                    error={errors.sellprice}
                    icon={DollarSign}
                  />

                  {/* المورد */}
                  {suppliers.length > 0 && (
                    <SelectField
                      label="المورد"
                      value={formData.supplierid || ''}
                      onChange={(v) => updateField('supplierid', v)}
                      options={suppliers}
                    />
                  )}

                  {/* الملاحظات */}
                  <div className="md:col-span-2">
                    <InputField
                      label="ملاحظات"
                      placeholder="ملاحظات إضافية..."
                      value={formData.notes}
                      onChange={(v) => updateField('notes', v)}
                      type="textarea"
                    />
                  </div>
                </div>
              </>
            )}

            {/* COUNT MODE */}
            {mode === 'count' && (
              <>
                {/* معلومات المنتج (قراءة فقط) */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">الكمية الحالية:</span>
                    <span className="font-bold text-blue-600">{formData.current_quantity}</span>
                  </div>
                  {formData.imei && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">IMEI:</span>
                      <code className="text-sm font-mono">{formData.imei}</code>
                    </div>
                  )}
                  {formData.sku && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">SKU:</span>
                      <code className="text-sm font-mono">{formData.sku}</code>
                    </div>
                  )}
                </div>

                {/* الكمية الفعلية */}
                <InputField
                  label="الكمية الفعلية"
                  placeholder="أدخل العدد الفعلي"
                  value={formData.quantity}
                  onChange={(v) => updateField('quantity', v)}
                  type="number"
                  required
                  error={errors.quantity}
                />

                {/* حساب الفرق */}
                {formData.quantity && formData.current_quantity !== undefined && (
                  <div
                    className={`p-3 rounded-lg font-semibold ${
                      parseInt(String(formData.quantity)) > formData.current_quantity
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    الفرق: {parseInt(String(formData.quantity)) - formData.current_quantity}
                  </div>
                )}

                {/* السبب */}
                <SelectField
                  label="السبب"
                  value={formData.adjustment_reason || ''}
                  onChange={(v) => updateField('adjustment_reason', v)}
                  options={[
                    { id: 'damaged', name: '❌ تالف' },
                    { id: 'lost', name: '🔍 مفقود' },
                    { id: 'theft', name: '🚨 سرقة' },
                    { id: 'inventory_count', name: '📊 جرد' },
                    { id: 'donation', name: '🎁 هدية' },
                    { id: 'other', name: '📝 أخرى' },
                  ]}
                  required
                  error={errors.adjustment_reason}
                  placeholder="اختر السبب"
                />

                {/* ملاحظات */}
                <InputField
                  label="ملاحظات"
                  placeholder="تفاصيل إضافية..."
                  value={formData.notes}
                  onChange={(v) => updateField('notes', v)}
                  type="textarea"
                />
              </>
            )}

            {/* MANUAL MODE */}
            {mode === 'manual' && (
              <>
                <InputField
                  label="اسم المنتج"
                  placeholder="مثال: هاتف قديم، هدية"
                  value={formData.name}
                  onChange={(v) => updateField('name', v)}
                  required
                  error={errors.name}
                />

                <InputField
                  label="الكمية"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(v) => updateField('quantity', v)}
                  type="number"
                  required
                  error={errors.quantity}
                />

                <SelectField
                  label="التصنيف"
                  value={formData.adjustment_reason || ''}
                  onChange={(v) => updateField('adjustment_reason', v)}
                  options={[
                    { id: 'gift', name: '🎁 هدية' },
                    { id: 'personal', name: '👤 شخصي' },
                    { id: 'inventory', name: '📊 جرد' },
                    { id: 'other', name: '📝 أخرى' },
                  ]}
                  required
                  error={errors.adjustment_reason}
                />

                <InputField
                  label="ملاحظات"
                  placeholder="توضيح..."
                  value={formData.notes}
                  onChange={(v) => updateField('notes', v)}
                  type="textarea"
                />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${config.buttonColor}`}
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري...
                </>
              ) : (
                <>
                  <Check size={20} />
                  {config.buttonText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}