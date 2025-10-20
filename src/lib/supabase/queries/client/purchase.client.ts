// ============================================
// lib/supabase/services/purchase.client.ts
// ✅ استخدم هذا فقط في: Client Components ('use client')
// ❌ لا تستخدمه في Server Components أو API Routes
// ============================================

'use client'

import { createClientBrowser } from "../../supabaseClient"


/**
 * جلب المشتريات - للـ Client فقط
 * استخدم في: Client Components
 * للقراءة والبحث الفوري
 */
export async function getPurchasesClient(storeId: string, limit = 50) {
  const supabase = createClientBrowser()

  const { data, error } = await supabase
    .from('v_purchase_summary')
    .select('*')
    .eq('storeid', storeId)
    .order('docdate', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to fetch purchases: ${error.message}`)
  return data
}

/**
 * البحث عن فاتورة بـ رقم الفاتورة
 * Real-time search للـ Client
 */
export async function searchPurchasesByDocNumber(storeId: string, docnumber: string) {
  const supabase = createClientBrowser()

  const { data, error } = await supabase
    .from('v_purchase_summary')
    .select('*')
    .eq('storeid', storeId)
    .ilike('docnumber', `%${docnumber}%`)
    .limit(20)

  if (error) throw new Error(`Search failed: ${error.message}`)
  return data
}

/**
 * جلب تفاصيل فاتورة (للقراءة من Client)
 * لكن الأفضل: استخدم Server Function لأنها تحتاج 3 queries
 */
export async function getPurchaseDetailClient(purchaseId: string) {
  const supabase = createClientBrowser()

  try {
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchase')
      .select('*')
      .eq('id', purchaseId)
      .single()

    if (purchaseError) throw new Error(`Purchase not found`)

    const { data: items, error: itemsError } = await supabase
      .from('purchase_item')
      .select('*')
      .eq('purchaseid', purchaseId)

    if (itemsError) throw new Error(`Failed to fetch items`)

    const { data: payments, error: paymentsError } = await supabase
      .from('payment')
      .select('*')
      .eq('purchase_id', purchaseId)

    if (paymentsError) throw new Error(`Failed to fetch payments`)

    return { purchase, items, payments }
  } catch (error) {
    throw new Error(`Failed to get purchase detail: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * جلب أفضل الموردين
 * للقراءة من Client
 */
export async function getTopSuppliersClient(storeId: string) {
  const supabase = createClientBrowser()

  const { data, error } = await supabase
    .from('v_top_suppliers')
    .select('*')
    .eq('storeid', storeId)
    .order('total_amount', { ascending: false })

  if (error) throw new Error(`Failed to fetch suppliers: ${error.message}`)
  return data
}

/**
 * جلب إحصائيات الموردين
 * للقراءة من Client
 */
export async function getSupplierDebtsClient(storeId: string, supplierId: string) {
  const supabase = createClientBrowser()

  const { data, error } = await supabase
    .from('v_supplier_debts')
    .select('*')
    .eq('storeid', storeId)
    .eq('supplierid', supplierId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch supplier debts: ${error.message}`)
  }

  return data || null
}


