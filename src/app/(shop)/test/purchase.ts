// app/actions/purchase.ts
'use server'

import { createPurchase, recordPurchasePayment } from "@/lib/supabase/queries/server/purchase.server"


/**
 * Server Action لإنشاء فاتورة
 * استدعها من Client Component
 */
export async function handleCreatePurchase(data: {
  storeId: string
  docnumber: string
  supplierid: string
  docdate: string
  items: Array<{
    item_type: 'phone' | 'accessory'
    phone_id?: string
    accessory_id?: string
    qty: number
    unitprice: number
  }>
  notes?: string
}) {
  try {
    const purchase = await createPurchase({
      storeid: data.storeId,
      supplierid: data.supplierid,
      docnumber: data.docnumber,
      docdate: data.docdate,
      items: data.items,
      notes: data.notes,
      storeId: data.storeId,
    })

    return { success: true, data: purchase }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ',
    }
  }
}

/**
 * Server Action لتسجيل دفعة
 */
export async function handleRecordPayment(data: {
  storeId: string
  purchase_id: string
  amount: number
  method: 'cash' | 'bank' | 'check' | 'transfer'
  reference?: string
}) {
  try {
    const payment = await recordPurchasePayment({
      purchase_id: data.purchase_id,
      amount: data.amount,
      method: data.method,
      reference: data.reference,
      storeId: data.storeId,
    })

    return { success: true, data: payment }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ',
    }
  }
}