"use client"
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Plus, Trash2, Package, User, Calendar, FileText, 
  Search, AlertCircle, Save, Clock, Check, Smartphone,
  DollarSign, Hash, ChevronDown, Zap, TrendingUp, Edit2,
  Eye, Filter, Download, MoreVertical, Truck, Archive,
  RefreshCw, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';

// ============= TYPES =============
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

interface Purchase {
  id: string;
  supplier: string;
  invoiceNumber: string;
  date: string;
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
  status: 'completed' | 'draft' | 'pending_imei';
  missingIMEI: number;
  items: PurchaseItem[];
  notes?: string;
  createdAt: string;
}

// ============= MODAL COMPONENTS =============

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
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">{index + 1}</span>
          </div>
          
          <div className="flex-1 min-w-0 space-y-3">
            <input
              type="text"
              placeholder="اسم المنتج... مثال: Samsung A54"
              value={item.name}
              onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-primary placeholder:text-text-secondary focus:border-primary outline-none transition-colors font-medium"
            />

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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">الإجمالي:</span>
                <span className="text-lg font-bold text-primary">
                  {(item.quantity * item.unitPrice).toLocaleString()} دج
                </span>
              </div>

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

// مكون Modal إضافة المشتريات
const AddPurchaseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PurchaseFormData, isDraft: boolean) => void;
  categories: Array<{ id: string; name: string }>;
  recentSuppliers: string[];
}> = ({ isOpen, onClose, onSubmit, categories, recentSuppliers }) => {
  const [formData, setFormData] = useState<PurchaseFormData>({
    supplier: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
    notes: ''
  });

  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const supplierInputRef = useRef<HTMLInputElement>(null);

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
    alert('فتح نافذة إدخال IMEI...');
  };

  const handleSaveDraft = () => {
    onSubmit(formData, true);
    onClose();
  };

  const handleSubmit = () => {
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <QuickSummary items={formData.items} missingIMEI={getMissingIMEICount()} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">المنتجات</h3>
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

            <button
              onClick={addNewItem}
              className="w-full py-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-all flex items-center justify-center gap-2 text-text-secondary hover:text-primary font-medium"
            >
              <Plus size={20} />
              <span>أضف منتج آخر</span>
            </button>
          </div>

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
    </div>
  );
};

// ============= PAGE COMPONENTS =============

