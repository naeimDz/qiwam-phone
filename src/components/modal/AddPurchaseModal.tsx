import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Plus, Trash2, Package, User, Calendar, FileText, 
  Search, AlertCircle, Save, Clock, Check, Smartphone,
  DollarSign, Hash, ChevronDown, Zap, TrendingUp
} from 'lucide-react';

// Types
interface PurchaseItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
  hasIMEI: boolean;
  imeiList?: string[];
  notes?: string;
}

interface PurchaseFormData {
  supplier: string;
  invoiceNumber: string;
  date: string;
  items: PurchaseItem[];
  notes: string;
}

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PurchaseFormData, isDraft: boolean) => void;
  categories: Array<{ id: string; name: string }>;
  recentSuppliers: string[];
}

// مكون عنصر المنتج (كرت)
const ProductCard: React.FC<{
  item: PurchaseItem;
  index: number;
  onUpdate: (id: string, field: keyof PurchaseItem, value: any) => void;
  onDelete: (id: string) => void;
  onAddIMEI: (id: string) => void;
}> = ({ item, index, onUpdate, onDelete, onAddIMEI }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const needsIMEI = item.hasIMEI && (!item.imeiList || item.imeiList.length < item.quantity);

  return (
    <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">{index + 1}</span>
          </div>
          
          <div className="flex-1 min-w-0 space-y-3">
            {/* اسم المنتج */}
            <input
              type="text"
              placeholder="اسم المنتج... مثال: Samsung A54"
              value={item.name}
              onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-primary placeholder:text-text-secondary focus:border-primary outline-none transition-colors font-medium"
            />

            {/* الصف الثاني: الكمية والسعر */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Hash size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="number"
                  placeholder="الكمية"
                  value={item.quantity || ''}
                  onChange={(e) => onUpdate(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full pr-8 pl-3 py-2 rounded-lg border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
                />
              </div>
              <div className="relative">
                <DollarSign size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="number"
                  placeholder="السعر"
                  value={item.unitPrice || ''}
                  onChange={(e) => onUpdate(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full pr-8 pl-3 py-2 rounded-lg border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            {/* الإجمالي + IMEI */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">الإجمالي:</span>
                <span className="text-lg font-bold text-primary">
                  {(item.quantity * item.unitPrice).toLocaleString()} دج
                </span>
              </div>

              {/* زر IMEI */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.hasIMEI}
                  onChange={(e) => onUpdate(item.id, 'hasIMEI', e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <Smartphone size={14} className="text-text-secondary" />
                <span className="text-xs text-text-secondary">يحتاج IMEI</span>
              </label>
            </div>

            {/* تنبيه IMEI */}
            {needsIMEI && (
              <div className="flex items-center gap-2 p-2 bg-orange-500 bg-opacity-10 border border-orange-500 border-opacity-30 rounded-lg">
                <AlertCircle size={14} className="text-orange-400 shrink-0" />
                <span className="text-xs text-orange-400 flex-1">
                  باقي {item.quantity - (item.imeiList?.length || 0)} أجهزة بدون IMEI
                </span>
                <button
                  onClick={() => onAddIMEI(item.id)}
                  className="text-xs text-orange-400 hover:text-orange-300 font-medium"
                >
                  إضافة الآن
                </button>
              </div>
            )}
          </div>

          {/* الأزرار */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-bg-light transition-colors text-text-secondary"
              title="المزيد"
            >
              <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 rounded-lg hover:bg-bg-light transition-colors text-text-secondary hover:text-red-500"
              title="حذف"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* القسم الموسع */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-border space-y-3">
            <select
              value={item.category}
              onChange={(e) => onUpdate(item.id, 'category', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
            >
              <option value="">اختر الفئة</option>
              <option value="phones">هواتف</option>
              <option value="accessories">إكسسوارات</option>
              <option value="covers">كفرات</option>
            </select>

            <textarea
              placeholder="ملاحظات خاصة بهذا المنتج..."
              value={item.notes || ''}
              onChange={(e) => onUpdate(item.id, 'notes', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors resize-none h-20"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// مكون الملخص السريع
const QuickSummary: React.FC<{
  items: PurchaseItem[];
  missingIMEI: number;
}> = ({ items, missingIMEI }) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="bg-gradient-to-br from-primary to-accent p-4 rounded-xl text-white">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm opacity-90">ملخص الفاتورة</span>
        <TrendingUp size={16} />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-2xl font-bold">{items.length}</p>
          <p className="text-xs opacity-75">منتج</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{totalItems}</p>
          <p className="text-xs opacity-75">قطعة</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{totalAmount.toLocaleString()}</p>
          <p className="text-xs opacity-75">دج</p>
        </div>
      </div>

      {missingIMEI > 0 && (
        <div className="mt-3 pt-3 border-t border-white border-opacity-20 flex items-center gap-2 text-sm">
          <AlertCircle size={14} />
          <span className="opacity-90">{missingIMEI} جهاز بدون IMEI</span>
        </div>
      )}
    </div>
  );
};

// المكون الرئيسي
export const AddPurchaseModal: React.FC<AddPurchaseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  recentSuppliers
}) => {
  const [formData, setFormData] = useState<PurchaseFormData>({
    supplier: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
    notes: ''
  });

  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [showQuickInput, setShowQuickInput] = useState(false);
  const supplierInputRef = useRef<HTMLInputElement>(null);

  // Reset عند الفتح
  useEffect(() => {
    if (isOpen) {
      setFormData({
        supplier: '',
        invoiceNumber: '',
        date: new Date().toISOString().split('T')[0],
        items: [createNewItem()],
        notes: ''
      });
    }
  }, [isOpen]);

  // إغلاق عند ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (formData.items.length > 0 && formData.items.some(i => i.name)) {
          if (window.confirm('هل تريد حفظ كمسودة؟')) {
            handleSaveDraft();
          } else {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, formData]);

  const createNewItem = (): PurchaseItem => ({
    id: Date.now().toString() + Math.random(),
    name: '',
    category: '',
    quantity: 1,
    unitPrice: 0,
    total: 0,
    hasIMEI: false,
    imeiList: []
  });

  const addNewItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, createNewItem()]
    }));
  };

  const updateItem = (id: string, field: keyof PurchaseItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const deleteItem = (id: string) => {
    if (formData.items.length === 1) {
      alert('لازم يكون فيه منتج واحد على الأقل');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleAddIMEI = (itemId: string) => {
    // هنا تفتح modal منفصل لإدخال IMEI
    alert('فتح نافذة إدخال IMEI...');
  };

  const handleSaveDraft = () => {
    onSubmit(formData, true);
    onClose();
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.supplier.trim()) {
      alert('يرجى إدخال اسم المورد');
      return;
    }
    if (formData.items.length === 0 || !formData.items.some(i => i.name)) {
      alert('يرجى إضافة منتج واحد على الأقل');
      return;
    }

    const missingIMEI = formData.items.filter(item => 
      item.hasIMEI && (!item.imeiList || item.imeiList.length < item.quantity)
    ).length;

    if (missingIMEI > 0) {
      if (!window.confirm(`هناك ${missingIMEI} منتج بدون IMEI. هل تريد الحفظ رغم ذلك؟`)) {
        return;
      }
    }

    onSubmit(formData, false);
    onClose();
  };

  const getMissingIMEICount = () => {
    return formData.items.reduce((count, item) => {
      if (item.hasIMEI && (!item.imeiList || item.imeiList.length < item.quantity)) {
        return count + (item.quantity - (item.imeiList?.length || 0));
      }
      return count;
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-bg-primary border border-border rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Package className="text-primary" size={28} />
              إدخال فاتورة مورد
            </h2>
            <p className="text-sm text-text-secondary mt-1 flex items-center gap-1">
              <Zap size={12} />
              جبت سلعة؟ دخلها بسرعة وارتاح
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* معلومات الفاتورة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* المورد */}
            <div className="relative">
              <label className="block text-text-primary font-medium mb-2 flex items-center gap-2">
                <User size={14} />
                المورد <span className="text-red-500">*</span>
              </label>
              <input
                ref={supplierInputRef}
                type="text"
                placeholder="مثال: قيس للتجارة"
                value={formData.supplier}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, supplier: e.target.value }));
                  setShowSupplierSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSupplierSuggestions(true)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
              />
              
              {/* اقتراحات الموردين */}
              {showSupplierSuggestions && recentSuppliers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border rounded-xl shadow-lg max-h-40 overflow-y-auto z-10">
                  {recentSuppliers
                    .filter(s => s.toLowerCase().includes(formData.supplier.toLowerCase()))
                    .map((supplier, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, supplier }));
                          setShowSupplierSuggestions(false);
                        }}
                        className="w-full px-4 py-2 text-right hover:bg-bg-light transition-colors text-text-primary"
                      >
                        {supplier}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* رقم الفاتورة */}
            <div>
              <label className="block text-text-primary font-medium mb-2 flex items-center gap-2">
                <FileText size={14} />
                رقم الفاتورة
              </label>
              <input
                type="text"
                placeholder="اختياري"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
              />
            </div>

            {/* التاريخ */}
            <div>
              <label className="block text-text-primary font-medium mb-2 flex items-center gap-2">
                <Calendar size={14} />
                التاريخ
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors"
              />
            </div>
          </div>

          {/* الملخص السريع */}
          <QuickSummary items={formData.items} missingIMEI={getMissingIMEICount()} />

          {/* قائمة المنتجات */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">المنتجات</h3>
              <button
                onClick={() => setShowQuickInput(!showQuickInput)}
                className="text-sm text-primary hover:text-opacity-80 flex items-center gap-1"
              >
                <Zap size={14} />
                {showQuickInput ? 'الوضع العادي' : 'إدخال سريع'}
              </button>
            </div>

            {formData.items.map((item, index) => (
              <ProductCard
                key={item.id}
                item={item}
                index={index}
                onUpdate={updateItem}
                onDelete={deleteItem}
                onAddIMEI={handleAddIMEI}
              />
            ))}

            {/* زر إضافة منتج */}
            <button
              onClick={addNewItem}
              className="w-full py-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-all flex items-center justify-center gap-2 text-text-secondary hover:text-primary font-medium"
            >
              <Plus size={20} />
              <span>أضف منتج آخر</span>
            </button>
          </div>

          {/* ملاحظات عامة */}
          <div>
            <label className="block text-text-primary font-medium mb-2">ملاحظات عامة</label>
            <textarea
              placeholder="أي ملاحظات على الفاتورة..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors resize-none h-24"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-bg-secondary flex gap-3">
          <button
            onClick={handleSaveDraft}
            className="px-6 py-3 rounded-xl border border-border text-text-primary hover:bg-bg-light transition-all flex items-center gap-2"
          >
            <Clock size={18} />
            <span>حفظ كمسودة</span>
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-bold text-lg"
          >
            <Check size={22} />
            <span>تأكيد وحفظ</span>
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

