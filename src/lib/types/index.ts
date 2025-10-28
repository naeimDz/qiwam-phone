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

export type TransactionStatus = 'draft' | 'posted' | 'cancelled'
export type SaleType = 'cash' | 'credit'
export type InvoiceType = 'full_invoice' | 'quick_sale'
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'cheque'

// Sale (Invoice Header)
export type Sale = {
  id: string
  storeid: string
  customerid: string | null
  docnumber: string | null
  docdate: Date
  saletype: SaleType
  invoice_type: InvoiceType
  total: number
  paidamount: number
  remainingamount: number
  notes: string | null
  status: TransactionStatus
  createdbyid: string | null
  modifiedbyid: string | null
  createdat: Date
  updatedat: Date
  deleted_at: Date | null
}

export type SaleWithDetails = Sale & {
  customer_name: string | null
  customer_phone: string | null
  created_by_name: string | null
  items_count: number
}

// Sale Item (Invoice Line)
export type SaleItem = {
  id: string
  saleid: string
  item_type: 'phone' | 'accessory'
  phone_id: string | null
  accessory_id: string | null
  qty: number
  base_price: number
  unitprice: number
  discount: number
  linetotal: number
  imei_snapshot: string | null
  createdat: Date
}

export type SaleItemWithDetails = SaleItem & {
  product_name: string
  brand_name: string | null
}

// Purchase (Invoice Header)
export type Purchase = {
  id: string
  storeid: string
  supplierid: string | null
  docnumber: string | null
  docdate: Date
  total: number
  paidamount: number
  remainingamount: number
  status: TransactionStatus
  notes: string | null
  createdbyid: string | null
  modifiedbyid: string | null
  createdat: Date
  updatedat: Date
  deleted_at: Date | null
}

export type PurchaseWithDetails = Purchase & {
  supplier_name: string | null
  supplier_phone: string | null
  created_by_name: string | null
  items_count: number
}

// Purchase Item (Invoice Line)
export type PurchaseItem = {
  id: string
  purchaseid: string
  item_type: 'phone' | 'accessory'
  phone_id: string | null
  accessory_id: string | null
  qty: number
  unitprice: number
  linetotal: number
  createdat: Date
}

export type PurchaseInsert = Omit<Purchase, 'id' | 'total' | 'paidamount' | 'remainingamount' | 'docnumber' | 'createdat' | 'updatedat' | 'deleted_at'>

export type PurchaseItemWithDetails = PurchaseItem & {
  product_name: string
  brand_name: string | null
}

// Payment
export type Payment = {
  id: string
  storeid: string
  sale_id: string | null
  purchase_id: string | null
  expense_id: string | null
  amount: number
  method: PaymentMethod
  direction: 'in' | 'out'
  reference: string | null
  register_id: string | null
  createdbyid: string | null
  createdat: Date
}

export type InsertPayment = Omit<Payment, 'id' | 'createdat'>;

// Payment with Details
export type PaymentWithDetails = Payment & {
  created_by_name: string | null
  sale_docnumber: string | null
  purchase_docnumber: string | null
}

// Cash Movement
export type CashMovement = {
  id: string
  storeid: string
  movement_type: 'in' | 'out'
  source_table: string
  source_id: string | null
  related_sale: string | null
  related_purchase: string | null
  related_expense: string | null
  amount: number
  method: PaymentMethod
  payment_id: string | null
  createdby: string | null
  createdat: Date
  meta: Record<string, any>
}


// Cash Register
export type CashRegister = {
  id: string
  storeid: string
  register_name: string
  opening_balance: number
  current_balance: number
  status: 'open' | 'closed'
  opened_at: Date
  opened_by: string
  closed_at: Date | null
  closed_by: string | null
  notes: string | null
  createdat: Date
  updatedat: Date
  deleted_at: Date | null
}

export type CashRegisterWithDetails = CashRegister & {
  opened_by_name: string
  closed_by_name: string | null
  total_in: number
  total_out: number
  expected_balance: number
  variance: number
}

// Cash Register Transaction
export type CashRegisterTransaction = {
  id: string
  register_id: string
  transaction_type: 'in' | 'out' | 'opening' | 'closing'
  amount: number
  payment_id: string | null
  sale_id: string | null
  purchase_id: string | null
  expense_id: string | null
  notes: string | null
  createdby: string
  createdat: Date
}

export type CashRegisterTransactionWithDetails = CashRegisterTransaction & {
  created_by_name: string
  reference_number: string | null
}