// ============================================
// 📁 lib/services/customerService.ts
// ============================================
import * as customersDb from '@/lib/supabase/db/customers'
import { ValidationError, NotFoundError } from '@/lib/errors/ActionError'
import { createCustomerSchema, updateCustomerSchema } from '@/lib/validation/customerSchema'
import { parseFormData } from '../utils'

/**
 * ✅ Business Logic Layer: كل الـ Logic في مكان واحد
 * - بدون Auth (يتم التعامل معه في الـ Wrapper)
 * - بدون revalidate (يتم التعامل معه في الـ Wrapper)
 * - بدون try-catch (يتم التعامل معه في الـ Wrapper)
 * - بدون Logging (يتم التعامل معه في الـ Wrapper)
 */
export const customerService = {
  async getAll(storeId: string, activeOnly: boolean = false) {
    return customersDb.getCustomersByStore(storeId, activeOnly)
  },

  async getOne(customerId: string, storeId?: string) {
    const customer = await customersDb.getCustomerById(customerId)
    if (!customer) {
      throw new NotFoundError('العميل')
    }
    return customer
  },

  async create(storeId: string, formData: FormData) {
    // 1. Parse FormData
    const rawData = parseFormData(formData)

    // 2. Validate with Zod
    const validation = createCustomerSchema.safeParse(rawData)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      throw new ValidationError(
        `${firstError.path.join('.')}: ${firstError.message}`
      )
    }

    const { fullname, phone, address, notes } = validation.data

    // 3. Check for duplicates (Business Logic)
    if (phone) {
      const exists = await customersDb.customerPhoneExists(storeId, phone)
      if (exists) {
        throw new ValidationError('رقم الهاتف موجود بالفعل')
      }
    }

    // 4. Insert
    return customersDb.insertCustomer({
      storeid: storeId,
      fullname,
      phone: phone || null,
      address: address || null,
      notes: notes || null,
      active: true,
    })
  },

  async update(storeId: string, customerId: string, formData: FormData) {
    // 1. Verify customer exists
    await this.getOne(customerId, storeId)

    // 2. Parse FormData
    const rawData = parseFormData(formData)

    // 3. Validate with Zod
    const validation = updateCustomerSchema.safeParse(rawData)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      throw new ValidationError(
        `${firstError.path.join('.')}: ${firstError.message}`
      )
    }

    const { fullname, phone, address, notes } = validation.data

    // 4. Check for duplicates (excluding current customer)
    if (phone) {
      const exists = await customersDb.customerPhoneExists(
        storeId,
        phone,
        customerId
      )
      if (exists) {
        throw new ValidationError('رقم الهاتف موجود بالفعل')
      }
    }

    // 5. Update
    return customersDb.updateCustomer(customerId, {
      fullname: fullname || undefined,
      phone: phone === null ? null : phone || undefined,
      address: address === null ? null : address || undefined,
      notes: notes === null ? null : notes || undefined,
    })
  },

  async delete(storeId: string, customerId: string) {
    await this.getOne(customerId, storeId)
    return customersDb.deleteCustomer(customerId)
  },

  async toggleActive(storeId: string, customerId: string, active: boolean) {
    await this.getOne(customerId, storeId)
    return customersDb.toggleCustomerActive(customerId, active)
  },

  async search(storeId: string, query: string) {
    if (!query?.trim()) return []
    return customersDb.searchCustomers(storeId, query.trim())
  },

  async getDebts(storeId: string) {
    return customersDb.getCustomerDebts(storeId)
  },

  async getDebtsByThreshold(storeId: string, minDebt: number) {
    if (minDebt < 0) {
      throw new ValidationError('المبلغ يجب أن يكون موجب')
    }
    return customersDb.getCustomerDebtsByThreshold(storeId, minDebt)
  },

  async getHighRisk(storeId: string, threshold: number = 0.5) {
    if (threshold < 0 || threshold > 1) {
      throw new ValidationError('نسبة المخاطرة يجب أن تكون بين 0 و 1')
    }
    return customersDb.getHighRiskCustomers(storeId, threshold)
  },

  async getTopCustomers(storeId: string, limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new ValidationError('الحد يجب أن يكون بين 1 و 100')
    }
    return customersDb.getTopCustomers(storeId, limit)
  },

  async getAllWithAnalytics(storeId: string) {
    return customersDb.getAllCustomersWithAnalytics(storeId)
  },
}