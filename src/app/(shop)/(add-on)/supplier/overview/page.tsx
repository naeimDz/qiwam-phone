// src/app/(shop)/(add-on)/supplier/overview/page.tsx
'use client';
import React from 'react';
import type { NextPage } from 'next';
import { CheckCircleIcon, FireExtinguisherIcon, RocketIcon } from 'lucide-react';

const SupplierOverviewPage: NextPage = () => {
  const sections = [
    {
      icon: <CheckCircleIcon className="h-7 w-7 text-green-600" />,
      title: '✅ واش راه يخدم توا',
      color: 'from-green-50 to-green-100',
      items: [
        'كل تعديل في المورد يتسجل وحدو، بلا ما تدير والو.',
        'قائمة الموردين الأقوى بالأرقام والنتائج.',
        'كل ديون الموردين واضحة قدامك بلا غبينة.',
        'الأمان مضمون، النظام مربوط بمالك المحل فقط.',
        'خدمة ثابتة ومستقرة يوميًا بلا مشاكل.'
      ]
    },
    {
      icon: <FireExtinguisherIcon className="h-7 w-7 text-amber-600" />,
      title: '⚙️ الحوايج اللي راهي على النار 🔥',
      color: 'from-amber-50 to-yellow-100',
      items: [
        'النظام يسجّلك أول تعامل مع كل مورد.',
        'يعرف آخر تواصل باش تعرف النشيط من الراكد.',
        'منع إيقاف مورد فيه ديون غير مدفوعة.',
        'سجل تغييرات فيه شكون بدّل واش ومتى.',
        'عدد الصفقات مع كل مورد بشكل فوري.',
        'تنبيهات تلقائية كي توصل الديون للسقف اللي تحدده.'
      ]
    },
    {
      icon: <RocketIcon className="h-7 w-7 text-blue-600" />,
      title: '🚀 الحوايج اللي جايين قدّام',
      color: 'from-blue-50 to-indigo-100',
      items: [
        'نقطة جودة لكل مورد مبنية على المرتجعات.',
        'تحليل أداء الموردين بالأرقام والمقارنات.',
        'تقارير ذكية: "أحسن موردين لهذي السنة".',
        'صفحة خاصة بكل مورد فيها كل التاريخ والتعاملات.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-3 text-gray-900 flex items-center gap-2">
          📦 نظام الموردين — واش راه كاين ووش راح يجي
        </h1>
        <p className="text-gray-600 mb-10 leading-relaxed max-w-2xl">
          👋 ها الصفحة جاية باش تبقى في الصورة. تشوف شنو يخدم النظام توا، 
          وشنو مزال راح يهبط قريب إن شاء الله. 
          كل حاجة مكتوبة هنا راح تشوفها تولي حقيقة خطوة بخطوة 💪
        </p>

        <div className="grid gap-8">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${section.color} p-6 rounded-2xl shadow-sm border border-gray-200`}
            >
              <div className="flex items-center gap-2 mb-3">
                {section.icon}
                <h2 className="text-xl font-semibold">{section.title}</h2>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-700 leading-relaxed">
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <p className="text-lg font-medium text-gray-800 mb-2">
            "راك تخدم، والنظام يخدم معاك."
          </p>
          <p className="text-gray-500">
            ما نبيعوش الوهم 🚫 نخدمو ونزيدو خطوة بخطوة ✌️  
            شكراً على الثقة ❤️
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupplierOverviewPage;
