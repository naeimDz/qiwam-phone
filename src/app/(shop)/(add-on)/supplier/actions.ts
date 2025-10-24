// app/(dashboard)/admin/suppliers/actions.ts
'use server'

import * as supActions from '@/lib/actions/suppliers' 

/**
 * Wrapper: create supplier from form
 */
export async function createSupplierFormAction(formData: FormData) {
  // forward to your existing server action
  const result = await supActions.createSupplierAction(formData)
  // revalidate already done inside your action, but double-safety (optional)
  // revalidatePath('/admin/suppliers')
  return result
}

/**
 * Wrapper: update supplier from form
 * expects a hidden input named 'supplierId' in the form
 */
export async function updateSupplierFormAction(formData: FormData) {
  const supplierId = formData.get('supplierId') as string | null
  if (!supplierId) {
    return { success: false, error: 'supplierId missing' }
  }
  const result = await supActions.updateSupplierAction(supplierId, formData)
  return result
}

/**
 * Wrapper: delete supplier (soft delete)
 * expects hidden 'supplierId'
 */
export async function deleteSupplierFormAction(formData: FormData) {
  const supplierId = formData.get('supplierId') as string | null
  if (!supplierId) {
    return { success: false, error: 'supplierId missing' }
  }
  const result = await supActions.deleteSupplierAction(supplierId)
  return result
}

/**
 * Wrapper: toggle active
 * expects 'supplierId' and 'active' ('true'|'false')
 */
export async function toggleSupplierActiveFormAction(formData: FormData) {
  const supplierId = formData.get('supplierId') as string | null
  const activeRaw = formData.get('active') as string | null
  if (!supplierId || activeRaw === null) {
    return { success: false, error: 'invalid payload' }
  }
  const active = activeRaw === 'true'
  const result = await supActions.toggleSupplierActiveAction(supplierId, active)
  return result
}
