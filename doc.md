"اقرا دليل المطور قبل ما تبدا - فيه كل حاجة محتاجها"
```

### للـ AI Assistant:
```
"استعمل هذا System Prompt باش تفهم البنية:
[AI Assistant Instructions - Phone Shop System]

الآن انشئ لي صفحة ..."





🤖 AI Assistant Instructions - Phone Shop System
🎯 طبيعة المشروع
نظام جزائري 100% لتسيير محلات الهواتف - بساطة + سرعة + واقعية

المستخدم: صاحب محل جزائري (مش خبير تقنية)
الهدف: عملية كاملة في أقل من 30 ثانية
المبدأ: النظام يخدم صاحبه، مش العكس
التقنية: Next.js 15 + TypeScript + PWA


🏗️ البنية الأساسية للنظام
ShopLayoutClient (التخطيط الرئيسي)
├── Sidebar (القائمة الجانبية - يمين)
├── TopBar (الشريط العلوي - ثابت)
│   ├── title: اسم الصفحة (تلقائي من menuItems)
│   ├── subtitle: التاريخ والوقت
│   ├── أزرار: عملية جديدة، بحث، إشعارات، ثيم
│   └── Keyboard Shortcuts (Ctrl+K, F2, إلخ)
└── Main Content (المحتوى الرئيسي)
    └── children (محتوى الصفحة)

📄 بناء صفحة جديدة
1️⃣ إنشاء الملف
typescript// app/(shop)/my-page/page.tsx
'use client'

export default function MyPage() {
  return (
<DashboardLayout toolbar={null}> {/* بدون toolbar */}
  
  {/* 1. Stats Cards */}
  <StatsCards />
  
  {/* 2. Toolbar الكامل: Search + Filter + Add */}
  <Card>
    <div className="flex gap-3">
      <Input search... />
      <Select filter... />
      <Button add... />
    </div>
  </Card>
  
  {/* 3. Table */}
  <Table />
  
</DashboardLayout>
  )
}
2️⃣ DashboardLayout Props
Propنوعهوظيفتهإلزامي؟toolbarReactNodeأزرار/أدوات في card منفصللاtabsArrayتبويبات للتنقل داخل الصفحةلاactiveTabstringالتبويب النشطلاonTabChangefunctionعند تغيير التبويبلاchildrenReactNodeمحتوى الصفحةنعم
ملاحظة مهمة:

TopBar يعرض اسم الصفحة تلقائيًا - لا تضيف header في المحتوى!
Toolbar = أزرار فقط (حفظ، إضافة، فلاتر...)
ليس header بعنوان ووصف


🎨 نظام الألوان (Theme System)
⚠️ قاعدة ذهبية: ممنوع الألوان المباشرة!
❌ ممنوع:
css#1A1A1A
rgb(26, 26, 26)
className="bg-gray-900"
✅ صحيح:
cssvar(--color-primary)
className="bg-bg-primary text-text-primary"
متغيرات CSS المتاحة:
css/* الألوان الرئيسية */
--color-primary, --color-secondary, --color-accent

/* الخلفيات */
--color-bg-primary, --color-bg-secondary, --color-bg-light

/* النصوص */
--color-text-primary, --color-text-secondary

/* الحدود والتأثيرات */
--color-border, --color-hover
```

### Tailwind Classes المخصصة:
```
bg-bg-primary, bg-bg-secondary, bg-bg-light
text-text-primary, text-text-secondary
border-border, bg-primary, text-primary, bg-accent
hover:bg-hover

