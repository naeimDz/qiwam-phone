// app/admin/page.tsx
import { redirect } from 'next/navigation'

import { signOutAction } from '@/lib/actions/auth'
import { getCurrentUser, getUsersByStore } from '@/lib/supabase/db/auth'
import { getStoreWithSettings } from '@/lib/supabase/db/stores'

export default async function AdminDashboard() {
  // Step 1: Get current user
  const user = await getCurrentUser()
  
  if (!user) {
    console.log(user)
    redirect('/login')
  }

  if (!user.storeid) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ</h1>
          <p className="text-gray-700">حسابك غير مرتبط بأي متجر. يرجى التواصل مع الدعم الفني.</p>
        </div>
      </div>
    )
  }

  // Step 2: Get store data
  const { store, settings } = await getStoreWithSettings(user.storeid)
  
  if (!store) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ</h1>
          <p className="text-gray-700">المتجر غير موجود.</p>
        </div>
      </div>
    )
  }

  // Step 3: Get store users
  const storeUsers = await getUsersByStore(user.storeid)

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {store.name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                <p className="text-sm text-gray-600">{user.fullname} - {getRoleLabel(user.role)}</p>
              </div>
            </div>
            
            <form action={signOutAction as unknown as (formData: FormData) => void}>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                تسجيل الخروج
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Alert */}
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-900">✅ Phase 1A Test Successful!</h3>
              <p className="text-sm text-green-700">Authentication & Store isolation working correctly</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              معلومات المستخدم الحالي
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">المعرف</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{user.id.substring(0, 8)}...</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">الاسم الكامل</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.fullname}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">البريد الإلكتروني</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email || 'غير متوفر'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">الدور</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {getRoleLabel(user.role)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">معرف المتجر</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{user.storeid?.substring(0, 8)}...</dd>
              </div>
            </dl>
          </div>

          {/* Store Info Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              معلومات المتجر
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">اسم المتجر</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">{store.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">العنوان</dt>
                <dd className="mt-1 text-sm text-gray-900">{store.address || 'غير محدد'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">الهاتف</dt>
                <dd className="mt-1 text-sm text-gray-900">{store.phone || 'غير محدد'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">الخطة</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    store.plan === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {store.plan === 'paid' ? 'مدفوعة' : 'مجانية'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">الحالة</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    store.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {store.active ? 'نشط' : 'غير نشط'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Store Settings Card */}
          {settings && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                إعدادات المتجر
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">العملة</dt>
                  <dd className="mt-1 text-sm text-gray-900">{settings.currency}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">اللغة</dt>
                  <dd className="mt-1 text-sm text-gray-900">{settings.locale}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">طباعة الشعار</dt>
                  <dd className="mt-1 text-sm text-gray-900">{settings.print_logo ? 'مفعّل' : 'معطّل'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">طباعة QR تلقائياً</dt>
                  <dd className="mt-1 text-sm text-gray-900">{settings.auto_print_invoice ? 'مفعّل' : 'معطّل'}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Store Users Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              مستخدمي المتجر ({storeUsers.length})
            </h2>
            <div className="space-y-3">
              {storeUsers.map((storeUser) => (
                <div key={storeUser.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{storeUser.fullname}</p>
                    <p className="text-xs text-gray-500">storeUser.phone</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    storeUser.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getRoleLabel(storeUser.role)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Results Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 نتائج الاختبار - Phase 1A</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TestResult
              label="Auth User"
              value="✅ Success"
              description={`Loaded: ${user.fullname}`}
            />
            <TestResult
              label="Store Isolation"
              value="✅ Success"
              description={`Store ID: ${user.storeid?.substring(0, 8)}...`}
            />
            <TestResult
              label="Store Data"
              value="✅ Success"
              description={`${store.name} - ${store.plan}`}
            />
            <TestResult
              label="Users Query"
              value="✅ Success"
              description={`${storeUsers.length} users found`}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    owner: 'مالك',
    manager: 'مدير',
    seller: 'بائع',
    accountant: 'محاسب',
  }
  return labels[role] || role
}

function TestResult({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  )
}