// test/features/inventory/page.tsx
'use client'
import { useState } from 'react'
import { 
  getPhonesAction, 
  getAvailablePhonesAction, 
  addPhoneAction, 
  updatePhoneAction, 
  searchPhoneByImeiAction, 
  deletePhoneAction, 
  getPhonesStatsAction 
} from '@/lib/actions/phones'
import { getAccessoriesAction } from '@/lib/actions/accessories'

type TestAction = {
  id: string
  name: string
  description: string
  action: string
  status: 'pending' | 'testing' | 'success' | 'error'
  result?: string
  triggers?: string[]
  tables?: string[]
}

export default function InventoryTestPage() {
  const [actions, setActions] = useState<TestAction[]>([
    {
      id: 'get-phones',
      name: 'جلب جميع الهواتف',
      description: 'اختبار getPhonesAction لجلب جميع هواتف المتجر',
      action: 'getPhonesAction()',
      status: 'pending',
      triggers: [],
      tables: ['phone', 'brand', 'supplier']
    },
    {
      id: 'get-available-phones',
      name: 'جلب الهواتف المتاحة',
      description: 'اختبار getAvailablePhonesAction لجلب الهواتف المتاحة للبيع فقط',
      action: 'getAvailablePhonesAction()',
      status: 'pending',
      triggers: [],
      tables: ['phone', 'brand', 'supplier']
    },
    {
      id: 'add-phone',
      name: 'إضافة هاتف جديد',
      description: 'اختبار addPhoneAction مع بيانات هاتف جديد وIMEI',
      action: 'addPhoneAction(formData)',
      status: 'pending',
      triggers: ['fn_prevent_sold_phone_modification'],
      tables: ['phone', 'brand', 'supplier', 'audit_log']
    },
    {
      id: 'search-phone-imei',
      name: 'البحث بالIMEI',
      description: 'اختبار searchPhoneByImeiAction للبحث عن هاتف برقم IMEI',
      action: 'searchPhoneByImeiAction("123456789012345")',
      status: 'pending',
      triggers: ['search_phone_by_imei'],
      tables: ['phone', 'brand', 'supplier']
    },
    {
      id: 'update-phone',
      name: 'تحديث بيانات الهاتف',
      description: 'اختبار updatePhoneAction لتحديث معلومات هاتف موجود',
      action: 'updatePhoneAction(phoneId, formData)',
      status: 'pending',
      triggers: ['fn_prevent_sold_phone_modification', 'fn_touch_updatedat'],
      tables: ['phone', 'audit_log']
    },
    {
      id: 'get-phones-stats',
      name: 'إحصائيات الهواتف',
      description: 'اختبار getPhonesStatsAction لجلب عدد الهواتف حسب الحالة',
      action: 'getPhonesStatsAction()',
      status: 'pending',
      triggers: [],
      tables: ['phone']
    }
  ])

  const runTest = async (actionId: string) => {
    setActions(prev => prev.map(action => 
      action.id === actionId 
        ? { ...action, status: 'testing' }
        : action
    ))

    try {
      let result: any

      switch (actionId) {
        case 'get-phones':
          result = await getPhonesAction()
          break
          
        case 'get-available-phones':
          result = await getAvailablePhonesAction()
          break
          
        case 'add-phone':
          const formData = new FormData()
          formData.append('name', 'Samsung A12')
          formData.append('imei', `303156781020511`)
          formData.append('buyprice', '25000')
          formData.append('sellprice', '30000')
          formData.append('warranty_months', '12')
          result = await addPhoneAction(formData)
          break
          
        case 'search-phone-imei':
          result = await searchPhoneByImeiAction('123456789012345')
          break
          
        case 'update-phone':
          // First get a phone to update
          const phones = await getPhonesAction()
          if (phones.success && phones.data.length > 0) {
            const updateFormData = new FormData()
            updateFormData.append('name', phones.data[0].name + ' - Updated')
            updateFormData.append('imei', phones.data[0].imei)
            updateFormData.append('buyprice', phones.data[0].buyprice.toString())
            updateFormData.append('sellprice', phones.data[0].sellprice.toString())
            updateFormData.append('warranty_months', '24')
            result = await updatePhoneAction(phones.data[0].id, updateFormData)
          } else {
            result = { success: false, error: 'لا توجد هواتف للتحديث' }
          }
          break
          
        case 'get-phones-stats':
          result = await getPhonesStatsAction()
          break
          
        default:
          result = { success: false, error: 'اختبار غير معروف' }
      }

      setActions(prev => prev.map(action => 
        action.id === actionId 
          ? { 
              ...action, 
              status: result.success ? 'success' : 'error',
              result: result.success 
                ? `✅ نجح الاختبار: ${JSON.stringify(result.data, null, 2)}`
                : `❌ فشل الاختبار: ${result.error}`
            }
          : action
      ))
    } catch (error: any) {
      setActions(prev => prev.map(action => 
        action.id === actionId 
          ? { 
              ...action, 
              status: 'error',
              result: `❌ خطأ في التنفيذ: ${error.message}`
            }
          : action
      ))
    }
  }

  const runAllTests = () => {
    actions.forEach((_, index) => {
      setTimeout(() => runTest(actions[index].id), index * 500)
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'testing': return '⏳'
      default: return '▶️'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'testing': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">اختبار إدارة المخزون</h1>
            <p className="mt-2 text-gray-600">اختبار شامل لجميع عمليات المخزون: الهواتف والإكسسوارات</p>
          </div>
          <button
            onClick={runAllTests}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            تشغيل جميع الاختبارات
          </button>
        </div>
      </div>

      {/* Core Features Overview */}
      <div className="mb-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">الميزات الأساسية للمخزون</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">🏷️ إدارة الهواتف</h4>
                <p className="text-sm text-blue-700 mt-1">IMEI إلزامي، تمييز الموديلات، ربط بالموردين</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">📦 إدارة الإكسسوارات</h4>
                <p className="text-sm text-green-700 mt-1">كميات، حد أدنى، باركود، تصنيفات</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900">🔔 التنبيهات الذكية</h4>
                <p className="text-sm text-yellow-700 mt-1">مخزون منخفض، انتهاء الضمان</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Actions */}
      <div className="space-y-4">
        {actions.map((action) => (
          <div key={action.id} className={`border rounded-lg p-6 ${getStatusColor(action.status)}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">{getStatusIcon(action.status)}</span>
                  <h3 className="text-lg font-medium text-gray-900">{action.name}</h3>
                </div>
                <p className="text-gray-600 mb-3">{action.description}</p>
                
                {action.result && (
                  <div className="mb-3 p-3 bg-white rounded border">
                    <p className="text-sm font-medium text-gray-900">النتيجة:</p>
                    <p className="text-sm text-gray-700">{action.result}</p>
                  </div>
                )}

                {/* Technical Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-gray-700">Triggers:</span>
                    <div className="mt-1">
                      {action.triggers?.map(trigger => (
                        <span key={trigger} className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded mr-1 mb-1">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tables:</span>
                    <div className="mt-1">
                      {action.tables?.map(table => (
                        <span key={table} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded mr-1 mb-1">
                          {table}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => runTest(action.id)}
                disabled={action.status === 'testing'}
                className="ml-4 bg-white text-gray-700 px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {action.status === 'testing' ? 'جار التشغيل...' : 'اختبار'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Database Schema Relevant to Inventory */}
      <div className="mt-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">هيكل قاعدة البيانات المرتبط</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Core Tables</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <code>phone</code> - معلومات الهواتف والIMEI</li>
                <li>• <code>accessory</code> - الإكسسوارات والكميات</li>
                <li>• <code>brand</code> - العلامات التجارية</li>
                <li>• <code>category</code> - تصنيفات الإكسسوارات</li>
                <li>• <code>supplier</code> - معلومات الموردين</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Support Tables</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <code>stock_movement</code> - حركات المخزون</li>
                <li>• <code>audit_log</code> - سجل العمليات</li>
                <li>• <code>notification</code> - التنبيهات</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Dashboard */}
      <div className="mt-8">
        <a
          href="/test/features"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          ← العودة للوحة الرئيسية
        </a>
      </div>
    </div>
  )
}