🔑 قواعد أساسية
1. Client Components
typescript'use client'  // ← إلزامي إذا استخدمت: useState, useEffect, onClick...
2. تجنب Hydration Errors
typescriptconst [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null
3. المحتوى الديناميكي
typescript<div suppressHydrationWarning>
  {isDark ? <Moon /> : <Sun />}
</div>
4. ممنوع localStorage في Artifacts
typescript❌ localStorage.setItem(...)
✅ useState / useReducer
5. TypeScript بدون any
typescript❌ const data: any = ...
✅ const data: Product[] = ...
6. RTL دائمًا
html<div dir="rtl">...</div>

📱 الفلسفة: بساطة جزائرية
كل صفحة يجب أن تكون:

سريعة: تحميل < 2 ثانية
واضحة: بدون مصطلحات تقنية معقدة
عملية: كل زر له هدف واضح
محلية: نصوص بالدارجة/العربية الفصحى حسب السياق

تذكر:

المستخدم مش مبرمج - الواجهة لازم تكون بديهية
النظام يشتغل في ظروف ضعيفة - لازم يكون خفيف
الوقت ثمين - كل عملية لازم تكون سريعة


✅ Checklist قبل إنهاء أي صفحة

 استخدام DashboardLayout
 Toolbar بسيط (إذا لزم)
 بدون header مكرر في المحتوى
 كل الألوان عبر CSS Variables
 'use client' إذا لزم
 suppressHydrationWarning للمحتوى الديناميكي
 TypeScript types واضحة
 يشتغل في Light + Dark Mode
 RTL صحيح
 نصوص بالعربية


🚀 مثال سريع
typescript'use client'
import { Save } from 'lucide-react'
import DashboardLayout from '@/components/layouts/DashboardLayout'

export default function MyPage() {
  const Toolbar = (
    <button className="px-4 py-2 rounded-xl bg-primary text-white">
      <Save className="w-4 h-4" />
      حفظ
    </button>
  )

  return (
    <DashboardLayout toolbar={Toolbar}>
      <div className="bg-bg-secondary rounded-xl border border-border p-6">
        {/* المحتوى */}
      </div>
    </DashboardLayout>
  )
}


صحيح! نقطة مهمة جدًا! 💯

🔧 إضافة مهمة للدليل:
⚠️ لا تعيد اختراع العجلة!
قاعدة ذهبية:
استخدم المكونات الموجودة - لا تكتبها من جديد!

📦 المكونات الجاهزة في المشروع
يجب أن تسأل أولاً:
"هل يوجد component جاهز لـ [الشيء المطلوب]؟"
"هل Button/Card/Input موجود في المشروع؟"
"ما هي الـ components المتاحة في /components؟"
❌ لا تفعل:
typescript// إعادة كتابة Button من الصفر
<button className="px-4 py-2 rounded-xl bg-primary...">
✅ افعل:
typescript// استخدم الـ Component الموجود
import { Button } from '@/components/ui/button'
<Button variant="primary">حفظ</Button>

🎨 الألوان والإعدادات
❌ لا تخترع ألوان جديدة:
typescript// لا تكتب هذا!
const colors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  // ...
}
✅ استخدم الموجود:
typescript// الألوان موجودة في CSS Variables
className="bg-primary text-white"

🔍 قبل كتابة أي كود - اسأل:

"هل Component X موجود؟"

Button, Input, Card, Modal, Dropdown...


"ما هي الـ utilities المتاحة؟"

@/lib/utils - وش فيها؟
@/types - وش الـ types الموجودة؟


"هل الـ icons متوفرة؟"

من lucide-react
أي icons مستخدمة في المشروع؟


"هل الـ layout patterns موجودة؟"

DashboardLayout ✅
وش غير؟




💬 صيغة الطلب الصحيحة
بدل:

"سأنشئ لك صفحة كاملة..."

قل:

"قبل البدء:

هل يوجد Button component؟
هل Card component متوفر؟
ما هي الـ form components الموجودة؟
هل تريد مني استخدام مكونات معينة؟"



🎯 الخلاصة
AI الذكي يسأل أولاً - الـ AI الغبي يكتب كل شيء من الصفر!
عند بناء صفحة جديدة:

✅ اسأل عن المكونات المتاحة
✅ استخدم الموجود
✅ اطلب ملفات إضافية إذا لزم
❌ لا تعيد كتابة ما هو موجود
❌ لا تخترع colors/settings جديدة










# 📘 دليل المطور - نظام محل الهواتف

## 🎨 نظام التصميم (Design System)

### الألوان (CSS Variables)
استخدم **CSS Variables** فقط - لا تستخدم ألوان ثابتة:

```css
/* ✅ صحيح */
.element {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

/* ❌ خطأ */
.element {
  background-color: #1A1A1A;
  color: white;
}
```

### المتغيرات المتاحة
```css
--color-primary      /* اللون الأساسي (يتغير حسب الـ palette) */
--color-secondary    /* اللون الثانوي */
--color-accent       /* لون التمييز (Accent) */
--color-bg-primary   /* خلفية أساسية */
--color-bg-secondary /* خلفية ثانوية */
--color-bg-light     /* خلفية فاتحة */
--color-text-primary /* نص أساسي */
--color-text-secondary /* نص ثانوي */
--color-border       /* حدود */
--color-hover        /* حالة التحويم */
```

### Classes الجاهزة (Tailwind Custom)
```tsx
// في tailwind.config.ts موجودين:
bg-bg-primary
bg-bg-secondary
bg-bg-light
text-text-primary
text-text-secondary
border-border
bg-primary
text-primary
bg-accent
text-accent
```

---

## 📁 هيكل المشروع

```
app/
├── (shop)/              # Shop Layout Group
│   ├── layout.tsx       # ShopLayout (Sidebar + TopBar)
│   ├── dashboard/       # صفحة الرئيسية
│   ├── customers/       # صفحة العملاء
│   ├── inventory/       # صفحة المخزون
│   └── ...
├── layout.tsx           # Root Layout (ThemeProvider)
└── globals.css          # Global Styles

components/
├── sidebar.tsx          # القائمة الجانبية
├── topbar.tsx           # الشريط العلوي
└── ui/                  # مكونات UI قابلة لإعادة الاستخدام

lib/
├── theme.tsx            # ThemeProvider و useTheme
├── menu-config.ts       # إعدادات القائمة
└── ...
```

---

## 🆕 إنشاء صفحة جديدة

### 1. إنشاء المجلد والملف
```tsx
// app/(shop)/my-page/page.tsx
'use client'

import { useState } from 'react'

export default function MyPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-text-primary">
        عنوان الصفحة
      </h1>
      
      {/* المحتوى هنا */}
    </div>
  )
}
```

### 2. إضافة الصفحة للقائمة
```tsx
// lib/menu-config.ts
import { MyIcon } from 'lucide-react'

export const menuItems = [
  // ... العناصر الموجودة
  {
    id: 'my-page',
    label: 'صفحتي الجديدة',
    icon: MyIcon,
    href: '/my-page',  // يطابق اسم المجلد
  },
]
```

---

## 🎨 استخدام الـ Theme

### الحصول على الـ Theme
```tsx
'use client'

import { useTheme } from '@/lib/theme'

export default function MyComponent() {
  const { theme, isDark, toggleTheme, changePalette } = useTheme()
  
  return (
    <div style={{ 
      backgroundColor: theme.colors.bgPrimary,
      color: theme.colors.textPrimary 
    }}>
      {/* أو استخدم Tailwind classes */}
      <div className="bg-bg-primary text-text-primary">
        المحتوى
      </div>
    </div>
  )
}
```

---

## 🚫 قواعد إلزامية

### ❌ ممنوع منعاً باتاً
1. **استخدام ألوان ثابتة** (hex/rgb) في الـ components
2. **استخدام `localStorage` داخل artifacts** (React فقط)
3. **تجاهل الـ RTL direction** - كل النصوص بالعربية
4. **Hydration errors** - استخدم `mounted` state للقيم الديناميكية

### ✅ يجب دائماً
1. **استخدام CSS Variables** لكل الألوان
2. **'use client'** للمكونات التفاعلية
3. **suppressHydrationWarning** للعناصر المعتمدة على theme
4. **Tailwind classes** للتنسيق (bg-bg-primary, text-text-primary)
5. **TypeScript Types** - استورد من `@/types`

---

## 📦 المكونات الأساسية

### Button
```tsx
<button className="px-4 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition-all duration-300">
  زر
</button>
```

### Card
```tsx
<div className="bg-bg-secondary border border-border rounded-xl p-4">
  محتوى الكارت
</div>
```

### Input
```tsx
<input 
  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:border-primary focus:outline-none"
  placeholder="أدخل النص..."
/>
```

---

## 🔧 Troubleshooting

### مشكلة: الألوان لا تتغير
**الحل:** تأكد من استخدام CSS Variables وليس ألوان ثابتة

### مشكلة: Hydration Error
**الحل:** استخدم `mounted` state:
```tsx
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])

if (!mounted) return null // أو عرض placeholder
```

### مشكلة: Flash على الـ refresh
**الحل:** تأكد من وجود inline script في `layout.tsx`

---

## 📞 الاتصال بالـ API

### استخدم fetch مع error handling
```tsx
try {
  const response = await fetch('/api/endpoint')
  if (!response.ok) throw new Error('فشل الطلب')
  const data = await response.json()
  // معالجة البيانات
} catch (error) {
  console.error('خطأ:', error)
  // عرض رسالة للمستخدم
}
```

---

## 🎯 Best Practices

1. **تسمية واضحة** بالعربية للمتغيرات المهمة
2. **استخدم TypeScript** - لا تستخدم `any`
3. **تجنب التكرار** - استخدم components قابلة لإعادة الاستخدام
4. **Accessibility** - استخدم `aria-label` للعناصر التفاعلية
5. **Performance** - استخدم `useMemo` و `useCallback` عند الحاجة

---

## 📚 الأدوات المتاحة

- **React 18+** (Client Components)
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** (مع Custom Classes)
- **Lucide React** (Icons)
- **CSS Variables** (Dynamic Theming)

---

## ⚡ مثال كامل: صفحة جديدة

```tsx
// app/(shop)/products/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Package } from 'lucide-react'
import { useTheme } from '@/lib/theme'

export default function ProductsPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState([])

  useEffect(() => {
    setMounted(true)
    // جلب البيانات
  }, [])

  if (!mounted) return null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Package className="text-primary" size={32} />
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            المنتجات
          </h1>
          <p className="text-sm text-text-secondary">
            إدارة منتجات المحل
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(product => (
          <div 
            key={product.id}
            className="bg-bg-secondary border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-300"
          >
            <h3 className="font-bold text-text-primary">
              {product.name}
            </h3>
            <p className="text-sm text-text-secondary mt-2">
              {product.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🎓 خلاصة

**احفظ هذه القواعد:**
1. ✅ استخدم CSS Variables دائماً
2. ✅ Tailwind Custom Classes للألوان
3. ✅ 'use client' للتفاعلية
4. ✅ mounted state لتجنب Hydration
5. ✅ TypeScript + Types
6. ❌ لا ألوان ثابتة
7. ❌ لا localStorage في artifacts
8. ❌ لا Hydration errors

**كل شيء يجب أن يدعم Dark Mode تلقائياً بفضل CSS Variables! 🎨**








# AI Assistant Instructions - Supabase Integration (Core Entities)
## Multi-Tenant SaaS - Phase 1A & 1B

---

## Critical Context

**Your Architecture:**
- Multi-Tenant SaaS (Users manage stores with subscriptions)
- Supabase Auth enabled
- RLS policies configured in Supabase Dashboard
- Supabase Setup: Client + Server with API (Already configured)
- Objective: Core Entities with proper tenant isolation

**This Document:**
- ONLY tables/types that exist in your schema
- NO hypothetical fields
- Phase 1A (Auth) + Phase 1B (Master Data)

---
**Critical Rules for Multi-Tenant:**

- EVERY query must filter by storeid (tenant isolation via RLS)
- EVERY table must have storeid uuid NOT NULL foreign key
- NEVER insert without storeid - RLS will block it
- Auth user → Get their default store from users table
- Subscription check before operations (postponed for Phase 2)

---
## Exact Tables & Types from Your Schema

### Database Tables (from schema):
```
store
├─ store_settings
├─ users
├─ brand
├─ category
├─ supplier
├─ phone
├─ accessory
├─ customer
├─ sale
├─ sale_item
├─ purchase
├─ purchase_item
├─ payment
├─ expense
├─ return_transaction
├─ cash_movement
├─ cash_register
├─ audit_log
├─ notification
├─ stock_movement
└─ trade_transaction
```

---

## Phase 1A: Authentication & Store Setup

### Table 1: **store**

#### Schema Columns:
```typescript
id: uuid (PRIMARY KEY)
name: string
address: text
phone: string
plan: 'free' | 'paid'
startdate: timestamp
enddate: timestamp | null
active: boolean
createdat: timestamp
```

#### TypeScript Type:
```typescript
export type Store = {
  id: string
  name: string
  address: string | null
  phone: string | null
  plan: 'free' | 'paid'
  startdate: Date
  enddate: Date | null
  active: boolean
  createdat: Date
}
```

#### DB Layer Priority:
```
getStoreById(storeid: string): Promise<Store>
```

---

### Table 2: **store_settings**

#### Schema Columns:
```typescript
storeid: uuid (PRIMARY KEY & FOREIGN KEY → store.id)
invoice_footer: text
receipt_footer: text
phone: string
tax_number: string | null
logo_url: text | null
currency: 'DZD' | 'EUR' | 'USD' | 'SAR' | 'AED'
locale: 'ar-DZ' | 'fr-DZ' | 'en-US'
print_logo: boolean
print_qr: boolean
auto_print_invoice: boolean
notify_low_stock: boolean
notify_warranty_expiry: boolean
notify_daily_report: boolean
createdat: timestamp
updatedat: timestamp
deleted_at: timestamp | null
```

#### TypeScript Type:
```typescript
export type StoreSettings = {
  storeid: string
  invoice_footer: string
  receipt_footer: string
  phone: string
  tax_number: string | null
  logo_url: string | null
  currency: 'DZD' | 'EUR' | 'USD' | 'SAR' | 'AED'
  locale: 'ar-DZ' | 'fr-DZ' | 'en-US'
  print_logo: boolean
  print_qr: boolean
  auto_print_invoice: boolean
  notify_low_stock: boolean
  notify_warranty_expiry: boolean
  notify_daily_report: boolean
  createdat: Date
  updatedat: Date
  deleted_at: Date | null
}
```

#### DB Layer Priority:
```
getStoreSettings(storeid: string): Promise<StoreSettings>
updateStoreSettings(storeid: string, updates: Partial<StoreSettings>): Promise<StoreSettings>
```

---

### Table 3: **users**

#### Schema Columns:
```typescript
id: uuid (PRIMARY KEY)
storeid: uuid (FOREIGN KEY → store.id)
fullname: string
phone: string
role: 'owner' | 'manager' | 'seller' | 'accountant'
passwordhash: text
active: boolean
lastloginat: timestamp | null
createdat: timestamp
updatedat: timestamp
deleted_at: timestamp | null
```

#### TypeScript Type:
```typescript
export type User = {
  id: string
  storeid: string | null
  fullname: string
  phone: string
  role: 'owner' | 'manager' | 'seller' | 'accountant'
  passwordhash: string
  active: boolean
  lastloginat: Date | null
  createdat: Date
  updatedat: Date
  deleted_at: Date | null
}

export type UserProfile = Omit<User, 'passwordhash'>
```

#### DB Layer Priority:
```
getCurrentUser(): Promise<UserProfile | null>
getUsersByStore(storeid: string): Promise<UserProfile[]>
getUserById(userId: string): Promise<UserProfile>
updateUserRole(userId: string, role: User['role']): Promise<UserProfile>
deleteUser(userId: string): Promise<void>
```

---

## Phase 1B: Master Data (No Dependencies except storeid)

### Table 4: **brand**

#### Schema Columns:
```typescript
id: uuid (PRIMARY KEY)
storeid: uuid (FOREIGN KEY → store.id, NOT NULL)
name: string
createdat: timestamp
deleted_at: timestamp | null
```

#### TypeScript Type:
```typescript
export type Brand = {
  id: string
  storeid: string
  name: string
  createdat: Date
  deleted_at: Date | null
}
```

#### DB Layer Priority:
```
getBrandsByStore(storeid: string): Promise<Brand[]>
getBrandById(brandId: string): Promise<Brand>
insertBrand(storeid: string, name: string): Promise<Brand>
updateBrand(brandId: string, name: string): Promise<Brand>
deleteBrand(brandId: string): Promise<void>
```

---

### Table 5: **category**

#### Schema Columns:
```typescript
id: uuid (PRIMARY KEY)
storeid: uuid (FOREIGN KEY → store.id, NOT NULL)
name: string
createdat: timestamp
deleted_at: timestamp | null
```

#### TypeScript Type:
```typescript
export type Category = {
  id: string
  storeid: string
  name: string
  createdat: Date
  deleted_at: Date | null
}
```

#### DB Layer Priority:
```
getCategoriesByStore(storeid: string): Promise<Category[]>
getCategoryById(categoryId: string): Promise<Category>
insertCategory(storeid: string, name: string): Promise<Category>
updateCategory(categoryId: string, name: string): Promise<Category>
deleteCategory(categoryId: string): Promise<void>
```

---

### Table 6: **supplier**

#### Schema Columns:
```typescript
id: uuid (PRIMARY KEY)
storeid: uuid (FOREIGN KEY → store.id, NOT NULL)
name: string
contact_person: string | null
phone: string | null
email: string | null
address: text | null
notes: text | null
active: boolean
createdat: timestamp
updatedat: timestamp
deleted_at: timestamp | null
```

#### TypeScript Type:
```typescript
export type Supplier = {
  id: string
  storeid: string
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  active: boolean
  createdat: Date
  updatedat: Date
  deleted_at: Date | null
}
```

#### DB Layer Priority:
```
getSuppliersByStore(storeid: string): Promise<Supplier[]>
getSupplierById(supplierId: string): Promise<Supplier>
insertSupplier(storeid: string, data: Omit<Supplier, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>): Promise<Supplier>
updateSupplier(supplierId: string, data: Partial<Supplier>): Promise<Supplier>
deleteSupplier(supplierId: string): Promise<void>
```

---
1. Get Current User
What it does: Fetch authenticated user from Supabase Auth
DB Layer: lib/db/auth.ts
- getCurrentUser() → Returns auth.user with store association
- useAuth hook (ONLY exception to no-hooks rule) - lightweight wrapper

Why first:
- Every operation needs to know WHO and WHICH STORE
- Foundation for RLS policies
```

