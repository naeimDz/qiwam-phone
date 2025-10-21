// lib/types/index.ts
// Phase 1A Types - Authentication & Store Setup

// ==================== Store ====================
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

// ==================== Store Settings ====================
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

// ==================== Users ====================
// Note: id comes from auth.users, email/phone/password managed by Supabase Auth
export type User = {
  id: string // References auth.users(id)
  storeid: string
  fullname: string
  role: 'owner' | 'seller'| 'technician'
  active: boolean
  lastloginat: Date | null
  createdat: Date
  updatedat: Date
  deleted_at: Date | null
}

// UserProfile is now same as User (no sensitive fields to omit)
export type UserProfile = User

// Auth context type
export type AuthUser = {
  id: string
  email: string | null
  storeid: string | null
  fullname: string
  role: UserProfile['role']
}

// ==================== Phase 1B Types (Preview) ====================
export type Brand = {
  id: string
  storeid: string
  name: string
  createdat: Date
  deleted_at: Date | null
}

export type Category = {
  id: string
  storeid: string
  name: string
  createdat: Date
  deleted_at: Date | null
}

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