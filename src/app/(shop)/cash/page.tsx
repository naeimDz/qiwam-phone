'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Lock,
  Unlock,
  Eye,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Filter,
  Download,
  CreditCard,
  Wallet,
  Smartphone,
  X
} from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { StatsCard } from '@/components/ui/StatsCard'



// Types
interface CashRegister {
  id: string
  openedBy: string
  openedAt: string
  closedBy?: string
  closedAt?: string
  openingBalance: number
  closingBalance?: number
  expectedBalance?: number
  difference?: number
  status: 'open' | 'closed'
  notes?: string
}

interface Payment {
  id: string
  amount: number
  method: 'cash' | 'card' | 'bank_transfer' | 'mobile_payment'
  direction: 'in' | 'out'
  reference?: string
  transactionType: 'sale' | 'purchase' | 'expense'
  transactionId: string
  createdAt: string
  createdBy: string
}

export default function CashRegisterPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('current')
  const [currentRegister, setCurrentRegister] = useState<CashRegister | null>(null)
  const [registerHistory, setRegisterHistory] = useState<CashRegister[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  
  // Filters
  const [filterMethod, setFilterMethod] = useState('all')
  const [filterDirection, setFilterDirection] = useState('all')
  
  // Modals
  const [showOpenModal, setShowOpenModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRegister, setSelectedRegister] = useState<CashRegister | null>(null)
  
  // Form data
  const [openingBalance, setOpeningBalance] = useState('')
  const [closingNotes, setClosingNotes] = useState('')
  const [actualCash, setActualCash] = useState('')

  useEffect(() => {
    setMounted(true)
    
    // بيانات تجريبية
    const mockCurrentRegister: CashRegister = {
      id: '1',
      openedBy: 'محمد أحمد',
      openedAt: new Date().toISOString(),
      openingBalance: 50000,
      status: 'open'
    }
    
    const mockPayments: Payment[] = [
      {
        id: '1',
        amount: 180000,
        method: 'cash',
        direction: 'in',
        transactionType: 'sale',
        transactionId: 'SAL-001',
        createdAt: new Date().toISOString(),
        createdBy: 'محمد أحمد'
      },
      {
        id: '2',
        amount: 250000,
        method: 'card',
        direction: 'in',
        transactionType: 'sale',
        transactionId: 'SAL-002',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        createdBy: 'محمد أحمد'
      },
      {
        id: '3',
        amount: 3000,
        method: 'cash',
        direction: 'out',
        transactionType: 'expense',
        transactionId: 'EXP-001',
        reference: 'كراء المحل',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        createdBy: 'محمد أحمد'
      },
      {
        id: '4',
        amount: 150000,
        method: 'cash',
        direction: 'out',
        transactionType: 'purchase',
        transactionId: 'PUR-001',
        reference: 'فاتورة قيس للتجارة',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        createdBy: 'محمد أحمد'
      }
    ]
    
    const mockHistory: CashRegister[] = [
      {
        id: '2',
        openedBy: 'محمد أحمد',
        openedAt: new Date(Date.now() - 86400000).toISOString(),
        closedBy: 'محمد أحمد',
        closedAt: new Date(Date.now() - 43200000).toISOString(),
        openingBalance: 30000,
        closingBalance: 145000,
        expectedBalance: 147000,
        difference: -2000,
        status: 'closed',
        notes: 'يوم عمل جيد'
      },
      {
        id: '3',
        openedBy: 'أحمد علي',
        openedAt: new Date(Date.now() - 172800000).toISOString(),
        closedBy: 'أحمد علي',
        closedAt: new Date(Date.now() - 129600000).toISOString(),
        openingBalance: 25000,
        closingBalance: 98000,
        expectedBalance: 98000,
        difference: 0,
        status: 'closed'
      }
    ]
    
    setCurrentRegister(mockCurrentRegister)
    setPayments(mockPayments)
    setFilteredPayments(mockPayments)
    setRegisterHistory(mockHistory)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    let filtered = payments
    
    if (filterMethod !== 'all') {
      filtered = filtered.filter(p => p.method === filterMethod)
    }
    
    if (filterDirection !== 'all') {
      filtered = filtered.filter(p => p.direction === filterDirection)
    }
    
    setFilteredPayments(filtered)
  }, [filterMethod, filterDirection, payments, mounted])

  if (!mounted) return null

  // حسابات الصندوق الحالي
  const cashInToday = payments
    .filter(p => p.direction === 'in' && p.method === 'cash')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const cashOutToday = payments
    .filter(p => p.direction === 'out' && p.method === 'cash')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const expectedBalance = currentRegister ? currentRegister.openingBalance + cashInToday - cashOutToday : 0
  
  const totalInToday = payments
    .filter(p => p.direction === 'in')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const totalOutToday = payments
    .filter(p => p.direction === 'out')
    .reduce((sum, p) => sum + p.amount, 0)

  // فتح صندوق
  const handleOpenRegister = () => {
    if (!openingBalance) {
      alert('يرجى إدخال رصيد الافتتاح')
      return
    }
    
    const newRegister: CashRegister = {
      id: Date.now().toString(),
      openedBy: 'محمد أحمد',
      openedAt: new Date().toISOString(),
      openingBalance: parseFloat(openingBalance),
      status: 'open'
    }
    
    setCurrentRegister(newRegister)
    setOpeningBalance('')
    setShowOpenModal(false)
    alert('✓ تم فتح الصندوق بنجاح')
  }

  // إغلاق صندوق
  const handleCloseRegister = () => {
    if (!actualCash) {
      alert('يرجى إدخال النقد الفعلي')
      return
    }
    
    if (!currentRegister) return
    
    const actual = parseFloat(actualCash)
    const difference = actual - expectedBalance
    
    const closedRegister: CashRegister = {
      ...currentRegister,
      closedBy: 'محمد أحمد',
      closedAt: new Date().toISOString(),
      closingBalance: actual,
      expectedBalance: expectedBalance,
      difference: difference,
      status: 'closed',
      notes: closingNotes
    }
    
    setRegisterHistory([closedRegister, ...registerHistory])
    setCurrentRegister(null)
    setActualCash('')
    setClosingNotes('')
    setShowCloseModal(false)
    alert('✓ تم إغلاق الصندوق بنجاح')
  }

  // عرض تفاصيل صندوق
  const handleViewDetails = (register: CashRegister) => {
    setSelectedRegister(register)
    setShowDetailsModal(true)
  }

  // أيقونة طريقة الدفع
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Wallet size={18} />
      case 'card': return <CreditCard size={18} />
      case 'bank_transfer': return <DollarSign size={18} />
      case 'mobile_payment': return <Smartphone size={18} />
      default: return <DollarSign size={18} />
    }
  }

  // اسم طريقة الدفع
  const getPaymentMethodName = (method: string) => {
    const names: Record<string, string> = {
      cash: 'نقدي',
      card: 'بطاقة',
      bank_transfer: 'تحويل بنكي',
      mobile_payment: 'دفع إلكتروني'
    }
    return names[method] || method
  }

  // لون نوع المعاملة
  const getTransactionColor = (type: string) => {
    const colors: Record<string, string> = {
      sale: 'text-green-600',
      purchase: 'text-blue-600',
      expense: 'text-red-600'
    }
    return colors[type] || 'text-gray-600'
  }

  const tabs = [
    { key: 'current', label: 'الصندوق الحالي' },
    { key: 'history', label: `السجل (${registerHistory.length})` }
  ]

  const statsCards = (
    <>
      <StatsCard
        title="رصيد الافتتاح"
        value={`${currentRegister?.openingBalance.toLocaleString() || 0} دج`}
        icon={Unlock}
        variant="primary"
        description={currentRegister ? `فُتح في ${new Date(currentRegister.openedAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}` : 'لم يتم فتح الصندوق'}
      />
      <StatsCard
        title="الرصيد المتوقع"
        value={`${expectedBalance.toLocaleString()} دج`}
        icon={TrendingUp}
        variant="success"
        description={`دخل: ${cashInToday.toLocaleString()} | خرج: ${cashOutToday.toLocaleString()}`}
      />
      <StatsCard
        title="إجمالي الحركات"
        value={filteredPayments.length}
        icon={FileText}
        variant="accent"
        description={`دخل: ${totalInToday.toLocaleString()} | خرج: ${totalOutToday.toLocaleString()}`}
      />
    </>
  )

  const toolbar = (
    <>
      <div className="flex flex-col md:flex-row gap-3 flex-1">
        {/* فلتر طريقة الدفع */}
        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
        >
          <option value="all">جميع الطرق</option>
          <option value="cash">نقدي</option>
          <option value="card">بطاقة</option>
          <option value="bank_transfer">تحويل بنكي</option>
          <option value="mobile_payment">دفع إلكتروني</option>
        </select>

        {/* فلتر الاتجاه */}
        <select
          value={filterDirection}
          onChange={(e) => setFilterDirection(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none transition-colors"
        >
          <option value="all">الكل</option>
          <option value="in">الداخل</option>
          <option value="out">الخارج</option>
        </select>
      </div>

      <div className="flex gap-2">
        {activeTab === 'current' && (
          <>
            {!currentRegister ? (
              <button
                onClick={() => setShowOpenModal(true)}
                className="px-4 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center gap-2 font-semibold whitespace-nowrap"
              >
                <Unlock size={20} />
                <span>فتح الصندوق</span>
              </button>
            ) : (
              <button
                onClick={() => setShowCloseModal(true)}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white hover:opacity-90 transition-all flex items-center gap-2 font-semibold whitespace-nowrap"
              >
                <Lock size={20} />
                <span>إغلاق الصندوق</span>
              </button>
            )}
          </>
        )}
        <button className="px-4 py-2.5 rounded-xl border border-border text-text-primary hover:bg-bg-light transition-all flex items-center gap-2">
          <Download size={20} />
          <span className="hidden md:inline">تصدير</span>
        </button>
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
        {activeTab === 'current' ? (
          /* الصندوق الحالي */
          <div className="space-y-4">
            {!currentRegister ? (
              <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center">
                <Lock className="mx-auto mb-4 opacity-30" size={64} />
                <h3 className="text-xl font-bold text-text-primary mb-2">الصندوق مغلق</h3>
                <p className="text-text-secondary mb-6">قم بفتح الصندوق لبدء العمل اليومي</p>
                <button
                  onClick={() => setShowOpenModal(true)}
                  className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center gap-2 font-semibold mx-auto"
                >
                  <Unlock size={20} />
                  <span>فتح الصندوق</span>
                </button>
              </div>
            ) : (
              <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border bg-bg-light">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-text-primary">حركات الصندوق اليوم ({filteredPayments.length})</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                      مفتوح
                    </span>
                  </div>
                </div>

                {filteredPayments.length === 0 ? (
                  <div className="text-center py-12 text-text-secondary">
                    <FileText className="mx-auto mb-3 opacity-30" size={48} />
                    <p>لا توجد حركات لعرضها</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredPayments.map(payment => (
                      <div key={payment.id} className="p-4 hover:bg-bg-light transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-lg ${
                              payment.direction === 'in' 
                                ? 'bg-green-100 dark:bg-green-900/20' 
                                : 'bg-red-100 dark:bg-red-900/20'
                            }`}>
                              {payment.direction === 'in' ? (
                                <TrendingUp className="text-green-600" size={20} />
                              ) : (
                                <TrendingDown className="text-red-600" size={20} />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-semibold ${getTransactionColor(payment.transactionType)}`}>
                                  {payment.transactionType === 'sale' ? 'بيع' : 
                                   payment.transactionType === 'purchase' ? 'شراء' : 'مصروف'}
                                </span>
                                <span className="text-text-secondary text-sm">
                                  #{payment.transactionId}
                                </span>
                              </div>
                              {payment.reference && (
                                <p className="text-text-secondary text-sm mb-2">{payment.reference}</p>
                              )}
                              <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
                                <span className="flex items-center gap-1">
                                  {getPaymentMethodIcon(payment.method)}
                                  {getPaymentMethodName(payment.method)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {new Date(payment.createdAt).toLocaleTimeString('ar-DZ', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User size={14} />
                                  {payment.createdBy}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className={`font-bold text-lg ${
                            payment.direction === 'in' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {payment.direction === 'in' ? '+' : '-'}{payment.amount.toLocaleString()} دج
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* سجل الصناديق */
          <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-text-primary">سجل الصناديق السابقة</h3>
            </div>

            {registerHistory.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <Calendar className="mx-auto mb-3 opacity-30" size={48} />
                <p>لا يوجد سجل سابق</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {registerHistory.map(register => {
                  const duration = register.closedAt && register.openedAt
                    ? Math.round((new Date(register.closedAt).getTime() - new Date(register.openedAt).getTime()) / 3600000)
                    : 0

                  return (
                    <div key={register.id} className="p-4 hover:bg-bg-light transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                              مغلق
                            </span>
                            <span className="text-text-secondary text-sm">
                              {new Date(register.openedAt).toLocaleDateString('ar-DZ')}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-text-secondary text-xs mb-1">رصيد الافتتاح</p>
                              <p className="font-semibold text-text-primary">
                                {register.openingBalance.toLocaleString()} دج
                              </p>
                            </div>
                            <div>
                              <p className="text-text-secondary text-xs mb-1">رصيد الإغلاق</p>
                              <p className="font-semibold text-text-primary">
                                {register.closingBalance?.toLocaleString()} دج
                              </p>
                            </div>
                            <div>
                              <p className="text-text-secondary text-xs mb-1">المتوقع</p>
                              <p className="font-semibold text-text-primary">
                                {register.expectedBalance?.toLocaleString()} دج
                              </p>
                            </div>
                            <div>
                              <p className="text-text-secondary text-xs mb-1">الفرق</p>
                              <p className={`font-semibold ${
                                (register.difference || 0) === 0 ? 'text-green-600' :
                                (register.difference || 0) > 0 ? 'text-blue-600' : 'text-red-600'
                              }`}>
                                {register.difference === 0 ? '✓ متوازن' : 
                                 `${register.difference! > 0 ? '+' : ''}${register.difference?.toLocaleString()} دج`}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              فتح: {register.openedBy}
                            </span>
                            {register.closedBy && (
                              <span className="flex items-center gap-1">
                                <User size={14} />
                                أغلق: {register.closedBy}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {duration} ساعة
                            </span>
                          </div>

                          {register.notes && (
                            <p className="text-text-secondary text-sm mt-2 italic">"{register.notes}"</p>
                          )}
                        </div>

                        <button
                          onClick={() => handleViewDetails(register)}
                          className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-primary"
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </DashboardLayout>

      {/* نافذة فتح الصندوق */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-primary border border-border rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary bg-opacity-10">
                <Unlock className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">فتح الصندوق</h3>
                <p className="text-text-secondary text-sm">بداية يوم عمل جديد</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-text-primary font-medium mb-2">
                  رصيد الافتتاح (دج) *
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary text-2xl font-bold text-center focus:border-primary outline-none transition-colors"
                  autoFocus
                />
                <p className="text-text-secondary text-xs mt-2">المبلغ النقدي الموجود في الصندوق</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowOpenModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-border text-text-primary hover:bg-bg-secondary transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleOpenRegister}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Unlock size={20} />
                  <span>فتح الصندوق</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إغلاق الصندوق */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-primary border border-border rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-red-600 bg-opacity-10">
                <Lock className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">إغلاق الصندوق</h3>
                <p className="text-text-secondary text-sm">إنهاء يوم العمل</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* الرصيد المتوقع */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-300/30">
                <p className="text-blue-900 dark:text-blue-300 text-sm font-medium mb-1">الرصيد المتوقع</p>
                <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold">
                  {expectedBalance.toLocaleString()} دج
                </p>
                <p className="text-blue-800 dark:text-blue-300 text-xs mt-2">
                  افتتاح: {currentRegister?.openingBalance.toLocaleString()} | 
                  دخل: {cashInToday.toLocaleString()} | 
                  خرج: {cashOutToday.toLocaleString()}
                </p>
              </div>

              {/* النقد الفعلي */}
              <div>
                <label className="block text-text-primary font-medium mb-2">
                  النقد الفعلي في الصندوق (دج) *
                </label>
                <input
                  type="number"
                  placeholder="قم بعد النقد الموجود"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary text-2xl font-bold text-center focus:border-primary outline-none transition-colors"
                  autoFocus
                />
                {actualCash && (
                  <div className={`mt-2 p-2 rounded-lg text-sm font-medium text-center ${
                    parseFloat(actualCash) === expectedBalance 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : parseFloat(actualCash) > expectedBalance
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  }`}>
                    {parseFloat(actualCash) === expectedBalance 
                      ? '✓ متوازن تماماً'
                      : `فرق: ${(parseFloat(actualCash) - expectedBalance).toLocaleString()} دج ${
                          parseFloat(actualCash) > expectedBalance ? '(زيادة)' : '(نقص)'
                        }`
                    }
                  </div>
                )}
              </div>

              {/* ملاحظات */}
              <div>
                <label className="block text-text-primary font-medium mb-2">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="أي ملاحظات عن يوم العمل..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors resize-none"
                />
              </div>

              {/* تحذير */}
              {actualCash && parseFloat(actualCash) !== expectedBalance && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300/30">
                  <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    هناك فرق بين المتوقع والفعلي. تأكد من عد النقد بدقة قبل الإغلاق.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-border text-text-primary hover:bg-bg-secondary transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCloseRegister}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Lock size={20} />
                  <span>إغلاق نهائي</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تفاصيل صندوق سابق */}
      {showDetailsModal && selectedRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-primary border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent bg-opacity-10">
                  <FileText className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">تفاصيل الصندوق</h3>
                  <p className="text-text-secondary text-sm">
                    {new Date(selectedRegister.openedAt).toLocaleDateString('ar-DZ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* معلومات الفتح */}
                <div>
                  <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <Unlock size={18} className="text-green-600" />
                    فتح الصندوق
                  </h4>
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-bg-secondary">
                    <div>
                      <p className="text-text-secondary text-sm mb-1">الموظف</p>
                      <p className="font-medium text-text-primary">{selectedRegister.openedBy}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-sm mb-1">الوقت</p>
                      <p className="font-medium text-text-primary">
                        {new Date(selectedRegister.openedAt).toLocaleString('ar-DZ')}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-text-secondary text-sm mb-1">رصيد الافتتاح</p>
                      <p className="font-bold text-primary text-xl">
                        {selectedRegister.openingBalance.toLocaleString()} دج
                      </p>
                    </div>
                  </div>
                </div>

                {/* معلومات الإغلاق */}
                {selectedRegister.closedAt && (
                  <div>
                    <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <Lock size={18} className="text-red-600" />
                      إغلاق الصندوق
                    </h4>
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-bg-secondary">
                      <div>
                        <p className="text-text-secondary text-sm mb-1">الموظف</p>
                        <p className="font-medium text-text-primary">{selectedRegister.closedBy}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary text-sm mb-1">الوقت</p>
                        <p className="font-medium text-text-primary">
                          {new Date(selectedRegister.closedAt).toLocaleString('ar-DZ')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* الملخص المالي */}
                <div>
                  <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <DollarSign size={18} className="text-accent" />
                    الملخص المالي
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 rounded-xl bg-bg-secondary">
                      <span className="text-text-secondary">رصيد الافتتاح</span>
                      <span className="font-bold text-text-primary">
                        {selectedRegister.openingBalance.toLocaleString()} دج
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                      <span className="text-green-700 dark:text-green-300 flex items-center gap-2">
                        <TrendingUp size={18} />
                        الداخل (النقدي)
                      </span>
                      <span className="font-bold text-green-600">
                        +{cashInToday.toLocaleString()} دج
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                      <span className="text-red-700 dark:text-red-300 flex items-center gap-2">
                        <TrendingDown size={18} />
                        الخارج (النقدي)
                      </span>
                      <span className="font-bold text-red-600">
                        -{cashOutToday.toLocaleString()} دج
                      </span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between items-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                      <span className="text-blue-700 dark:text-blue-300 font-semibold">الرصيد المتوقع</span>
                      <span className="font-bold text-blue-600 text-xl">
                        {selectedRegister.expectedBalance?.toLocaleString()} دج
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-bg-secondary">
                      <span className="text-text-primary font-semibold">النقد الفعلي</span>
                      <span className="font-bold text-text-primary text-xl">
                        {selectedRegister.closingBalance?.toLocaleString()} دج
                      </span>
                    </div>
                    <div className={`flex justify-between items-center p-4 rounded-xl ${
                      (selectedRegister.difference || 0) === 0 
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : (selectedRegister.difference || 0) > 0
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <span className={`font-semibold flex items-center gap-2 ${
                        (selectedRegister.difference || 0) === 0 
                          ? 'text-green-700 dark:text-green-300'
                          : (selectedRegister.difference || 0) > 0
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {(selectedRegister.difference || 0) === 0 ? (
                          <CheckCircle size={18} />
                        ) : (
                          <AlertCircle size={18} />
                        )}
                        الفرق
                      </span>
                      <span className={`font-bold text-xl ${
                        (selectedRegister.difference || 0) === 0 
                          ? 'text-green-600'
                          : (selectedRegister.difference || 0) > 0
                          ? 'text-blue-600'
                          : 'text-red-600'
                      }`}>
                        {selectedRegister.difference === 0 
                          ? '✓ متوازن' 
                          : `${selectedRegister.difference! > 0 ? '+' : ''}${selectedRegister.difference?.toLocaleString()} دج`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* الملاحظات */}
                {selectedRegister.notes && (
                  <div>
                    <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <FileText size={18} className="text-text-secondary" />
                      الملاحظات
                    </h4>
                    <div className="p-4 rounded-xl bg-bg-secondary">
                      <p className="text-text-primary italic">"{selectedRegister.notes}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-border text-text-primary hover:bg-bg-secondary transition-all font-semibold"
              >
                إغلاق
              </button>
              <button
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <Download size={20} />
                <span>تصدير التقرير</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}