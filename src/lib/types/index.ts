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


export type SignupFormData = {
  email: string
  password: string
  fullname: string
  phone: string
  storeName?: string
  taxNumber?: string
}

export type LoginFormData = {
  email: string
  password: string
}

export type AuthResponse = {
  success: boolean
  error?: string
  user?: AuthUser
  storeid?: string
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


export type Customer = {
  id: string
  storeid: string
  fullname: string
  phone: string | null
  address: string | null
  notes: string | null
  active: boolean
  createdat: Date
  updatedat: Date
  deleted_at: Date | null
}


export type ProductStatus = 'available' | 'sold' | 'returned' | 'damaged' |  'reserved'

export type Phone = {
  id: string
  storeid: string
  name: string
  brandid: string | null
  model: string | null
  imei: string
  supplierid: string | null
  status: ProductStatus
  buyprice: number
  sellprice: number
  warranty_months: number
  warranty_notes: string | null
  notes: string | null
  createdat: Date
  updatedat: Date
  deleted_at: Date | null
}

export type PhoneWithDetails = Phone & {
  brand_name: string | null
  supplier_name: string | null
}

export type Accessory = {
  id: string
  storeid: string
  name: string
  brandid: string | null
  categoryid: string | null
  supplierid: string | null
  sku: string | null
  barcode: string | null
  quantity: number
  minqty: number
  buyprice: number
  sellprice: number
  active: boolean
  notes: string | null
  createdat: Date
  updatedat: Date
  deleted_at: Date | null
}

export type AccessoryWithDetails = Accessory & {
  brand_name: string | null
  category_name: string | null
  supplier_name: string | null
  is_low_stock: boolean
}

export type StockMovement = {
  id: string
  storeid: string
  product_type: 'phone' | 'accessory'
  product_id: string
  movement_type: 'in' | 'out' | 'adjustment' | 'return'
  quantity: number
  source_table: string | null
  source_id: string | null
  notes: string | null
  createdbyid: string
  createdat: Date
}

export type StockMovementWithDetails = StockMovement & {
  product_name: string
  created_by_name: string
}