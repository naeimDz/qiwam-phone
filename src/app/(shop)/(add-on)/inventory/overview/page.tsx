'use client'

import React from 'react'
import type { NextPage } from 'next'
import {
  CheckCircleIcon,
  FireExtinguisherIcon,
  RocketIcon,
  TrendingUpIcon,
  BrainIcon,
} from 'lucide-react'

const InventoryOverviewPage: NextPage = () => {
  const sections = [
    {
      icon: <CheckCircleIcon className="h-7 w-7 text-green-600" />,
      title: '✅ واش راه يخدم توا (Fully Working)',
      color: 'from-green-50 to-green-100',
      items: [
        '📊 لوحة التحكم الرئيسية: 4 Tabs (نظرة عامة، هواتف، إكسسوارات، إحصائيات).',
        '🔍 بحث فوري: IMEI + الاسم + SKU بلا تأخير.',
        '📱 جدول الهواتف: عرض سريع + حالة واضحة (متاح/مباع).',
        '📦 جدول الإكسسوارات: كمية + تنبيهات مخزون منخفض.',
        '⚡ Pagination سريع: 10 منتجات بالصفحة الواحدة.',
        '🎨 Stats Cards ذكية: قيمة المخزون + عدد الهواتف + إكسسوارات.',
        '⚠️ تنبيهات فورية: مخزون منخفض يظهر بلاحظ في الـ Dashboard.',
        '🏠 Responsive Design: يشتغل على الموبايل والديسكتوب.',
        '🔐 أمان: كل المخزون مربوط بـ Store ID بتاع صاحب المحل فقط.'
      ]
    },
    {
      icon: <FireExtinguisherIcon className="h-7 w-7 text-amber-600" />,
      title: '⚙️ الحوايج اللي راهي على النار 🔥 (In Progress)',
      color: 'from-amber-50 to-yellow-100',
      items: [
        '🗑️ حذف منتجات: حالياً بدون Modal تأكيد (نحتاج تنبيه قبل الحذف).',
        '✏️ تعديل الهواتف: الزر موجود لكن بدون صفحة تعديل فعلية.',
        '✏️ تعديل الإكسسوارات: نفس المشكلة، بحاجة صفحة تعديل منفصلة.',
        '📝 تعديل الكمية: تعديل سريع للإكسسوارات بدون فتح صفحة كاملة.',
        '👁️ عرض التفاصيل: زر View موجود لكن بدون Modal معلومات مفصلة.',
        '🏷️ إضافة منتج: الأزرار موجودة لكن بدون Modals للإدخال.',
        '📤 Export/Import: استيراد من Excel أو تصدير التقارير.',
        '📌 تثبيت المنتجات: حفظ المنتجات المهمة في الأعلى (Favorites).',
        '🔔 إشعارات متقدمة: البريد أو الواتساب عند انقطاع مخزون.'
      ]
    },
    {
      icon: <RocketIcon className="h-7 w-7 text-blue-600" />,
      title: '🚀 الحوايج اللي جايين قدّام (Next Phase)',
      color: 'from-blue-50 to-indigo-100',
      items: [
        '📊 Dashboard متقدم: رسم بياني لحركة المخزون (في والخروج).',
        '📈 تحليل البيانات: "أكثر منتج مبيع" و "أطول منتج في المخزون".',
        '⏰ توقع الطلب: النظام يقول لك "شري من الموردين قريب" قبل الانقطاع.',
        '🏆 تصنيف الموردين: أي مورد يجيب الأسرع والأرخص.',
        '🔄 تعديل أسعار تلقائي: حسب السوق أو الموسم.',
        '🎯 أهداف مخزون: تحديد كمية مثالية لكل منتج بناءً على البيع.',
        '📞 ربط الموردين: عند انقطاع المخزون، يقتري عليك أفضل موردين.',
        '🛠️ صيانة المخزون: جرد سريع (Inventory Count) بـ QR Code أو IMEI مسح.',
        '💾 نسخ احتياطي: كل تغيير في المخزون يُحفظ (Audit Trail).',
        '🌍 متعدد المتاجر: إذا فتح أكثر من فرع، ننقل منتجات بين المتاجر.'
      ]
    },
    {
      icon: <BrainIcon className="h-7 w-7 text-purple-600" />,
      title: '🧠 أفكار متقدمة جداً (Advanced Brainstorm)',
      color: 'from-purple-50 to-pink-100',
      items: [
        '🤖 AI Recommendations: "على أساس تاريخك، بدّل أسعارك كذا".',
        '📱 SMS Alerts: تنبيهات مباشرة للموبايل عند انقطاع منتج حساس.',
        '🔗 API للموردين: موردك يدخل ويشوف الطلبيات المعلقة فحالو.',
        '💳 فوترة الموردين: الفاتورة التلقائية بناءً على التسليمات.',
        '🌐 Multi-Currency: إذا استوردت من دول مختلفة (USD, EUR, DZD).',
        '🔐 Barcode Scanner: مسح البار كود مباشرة من الموبايل (PWA).',
        '📊 Predictive Analytics: توقع المنتجات اللي تنقطع قبل ما تنقطع.',
        '🎁 Bundle Products: مجموعات منتجات (هاتف + شاحن + واقية).',
        '💰 Dynamic Pricing: السعر يتغير حسب الكمية المتاحة.',
        '🏪 Drop-shipping Integration: موردك يرسل مباشرة للزبون.'
      ]
    },
    {
      icon: <TrendingUpIcon className="h-7 w-7 text-cyan-600" />,
      title: '🎯 الأولويات للـ Next Sprint (Priority Order)',
      color: 'from-cyan-50 to-teal-100',
      items: [
        '1️⃣ تعديل سريع للكمية: Inline Edit (بدون Modal) للإكسسوارات.',
        '2️⃣ Modal تأكيد الحذف: قبل ما تحذف، اتأكد (Confirmation Dialog).',
        '3️⃣ Modal تفاصيل المنتج: عرض كامل المعلومات عند الضغط على View.',
        '4️⃣ صفحات تعديل: EditPhone و EditAccessory (منفصلة).',
        '5️⃣ جرد سريع: صفحة Inventory Count بـ QR Scan.',
        '6️⃣ تقارير PDF: طباعة قائمة المخزون أو الإحصائيات.',
        '7️⃣ رسم بياني بسيط: Top 5 منتجات مبيعاً (Bar Chart).',
        '8️⃣ تصنيف Favorites: شريط منتجات مهمة في الأعلى.',
        '9️⃣ Notifications Center: مركز إشعارات موحد للمنتجات الحرجة.',
        '🔟 API للمبيعات: ربط صفحة المخزون بصفحة البيع تلقائياً.'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        {/* الرأس */}
        <h1 className="text-4xl font-bold mb-3 text-gray-900 flex items-center gap-3">
          📦 نظام المخزون — واش راه كاين ووش راح يجي
        </h1>
        <p className="text-lg text-gray-600 mb-12 leading-relaxed max-w-3xl">
          👋 ها الصفحة جاية باش تبقى في الصورة كاملة على نظام المخزون بتاعك.
          تشوف شنو يخدم توا، شنو مزال قيد الشغل، وشنو مزال في الخطة المستقبلية.
          كل حاجة هنا راح تشوفها تولي حقيقة خطوة بخطوة 💪
        </p>

        {/* الأقسام الرئيسية */}
        <div className="grid gap-8">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${section.color} p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow`}
            >
              {/* الرأس */}
              <div className="flex items-center gap-3 mb-4">
                {section.icon}
                <h2 className="text-2xl font-semibold text-gray-900">
                  {section.title}
                </h2>
              </div>

              {/* العناصر */}
              <ul className="space-y-3">
                {section.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-gray-700 leading-relaxed"
                  >
                    <span className="text-sm font-bold text-gray-400 min-w-5">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* الخلاصة */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="space-y-6">
            {/* رسالة الثقة */}
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 mb-2">
                "راك تخدم، والنظام يخدم معاك." 💼
              </p>
              <p className="text-gray-600 text-lg">
                ما نبيعوش الوهم 🚫
                <br />
                نخدمو ونزيدو خطوة بخطوة بناءً على احتياجاتك الحقيقية ✌️
                <br />
                شكراً على الثقة ❤️
              </p>
            </div>

            {/* خريطة الطريق */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                🗺️ خريطة الطريق القادمة:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-green-700">الأسبوع 1-2</p>
                  <p className="text-gray-600 mt-1">
                    ✅ Modals تعديل ونقل المنتجات
                    <br />
                    ✅ جرد سريع (QR Code)
                    <br />
                    ✅ حذف آمن مع تأكيد
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-amber-700">الأسبوع 3-4</p>
                  <p className="text-gray-600 mt-1">
                    📊 رسوم بيانية بسيطة
                    <br />
                    📥 تصدير تقارير PDF
                    <br />
                    🏆 Top منتجات
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-blue-700">الشهر 2+</p>
                  <p className="text-gray-600 mt-1">
                    🤖 Predictions ذكية
                    <br />
                    📱 Mobile Scanning
                    <br />
                    🌐 Multi-Store Support
                  </p>
                </div>
              </div>
            </div>

            {/* النصيحة النهائية */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800 font-medium">
                💡 <strong>نصيحة:</strong> ركز على الأساس أولاً (تعديل + حذف آمن +
                جرد). بعدين نركز على الـ Analytics والتنبؤات. النظام كلو بيشتغل أحسن
                لما تكون البيانات نضيفة ودقيقة من البداية 🎯
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryOverviewPage