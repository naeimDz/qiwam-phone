import { Suspense } from 'react'
import { getAccessoriesAction } from '@/lib/actions/accessories'
import { getPhonesAction } from '@/lib/actions/phones'
import { getCategoriesAction } from '@/lib/actions/categories'
import { getBrandsAction } from '@/lib/actions/brands'
import { getSuppliersAction } from '@/lib/actions/suppliers'
import { getAccessoriesInventoryStatsAction } from '@/lib/actions/accessories'
import { getPhonesStatsAction } from '@/lib/actions/phones'

import { InventoryErrorBoundary, InventoryLoadingSkeleton } from './InventoryLoadingSkeleton'
import { InventoryClient } from './InventoryClient'

/**
 * 📦 صفحة المخزون الرئيسية
 * 
 * المسؤولية:
 * 1. جلب كل البيانات المطلوبة بالتوازي
 * 2. معالجة الأخطاء والحالات الخاصة
 * 3. تمرير البيانات للـ Client Component
 * 
 * الهدف: "30 ثانية" = تحميل سريع + رؤية شاملة
 */

export const metadata = {
  title: '📦 المخزون | إدارة المحل',
  description: 'إدارة الهواتف والإكسسوارات والمخزون',
}

export default async function InventoryPage() {
  try {
    // 🚀 جلب كل البيانات بالتوازي
    const [
      accessoriesRes,
      phonesRes,
      categoriesRes,
      brandsRes,
      suppliersRes,
      accessoriesStatsRes,
      phonesStatsRes,
    ] = await Promise.all([
      getAccessoriesAction(false), // false = تشمل الغير نشطة أيضاً
      getPhonesAction(),
      getCategoriesAction(),
      getBrandsAction(),
      getSuppliersAction(),
      getAccessoriesInventoryStatsAction(),
      getPhonesStatsAction(),
    ])

    // 🔴 معالجة الأخطاء الحرجة (Must-have data)
    const criticalErrors = []

    if (!categoriesRes.success) criticalErrors.push(`الفئات: ${categoriesRes.error}`)
    if (!brandsRes.success) criticalErrors.push(`العلامات: ${brandsRes.error}`)
    if (!suppliersRes.success) criticalErrors.push(`الموردين: ${suppliersRes.error}`)

    if (criticalErrors.length > 0) {
      return (
        <h1>
          ⚠️ فشل في تحميل البيانات الضرورية:
        </h1>
      )
    }

    // 🟡 تحذيرات (Non-critical errors - البيانات قد تكون فارغة)
    const warnings = []

    if (!accessoriesRes.success) {
      warnings.push(`الإكسسوارات: ${accessoriesRes.error}`)
    }

    if (!phonesRes.success) {
      warnings.push(`الهواتف: ${phonesRes.error}`)
    }

    if (!accessoriesStatsRes.success) {
      warnings.push(`إحصائيات الإكسسوارات: ${accessoriesStatsRes.error}`)
    }

    if (!phonesStatsRes.success) {
      warnings.push(`إحصائيات الهواتف: ${phonesStatsRes.error}`)
    }

    // 🟢 البيانات النهائية (مع fallback)
    const accessories = accessoriesRes.success ? accessoriesRes.data : []
    const phones = phonesRes.success ? phonesRes.data : []
    const categories = categoriesRes.success ? categoriesRes.data : []
    const brands = brandsRes.success ? brandsRes.data : []
    const suppliers = suppliersRes.success ? suppliersRes.data : []
    const accessoriesStats = accessoriesStatsRes.success ? accessoriesStatsRes.data : null
    const phonesStats = phonesStatsRes.success ? phonesStatsRes.data : null

    // 📊 حساب الإحصائيات السريعة
    const stats = {
      totalPhones: phones.length,
      totalAccessories: accessories.length,
      accessories: accessoriesStats,
      phones: phonesStats,
      totalValue: {
        phones: phones.reduce((sum, p) => sum + (p.buyprice || 0), 0),
        accessories: accessories.reduce((sum, a) => sum + (a.quantity * a.buyprice), 0),
      },
    }

    // 🎯 Case: لا توجد بيانات على الإطلاق
    if (accessories.length === 0 && phones.length === 0) {
      return (
        <h1>
          "لا توجد منتجات في المخزون حالياً. ابدأ بإضافة هاتف أو إكسسوار."
        </h1>
      )
    }

    // ✅ العرض الطبيعي
    return (
      <Suspense fallback={<InventoryLoadingSkeleton />}>
        <InventoryClient
          accessories={accessories}
          phones={phones}
          categories={categories}
          brands={brands}
          suppliers={suppliers}
          stats={stats}
          warnings={warnings}
        />
      </Suspense>
    )
  } catch (error) {
    console.error('[InventoryPage] Error:', error)

    return (
      <InventoryErrorBoundary
        errors={['خطأ غير متوقع في تحميل المخزون. يرجى المحاولة لاحقاً.']}
        isCritical={true}
      />
    )
  }
}