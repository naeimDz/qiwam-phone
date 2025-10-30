// test/features/cash-register/page.tsx
'use client'
import { useState } from 'react'
import { 
  openCashRegisterAction,
  getOpenCashRegisterAction,
  getCashRegistersAction,
  closeCashRegisterAction,
  reconcileCashRegisterAction,
  createCashSnapshotAction,
  getCashSnapshotsAction,
  getSettlementRecordsAction,
  reconcileSettlementAction
} from '@/lib/actions/cashRegister.actions'

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

export default function CashRegisterTestPage() {
  const [actions, setActions] = useState<TestAction[]>([
    {
      id: 'get-open-register',
      name: 'جلب الصندوق المفتوح',
      description: 'اختبار getOpenCashRegisterAction لجلب الصندوق المفتوح حالياً',
      action: 'getOpenCashRegisterAction()',
      status: 'pending',
      triggers: [],
      tables: ['cash_register', 'users']
    },
    {
      id: 'open-register',
      name: 'فتح صندوق نقدي جديد',
      description: 'اختبار openCashRegisterAction لفتح صندوق نقدي برصيد افتتاحي',
      action: 'openCashRegisterAction(1000, "رصيد افتتاحي للاختبار")',
      status: 'pending',
      triggers: [],
      tables: ['cash_register', 'audit_log']
    },
    {
      id: 'get-all-registers',
      name: 'جلب جميع الصناديق',
      description: 'اختبار getCashRegistersAction لجلب تاريخ جميع الصناديق النقدية',
      action: 'getCashRegistersAction()',
      status: 'pending',
      triggers: [],
      tables: ['cash_register', 'users']
    },
    {
      id: 'create-snapshot',
      name: 'إنشاء لقطة يدوية',
      description: 'اختبار createCashSnapshotAction لحفظ حالة الصندوق',
      action: 'createCashSnapshotAction(registerId, "لقطة اختبارية")',
      status: 'pending',
      triggers: [],
      tables: ['cash_register_snapshots', 'cash_register']
    },
    {
      id: 'close-register',
      name: 'إغلاق الصندوق',
      description: 'اختبار closeCashRegisterAction لإغلاق الصندوق مع الرصيد الختامي',
      action: 'closeCashRegisterAction(registerId, 950, "إغلاق اختباري")',
      status: 'pending',
      triggers: ['trg_cash_register_close', 'fn_cash_register_close_balance'],
      tables: ['cash_register', 'settlement_record', 'audit_log']
    },
    {
      id: 'reconcile-register',
      name: 'توفيق الصندوق',
      description: 'اختبار reconcileCashRegisterAction لتوفيق الصندوق المغلق',
      action: 'reconcileCashRegisterAction(registerId)',
      status: 'pending',
      triggers: [],
      tables: ['cash_register', 'audit_log']
    },
    {
      id: 'get-settlements',
      name: 'جلب التسويات',
      description: 'اختبار getSettlementRecordsAction لجلب سجلات التسوية',
      action: 'getSettlementRecordsAction()',
      status: 'pending',
      triggers: [],
      tables: ['settlement_record', 'cash_register', 'variance_record']
    },
    {
      id: 'get-snapshots',
      name: 'جلب اللقطات',
      description: 'اختبار getCashSnapshotsAction لجلب لقطات الصندوق',
      action: 'getCashSnapshotsAction(registerId)',
      status: 'pending',
      triggers: [],
      tables: ['cash_register_snapshots', 'users']
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
        case 'get-open-register':
          result = await getOpenCashRegisterAction()
          break
          
        case 'open-register':
          result = await openCashRegisterAction(1000, 'رصيد افتتاحي للاختبار')
          break
          
        case 'get-all-registers':
          result = await getCashRegistersAction()
          break
          
        case 'create-snapshot':
          // Get first register to create snapshot
          const registersForSnapshot = await getCashRegistersAction()
          if (registersForSnapshot.success && registersForSnapshot.data.length > 0) {
            const openRegister = registersForSnapshot.data.find((r: any) => r.status === 'open')
            if (openRegister) {
              result = await createCashSnapshotAction(openRegister.id, 'لقطة اختبارية')
            } else {
              result = { success: false, error: 'لا يوجد صندوق مفتوح لإنشاء لقطة' }
            }
          } else {
            result = { success: false, error: 'لا توجد صناديق للاختبار' }
          }
          break
          
        case 'close-register':
          // Get first open register to close
          const registersForClose = await getCashRegistersAction('open')
          if (registersForClose.success && registersForClose.data.length > 0) {
            result = await closeCashRegisterAction(registersForClose.data[0].id, 950, 'إغلاق اختباري')
          } else {
            result = { success: false, error: 'لا يوجد صندوق مفتوح للإغلاق' }
          }
          break
          
        case 'reconcile-register':
          // Get first closed register to reconcile
          const registersForReconcile = await getCashRegistersAction('closed')
          if (registersForReconcile.success && registersForReconcile.data.length > 0) {
            const unreconciled = registersForReconcile.data.find((r: any) => !r.reconciled)
            if (unreconciled) {
              result = await reconcileCashRegisterAction(unreconciled.id)
            } else {
              result = { success: false, error: 'جميع الصناديق موفقة' }
            }
          } else {
            result = { success: false, error: 'لا توجد صناديق مغلقة للتوفيق' }
          }
          break
          
        case 'get-settlements':
          result = await getSettlementRecordsAction()
          break
          
        case 'get-snapshots':
          const registersForSnapshots = await getCashRegistersAction()
          if (registersForSnapshots.success && registersForSnapshots.data.length > 0) {
            result = await getCashSnapshotsAction(registersForSnapshots.data[0].id)
          } else {
            result = { success: false, error: 'لا توجد صناديق للاختبار' }
          }
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
    // Run tests in logical order
    const orderedTests = [
      'get-open-register',
      'open-register', 
      'get-all-registers',
      'create-snapshot',
      'get-snapshots',
      'close-register',
      'reconcile-register',
      'get-settlements'
    ]
    
    orderedTests.forEach((testId, index) => {
      setTimeout(() => runTest(testId), index * 2000)
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
            <h1 className="text-2xl font-bold text-gray-900">اختبار صندوق النقد</h1>
            <p className="mt-2 text-gray-600">اختبار شامل لإدارة الصندوق النقدي والتسويات المالية</p>
          </div>
          <button
            onClick={runAllTests}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            تشغيل جميع الاختبارات
          </button>
        </div>
      </div>

      {/* Cash Register Lifecycle */}
      <div className="mb-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">دورة حياة الصندوق النقدي</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-5">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">1️⃣ فتح الصندوق</h4>
                <p className="text-sm text-blue-700 mt-1">رصيد افتتاحي + مسؤول</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">2️⃣ المعاملات</h4>
                <p className="text-sm text-green-700 mt-1">دفعات داخلة + خارجة</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900">3️⃣ لقطات</h4>
                <p className="text-sm text-yellow-700 mt-1">حفظ حالة الرصيد</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-900">4️⃣ إغلاق + تسوية</h4>
                <p className="text-sm text-orange-700 mt-1">رصيد ختامي + فروقات</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">5️⃣ التوفيق</h4>
                <p className="text-sm text-purple-700 mt-1">تدقيق + audit log</p>
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
                <p className="text-gray-600 mb-2">{action.description}</p>
                <p className="text-xs text-gray-500 mb-3"><code>{action.action}</code></p>
                
                {action.result && (
                  <div className="mb-3 p-3 bg-white rounded border">
                    <p className="text-sm font-medium text-gray-900">النتيجة:</p>
                    <pre className="text-xs text-gray-700 mt-1 whitespace-pre-wrap">{action.result}</pre>
                  </div>
                )}

                {/* Technical Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-gray-700">Database Triggers:</span>
                    <div className="mt-1">
                      {action.triggers?.length === 0 ? (
                        <span className="text-gray-500">No automated triggers</span>
                      ) : (
                        action.triggers?.map(trigger => (
                          <span key={trigger} className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded mr-1 mb-1">
                            {trigger}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tables Affected:</span>
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

      {/* Critical Cash Register Triggers */}
      <div className="mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 mb-4">⚠️ Triggers مهمة جداً</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-red-800 mb-2">عند إغلاق الصندوق:</h4>
              <ul className="space-y-1 text-red-700">
                <li>• <code>fn_cash_register_close_balance</code> - حساب الفرق التلقائي</li>
                <li>• إنشاء <code>settlement_record</code> تلقائياً</li>
                <li>• كشف الفروقات في <code>variance_record</code></li>
                <li>• تسجيل في <code>audit_log</code></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-800 mb-2">عند المعاملات النقدية:</h4>
              <ul className="space-y-1 text-red-700">
                <li>• <code>tr_payment_after_insert_sync</code> - تحديث الرصيد</li>
                <li>• إنشاء <code>cash_register_snapshots</code> تلقائي</li>
                <li>• تحديث عدادات الدفعات</li>
                <li>• ربط مع <code>cash_movement</code></li>
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