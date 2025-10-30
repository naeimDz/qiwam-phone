// ============================================
// 📁 lib/validation/customerSchema.ts
// ============================================
import { z } from 'zod'

export const customerBaseSchema = z.object({
  fullname: z.string()
    .trim()
    .min(2, 'اسم العميل يجب أن يكون حرفين على الأقل')
    .max(100, 'اسم العميل طويل جداً'),
  
  phone: z.string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => !val || val.length > 0,
      'رقم الهاتف غير صحيح'
    ),
  
  address: z.string()
    .trim()
    .optional()
    .nullable(),
  
  notes: z.string()
    .trim()
    .optional()
    .nullable(),
})

export const createCustomerSchema = customerBaseSchema
export const updateCustomerSchema = customerBaseSchema.partial()