#### 2. **Store & Store Settings**
```
What it does: Manage store profiles and configuration
DB Layer: lib/db/stores.ts
- getStoreById(storeid)
- getStoreSettings(storeid)
- updateStoreSettings(storeid, settings)

Actions Layer: lib/actions/stores.ts
- updateStoreAction(formData)

Why second:
- Store is the tenant
- Settings are SaaS-specific (subscription tier, features)
- Users belong to stores
```

#### 3. **Users Management**
```
What it does: Manage store users/employees
DB Layer: lib/db/users.ts
- getUsersByStore(storeid)
- getUserById(userId)
- updateUserRole(userId, role)
- deleteUser(userId) [soft delete]

Actions Layer: lib/actions/users.ts
- inviteUserAction(email, role, storeid)
- updateUserRoleAction(userId, role)

Important:
- Only owner can invite users
- Role-based (owner, manager, seller, accountant)
- Link to auth.users via email
- RLS: Users can only see their store's users
```

---

## Phase 1B: Master Data (Dependencies)

After Auth setup, proceed with master data (can happen in parallel):

#### 4. **Brand**
```
What it does: Phone/Accessory brands
DB Layer: lib/db/brands.ts
- getBrandsByStore(storeid)
- getBrandById(brandId)
- insertBrand(storeid, name)
- updateBrand(brandId, name)
- deleteBrand(brandId)

RLS Rule:
- SELECT/INSERT/UPDATE/DELETE WHERE storeid = auth.user_id (via users table)

Why:
- Simple, no dependencies except storeid
- Referenced by Phone and Accessory
- Good testing ground for RLS
```

#### 5. **Category**
```
Same pattern as Brand
DB Layer: lib/db/categories.ts
- CRUD for Accessory categories
- Filter by storeid
```

#### 6. **Supplier**
```
Same pattern
DB Layer: lib/db/suppliers.ts
- Keep simple: name, phone, contact, address
- No complex logic yet
## RLS Policies Required

### For Every Table in Phase 1B (brand, category, supplier):

```sql
-- SELECT Policy
CREATE POLICY "Users can view their store data"
ON brand -- (replace with table name)
FOR SELECT
USING (
  storeid IN (
    SELECT storeid FROM public.users 
    WHERE id = auth.uid() 
      AND deleted_at IS NULL
  )
);

-- INSERT Policy
CREATE POLICY "Users can insert in their store"
ON brand
FOR INSERT
WITH CHECK (
  storeid IN (
    SELECT storeid FROM public.users 
    WHERE id = auth.uid() 
      AND deleted_at IS NULL
  )
);

