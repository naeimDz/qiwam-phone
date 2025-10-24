import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Check, AlertCircle, Zap, DollarSign, Package } from 'lucide-react';


interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface AccessoryFormData {
  name: string;
  brandid: string;
  categoryid: string;
  quantity: string;
  buyprice: string;
  sellprice: string;
  supplierid: string;
  notes: string;
  financial_notes: string;
}

interface AddAccessoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AccessoryFormData, isFinancial: boolean) => void;
  categories: Category[];
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
  colSpan = 1,
  error
}) => {
  const inputClasses = `w-full px-4 py-3 rounded-lg border transition-all outline-none placeholder:text-gray-400
    ${error 
      ? 'border-red-500 bg-red-50 focus:border-red-600' 
      : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
    }`;
  
  return (
    <div className={colSpan === 2 ? 'col-span-1 md:col-span-2' : ''}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClasses} h-16 resize-none`}
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
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <span>{hint}</span>
        </p>
      )}
    </div>
  );
};

const ModeCard: React.FC<{
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  details: string;
  isSelected: boolean;
  onClick: () => void;
  accentColor: string;
}> = ({ icon: Icon, title, description, details, isSelected, onClick, accentColor }) => (
  <button
    onClick={onClick}
    className={`relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 border-2 ${
      isSelected 
        ? `border-${accentColor}-500 bg-${accentColor}-50 shadow-lg shadow-${accentColor}-200` 
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}
  >
    {isSelected && (
      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-${accentColor}-500`}></div>
    )}
    
    <div className="flex gap-3">
      <Icon size={24} className={`text-${accentColor}-600 mt-1 flex-shrink-0`} />
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
        <p className="text-xs text-gray-600 mb-2">{description}</p>
        <div className={`p-2 rounded text-xs font-mono bg-${accentColor}-100 text-${accentColor}-700`}>
          {details}
        </div>
      </div>
    </div>
  </button>
);

export const AddAccessoryModal: React.FC<AddAccessoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  suppliers,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<AccessoryFormData>({
    name: '',
    brandid: '',
    categoryid: '',
    quantity: '',
    buyprice: '',
    sellprice: '',
    supplierid: '',
    notes: '',
    financial_notes: ''
  });

  const [isFinancial, setIsFinancial] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modeCollapsed, setModeCollapsed] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        buyprice: '',
        sellprice: '',
        supplierid: '',
        financial_notes: ''
      }));
      setErrors({});
      setModeCollapsed(false);
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

  const updateField = (field: keyof AccessoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم الإكسسوار مطلوب';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'اسم قصير جداً';
    }

    if (!formData.categoryid) {
      newErrors.categoryid = 'الفئة مطلوبة';
    }

    if (!formData.quantity || isNaN(parseInt(formData.quantity)) || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'كمية صحيحة مطلوبة';
    }

    if (isFinancial) {
      if (!formData.buyprice || isNaN(parseFloat(formData.buyprice)) || parseFloat(formData.buyprice) < 0) {
        newErrors.buyprice = 'سعر الشراء مطلوب وصحيح';
      }
      if (!formData.sellprice || isNaN(parseFloat(formData.sellprice)) || parseFloat(formData.sellprice) < 0) {
        newErrors.sellprice = 'سعر البيع مطلوب وصحيح';
      }
      if (formData.buyprice && formData.sellprice && parseFloat(formData.sellprice) < parseFloat(formData.buyprice)) {
        newErrors.sellprice = 'سعر البيع يجب أن يكون ≥ سعر الشراء';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData, isFinancial);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-blue-50 to-transparent sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Plus className="text-indigo-600" size={28} />
              إضافة إكسسوار جديد
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isFinancial ? '💰 منتج تجاري' : '⚡ جرد سريع'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Mode Selector - Collapsible */}
            <div className="space-y-3">
              <button
                onClick={() => setModeCollapsed(!modeCollapsed)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700">نوع الإضافة</span>
                <span className={`text-xl transition-transform duration-300 ${modeCollapsed ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {!modeCollapsed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-200">
                  <ModeCard
                    icon={Zap}
                    title="جرد سريع"
                    description="بدون حسابات مالية"
                    details="اسم + كمية + ملاحظات ⚡"
                    isSelected={!isFinancial}
                    onClick={() => setIsFinancial(false)}
                    accentColor="blue"
                  />
                  <ModeCard
                    icon={DollarSign}
                    title="منتج تجاري"
                    description="مع حسابات مالية"
                    details="أسعار + مورد + ملاحظات 💰"
                    isSelected={isFinancial}
                    onClick={() => setIsFinancial(true)}
                    accentColor="green"
                  />
                </div>
              )}
            </div>

            {/* Main Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package size={18} className="text-blue-600" />
                    المعلومات الأساسية
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Name */}
                    <InputField
                      label="اسم الإكسسوار"
                      placeholder="مثال: شاحن iPhone أصلي، كيبل USB-C..."
                      value={formData.name}
                      onChange={(v) => updateField('name', v)}
                      required
                      error={errors.name}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      {/* Category */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          الفئة <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.categoryid}
                          onChange={(e) => updateField('categoryid', e.target.value)}
                          className={`w-full px-4 py-3 rounded-lg border transition-all outline-none
                            ${errors.categoryid 
                              ? 'border-red-500 bg-red-50 focus:border-red-600' 
                              : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                            }`}
                        >
                          <option value="">اختر</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        {errors.categoryid && (
                          <p className="text-xs text-red-600 mt-1">{errors.categoryid}</p>
                        )}
                      </div>

                      {/* Quantity */}
                      <InputField
                        label="الكمية"
                        placeholder="0"
                        value={formData.quantity}
                        onChange={(v) => updateField('quantity', v)}
                        type="number"
                        required
                        error={errors.quantity}
                      />
                    </div>
                  </div>
                </div>

                {/* General Notes */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">ملاحظات عامة</h3>
                  <InputField
                    label="ملاحظات"
                    placeholder="أي معلومة إضافية..."
                    value={formData.notes}
                    onChange={(v) => updateField('notes', v)}
                    type="textarea"
                  />
                </div>
              </div>

              {/* Right Column - Category Specific */}
              <div className="space-y-4">

                {/* Financial Section - Conditional */}
                {isFinancial && (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200 space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                      <DollarSign size={16} className="text-green-600" />
                      المعلومات المالية
                    </h3>
                    
                    <InputField
                      label="سعر الشراء (دج)"
                      placeholder="1500"
                      value={formData.buyprice}
                      onChange={(v) => updateField('buyprice', v)}
                      type="number"
                      required
                      error={errors.buyprice}
                    />

                    <InputField
                      label="سعر البيع (دج)"
                      placeholder="2000"
                      value={formData.sellprice}
                      onChange={(v) => updateField('sellprice', v)}
                      type="number"
                      required
                      error={errors.sellprice}
                    />

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        المورد
                      </label>
                      <select
                        value={formData.supplierid}
                        onChange={(e) => updateField('supplierid', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      >
                        <option value="">اختر المورد</option>
                        {suppliers.map(sup => (
                          <option key={sup.id} value={sup.id}>{sup.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all font-medium disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
          >
            <Check size={20} />
            <span>{isLoading ? 'جاري الحفظ...' : 'حفظ الإكسسوار'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};