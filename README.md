# 📱 محل الهواتف - نظام الإدارة

نظام إدارة شامل لمحل الهواتف المحمولة مبني بأحدث التقنيات مع Next.js 15 و TypeScript و Tailwind CSS.

## ✨ المميزات

- 🎨 **8 أنظمة ألوان مختلفة** قابلة للتبديل بسهولة
- 🌓 **الوضع الداكن/الفاتح** مع حفظ التفضيلات
- ⚡ **Command Palette** للوصول السريع لجميع الوظائف
- 🎯 **اختصارات لوحة المفاتيح** لتسريع العمل
- 📊 **لوحة تحكم شاملة** مع إحصائيات مباشرة
- 🔄 **RTL Support** دعم كامل للغة العربية
- 📱 **Responsive Design** متجاوب مع جميع الشاشات
- 🏗️ **بنية منظمة** قابلة للتوسع والصيانة

## 🏗️ البنية المعمارية

```
phone-shop/
├── app/
│   ├── layout.tsx              # Root layout + ThemeProvider
│   ├── globals.css             # Tailwind + CSS variables
│   ├── (shop)/                 # Route group للـ authenticated pages
│   │   ├── layout.tsx          # Main layout (Sidebar + TopBar)
│   │   ├── page.tsx            # Dashboard
│   │   ├── sales/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── customers/page.tsx
│   │   └── reports/page.tsx
│   └── login/page.tsx          # خارج الـ route group
│
├── components/
│   ├── sidebar.tsx             # كل الـ Sidebar في ملف واحد
│   ├── topbar.tsx              # كل الـ TopBar في ملف واحد
│   ├── command-palette.tsx     # Modal للبحث السريع
│   ├── theme-picker.tsx        # Modal لاختيار الألوان
│   └── ui/
│       ├── logo.tsx
│       └── nav-item.tsx
│
├── lib/
│   ├── theme.tsx               # ThemeProvider + Context + Hook
│   ├── menu-config.ts          # Menu items + shortcuts
│   └── utils.ts                # cn() + helpers
│
└── types.ts                    # كل الـ TypeScript types
```

## 🚀 التثبيت والتشغيل

### المتطلبات

- Node.js 18+ أو Bun 1.0+
- npm أو yarn أو pnpm أو bun

### التثبيت

```bash
# استنساخ المشروع
git clone <repo-url>
cd phone-shop

# تثبيت المكتبات
npm install
# أو
bun install

# تشغيل بيئة التطوير
npm run dev
# أو
bun dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## 🎨 نظام الألوان

يوفر النظام 8 أنظمة ألوان مختلفة:

- 🟢 **أخضر زيتوني** - اللون الافتراضي
- 🔵 **أزرق احترافي**
- 🟣 **بنفسجي عصري**
- 🩵 **فيروزي منعش**
- 🔴 **أحمر قوي**
- 🟣 **نيلي أنيق**
- 🟠 **برتقالي دافئ**
- 🩷 **وردي لطيف**

يمكن تبديل الألوان من الزر الموجود في شريط الأدوات العلوي.

## ⌨️ اختصارات لوحة المفاتيح

| الاختصار | الوظيفة |
|----------|----------|
| `Ctrl/Cmd + K` | فتح لوحة الأوامر |
| `F2` | الانتقال لنقطة البيع |
| `Alt + 1-5` | التنقل بين الأقسام |
| `Esc` | إغلاق النوافذ المنبثقة |

## 🧩 المكونات الأساسية

### Sidebar
- **قابل للطي** لتوفير مساحة الشاشة
- **Tooltips** عند الطي
- **Active state** واضح
- **Notifications badges** للتنبيهات
- **User profile** في الأسفل

### TopBar
- **عنوان الصفحة** الحالية
- **التاريخ والوقت** محدث تلقائياً
- **بحث سريع** مع Command Palette
- **Theme toggle** للوضع الداكن/الفاتح
- **Color picker** لاختيار الألوان
- **Notifications** مع badge
- **زر عملية جديدة** سريع

### Command Palette
- **بحث ذكي** في جميع الأوامر
- **اختصارات** واضحة
- **تنفيذ فوري** للأوامر

## 📦 التقنيات المستخدمة

- **Next.js 15** - React framework مع App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - أيقونات عصرية
- **CSS Variables** - Dynamic theming

## 🎯 Best Practices المطبقة

✅ **Server/Client Components Separation**
- Root layout و route group layouts كـ Server Components
- Interactive components فقط كـ Client Components

✅ **CSS Variables للألوان**
- جميع الألوان في CSS variables
- دعم كامل للـ dark mode
- تحديث ديناميكي عند تغيير الألوان

✅ **TypeScript Strict Mode**
- جميع الـ types محددة بوضوح
- لا توجد `any` types
- Props interfaces واضحة

✅ **Clean Code**
- Components صغيرة ومركزة
- Reusable logic في hooks
- Configuration منفصلة عن الكود

✅ **Performance**
- Code splitting تلقائي
- Optimized images
- Minimal client-side JavaScript

## 🔜 الخطوات القادمة

- [ ] تكامل مع API خلفي
- [ ] نظام المصادقة الكامل
- [ ] قاعدة البيانات (Offline-first)
- [ ] واجهة نقطة البيع التفاعلية
- [ ] إدارة المخزون الكاملة
- [ ] التقارير والإحصائيات المتقدمة
- [ ] الطباعة (فواتير، تقارير)
- [ ] النسخ الاحتياطي والاستعادة

## 📝 ملاحظات

- المشروع جاهز للتطوير والتوسع
- البنية مرنة وقابلة للصيانة
- الكود نظيف ومنظم وفق أفضل الممارسات
- لا توجد مكتبات خارجية إضافية (pragmatic approach)

## 👨‍💻 التطوير

```bash
# TypeScript type checking
npm run type-check

# ESLint
npm run lint

# Production build
npm run build

# Start production server
npm start
```

---

