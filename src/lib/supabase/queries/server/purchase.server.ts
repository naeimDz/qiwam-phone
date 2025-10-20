// ============================================
// lib/supabase/services/purchase.server.ts
// ✅ استخدم هذا في: Server Components, API Routes, Server Actions
// ============================================

import { createClientServer } from "../../supabaseServer"


export interface PurchaseItem {
  id: string
  purchaseid: string
  item_type: 'phone' | 'accessory'
  phone_id?: string
  accessory_id?: string
  qty: number
  unitprice: number
  linetotal: number
  createdat: string
}

export interface Purchase {
  id: string
  storeid: string
  supplierid: string | null
  docnumber: string | null
  docdate: string
  total: number
  paidamount: number
  remainingamount: number
  status: 'draft' | 'posted' | 'cancelled'
  notes: string | null
  createdbyid: string | null
  modifiedbyid: string | null
  createdat: string
  updatedat: string
  deleted_at: string | null
}

export interface CreatePurchaseDto {
  storeid: string
  supplierid: string | null
  docnumber: string
  docdate: string
  items: Array<{
    item_type: 'phone' | 'accessory'
    phone_id?: string
    accessory_id?: string
    qty: number
    unitprice: number
  }>
  notes?: string
}

export interface PurchasePaymentDto {
  purchase_id: string
  amount: number
  method: 'cash' | 'bank' | 'check' | 'transfer'
  reference?: string
}

/**
 * جلب قائمة المشتريات
 * - استخدم في Server Components أو API Routes
 * - RLS يفلتر تلقائياً حسب storeid
 */
export async function getPurchases(storeId: string, limit = 20, offset = 0) {
  const supabase = await createClientServer()

  const { data, error, count } = await supabase
    .from('v_purchase_summary')
    .select('*', { count: 'exact' })
    .eq('storeid', storeId)
    .order('docdate', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(`Failed to fetch purchases: ${error.message}`)
  return { data, total: count || 0 }
}

/**
 * جلب تفاصيل فاتورة واحدة مع العناصر والدفعات
 */
export async function getPurchaseDetail(purchaseId: string) {
  const supabase = await createClientServer()

  try {
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchase')
      .select('*')
      .eq('id', purchaseId)
      .single()

    if (purchaseError) throw new Error(`Purchase not found: ${purchaseError.message}`)

    const { data: items, error: itemsError } = await supabase
      .from('purchase_item')
      .select('*')
      .eq('purchaseid', purchaseId)

    if (itemsError) throw new Error(`Failed to fetch items: ${itemsError.message}`)

    const { data: payments, error: paymentsError } = await supabase
      .from('payment')
      .select('*')
      .eq('purchase_id', purchaseId)
      .order('createdat', { ascending: false })

    if (paymentsError) throw new Error(`Failed to fetch payments: ${paymentsError.message}`)

    return { purchase, items, payments }
  } catch (error) {
    throw new Error(`Failed to get purchase detail: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * إنشاء فاتورة شراء جديدة
 * - createdbyid يأخذ من session تلقائياً
 * - triggers تحدث total والمخزون
 */
export async function createPurchase(
  dto: CreatePurchaseDto & { storeId: string }
) {
  const supabase = await createClientServer()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) throw new Error('Not authenticated')

  try {
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchase')
      .insert({
        storeid: dto.storeId,
        supplierid: dto.supplierid,
        docnumber: dto.docnumber,
        docdate: dto.docdate,
        total: 0,
        paidamount: 0,
        status: 'draft',
        notes: dto.notes || null,
        createdbyid: user.id,
      })
      .select()
      .single()

    if (purchaseError) throw purchaseError

    const itemsToInsert = dto.items.map(item => ({
      purchaseid: purchase.id,
      item_type: item.item_type,
      phone_id: item.phone_id || null,
      accessory_id: item.accessory_id || null,
      qty: item.qty,
      unitprice: item.unitprice,
    }))

    const { error: itemsError } = await supabase
      .from('purchase_item')
      .insert(itemsToInsert)

    if (itemsError) throw itemsError

    const { data: updatedPurchase, error: fetchError } = await supabase
      .from('purchase')
      .select('*')
      .eq('id', purchase.id)
      .single()

    if (fetchError) throw fetchError

    return updatedPurchase
  } catch (error) {
    throw new Error(`Failed to create purchase: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * نشر الفاتورة (Draft → Posted)
 */
export async function postPurchase(purchaseId: string, storeId: string) {
  const supabase = await createClientServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('purchase')
    .update({
      status: 'posted',
      modifiedbyid: user.id,
    })
    .eq('id', purchaseId)
    .eq('storeid', storeId)
    .eq('status', 'draft')
    .select()
    .single()

  if (error) throw new Error(`Failed to post purchase: ${error.message}`)
  return data
}

/**
 * تسجيل دفعة على فاتورة
 * - trigger يحدث paidamount تلقائياً
 */
export async function recordPurchasePayment(
  dto: PurchasePaymentDto & { storeId: string }
) {
  const supabase = await createClientServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: purchase } = await supabase
    .from('purchase')
    .select('id')
    .eq('id', dto.purchase_id)
    .eq('storeid', dto.storeId)
    .single()

  if (!purchase) throw new Error('Purchase not found or access denied')

  const { data: payment, error } = await supabase
    .from('payment')
    .insert({
      purchase_id: dto.purchase_id,
      storeid: dto.storeId,
      amount: dto.amount,
      method: dto.method,
      reference: dto.reference || null,
      direction: 'out',
      createdbyid: user.id,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to record payment: ${error.message}`)
  return payment
}

/**
 * إلغاء فاتورة
 */
export async function cancelPurchase(purchaseId: string, storeId: string) {
  const supabase = await createClientServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('purchase')
    .update({
      deleted_at: new Date().toISOString(),
      modifiedbyid: user.id,
    })
    .eq('id', purchaseId)
    .eq('storeid', storeId)
    .select()
    .single()

  if (error) throw new Error(`Failed to cancel purchase: ${error.message}`)
  return data
}

/**
 * جلب ديون المورد
 */
export async function getSupplierDebts(storeId: string, supplierId: string) {
  const supabase = await createClientServer()

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