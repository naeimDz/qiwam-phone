import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Check, AlertCircle, ChevronDown, Info } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface PhoneFormData {
  name: string;
  brandid: string;
  model: string;
  imei: string;
  supplierid: string;
  buyprice: string;
  sellprice: string;
  warranty_months: string;
  warranty_notes: string;
  notes: string;
}

interface AddPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PhoneFormData) => void;
  brands: Brand[];
  suppliers: Supplier[];
  isLoading?: boolean;
}

const InputField: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'textarea';
  hint?: string;
  required?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  colSpan?: 1 | 2;
  error?: string;
}> = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = 'text', 
  hint, 
  required = false,
  icon: Icon,
  colSpan = 1,
  error
}) => {
  const inputClasses = `w-full px-4 py-3 rounded-xl border transition-all outline-none placeholder:text-gray-400
    ${error 
      ? 'border-red-500 bg-red-50 focus:border-red-600' 
      : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
    }`;
  
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
          className={`${inputClasses} h-20 resize-none`}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        />
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-start gap-1">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
          <Info size={12} className="mt-0.5 shrink-0" />
          <span>{hint}</span>
        </p>
      )}
    </div>
  );
};

const CollapsibleSection: React.FC<{
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  info?: string;
}> = ({ title, isOpen, onToggle, children, info }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-700">{title}</span>
        {info && <span className="text-xs text-gray-500 bg-blue-100 text-blue-700 px-2 py-1 rounded">{info}</span>}
      </div>
      <ChevronDown 
        size={20} 
        className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    {isOpen && (
      <div className="p-4 border-t border-gray-200 bg-white">
        {children}
      </div>
    )}
  </div>
);

export const AddPhoneModal: React.FC<AddPhoneModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  brands,
  suppliers,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<PhoneFormData>({
    name: '',
    brandid: '',
    model: '',
    imei: '',
    supplierid: '',
    buyprice: '',
    sellprice: '',
    warranty_months: '',
    warranty_notes: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showWarrantySection, setShowWarrantySection] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        brandid: '',
        model: '',
        imei: '',
        supplierid: '',
        buyprice: '',
        sellprice: '',
        warranty_months: '',
        warranty_notes: '',
        notes: ''
      });
      setErrors({});
      setShowWarrantySection(false);
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isLoading]);

  const updateField = (field: keyof PhoneFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم الهاتف مطلوب';
    }

    if (!formData.brandid) {
      newErrors.brandid = 'البراند مطلوب';
    }

    if (!formData.imei.trim()) {
      newErrors.imei = 'رقم IMEI مطلوب';
    } else if (formData.imei.trim().length < 15 || formData.imei.trim().length > 17) {
      newErrors.imei = 'رقم IMEI يجب أن يكون 15-17 رقم';
    } else if (!/^\d+$/.test(formData.imei.trim())) {
      newErrors.imei = 'رقم IMEI يجب أن يحتوي على أرقام فقط';
    }

    if (!formData.buyprice) {
      newErrors.buyprice = 'سعر الشراء مطلوب';
    } else if (isNaN(parseFloat(formData.buyprice)) || parseFloat(formData.buyprice) < 0) {
      newErrors.buyprice = 'سعر الشراء غير صحيح';
    }

    if (!formData.sellprice) {
      newErrors.sellprice = 'سعر البيع مطلوب';
    } else if (isNaN(parseFloat(formData.sellprice)) || parseFloat(formData.sellprice) < 0) {
      newErrors.sellprice = 'سعر البيع غير صحيح';
    } else if (parseFloat(formData.sellprice) < parseFloat(formData.buyprice)) {
      newErrors.sellprice = 'سعر البيع يجب أن يكون ≥ سعر الشراء';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-gray-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-transparent">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Plus className="text-blue-600" size={24} />
              إضافة هاتف جديد
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              أدخل تفاصيل الهاتف مع الأسعار لتتبع دقيق
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Information Alert */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
            <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">ملاحظة:</p>
              <p>جميع الهواتف المضافة هنا تدخل في الحسابات المالية والأرباح. إذا كنت تريد إضافة جهاز للجرد فقط بدون حسابات مالية، يرجى استخدام قسم الإكسسوارات.</p>
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Name */}
            <div className="md:col-span-2">
              <InputField
                label="اسم الهاتف"
                placeholder="مثال: iPhone 15 Pro Max"
                value={formData.name}
                onChange={(v) => updateField('name', v)}
                required
                error={errors.name}
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                البراند <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.brandid}
                onChange={(e) => updateField('brandid', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none
                  ${errors.brandid 
                    ? 'border-red-500 bg-red-50 focus:border-red-600' 
                    : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  }`}
              >
                <option value="">اختر البراند</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              {errors.brandid && (
                <p className="text-xs text-red-600 mt-1">{errors.brandid}</p>
              )}
            </div>

            {/* Model */}
            <InputField
              label="الموديل"
              placeholder="مثال: 128GB, Black"
              value={formData.model}
              onChange={(v) => updateField('model', v)}
              hint="اختياري - لكن يساعد في التمييز"
            />

            {/* IMEI */}
            <div className="md:col-span-2">
              <InputField
                label="رقم IMEI"
                placeholder="أدخل 15-17 رقم"
                value={formData.imei}
                onChange={(v) => updateField('imei', v)}
                type="text"
                required
                error={errors.imei}
                hint="يجب أن يكون فريد لكل هاتف - لا تكرار"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                المورد
              </label>
              <select
                value={formData.supplierid}
                onChange={(e) => updateField('supplierid', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              >
                <option value="">اختر المورد (اختياري)</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>

            {/* Buy Price */}
            <InputField
              label="سعر الشراء (دج)"
              placeholder="مثال: 87500"
              value={formData.buyprice}
              onChange={(v) => updateField('buyprice', v)}
              type="number"
              required
              error={errors.buyprice}
              hint="كم كلفك الهاتف"
            />

            {/* Sell Price */}
            <InputField
              label="سعر البيع (دج)"
              placeholder="مثال: 95000"
              value={formData.sellprice}
              onChange={(v) => updateField('sellprice', v)}
              type="number"
              required
              error={errors.sellprice}
              hint="السعر المعروض للزبون"
            />
          </div>

          {/* Warranty Section */}
          <CollapsibleSection
            title="معلومات الضمان"
            isOpen={showWarrantySection}
            onToggle={() => setShowWarrantySection(!showWarrantySection)}
            info="اختياري"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="مدة الضمان (شهر)"
                placeholder="مثال: 12"
                value={formData.warranty_months}
                onChange={(v) => updateField('warranty_months', v)}
                type="number"
                hint="0 = بدون ضمان"
              />

              <InputField
                label="ملاحظات الضمان"
                placeholder="مثال: ضمان 1 سنة من الشركة"
                value={formData.warranty_notes}
                onChange={(v) => updateField('warranty_notes', v)}
              />

              <InputField
                label="ملاحظات إضافية"
                placeholder="أي ملاحظات أخرى..."
                value={formData.notes}
                onChange={(v) => updateField('notes', v)}
                type="textarea"
                colSpan={2}
              />
            </div>
          </CollapsibleSection>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={20} />
            <span>{isLoading ? 'جاري الحفظ...' : 'حفظ الهاتف'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};