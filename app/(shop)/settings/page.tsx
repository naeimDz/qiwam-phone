'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, Palette, Store, Bell, Package, DollarSign, 
  Moon, Sun, Monitor, Check, ChevronDown, Save, RotateCcw
} from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { useTheme } from '@/lib/theme'


// أنواع الإعدادات
type SettingSection = {
  id: string
  title: string
  icon: any
  settings: Setting[]
}

type Setting = {
  id: string
  label: string
  description: string
  type: 'toggle' | 'select' | 'text' | 'number'
  value: any
  options?: { value: string; label: string }[]
}


export default function SettingsPage() {
  const { theme, isDark, toggleTheme, changePalette } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [savedNotification, setSavedNotification] = useState(false)

  // الإعدادات الافتراضية
  const [settings, setSettings] = useState<Record<string, any>>({
    // إعدادات عامة
    shopType: 'retail',
    priceDisplay: 'full',
    autoUpdateInventory: true,
    lowStockAlerts: true,
    lowStockThreshold: 5,
    
    // إعدادات المظهر
    themeMode: 'light',
    accentColor: 'blue',
    showLogo: true,
    
    // إعدادات البيع
    requirePriceInput: true,
    showProfitCalc: true,
    enableIMEI: true,
    enableWarranty: true,
    
    // إعدادات الإشعارات
    notifyLowStock: true,
    notifyNewOrder: false,
    notifyDailyReport: true
  })

  useEffect(() => {
    setMounted(true)
    // تحميل الإعدادات المحفوظة
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  if (!mounted) return null

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
    setHasChanges(false)
    setSavedNotification(true)
    setTimeout(() => setSavedNotification(false), 3000)
  }

  const resetSettings = () => {
    if (confirm('هل أنت متأكد من إعادة تعيين كل الإعدادات؟')) {
      localStorage.removeItem('appSettings')
      location.reload()
    }
  }

  const applyPreset = (preset: string) => {
    const presets: Record<string, any> = {
      retail: {
        shopType: 'retail',
        autoUpdateInventory: true,
        requirePriceInput: true,
        enableIMEI: false,
        lowStockThreshold: 5
      },
      wholesale: {
        shopType: 'wholesale',
        autoUpdateInventory: true,
        requirePriceInput: false,
        enableIMEI: false,
        lowStockThreshold: 20
      },
      phones: {
        shopType: 'phones',
        autoUpdateInventory: true,
        requirePriceInput: true,
        enableIMEI: true,
        enableWarranty: true,
        lowStockThreshold: 3
      },
      services: {
        shopType: 'services',
        autoUpdateInventory: false,
        requirePriceInput: true,
        enableIMEI: false,
        lowStockThreshold: 0
      }
    }
    
    setSettings(prev => ({ ...prev, ...presets[preset] }))
    setHasChanges(true)
    setShowPresets(false)
  }

  const sections: SettingSection[] = [
    {
      id: 'general',
      title: 'الإعدادات العامة',
      icon: Settings,
      settings: [
        {
          id: 'shopType',
          label: 'نوع نشاطك التجاري',
          description: 'اختر النشاط الأقرب لطريقة عملك',
          type: 'select',
          value: settings.shopType,
          options: [
            { value: 'retail', label: '🏬 بيع بالتجزئة' },
            { value: 'wholesale', label: '🚚 بيع بالجملة' },
            { value: 'phones', label: '📱 هواتف وإلكترونيات' },
            { value: 'services', label: '💇‍♂️ خدمات' }
          ]
        },
        {
          id: 'priceDisplay',
          label: 'كيف تحب عرض الأسعار؟',
          description: 'اختر الطريقة الأسهل في قراءة الأسعار',
          type: 'select',
          value: settings.priceDisplay,
          options: [
            { value: 'full', label: '36,000 دج' },
            { value: 'thousands', label: '36 ألف' },
            { value: 'simplified', label: '36K' }
          ]
        },
        {
          id: 'autoUpdateInventory',
          label: 'تحديث المخزون تلقائيًا بعد البيع؟',
          description: 'كل عملية بيع تنقص من المخزون مباشرة',
          type: 'toggle',
          value: settings.autoUpdateInventory
        }
      ]
    },
    {
      id: 'appearance',
      title: 'المظهر والشكل',
      icon: Palette,
      settings: [
        {
          id: 'themeMode',
          label: 'وضع العرض',
          description: 'اختر الوضع المريح لعينيك',
          type: 'select',
          value: settings.themeMode,
          options: [
            { value: 'light', label: '☀️ فاتح' },
            { value: 'dark', label: '🌙 داكن' },
            { value: 'auto', label: '🖥️ تلقائي' }
          ]
        },
        {
          id: 'accentColor',
          label: 'اللون الرئيسي',
          description: 'لون التفاصيل والأزرار',
          type: 'select',
          value: settings.accentColor,
          options: [
            { value: 'blue', label: '🔵 أزرق' },
            { value: 'green', label: '🟢 أخضر' },
            { value: 'purple', label: '🟣 بنفسجي' },
            { value: 'orange', label: '🟠 برتقالي' },
            { value: 'red', label: '🔴 أحمر' }
          ]
        },
        {
          id: 'showLogo',
          label: 'عرض شعار المتجر',
          description: 'إظهار شعارك في الواجهة الرئيسية',
          type: 'toggle',
          value: settings.showLogo
        }
      ]
    },
    {
      id: 'inventory',
      title: 'المخزون والمنتجات',
      icon: Package,
      settings: [
        {
          id: 'lowStockAlerts',
          label: 'تنبيهات انخفاض الكمية؟',
          description: 'تلقي إشعار عندما تنخفض الكمية',
          type: 'toggle',
          value: settings.lowStockAlerts
        },
        {
          id: 'lowStockThreshold',
          label: 'الحد الأدنى للتنبيه',
          description: 'عدد القطع التي يبدأ بعدها التنبيه',
          type: 'number',
          value: settings.lowStockThreshold
        },
        {
          id: 'enableIMEI',
          label: 'تفعيل حقل IMEI للهواتف؟',
          description: 'مفيد لتتبع الأجهزة والضمانات',
          type: 'toggle',
          value: settings.enableIMEI
        },
        {
          id: 'enableWarranty',
          label: 'تفعيل حقل الضمان؟',
          description: 'لتسجيل مدة وتفاصيل الضمان',
          type: 'toggle',
          value: settings.enableWarranty
        }
      ]
    },
    {
      id: 'sales',
      title: 'البيع والأرباح',
      icon: DollarSign,
      settings: [
        {
          id: 'requirePriceInput',
          label: 'هل تدخل سعر البيع لكل منتج؟',
          description: 'أو تعتمد على السعر المسجل مسبقًا',
          type: 'toggle',
          value: settings.requirePriceInput
        },
        {
          id: 'showProfitCalc',
          label: 'عرض حساب الأرباح؟',
          description: 'يظهر الربح المتوقع في كل عملية',
          type: 'toggle',
          value: settings.showProfitCalc
        }
      ]
    },
    {
      id: 'notifications',
      title: 'الإشعارات',
      icon: Bell,
      settings: [
        {
          id: 'notifyLowStock',
          label: 'إشعار عند نفاد المخزون',
          description: 'تلقي تنبيه عندما ينخفض المخزون',
          type: 'toggle',
          value: settings.notifyLowStock
        },
        {
          id: 'notifyNewOrder',
          label: 'إشعار عند طلب جديد',
          description: 'مفيد إذا كنت تبيع أونلاين',
          type: 'toggle',
          value: settings.notifyNewOrder
        },
        {
          id: 'notifyDailyReport',
          label: 'ملخص يومي',
          description: 'تقرير بمبيعات وأرباح اليوم',
          type: 'toggle',
          value: settings.notifyDailyReport
        }
      ]
    }
  ]

  const activeData = sections.find(s => s.id === activeSection)

  // Toolbar Component
  const Toolbar = (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setShowPresets(!showPresets)}
        className="px-4 py-2 rounded-xl bg-bg-primary border border-border text-text-primary hover:bg-bg-light transition-all text-sm flex items-center gap-2"
      >
        <Store className="w-4 h-4" />
        قوالب جاهزة
      </button>
      
      {hasChanges && (
        <>
          <button
            onClick={resetSettings}
            className="px-4 py-2 rounded-xl bg-bg-primary border border-border text-text-secondary hover:bg-bg-light transition-all text-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين
          </button>
          
          <button
            onClick={saveSettings}
            className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 transition-all text-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            حفظ التغييرات
          </button>
        </>
      )}
    </div>
  )

  return (
    <DashboardLayout toolbar={Toolbar}>

      {/* Presets Modal */}
      {showPresets && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPresets(false)}>
          <div className="bg-bg-secondary rounded-2xl p-6 max-w-2xl w-full mx-4 border border-border" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-text-primary mb-4">اختر نمط العمل المناسب</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'retail', icon: '🏬', title: 'محل تجزئة', desc: 'بيع قطعة بقطعة للزبائن' },
                { id: 'wholesale', icon: '🚚', title: 'بيع جملة', desc: 'بيع بكميات كبيرة للتجار' },
                { id: 'phones', icon: '📱', title: 'هواتف وإلكترونيات', desc: 'مع IMEI وضمانات' },
                { id: 'services', icon: '💇‍♂️', title: 'خدمات', desc: 'صالون، كراج، إلخ' }
              ].map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className="p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-right"
                >
                  <div className="text-3xl mb-2">{preset.icon}</div>
                  <div className="font-semibold text-text-primary">{preset.title}</div>
                  <div className="text-sm text-text-secondary mt-1">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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