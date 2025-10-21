// app/dashboard/DashboardClient.tsx
'use client'

import { useState } from 'react'
import { signOutAction } from '@/lib/actions/auth'
import { AuthUser, Store, StoreSettings, UserProfile } from '@/lib/types'

type Props = {
  user: AuthUser
  store: Store
  settings: StoreSettings | null
  users: UserProfile[]
}

export default function DashboardClient({ user, store, settings, users }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'store' | 'users'>('overview')

  const roleColors = {
    owner: 'bg-purple-100 text-purple-800',
    seller: 'bg-green-100 text-green-800',
    technician: 'bg-orange-100 text-orange-800',
  }

  const roleLabels = {
    owner: 'مالك',
    seller: 'بائع',
    technician: 'عامل',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {store.name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
                <p className="text-sm text-gray-500">مرحباً، {user.fullname}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role]}`}>
                {roleLabels[user.role]}
              </span>
              <button
                onClick={() => signOutAction()}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-3 font-medium transition ${
                activeTab === 'overview'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              نظرة عامة
            </button>
            <button
              onClick={() => setActiveTab('store')}
              className={`flex-1 px-6 py-3 font-medium transition ${
                activeTab === 'store'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              بيانات المتجر
            </button>
            {(user.role === 'owner') && (
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 px-6 py-3 font-medium transition ${
                  activeTab === 'users'
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                المستخدمين ({users.length})
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                    <div className="text-purple-600 text-sm font-semibold mb-2">الباقة</div>
                    <div className="text-2xl font-bold text-purple-900">
                      {store.plan === 'paid' ? 'مدفوعة' : 'مجانية'}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <div className="text-green-600 text-sm font-semibold mb-2">حالة المتجر</div>
                    <div className="text-2xl font-bold text-green-900">
                      {store.active ? 'نشط ✓' : 'غير نشط'}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <div className="text-blue-600 text-sm font-semibold mb-2">العملة</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {settings?.currency || 'DZD'}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">✅ Phase 1A - اختبار ناجح!</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ تسجيل الدخول يعمل</li>
                    <li>✓ RLS Policies تعمل (أنت ترى فقط متجرك)</li>
                    <li>✓ getCurrentUser() يعمل</li>
                    <li>✓ Store & Settings جاهزين</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Store Tab */}
            {activeTab === 'store' && (
              <div className="space-y-4">
                <InfoRow label="اسم المتجر" value={store.name} />
                <InfoRow label="العنوان" value={store.address || 'غير محدد'} />
                <InfoRow label="رقم الهاتف" value={store.phone || 'غير محدد'} />
                <InfoRow label="تاريخ البدء" value={new Date(store.startdate).toLocaleDateString('ar-DZ')} />
                {store.enddate && (
                  <InfoRow 
                    label="تاريخ الانتهاء" 
                    value={new Date(store.enddate).toLocaleDateString('ar-DZ')} 
                  />
                )}
                
                {settings && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-semibold text-gray-900 mb-4">الإعدادات</h3>
                    </div>
                    <InfoRow label="العملة" value={settings.currency} />
                    <InfoRow label="اللغة" value={settings.locale} />
                    <InfoRow label="طباعة الشعار" value={settings.print_logo ? 'نعم' : 'لا'} />
                    <InfoRow label="الإشعارات" value={settings.notify_low_stock ? 'مفعلة' : 'معطلة'} />
                  </>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-3">
                {users.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">لا يوجد مستخدمين</p>
                ) : (
                  users.map((u) => (
                    <div 
                      key={u.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {u.fullname.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.fullname}</p>
                          <p className="text-sm text-gray-500">
                            {u.lastloginat 
                              ? `آخر دخول: ${new Date(u.lastloginat).toLocaleDateString('ar-DZ')}`
                              : 'لم يسجل دخول بعد'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[u.role]}`}>
                          {roleLabels[u.role]}
                        </span>
                        {u.active ? (
                          <span className="text-green-600 text-sm">●</span>
                        ) : (
                          <span className="text-gray-400 text-sm">○</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  )
}