// كرت إحصائيات
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  trend?: { value: string; isUp: boolean };
}> = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-bg-secondary border border-border rounded-xl p-6 hover:shadow-lg transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-${color} bg-opacity-10`}>
        <Icon className={`text-${color}`} size={24} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}>
          <TrendingUp size={14} className={trend.isUp ? '' : 'rotate-180'} />
          <span>{trend.value}</span>
        </div>
      )}
    </div>
    <h3 className="text-text-secondary text-sm mb-1">{title}</h3>
    <p className="text-2xl font-bold text-text-primary">{value}</p>
  </div>
);

// كرت الفاتورة
const PurchaseCard: React.FC<{
  purchase: Purchase;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ purchase, onView, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusBadge = () => {
    switch (purchase.status) {
      case 'completed':
        return (
          <span className="px-3 py-1 bg-green-500 bg-opacity-10 text-green-500 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle size={12} />
            مكتملة
          </span>
        );
      case 'draft':
        return (
          <span className="px-3 py-1 bg-gray-500 bg-opacity-10 text-gray-400 rounded-full text-xs font-medium flex items-center gap-1">
            <Clock size={12} />
            مسودة
          </span>
        );
      case 'pending_imei':
        return (
          <span className="px-3 py-1 bg-orange-500 bg-opacity-10 text-orange-400 rounded-full text-xs font-medium flex items-center gap-1">
            <AlertTriangle size={12} />
            ناقص IMEI
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-text-primary">{purchase.supplier}</h3>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <FileText size={14} />
              {purchase.invoiceNumber || 'بدون رقم'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(purchase.date).toLocaleDateString('ar-DZ')}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-bg-light transition-colors text-text-secondary"
          >
            <MoreVertical size={18} />
          </button>
          {showMenu && (
            <div className="absolute left-0 top-full mt-1 bg-bg-primary border border-border rounded-xl shadow-lg overflow-hidden z-10 min-w-[150px]">
              <button
                onClick={() => {
                  onView(purchase.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-right hover:bg-bg-secondary transition-colors text-text-primary flex items-center gap-2"
              >
                <Eye size={16} />
                عرض التفاصيل
              </button>
              <button
                onClick={() => {
                  onEdit(purchase.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-right hover:bg-bg-secondary transition-colors text-text-primary flex items-center gap-2"
              >
                <Edit2 size={16} />
                تعديل
              </button>
              <button
                onClick={() => {
                  onDelete(purchase.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-right hover:bg-bg-secondary transition-colors text-red-500 flex items-center gap-2"
              >
                <Trash2 size={16} />
                حذف
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-text-secondary mb-1">عدد المنتجات</p>
          <p className="text-lg font-bold text-text-primary">{purchase.totalItems}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary mb-1">الكمية الإجمالية</p>
          <p className="text-lg font-bold text-text-primary">{purchase.totalQuantity}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary mb-1">المبلغ الإجمالي</p>
          <p className="text-lg font-bold text-primary">{purchase.totalAmount.toLocaleString()} دج</p>
        </div>
      </div>

      {purchase.missingIMEI > 0 && (
        <div className="flex items-center gap-2 p-3 bg-orange-500 bg-opacity-10 border border-orange-500 border-opacity-30 rounded-lg">
          <AlertCircle size={16} className="text-orange-400 shrink-0" />
          <span className="text-sm text-orange-400 flex-1">
            {purchase.missingIMEI} جهاز بحاجة لإدخال IMEI
          </span>
          <button className="text-sm text-orange-400 hover:text-orange-300 font-medium">
            إضافة الآن
          </button>
        </div>
      )}
    </div>
  );
};

// الصفحة الرئيسية
const PurchasesPage: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: '1',
      supplier: 'قيس للتجارة',
      invoiceNumber: 'INV-2024-001',
      date: '2024-10-15',
      totalItems: 3,
      totalQuantity: 32,
      totalAmount: 756000,
      status: 'completed',
      missingIMEI: 0,
      items: [],
      createdAt: '2024-10-15T10:30:00'
    },
    {
      id: '2',
      supplier: 'رضا الجلفة',
      invoiceNumber: 'INV-2024-002',
      date: '2024-10-18',
      totalItems: 2,
      totalQuantity: 12,
      totalAmount: 432000,
      status: 'pending_imei',
      missingIMEI: 2,
      items: [],
      createdAt: '2024-10-18T14:20:00'
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'draft' | 'pending_imei'>('all');

  const categories = [
    { id: '1', name: 'هواتف' },
    { id: '2', name: 'إكسسوارات' },
    { id: '3', name: 'كفرات' }
  ];

  const recentSuppliers = ['قيس للتجارة', 'رضا الجلفة', 'محل القدس', 'عماد للهواتف'];

  const handleAddPurchase = (data: PurchaseFormData, isDraft: boolean) => {
    const totalItems = data.items.length;
    const totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const missingIMEI = data.items.reduce((count, item) => {
      if (item.hasIMEI && (!item.imeiList || item.imeiList.length < item.quantity)) {
        return count + (item.quantity - (item.imeiList?.length || 0));
      }
      return count;
    }, 0);

    const newPurchase: Purchase = {
      id: Date.now().toString(),
      supplier: data.supplier,
      invoiceNumber: data.invoiceNumber,
      date: data.date,
      totalItems,
      totalQuantity,
      totalAmount,
      status: isDraft ? 'draft' : (missingIMEI > 0 ? 'pending_imei' : 'completed'),
      missingIMEI,
      items: data.items,
      notes: data.notes,
      createdAt: new Date().toISOString()
    };

    setPurchases(prev => [newPurchase, ...prev]);
  };

  const handleViewPurchase = (id: string) => {
    alert(`عرض تفاصيل الفاتورة ${id}`);
  };

  const handleEditPurchase = (id: string) => {
    alert(`تعديل الفاتورة ${id}`);
  };

  const handleDeletePurchase = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      setPurchases(prev => prev.filter(p => p.id !== id));
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         purchase.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || purchase.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // إحصائيات
  const totalPurchases = purchases.length;
  const totalAmount = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const pendingIMEI = purchases.filter(p => p.status === 'pending_imei').length;
  const drafts = purchases.filter(p => p.status === 'draft').length;

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
              <Truck className="text-primary" size={36} />
              المشتريات
            </h1>
            <p className="text-text-secondary mt-1">إدارة فواتير الموردين والمشتريات</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center gap-2 font-semibold shadow-lg"
          >
            <Plus size={20} />
            <span>إضافة فاتورة جديدة</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="إجمالي الفواتير"
            value={totalPurchases}
            icon={FileText}
            color="primary"
            trend={{ value: '+12%', isUp: true }}
          />
          <StatsCard
            title="إجمالي المبلغ"
            value={`${totalAmount.toLocaleString()} دج`}
            icon={DollarSign}
            color="accent"
            trend={{ value: '+8%', isUp: true }}
          />
          <StatsCard
            title="ناقص IMEI"
            value={pendingIMEI}
            icon={AlertTriangle}
            color="orange-500"
          />
          <StatsCard
            title="المسودات"
            value={drafts}
            icon={Clock}
            color="gray-400"
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-bg-secondary border border-border rounded-xl p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input
                type="text"
                placeholder="ابحث عن مورد أو رقم فاتورة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-bg-primary text-text-secondary hover:bg-bg-light'
                }`}
              >
                الكل ({purchases.length})
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  filterStatus === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-bg-primary text-text-secondary hover:bg-bg-light'
                }`}
              >
                <CheckCircle size={16} className="inline mr-1" />
                مكتملة
              </button>
              <button
                onClick={() => setFilterStatus('pending_imei')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  filterStatus === 'pending_imei'
                    ? 'bg-orange-500 text-white'
                    : 'bg-bg-primary text-text-secondary hover:bg-bg-light'
                }`}
              >
                <AlertTriangle size={16} className="inline mr-1" />
                ناقص IMEI
              </button>
              <button
                onClick={() => setFilterStatus('draft')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  filterStatus === 'draft'
                    ? 'bg-gray-500 text-white'
                    : 'bg-bg-primary text-text-secondary hover:bg-bg-light'
                }`}
              >
                <Clock size={16} className="inline mr-1" />
                مسودة
              </button>
            </div>

            {/* Export Button */}
            <button className="px-4 py-2.5 rounded-xl border border-border text-text-primary hover:bg-bg-light transition-all flex items-center gap-2">
              <Download size={18} />
              <span>تصدير</span>
            </button>
          </div>
        </div>

        {/* Purchases List */}
        <div className="space-y-4">
          {filteredPurchases.length === 0 ? (
            <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center">
              <Package size={64} className="mx-auto mb-4 text-text-secondary opacity-30" />
              <h3 className="text-xl font-bold text-text-primary mb-2">
                {searchQuery || filterStatus !== 'all' ? 'لا توجد نتائج' : 'لا توجد فواتير بعد'}
              </h3>
              <p className="text-text-secondary mb-6">
                {searchQuery || filterStatus !== 'all' 
                  ? 'جرب تغيير البحث أو الفلترة' 
                  : 'ابدأ بإضافة فاتورة المورد الأولى'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all inline-flex items-center gap-2 font-semibold"
                >
                  <Plus size={20} />
                  <span>إضافة فاتورة جديدة</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredPurchases.map(purchase => (
                <PurchaseCard
                  key={purchase.id}
                  purchase={purchase}
                  onView={handleViewPurchase}
                  onEdit={handleEditPurchase}
                  onDelete={handleDeletePurchase}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredPurchases.length > 0 && (
          <div className="flex items-center justify-between bg-bg-secondary border border-border rounded-xl p-4">
            <span className="text-text-secondary text-sm">
              عرض {filteredPurchases.length} من {purchases.length} فاتورة
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-bg-primary text-text-primary hover:bg-bg-light transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                السابق
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-all">
                1
              </button>
              <button className="px-4 py-2 rounded-lg bg-bg-primary text-text-primary hover:bg-bg-light transition-all">
                2
              </button>
              <button className="px-4 py-2 rounded-lg bg-bg-primary text-text-primary hover:bg-bg-light transition-all">
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Purchase Modal */}
      <AddPurchaseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPurchase}
        categories={categories}
        recentSuppliers={recentSuppliers}
      />

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

export default PurchasesPage