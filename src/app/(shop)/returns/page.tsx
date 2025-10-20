"use client"
import React, { useState } from 'react';
import { 
  RotateCcw, RefreshCw, ArrowLeftRight, AlertTriangle,
  Filter, Download, Eye, Trash2, Plus, ArrowUpRight,
  ArrowDownRight, Clock, CheckCircle, XCircle, Search,
  Calendar, DollarSign, Package, User, FileText, X,
  Check, ChevronDown, ShoppingCart, LucideIcon
} from 'lucide-react';

// ============================================
// TypeScript Types & Interfaces
// ============================================
interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  bgPrimary: string;
  bgSecondary: string;
  bgLight: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  hover: string;
}

interface Theme {
  colors: ThemeColors;
}

type ReturnType = 'sale' | 'purchase';
type ReturnStatus = 'completed' | 'pending' | 'partial' | 'rejected';
type ViewMode = 'invoices' | 'items';
type TabType = 'all' | 'sales' | 'purchases';

interface ReturnItem {
  name: string;
  quantity: number;
  price: number;
  returned?: boolean;
}

interface ReturnInvoice {
  id: string;
  type: ReturnType;
  date: string;
  customer?: string;
  supplier?: string;
  totalAmount: number;
  returnedAmount: number;
  status: ReturnStatus;
  items: ReturnItem[];
  reason: string;
  processedBy: string | null;
  processedDate: string | null;
}

interface ReturnItemData {
  id: number;
  invoiceId: string;
  name: string;
  quantity: number;
  price: number;
  date: string;
  type: ReturnType;
  status: ReturnStatus;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  theme: Theme;
}

interface FilterBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme: Theme;
}

interface ReturnInvoiceCardProps {
  returnItem: ReturnInvoice;
  onViewDetails: (item: ReturnInvoice) => void;
  theme: Theme;
}

interface ReturnItemRowProps {
  item: ReturnItemData;
  theme: Theme;
}

interface ReturnDetailsModalProps {
  returnItem: ReturnInvoice | null;
  onClose: () => void;
  theme: Theme;
}

interface NewReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

interface ReturnsPageProps {
  theme: Theme;
}

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  color: string;
}

// ============================================
// Stats Card Component
// ============================================
const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  theme 
}) => (
  <div 
    className="bg-white p-5 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-lg"
    
  >
    <div className="flex items-start justify-between mb-3">
      <div 
        className="p-2.5 rounded-xl shadow-sm" 
        
      >
        <Icon size={20} />
      </div>
      <span 
        className="text-xs font-bold px-2.5 py-1 rounded-full" 
        
      >
        {change}
      </span>
    </div>
    <h3 className="text-xs font-semibold mb-1.5" >
      {title}
    </h3>
    <p className="text-2xl font-bold">
      {value}
    </p>
  </div>
);

// ============================================
// Filter Bar Component
// ============================================
const FilterBar: React.FC<FilterBarProps> = ({ 
  activeTab, 
  setActiveTab, 
  viewMode, 
  setViewMode, 
  searchQuery, 
  setSearchQuery, 
  theme 
}) => (
  <div 
    className="bg-white rounded-2xl shadow-sm border p-4 mb-5"
    
  >
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Search */}
      <div className="flex-1 min-w-[300px]">
        <div 
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
          
        >
          <Search size={18}  />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الفاتورة، اسم العميل، أو المنتج..."
            className="flex-1 outline-none bg-transparent text-sm"
            
          />
        </div>
      </div>

      {/* View Mode Toggle */}
      <div 
        className="flex items-center gap-1 p-1 rounded-xl"
        
      >
        <button
          onClick={() => setViewMode('invoices')}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
        >
          <FileText size={16} className="inline ml-1" />
          حسب الفاتورة
        </button>
        <button
          onClick={() => setViewMode('items')}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
        >
          <Package size={16} className="inline ml-1" />
          حسب العنصر
        </button>
      </div>

      {/* Filter Tabs */}
      <div 
        className="flex items-center gap-1 p-1 rounded-xl"
        
      >
        <button
          onClick={() => setActiveTab('all')}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
        >
          الكل
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
          
        >
          <ArrowUpRight size={16} className="inline ml-1" />
          المبيعات
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
        >
          <ArrowDownRight size={16} className="inline ml-1" />
          المشتريات
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button 
          className="p-2.5 rounded-xl transition-all duration-300 border"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.hover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Filter size={18} />
        </button>
        <button 
          className="p-2.5 rounded-xl transition-all duration-300 border"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.hover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Download size={18} />
        </button>
      </div>
    </div>
  </div>
);

