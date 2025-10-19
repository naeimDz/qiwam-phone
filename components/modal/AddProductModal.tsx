import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Check, Package, DollarSign, AlertCircle, ChevronDown, Zap } from 'lucide-react';

// Types
interface Category {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  category: string;
  sku: string;
  quantity: string;
  minStock: string;
  price: string;
  cost: string;
  supplier: string;
  notes: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData, includeFinancials: boolean) => void;
  categories: Category[];
}

// مكون حقل الإدخال
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
}> = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = 'text', 
  hint, 
  required = false,
  icon: Icon,
  colSpan = 1
}) => {
  const inputClasses = "w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors placeholder:text-text-secondary";
  
  return (
    <div className={colSpan === 2 ? 'md:col-span-2' : ''}>
      <label className="block text-text-primary font-medium mb-2 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-primary" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClasses} h-24 resize-none`}
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
      {hint && (
        <p className="text-xs text-text-secondary mt-1 flex items-start gap-1">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <span>{hint}</span>
        </p>
      )}
    </div>
  );
};

// مكون التبديل بين الأنماط
const ModeToggle: React.FC<{
  isAdvanced: boolean;
  onChange: (isAdvanced: boolean) => void;
}> = ({ isAdvanced, onChange }) => (
  <div className="bg-bg-secondary border border-border rounded-xl p-4">
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Package className="text-primary" size={18} />
          <h3 className="font-semibold text-text-primary">نوع الإضافة</h3>
        </div>
        <p className="text-sm text-text-secondary">
          {isAdvanced 
            ? 'منتج تجاري - يدخل في الحسابات المالية والأرباح' 
            : 'إضافة سريعة للمخزون فقط - بدون حسابات مالية'}
        </p>
      </div>
      <button
        onClick={() => onChange(!isAdvanced)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isAdvanced ? 'bg-primary' : 'bg-gray-400'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isAdvanced ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
    
    {!isAdvanced && (
      <div className="mt-3 p-3 bg-blue-500 bg-opacity-10 rounded-lg border border-blue-500 border-opacity-20">
        <p className="text-sm text-blue-400 flex items-start gap-2">
          <Zap size={16} className="mt-0.5 shrink-0" />
          <span>
            مناسب للجرد، الهدايا، العينات، أو المنتجات الشخصية - لن تؤثر على التقارير المالية
          </span>
        </p>
      </div>
    )}
    
    {isAdvanced && (
      <div className="mt-3 p-3 bg-green-500 bg-opacity-10 rounded-lg border border-green-500 border-opacity-20">
        <p className="text-sm text-green-400 flex items-start gap-2">
          <DollarSign size={16} className="mt-0.5 shrink-0" />
          <span>
            سيتم احتساب التكاليف والأرباح - مناسب للمنتجات التجارية
          </span>
        </p>
      </div>
    )}
  </div>
);

// مكون القسم القابل للطي
const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="border border-border rounded-xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-bg-secondary hover:bg-bg-light transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className="text-primary" size={18} />
        <span className="font-semibold text-text-primary">{title}</span>
      </div>
      <ChevronDown 
        size={20} 
        className={`text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    {isOpen && (
      <div className="p-4 border-t border-border">
        {children}
      </div>
    )}
  </div>
);

// المكون الرئيسي
export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    sku: '',
    quantity: '',
    minStock: '',
    price: '',
    cost: '',
    supplier: '',
    notes: ''
  });

  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [showFinancialSection, setShowFinancialSection] = useState(true);
  const [showExtraSection, setShowExtraSection] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reset form عند الفتح
  useEffect(() => {
    if (isOpen) {
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
      });
      setIsAdvancedMode(false);
      setShowFinancialSection(true);
      setShowExtraSection(false);
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // إغلاق عند ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const updateField = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // التحقق من الحقول المطلوبة
    if (!formData.name.trim()) {
      alert('يرجى إدخال اسم المنتج');
      return;
    }
    if (!formData.category) {
      alert('يرجى اختيار الفئة');
      return;
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      alert('يرجى إدخال كمية صحيحة');
      return;
    }

    // التحقق من الحقول المالية في الوضع المتقدم
    if (isAdvancedMode) {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        alert('يرجى إدخال سعر البيع');
        return;
      }
    }

    onSubmit(formData, isAdvancedMode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-bg-primary border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Plus className="text-primary" size={24} />
              إضافة منتج جديد
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              أضف منتج للمخزون بسرعة ⚡
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary hover:text-text-primary"
            title="إغلاق (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* نوع الإضافة */}
          <ModeToggle
            isAdvanced={isAdvancedMode}
            onChange={setIsAdvancedMode}
          />

          {/* الحقول الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* اسم المنتج */}
            <div className="md:col-span-2">
              <label className="block text-text-primary font-medium mb-2 flex items-center gap-2">
                <Package size={16} className="text-primary" />
                اسم المنتج
                <span className="text-red-500">*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                placeholder="مثال: iPhone 13 Pro أو AirPods 3 أصلية"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors placeholder:text-text-secondary"
              />
            </div>

            {/* الفئة */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                الفئة <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
              >
                <option value="">اختر الفئة</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* الكمية */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                الكمية <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="كم جهاز عندك؟"
                value={formData.quantity}
                onChange={(e) => updateField('quantity', e.target.value)}
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
              />
            </div>
          </div>

          {/* القسم المالي - يظهر فقط في الوضع المتقدم */}
          {isAdvancedMode && (
            <CollapsibleSection
              title="المعلومات المالية"
              icon={DollarSign}
              isOpen={showFinancialSection}
              onToggle={() => setShowFinancialSection(!showFinancialSection)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="سعر البيع (دج)"
                  placeholder="مثال: 95000"
                  value={formData.price}
                  onChange={(v) => updateField('price', v)}
                  type="number"
                  hint="السعر الذي سيظهر للزبون في الفاتورة"
                  required={isAdvancedMode}
                />

                <InputField
                  label="سعر التكلفة (دج)"
                  placeholder="كم كلفك؟ مثال: 87000"
                  value={formData.cost}
                  onChange={(v) => updateField('cost', v)}
                  type="number"
                  hint="للتتبع الداخلي فقط، لن يظهر للزبون"
                />

                <InputField
                  label="المورد"
                  placeholder="مثلاً: رضا الجلفة"
                  value={formData.supplier}
                  onChange={(v) => updateField('supplier', v)}
                  colSpan={2}
                />
              </div>
            </CollapsibleSection>
          )}

          {/* معلومات إضافية */}
          <CollapsibleSection
            title="معلومات إضافية"
            icon={Package}
            isOpen={showExtraSection}
            onToggle={() => setShowExtraSection(!showExtraSection)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="كود المنتج (SKU)"
                placeholder="مثال: IP13-256-GR"
                value={formData.sku}
                onChange={(v) => updateField('sku', v)}
                hint="كود داخلي لتسهيل البحث (اختياري)"
              />

              <InputField
                label="حد التنبيه"
                placeholder="مثلاً: 2"
                value={formData.minStock}
                onChange={(v) => updateField('minStock', v)}
                type="number"
                hint="تنبيه عندما تقل الكمية عن هذا الرقم"
              />

              <InputField
                label="ملاحظات"
                placeholder="أي ملاحظات إضافية..."
                value={formData.notes}
                onChange={(v) => updateField('notes', v)}
                type="textarea"
                colSpan={2}
              />
            </div>
          </CollapsibleSection>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-bg-secondary flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-border text-text-primary hover:bg-bg-light transition-all font-medium"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <Check size={20} />
            <span>حفظ المنتج</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};
