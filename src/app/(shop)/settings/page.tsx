// app/(shop)/settings/page.tsx
// ✅ Settings saved to database
// ✅ No localStorage usage
// ✅ Uses useAuth for current user
// ✅ Server actions for save/load
'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, Palette, Store, Bell, Package, 
  Moon, Sun, Monitor, Check, Save, RotateCcw, Loader2
} from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { useTheme } from '@/lib/theme'
import { useAuth } from '@/lib/hooks/useAuth'
import { getStoreSettingsAction, updateStoreSettingsAction } from '@/lib/actions/stores'
import type { StoreSettings } from '@/lib/types'

export default function SettingsPage() {
  const { theme, isDark, toggleTheme } = useTheme()
  const { user, settings: initialSettings, loading: authLoading } = useAuth()
  
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savedNotification, setSavedNotification] = useState(false)

  // ✅ Settings from database (not localStorage)
  const [settings, setSettings] = useState<Partial<StoreSettings>>({
    invoice_footer: 'شكراً لتعاملكم معنا',
    receipt_footer: 'نتمنى لكم يوماً سعيداً',
    phone: '',
    currency: 'DZD',
    locale: 'ar-DZ',
    print_logo: true,
    print_qr: false,
    auto_print_invoice: false,
    notify_low_stock: true,
    notify_warranty_expiry: true,
    notify_daily_report: false,
  })

  // ✅ Load settings from database on mount
  useEffect(() => {
    setMounted(true)
    loadSettings()
  }, [])

  // ✅ Sync with initial settings from context
  useEffect(() => {
    if (initialSettings) {
      setSettings({
        invoice_footer: initialSettings.invoice_footer,
        receipt_footer: initialSettings.receipt_footer,
        phone: initialSettings.phone,
        tax_number: initialSettings.tax_number,
        currency: initialSettings.currency,
        locale: initialSettings.locale,
        print_logo: initialSettings.print_logo,
        print_qr: initialSettings.print_qr,
        auto_print_invoice: initialSettings.auto_print_invoice,
        notify_low_stock: initialSettings.notify_low_stock,
        notify_warranty_expiry: initialSettings.notify_warranty_expiry,
        notify_daily_report: initialSettings.notify_daily_report,
      })
      setLoading(false)
    }
  }, [initialSettings])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getStoreSettingsAction()
      
      if (result.success && result.data) {
        setSettings({
          invoice_footer: result.data.invoice_footer,
          receipt_footer: result.data.receipt_footer,
          phone: result.data.phone,
          tax_number: result.data.tax_number,
          currency: result.data.currency,
          locale: result.data.locale,
          print_logo: result.data.print_logo,
          print_qr: result.data.print_qr,
          auto_print_invoice: result.data.auto_print_invoice,
          notify_low_stock: result.data.notify_low_stock,
          notify_warranty_expiry: result.data.notify_warranty_expiry,
          notify_daily_report: result.data.notify_daily_report,
        })
      } else {
        setError(result.error || 'فشل تحميل الإعدادات')
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل الإعدادات')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const result = await updateStoreSettingsAction(settings)
      
      if (result.success) {
        setHasChanges(false)
        setSavedNotification(true)
        setTimeout(() => setSavedNotification(false), 3000)
      } else {
        setError(result.error || 'فشل حفظ الإعدادات')
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = async () => {
    if (confirm('هل أنت متأكد من إعادة تحميل الإعدادات؟')) {
      await loadSettings()
      setHasChanges(false)
    }
  }

  // ✅ Settings sections based on actual database schema
  const sections = [
    {
      id: 'general',
      title: 'الإعدادات العامة',
      icon: Store,
      settings: [
        {
          id: 'phone',
          label: 'رقم هاتف المحل',
          description: 'يظهر في الفواتير والإيصالات',
          type: 'text',
          value: settings.phone || ''
        },
        {
          id: 'tax_number',
          label: 'الرقم الضريبي (NIF)',
          description: 'إن كان لديك رقم ضريبي',
          type: 'text',
          value: settings.tax_number || ''
        },
        {
          id: 'currency',
          label: 'العملة',
          description: 'العملة المستخدمة في المحل',
          type: 'select',
          value: settings.currency,
          options: [
            { value: 'DZD', label: 'دينار جزائري (DZD)' },
            { value: 'EUR', label: 'يورو (EUR)' },
            { value: 'USD', label: 'دولار (USD)' }
          ]
        }
      ]
    },
    {
      id: 'printing',
      title: 'إعدادات الطباعة',
      icon: Settings,
      settings: [
        {
          id: 'invoice_footer',
          label: 'نص أسفل الفاتورة',
          description: 'رسالة تظهر أسفل كل فاتورة',
          type: 'text',
          value: settings.invoice_footer
        },
        {
          id: 'receipt_footer',
          label: 'نص أسفل الإيصال',
          description: 'رسالة تظهر أسفل كل إيصال',
          type: 'text',
          value: settings.receipt_footer
        },
        {
          id: 'print_logo',
          label: 'طباعة الشعار',
          description: 'إظهار شعار المحل في الفواتير',
          type: 'toggle',
          value: settings.print_logo
        },
        {
          id: 'print_qr',
          label: 'طباعة رمز QR',
          description: 'إضافة رمز QR للفواتير',
          type: 'toggle',
          value: settings.print_qr
        },
        {
          id: 'auto_print_invoice',
          label: 'طباعة تلقائية',
          description: 'طباعة الفاتورة تلقائياً بعد البيع',
          type: 'toggle',
          value: settings.auto_print_invoice
        }
      ]
    },
    {
      id: 'notifications',
      title: 'الإشعارات',
      icon: Bell,
      settings: [
        {
          id: 'notify_low_stock',
          label: 'إشعار عند نفاد المخزون',
          description: 'تلقي تنبيه عندما ينخفض المخزون',
          type: 'toggle',
          value: settings.notify_low_stock
        },
        {
          id: 'notify_warranty_expiry',
          label: 'إشعار انتهاء الضمان',
          description: 'تنبيه قبل انتهاء ضمان المنتجات',
          type: 'toggle',
          value: settings.notify_warranty_expiry
        },
        {
          id: 'notify_daily_report',
          label: 'تقرير يومي',
          description: 'ملخص بمبيعات وأرباح اليوم',
          type: 'toggle',
          value: settings.notify_daily_report
        }
      ]
    }
  ]

  const activeData = sections.find(s => s.id === activeSection)

  // Toolbar Component
  const Toolbar = (
    <div className="flex items-center gap-3">
      {error && (
        <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}
      
      {hasChanges && (
        <>
          <button
            onClick={resetSettings}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-bg-primary border border-border text-text-secondary hover:bg-bg-light transition-all text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تحميل
          </button>
          
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </>
      )}
    </div>
  )

  // Loading state
  if (loading) {
    return (
      <DashboardLayout toolbar={null}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout toolbar={Toolbar}>
      {/* Saved Notification */}
      {savedNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-[slideDown_0.3s_ease]">
          <Check className="w-5 h-5" />
          تم حفظ الإعدادات بنجاح
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-bg-secondary rounded-xl border border-border p-2 sticky top-6">
              {sections.map(section => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-right ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'text-text-secondary hover:bg-bg-light hover:text-text-primary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="col-span-9">
            <div className="bg-bg-secondary rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-text-primary mb-6">{activeData?.title}</h2>
              
              <div className="space-y-6">
                {activeData?.settings.map(setting => (
                  <div key={setting.id} className="pb-6 border-b border-border last:border-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <label className="block font-semibold text-text-primary mb-1">
                          {setting.label}
                        </label>
                        <p className="text-sm text-text-secondary">{setting.description}</p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {setting.type === 'toggle' && (
                          <button
                            onClick={() => updateSetting(setting.id, !setting.value)}
                            className={`w-14 h-7 rounded-full transition-all relative ${
                              setting.value ? 'bg-primary' : 'bg-bg-light border border-border'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${
                              setting.value ? 'right-1' : 'right-8'
                            }`} />
                          </button>
                        )}
                        
                        {setting.type === 'select' && (
                          <select
                            value={setting.value}
                            onChange={e => updateSetting(setting.id, e.target.value)}
                            className="px-4 py-2 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none min-w-[200px]"
                          >
                            {setting.options?.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        )}
                        
                        {setting.type === 'number' && (
                          <input
                            type="number"
                            value={setting.value}
                            onChange={e => updateSetting(setting.id, parseInt(e.target.value) || 0)}
                            className="w-24 px-4 py-2 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none text-center"
                            min="0"
                          />
                        )}
                        
                        {setting.type === 'text' && (
                          <input
                            type="text"
                            value={setting.value}
                            onChange={e => updateSetting(setting.id, e.target.value)}
                            className="w-64 px-4 py-2 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary outline-none"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>

  </DashboardLayout>
  )
}