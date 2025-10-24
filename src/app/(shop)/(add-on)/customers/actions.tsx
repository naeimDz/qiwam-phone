// app/(dashboard)/admin/customers/actions.ts
'use server'

import * as custActions from '@/lib/actions/customers'

/**
 * Wrapper: create customer from form
 */
export async function createCustomerFormAction(formData: FormData) {
  const result = await custActions.createCustomerAction(formData)
  return result
}

/**
 * Wrapper: update customer from form
 * expects a hidden input named 'customerId' in the form
 */
export async function updateCustomerFormAction(formData: FormData) {
  const customerId = formData.get('customerId') as string | null
  if (!customerId) {
    return { success: false, error: 'customerId missing' }
  }
  const result = await custActions.updateCustomerAction(customerId, formData)
  return result
}

/**
 * Wrapper: delete customer (soft delete)
 * expects hidden 'customerId'
 */
export async function deleteCustomerFormAction(formData: FormData) {
  const customerId = formData.get('customerId') as string | null
  if (!customerId) {
    return { success: false, error: 'customerId missing' }
  }
  const result = await custActions.deleteCustomerAction(customerId)
  return result
}

/**
 * Wrapper: toggle active
 * expects 'customerId' and 'active' ('true'|'false')
 */
export async function toggleCustomerActiveFormAction(formData: FormData) {
  const customerId = formData.get('customerId') as string | null
  const activeRaw = formData.get('active') as string | null
  if (!customerId || activeRaw === null) {
    return { success: false, error: 'invalid payload' }
  }
  const active = activeRaw === 'true'
  const result = await custActions.toggleCustomerActiveAction(customerId, active)
  return result
}