-- UPDATE Policy
CREATE POLICY "Users can update their store data"
ON brand
FOR UPDATE
USING (
  storeid IN (
    SELECT storeid FROM public.users 
    WHERE id = auth.uid() 
      AND deleted_at IS NULL
  )
)
WITH CHECK (
  storeid IN (
    SELECT storeid FROM public.users 
    WHERE id = auth.uid() 
      AND deleted_at IS NULL
  )
);

-- DELETE Policy
CREATE POLICY "Users can soft-delete in their store"
ON brand
FOR DELETE
USING (
  storeid IN (
    SELECT storeid FROM public.users 
    WHERE id = auth.uid() 
      AND deleted_at IS NULL
  )
);
```

---

## File Structure

```
lib/
├─ supabase/
│  ├─ client.ts (already done)
│  └─ server.ts (already done)
├─ db/
│  ├─ auth.ts (Phase 1A)
│  ├─ stores.ts (Phase 1A)
│  ├─ users.ts (Phase 1A)
│  ├─ brands.ts (Phase 1B)
│  ├─ categories.ts (Phase 1B)
│  └─ suppliers.ts (Phase 1B)
├─ actions/
│  ├─ auth.ts (Phase 1A)
│  ├─ stores.ts (Phase 1A)
│  ├─ users.ts (Phase 1A)
│  ├─ brands.ts (Phase 1B)
│  ├─ categories.ts (Phase 1B)
│  └─ suppliers.ts (Phase 1B)
└─ types/
   └─ index.ts (all TypeScript types)
```

---

Code Structure Template
lib/db/brands.ts (Example)
typescript// DB Layer - Query only, no business logic

import { createClient } from '@/lib/supabase/server'
import { Brand } from '@/types'

export async function getBrandsByStore(storeid: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('brand')
    .select('*')
    .eq('storeid', storeid)
    .is('deleted_at', null)
  
  if (error) throw error
  return data as Brand[]
}

export async function insertBrand(storeid: string, name: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('brand')
    .insert([{ storeid, name }])
    .select()
  
  if (error) throw error
  return data[0]
}

// ... getById, update, delete
lib/actions/brands.ts (Example)
typescript'use server'

import { revalidatePath } from 'next/cache'
import * as db from '@/lib/db/brands'
import { getCurrentUser } from '@/lib/db/auth'

export async function createBrandAction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user?.store_id) throw new Error('No store access')
    
    const name = formData.get('name') as string
    
    const brand = await db.insertBrand(user.store_id, name)
    
    revalidatePath('/admin/brands')
    return { success: true, data: brand }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

---

## Why This Order Matters
```
Auth Setup
    ↓
Store (tenant container)
    ↓
Users (who accesses what)
    ↓
Master Data (Brand, Category, Supplier)
    ↓
[ONLY THEN] Inventory Phase (Phase 2)
    ↓
Transactions Phase


## Critical Rules for This Phase

1. **EVERY query filters by storeid** - Non-negotiable
2. **No business logic in DB layer** - Just queries
3. **No validation yet** - Will add in Phase 2
4. **Soft deletes only** - Set deleted_at, don't actually delete
5. **getCurrentUser() is crucial** - All operations depend on it
6. **RLS policies must match** - DB layer logic + RLS = belt and suspenders

---

## Verification Checklist

- [ ] Auth user can only see their store
- [ ] Auth user can only see their store's brands
- [ ] Creating brand without storeid fails (RLS blocks)
- [ ] Creating brand in another's store fails (RLS blocks)
- [ ] Soft delete works (deleted_at set, record still in DB)
- [ ] updatedat updated on every change (trigger works)
- [ ] audit_log records every action (if triggers enabled)

---

## What NOT in Phase 1

❌ Phone table (Phase 2)
❌ Accessory table (Phase 2)
❌ Customer table (Phase 2)
❌ Sale, Purchase, Payment (Phase 2)
❌ Inventory calculations (Phase 2)
❌ Subscription checks (Phase 2)
❌ Email notifications (Phase 3)
❌ Complex validations (Phase 2)

---

## When You're Ready

Tell me:
1. Ready for Phase 1A complete code?
2. Ready for Phase 1B complete code?
3. Need RLS policy SQL to copy-paste?
4. Need example component for testing?