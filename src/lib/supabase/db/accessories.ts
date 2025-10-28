// lib/supabase/db/accessories.ts
// DB Layer - Accessory inventory queries with detailed error handling

import { createClientServer } from '@/lib/supabase'
import { Accessory, AccessoryWithDetails } from '@/lib/types'

type AccessoryInsert = Omit<Accessory, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>
type AccessoryUpdate = Partial<Omit<Accessory, 'id' | 'storeid' | 'createdat' | 'updatedat' | 'deleted_at'>>

// Error logging utility
interface ErrorLog {
  timestamp: string
  function: string
  error: any
  context?: Record<string, any>
}

const logError = (functionName: string, error: any, context?: Record<string, any>) => {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    function: functionName,
    error: {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      status: error?.status
    },
    context
  }
  console.error(`[${functionName}]`, errorLog)
  return errorLog
}

/**
 * Get all accessories for a store
 */
export async function getAccessoriesByStore(
  storeid: string,
  activeOnly: boolean = false
): Promise<AccessoryWithDetails[]> {
  const functionName = 'getAccessoriesByStore'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: جلب الإكسسوارات للمتجر ${storeid}`, { activeOnly })
    
    const supabase = await createClientServer()
    
    let query = supabase
      .from('accessory')
      .select(`
        *,
        brand:brandid(name),
        category:categoryid(name),
        supplier:supplierid(name)
      `)
      .eq('storeid', storeid)
      .is('deleted_at', null)

    if (activeOnly) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.order('name', { ascending: true })

    if (error) {
      logError(functionName, error, { storeid, activeOnly })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات`)
      return []
    }

    const result = data.map(a => ({
      ...a,
      brand_name: a.brand?.name || null,
      category_name: a.category?.name || null,
      supplier_name: a.supplier?.name || null,
      is_low_stock: (a.quantity || 0) <= (a.minqty || 0)
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} إكسسوار`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid, activeOnly })
    throw new Error(`فشل في جلب الإكسسوارات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get accessories with stock available (quantity > 0)
 */
export async function getAccessoriesInStock(storeid: string): Promise<AccessoryWithDetails[]> {
  const functionName = 'getAccessoriesInStock'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: جلب الإكسسوارات المتاحة في المخزون`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('accessory')
      .select(`
        *,
        brand:brandid(name),
        category:categoryid(name),
        supplier:supplierid(name)
      `)
      .eq('storeid', storeid)
      .eq('active', true)
      .gt('quantity', 0)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات`)
      return []
    }

    const result = data.map(a => ({
      ...a,
      brand_name: a.brand?.name || null,
      category_name: a.category?.name || null,
      supplier_name: a.supplier?.name || null,
      is_low_stock: (a.quantity || 0) <= (a.minqty || 0)
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} إكسسوار متاح`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب الإكسسوارات المتاحة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get accessory by ID
 */
export async function getAccessoryById(accessoryId: string): Promise<AccessoryWithDetails | null> {
  const functionName = 'getAccessoryById'
  
  try {
    if (!accessoryId) throw new Error('accessoryId مطلوب')

    console.log(`[${functionName}] البدء: جلب الإكسسوار ${accessoryId}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('accessory')
      .select(`
        *,
        brand:brandid(name),
        category:categoryid(name),
        supplier:supplierid(name)
      `)
      .eq('id', accessoryId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] الإكسسوار غير موجود`)
        return null
      }
      logError(functionName, error, { accessoryId })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] بيانات الإكسسوار فارغة`)
      return null
    }

    const result = {
      ...data,
      brand_name: data.brand?.name || null,
      category_name: data.category?.name || null,
      supplier_name: data.supplier?.name || null,
      is_low_stock: (data.quantity || 0) <= (data.minqty || 0)
    }

    console.log(`[${functionName}] تم بنجاح`)
    return result
  } catch (error: any) {
    logError(functionName, error, { accessoryId })
    throw new Error(`فشل في جلب الإكسسوار: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get accessories with low stock (quantity <= minqty)
 */
export async function getAccessoriesLowStock(storeid: string): Promise<AccessoryWithDetails[]> {
  const functionName = 'getAccessoriesLowStock'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: جلب الإكسسوارات منخفضة المخزون`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('accessory')
      .select(`
        *,
        brand:brandid(name),
        category:categoryid(name),
        supplier:supplierid(name)
      `)
      .eq('storeid', storeid)
      .eq('active', true)
      .is('deleted_at', null)

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات`)
      return []
    }

    const lowStock = data.filter(a => (a.quantity || 0) <= (a.minqty || 0))
    
    const result = lowStock.map(a => ({
      ...a,
      brand_name: a.brand?.name || null,
      category_name: a.category?.name || null,
      supplier_name: a.supplier?.name || null,
      is_low_stock: true
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} إكسسوار منخفض المخزون`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب الإكسسوارات منخفضة المخزون: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Insert new accessory
 * Triggers: تحديث audit_log و stock_movement (إذا لزم الأمر)
 */
export async function insertAccessory(data: AccessoryInsert): Promise<Accessory> {
  const functionName = 'insertAccessory'
  
  try {
    if (!data.storeid) throw new Error('storeid مطلوب')
    if (!data.name) throw new Error('الاسم مطلوب')
    if (data.quantity < 0) throw new Error('الكمية لا يمكن أن تكون سالبة')
    if (data.minqty < 0) throw new Error('الحد الأدنى لا يمكن أن يكون سالب')
    if (data.buyprice < 0) throw new Error('سعر الشراء لا يمكن أن يكون سالب')
    if (data.sellprice < 0) throw new Error('سعر البيع لا يمكن أن يكون سالب')

    console.log(`[${functionName}] البدء: إضافة إكسسوار جديد`, {
      name: data.name,
      quantity: data.quantity,
      active: data.active
    })
    
    const supabase = await createClientServer()
    
    const { data: accessory, error } = await supabase
      .from('accessory')
      .insert([{
        ...data,
        active: data.active !== false,
        quantity: data.quantity || 0,
        minqty: data.minqty || 0
      }])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { data })
      throw error
    }

    if (!accessory) {
      throw new Error('فشل في إرجاع الإكسسوار المُضاف')
    }

    console.log(`[${functionName}] تم بنجاح: الإكسسوار ${accessory.id}`)
    return accessory
  } catch (error: any) {
    logError(functionName, error, { data })
    throw new Error(`فشل في إضافة الإكسسوار: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Update accessory details (name, prices, minqty, notes, etc)
 * DO NOT update quantity here - use updateAccessoryQuantity instead
 * Triggers: تحديث audit_log عند تغيير البيانات المهمة
 */
export async function updateAccessory(accessoryId: string, updates: AccessoryUpdate): Promise<Accessory> {
  const functionName = 'updateAccessory'
  
  try {
    if (!accessoryId) throw new Error('accessoryId مطلوب')
    if (!updates || Object.keys(updates).length === 0) throw new Error('لا توجد تحديثات')

    // Validate numeric fields
    if (updates.buyprice !== undefined && updates.buyprice < 0) throw new Error('سعر الشراء لا يمكن أن يكون سالب')
    if (updates.sellprice !== undefined && updates.sellprice < 0) throw new Error('سعر البيع لا يمكن أن يكون سالب')
    if (updates.minqty !== undefined && updates.minqty < 0) throw new Error('الحد الأدنى لا يمكن أن يكون سالف')
    if (updates.quantity !== undefined) throw new Error('استخدم updateAccessoryQuantity لتحديث الكمية')

    console.log(`[${functionName}] البدء: تحديث الإكسسوار ${accessoryId}`, updates)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('accessory')
      .update({
        ...updates,
        updatedat: new Date().toISOString()
      })
      .eq('id', accessoryId)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('الإكسسوار غير موجود أو محذوف')
      }
      logError(functionName, error, { accessoryId, updates })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الإكسسوار المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { accessoryId, updates })
    throw new Error(`فشل في تحديث الإكسسوار: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Update accessory quantity (increase/decrease)
 * Triggers: تحديث stock_movement تلقائياً
 * Note: يفضل استخدام Triggers بدلاً من هذه الدالة عند البيع/الشراء
 */
export async function updateAccessoryQuantity(accessoryId: string, delta: number): Promise<Accessory> {
  const functionName = 'updateAccessoryQuantity'
  
  try {
    if (!accessoryId) throw new Error('accessoryId مطلوب')
    if (typeof delta !== 'number' || isNaN(delta)) throw new Error('الفرق يجب أن يكون رقم')

    console.log(`[${functionName}] البدء: تحديث كمية الإكسسوار ${accessoryId}`, { delta })
    
    const supabase = await createClientServer()
    
    // Get current quantity first
    const { data: current, error: fetchError } = await supabase
      .from('accessory')
      .select('quantity')
      .eq('id', accessoryId)
      .is('deleted_at', null)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new Error('الإكسسوار غير موجود أو محذوف')
      }
      logError(`${functionName}::fetch`, fetchError, { accessoryId })
      throw fetchError
    }

    const newQuantity = (current?.quantity || 0) + delta
    
    if (newQuantity < 0) {
      throw new Error('الكمية لا يمكن أن تكون سالبة')
    }

    console.log(`[${functionName}] الكمية الحالية: ${current?.quantity}, الكمية الجديدة: ${newQuantity}`)
    
    const { data, error } = await supabase
      .from('accessory')
      .update({ 
        quantity: newQuantity,
        updatedat: new Date().toISOString()
      })
      .eq('id', accessoryId)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { accessoryId, delta })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الإكسسوار المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { accessoryId, delta })
    throw new Error(`فشل في تحديث كمية الإكسسوار: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Soft delete accessory
 */
export async function deleteAccessory(accessoryId: string): Promise<void> {
  const functionName = 'deleteAccessory'
  
  try {
    if (!accessoryId) throw new Error('accessoryId مطلوب')

    console.log(`[${functionName}] البدء: حذف الإكسسوار ${accessoryId}`)
    
    const supabase = await createClientServer()
    
    const { error } = await supabase
      .from('accessory')
      .update({ 
        deleted_at: new Date().toISOString(),
        updatedat: new Date().toISOString()
      })
      .eq('id', accessoryId)

    if (error) {
      logError(functionName, error, { accessoryId })
      throw error
    }

    console.log(`[${functionName}] تم بنجاح: الإكسسوار ${accessoryId} محذوف`)
  } catch (error: any) {
    logError(functionName, error, { accessoryId })
    throw new Error(`فشل في حذف الإكسسوار: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Check if SKU or Barcode exists
 */
export async function accessoryCodeExists(
  storeid: string,
  code: string,
  type: 'sku' | 'barcode',
  excludeId?: string
): Promise<boolean> {
  const functionName = 'accessoryCodeExists'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!code) throw new Error('الرمز مطلوب')
    if (!['sku', 'barcode'].includes(type)) throw new Error('نوع الرمز غير صحيح')

    console.log(`[${functionName}] البدء: فحص تكرار ${type} ${code}`)
    
    const supabase = await createClientServer()
    
    let query = supabase
      .from('accessory')
      .select('id', { count: 'exact', head: true })
      .eq('storeid', storeid)
      .eq(type, code)
      .is('deleted_at', null)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { error, count } = await query

    if (error) {
      logError(functionName, error, { storeid, code, type })
      throw error
    }

    const exists = (count || 0) > 0
    console.log(`[${functionName}] تم بنجاح: ${type} موجود = ${exists}`)
    return exists
  } catch (error: any) {
    logError(functionName, error, { storeid, code, type, excludeId })
    throw new Error(`فشل في فحص الرمز: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get accessories inventory value (للتقارير والتحليلات)
 */

export async function getAccessoriesInventoryValue(storeid: string) {
  const functionName = 'getAccessoriesInventoryValue'

  if (!storeid) throw new Error('storeid مطلوب')

  console.log(`[${functionName}] البدء: حساب قيمة المخزون`)

  try {
    const supabase = await createClientServer()

    const { data, error } = await supabase
       .from('accessory') 
      .select('quantity, buyprice, sellprice')
      .eq('storeid', storeid)
      .eq('active', true)
      .is('deleted_at', null)

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد بيانات`)
      return getEmptyInventoryValue()
    }

    // حساب الإحصائيات باستخدام reduce
    const stats = data.reduce(
      (acc, a) => {
        const qty = a.quantity ?? 0
        const buyPrice = a.buyprice ?? 0
        const sellPrice = a.sellprice ?? 0

        acc.total_quantity += qty
        acc.total_buy_value += qty * buyPrice
        acc.total_sell_value += qty * sellPrice
        return acc
      },
      {
        total_items: data.length,
        total_quantity: 0,
        total_buy_value: 0,
        total_sell_value: 0,
        potential_profit: 0,
      }
    )

    stats.potential_profit = stats.total_sell_value - stats.total_buy_value

    console.log(`[${functionName}] تم بنجاح: الكمية الإجمالية ${stats.total_quantity}`)
    return stats
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في حساب قيمة المخزون: ${error?.message || 'خطأ غير معروف'}`)
  }
}

function getEmptyInventoryValue() {
  return {
    total_items: 0,
    total_quantity: 0,
    total_buy_value: 0,
    total_sell_value: 0,
    potential_profit: 0,
  }
}