// ============================================
// Return Invoice Card Component
// ============================================
const ReturnInvoiceCard: React.FC<ReturnInvoiceCardProps> = ({ 
  returnItem, 
  onViewDetails, 
  theme 
}) => {
  const statusConfig: Record<ReturnStatus, StatusConfig> = {
    completed: { label: 'مكتمل', icon: CheckCircle, color: '#10B981' },
    pending: { label: 'قيد المعالجة', icon: Clock, color: '#F59E0B' },
    partial: { label: 'جزئي', icon: AlertTriangle, color: '#3B82F6' },
    rejected: { label: 'مرفوض', icon: XCircle, color: '#EF4444' }
  };

  const status = statusConfig[returnItem.status];
  const StatusIcon = status.icon;

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border p-5 transition-all duration-300 hover:shadow-lg"
      
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div 
            className="p-3 rounded-xl"
          >
            {returnItem.type === 'sale' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1" >
              {returnItem.id}
            </h3>
            <p className="text-sm flex items-center gap-1.5" >
              <Calendar size={14} />
              {returnItem.date}
            </p>
          </div>
        </div>
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
          
        >
          <StatusIcon size={16} />
          {status.label}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm" >
            {returnItem.type === 'sale' ? 'العميل' : 'المورد'}:
          </span>
          <span className="font-semibold" >
            {returnItem.customer || returnItem.supplier}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm" >المبلغ المرتجع:</span>
          <span className="font-bold text-lg" >
            {returnItem.returnedAmount.toLocaleString()} DA
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm" >عدد العناصر:</span>
          <span className="font-semibold" >
            {returnItem.items.length}
          </span>
        </div>
        <div 
          className="p-3 rounded-lg flex items-start gap-2"
          
        >
          <AlertTriangle size={16}  className="mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold mb-0.5" >
              سبب الإرجاع:
            </p>
            <p className="text-sm font-semibold" >
              {returnItem.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onViewDetails(returnItem)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
          
        >
          <Eye size={16} />
          عرض التفاصيل
        </button>
        {returnItem.status === 'completed' && (
          <button 
            className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 border"
            
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.hover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Download size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// Return Item Row Component (for items view)
// ============================================
const ReturnItemRow: React.FC<ReturnItemRowProps> = ({ item, theme }) => (
  <div 
    className="flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:shadow-md"
  >
    <div className="flex items-center gap-4 flex-1">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center"      >
        <Package size={20} />
      </div>
      <div className="flex-1">
        <h4 className="font-bold mb-1" >
          {item.name}
        </h4>
        <div className="flex items-center gap-3 text-sm" >
          <span className="flex items-center gap-1">
            <FileText size={14} />
            {item.invoiceId}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {item.date}
          </span>
          <span className="flex items-center gap-1">
            {item.type === 'sale' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {item.type === 'sale' ? 'مبيعات' : 'مشتريات'}
          </span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="text-center">
        <p className="text-xs mb-1" >الكمية</p>
        <p className="font-bold" >{item.quantity}</p>
      </div>
      <div className="text-center">
        <p className="text-xs mb-1" >السعر</p>
        <p className="font-bold" >
          {item.price.toLocaleString()} DA
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs mb-1" >الإجمالي</p>
        <p className="font-bold text-lg" >
          {(item.quantity * item.price).toLocaleString()} DA
        </p>
      </div>
      <div 
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
      >
        {item.status === 'completed' ? <CheckCircle size={14} /> : <Clock size={14} />}
        {item.status === 'completed' ? 'مكتمل' : 'قيد المعالجة'}
      </div>
    </div>
  </div>
);

// ============================================
// Return Details Modal Component
// ============================================
const ReturnDetailsModal: React.FC<ReturnDetailsModalProps> = ({ 
  returnItem, 
  onClose, 
  theme 
}) => {
  if (!returnItem) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        
      >
        {/* Header */}
        <div 
          className="p-6 border-b flex items-center justify-between"
          
        >
          <div>
            <h3 className="text-2xl font-bold mb-1" >
              تفاصيل المرتجع
            </h3>
            <p className="text-sm" >
              {returnItem.id}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg transition-all"
            
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.hover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div 
              className="p-4 rounded-xl"
              
            >
              <p className="text-xs mb-1" >نوع العملية</p>
              <p className="font-bold flex items-center gap-2" >
                {returnItem.type === 'sale' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                {returnItem.type === 'sale' ? 'مرتجع مبيعات' : 'مرتجع مشتريات'}
              </p>
            </div>
            <div 
              className="p-4 rounded-xl"
              
            >
              <p className="text-xs mb-1" >تاريخ الإرجاع</p>
              <p className="font-bold" >{returnItem.date}</p>
            </div>
            <div 
              className="p-4 rounded-xl"
              
            >
              <p className="text-xs mb-1" >
                {returnItem.type === 'sale' ? 'العميل' : 'المورد'}
              </p>
              <p className="font-bold" >
                {returnItem.customer || returnItem.supplier}
              </p>
            </div>
            <div 
              className="p-4 rounded-xl"
              
            >
              <p className="text-xs mb-1" >المبلغ الإجمالي</p>
              <p className="font-bold text-xl" >
                {returnItem.returnedAmount.toLocaleString()} DA
              </p>
            </div>
          </div>

          {/* Items List */}
          <div className="mb-6">
            <h4 className="font-bold mb-3 text-lg" >
              العناصر المرتجعة
            </h4>
            <div className="space-y-2">
              {returnItem.items.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl border"
                  
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                    >
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="font-semibold" >
                        {item.name}
                      </p>
                      <p className="text-xs" >
                        الكمية: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold" >
                    {item.price.toLocaleString()} DA
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div 
            className="p-4 rounded-xl mb-6"          >
            <div className="flex items-start gap-2">
              <AlertTriangle size={18}  className="mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1" >
                  سبب الإرجاع
                </p>
                <p className="font-bold" >
                  {returnItem.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Processing Info */}
          {returnItem.processedBy && (
            <div 
              className="p-4 rounded-xl"
              
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs mb-1" >تمت المعالجة بواسطة</p>
                  <p className="font-bold" >
                    {returnItem.processedBy}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-xs mb-1" >تاريخ المعالجة</p>
                  <p className="font-bold" >
                    {returnItem.processedDate}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div 
          className="p-6 border-t flex items-center gap-3"
          
        >
          <button 
            className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            
          >
            <Download size={18} className="inline ml-2" />
            تحميل الفاتورة
          </button>
          <button 
            className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 border"
            
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = theme.colors.hover;
              e.currentTarget.style.color = theme.colors.textPrimary;
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.colors.textSecondary;
            }}
          >
            طباعة
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// New Return Modal Component
// ============================================
const NewReturnModal: React.FC<NewReturnModalProps> = ({ isOpen, onClose, theme }) => {
  const [returnType, setReturnType] = useState<ReturnType>('sale');
  const [searchInvoice, setSearchInvoice] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        
      >
        {/* Header */}
        <div 
          className="p-6 border-b flex items-center justify-between"
          
        >
          <div>
            <h3 className="text-2xl font-bold mb-1" >
              إنشاء مرتجع جديد
            </h3>
            <p className="text-sm" >
              اختر نوع المرتجع وابحث عن الفاتورة
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg transition-all"
            
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.hover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Return Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3" >
              نوع المرتجع
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setReturnType('sale')}
                className="p-4 rounded-xl border-2 transition-all duration-300"
              >
                <ArrowUpRight 
                  size={24} 
                  className="mx-auto mb-2" 
                   
                />
                <p className="font-bold" >مرتجع مبيعات</p>
                <p className="text-xs mt-1" >
                  إرجاع منتجات من عميل
                </p>
              </button>
              <button
                onClick={() => setReturnType('purchase')}
                className="p-4 rounded-xl border-2 transition-all duration-300"
              >
                <ArrowDownRight 
                  size={24} 
                  className="mx-auto mb-2" 
                   
                />
                <p className="font-bold" >مرتجع مشتريات</p>
                <p className="text-xs mt-1" >
                  إرجاع منتجات لمورد
                </p>
              </button>
            </div>
          </div>

          {/* Invoice Search */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3" >
              البحث عن الفاتورة
            </label>
            <div 
              className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              
            >
              <Search size={20}  />
              <input
                type="text"
                value={searchInvoice}
                onChange={(e) => setSearchInvoice(e.target.value)}
                placeholder="ابحث برقم الفاتورة أو رمز QR..."
                className="flex-1 outline-none bg-transparent"
                
              />
            </div>
          </div>

          {/* Placeholder for invoice results */}
          <div 
            className="p-8 rounded-xl text-center"
            
          >
            <FileText size={48}  className="mx-auto mb-3" />
            <p >
              ابحث عن فاتورة لبدء عملية الإرجاع
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div 
          className="p-6 border-t flex items-center gap-3"
          
        >
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 border"
            
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = theme.colors.hover;
              e.currentTarget.style.color = theme.colors.textPrimary;
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.colors.textSecondary;
            }}
          >
            إلغاء
          </button>
          <button 
            className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            
          >
            متابعة
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Main Returns Page Component
// ============================================
const ReturnsPage: React.FC<ReturnsPageProps> = ({ theme }) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('invoices');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReturn, setSelectedReturn] = useState<ReturnInvoice | null>(null);
  const [showNewReturnModal, setShowNewReturnModal] = useState<boolean>(false);

  // Sample Data - في التطبيق الحقيقي من API
  const returnsInvoices: ReturnInvoice[] = [
    {
      id: 'RET-2025-001',
      type: 'sale',
      date: '2025-10-18',
      customer: 'أحمد محمد',
      totalAmount: 45000,
      returnedAmount: 45000,
      status: 'completed',
      items: [{ name: 'Samsung Galaxy A54', quantity: 1, price: 45000 }],
      reason: 'عيب في الشاشة',
      processedBy: 'محمد أحمد',
      processedDate: '2025-10-18 14:30'
    },
    {
      id: 'RET-2025-002',
      type: 'sale',
      date: '2025-10-17',
      customer: 'فاطمة علي',
      totalAmount: 32000,
      returnedAmount: 32000,
      status: 'pending',
      items: [{ name: 'Redmi Note 13', quantity: 1, price: 32000 }],
      reason: 'العميل غير راضي',
      processedBy: null,
      processedDate: null
    },
    {
      id: 'RET-2025-003',
      type: 'purchase',
      date: '2025-10-16',
      supplier: 'مورد الجملة',
      totalAmount: 180000,
      returnedAmount: 180000,
      status: 'completed',
      items: [{ name: 'iPhone 15 Pro', quantity: 1, price: 180000 }],
      reason: 'بضاعة معيبة',
      processedBy: 'محمد أحمد',
      processedDate: '2025-10-16 10:15'
    },
    {
      id: 'RET-2025-004',
      type: 'sale',
      date: '2025-10-15',
      customer: 'خالد سعيد',
      totalAmount: 67000,
      returnedAmount: 25000,
      status: 'partial',
      items: [
        { name: 'Samsung Galaxy S24', quantity: 1, price: 67000 },
        { name: 'سماعات AirPods', quantity: 1, price: 25000 }
      ],
      reason: 'إرجاع جزئي - احتفاظ بالهاتف فقط',
      processedBy: 'محمد أحمد',
      processedDate: '2025-10-15 16:45'
    },
    {
      id: 'RET-2025-005',
      type: 'purchase',
      date: '2025-10-14',
      supplier: 'شركة التوزيع',
      totalAmount: 450000,
      returnedAmount: 450000,
      status: 'rejected',
      items: [
        { name: 'iPhone 15', quantity: 3, price: 150000 }
      ],
      reason: 'تأخر في الشحن',
      processedBy: 'محمد أحمد',
      processedDate: '2025-10-14 11:20'
    }
  ];

  const returnsItems: ReturnItemData[] = [
    {
      id: 1,
      invoiceId: 'RET-2025-001',
      name: 'Samsung Galaxy A54',
      quantity: 1,
      price: 45000,
      date: '2025-10-18',
      type: 'sale',
      status: 'completed'
    },
    {
      id: 2,
      invoiceId: 'RET-2025-002',
      name: 'Redmi Note 13',
      quantity: 1,
      price: 32000,
      date: '2025-10-17',
      type: 'sale',
      status: 'pending'
    },
    {
      id: 3,
      invoiceId: 'RET-2025-003',
      name: 'iPhone 15 Pro',
      quantity: 1,
      price: 180000,
      date: '2025-10-16',
      type: 'purchase',
      status: 'completed'
    },
    {
      id: 4,
      invoiceId: 'RET-2025-004',
      name: 'سماعات AirPods',
      quantity: 1,
      price: 25000,
      date: '2025-10-15',
      type: 'sale',
      status: 'completed'
    },
    {
      id: 5,
      invoiceId: 'RET-2025-005',
      name: 'iPhone 15',
      quantity: 3,
      price: 150000,
      date: '2025-10-14',
      type: 'purchase',
      status: 'rejected'
    }
  ];

  // Filter data based on active tab
  const filteredInvoices = returnsInvoices.filter((item) => {
    if (activeTab === 'sales') return item.type === 'sale';
    if (activeTab === 'purchases') return item.type === 'purchase';
    return true;
  }).filter((item) => 
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.customer?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.supplier?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredItems = returnsItems.filter((item) => {
    if (activeTab === 'sales') return item.type === 'sale';
    if (activeTab === 'purchases') return item.type === 'purchase';
    return true;
  }).filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.invoiceId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const stats = {
    totalReturns: returnsInvoices.length,
    totalAmount: returnsInvoices.reduce((sum, item) => sum + item.returnedAmount, 0),
    pendingReturns: returnsInvoices.filter(item => item.status === 'pending').length,
    todayReturns: returnsInvoices.filter(item => item.date === '2025-10-18').length
  };

  return (
    <div className="space-y-5">
      {/* Page Header with Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            إدارة المرتجعات
          </h2>
          <p className="text-sm">
            متابعة وإدارة مرتجعات المبيعات والمشتريات
          </p>
        </div>
        <button 
          onClick={() => setShowNewReturnModal(true)}
          className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <Plus size={20} />
          مرتجع جديد
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="إجمالي المرتجعات"
          value={stats.totalReturns}
          change="+3 هذا الأسبوع"
          trend="up"
          icon={RotateCcw}
          theme={theme}
        />
        <StatsCard
          title="قيمة المرتجعات"
          value={`${stats.totalAmount.toLocaleString()} DA`}
          change="-8.5%"
          trend="down"
          icon={DollarSign}
          theme={theme}
        />
        <StatsCard
          title="قيد المعالجة"
          value={stats.pendingReturns}
          change="يتطلب إجراء"
          trend="up"
          icon={Clock}
          theme={theme}
        />
        <StatsCard
          title="مرتجعات اليوم"
          value={stats.todayReturns}
          change="جديد"
          trend="neutral"
          icon={Calendar}
          theme={theme}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        theme={theme}
      />

      {/* Content Area */}
      {viewMode === 'invoices' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((returnItem) => (
              <ReturnInvoiceCard
                key={returnItem.id}
                returnItem={returnItem}
                onViewDetails={setSelectedReturn}
                theme={theme}
              />
            ))
          ) : (
            <div 
              className="col-span-full p-12 rounded-2xl text-center"
            >
              <Search size={64}  className="mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2" >
                لا توجد مرتجعات
              </h3>
              <p >
                جرب تغيير الفلتر أو البحث بكلمات مختلفة
              </p>
            </div>
          )}
        </div>
      ) : (
        <div 
          className="rounded-2xl shadow-sm border p-5"
        >
          <div className="space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <ReturnItemRow key={item.id} item={item} theme={theme} />
              ))
            ) : (
              <div className="p-12 text-center">
                <Package size={64} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">
                  لا توجد عناصر مرتجعة
                </h3>
                <p >
                  جرب تغيير الفلتر أو البحث بكلمات مختلفة
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ReturnDetailsModal
        returnItem={selectedReturn}
        onClose={() => setSelectedReturn(null)}
        theme={theme}
      />
      
      <NewReturnModal
        isOpen={showNewReturnModal}
        onClose={() => setShowNewReturnModal(false)}
        theme={theme}
      />
    </div>
  );
};

export default ReturnsPage;