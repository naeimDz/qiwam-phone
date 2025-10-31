// lib/types/index.ts
// Complete Types - Based on actual Supabase Schema

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
  auto_close_register: boolean
  close_register_frequency: 'hourly' | 'daily' | 'weekly' | 'manual'
  require_cash_count: boolean
  max_cash_difference: number
  auto_sequence_documents: boolean
  enable_batch_operations: boolean
  backup_frequency: 'hourly' | 'daily' | 'weekly'
  createdat: Date
  updatedat: Date
  deleted_at: Date | null
}

// ==================== Users ====================
export type User = {
  id: string // References auth.users(id)
  storeid: string
  fullname: string
  role: 'owner' | 'seller' | 'technician'
  active: boolean
  lastloginat: Date | null
  createdat: Date
  updatedat: Date
  deleted_at: Date | null
}

export type UserProfile = User

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

// ==================== Brands ====================
export type Brand = {
  id: string
  storeid: string
  name: string
  createdat: Date
  deleted_at: Date | null
}

// ==================== Categories ====================
export type Category = {
  id: string
  storeid: string
  name: string
  createdat: Date
  deleted_at: Date | null
}

// ==================== Suppliers ====================
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

// ==================== Customers ====================
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

// ==================== Phone (الهاتف الواحد) ====================
export type ProductStatus = 'available' | 'sold' | 'returned' | 'damaged' | 'reserved'

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

// ==================== Accessory (الإكسسوار) ====================
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

// ==================== Stock Movement (حركات المخزون) ====================
export type StockMovement = {
  id: string
  storeid: string
  item_type: 'phone' | 'accessory'
  phone_id: string | null
  accessory_id: string | null
  movement_type: 'in' | 'out' | 'adjustment' | 'return'
  qty: number
  source_table: string
  source_id: string | null
  createdby: string | null
  createdat: Date
  notes: string | null
  batch_id: string | null
  cost_per_unit: number
  source_reference_id: string | null
  reference_number: string | null
  is_adjustment: boolean
  adjustment_reason: string | null
  reverse_of_movement_id: string | null
}

export type StockMovementWithDetails = StockMovement & {
  product_name: string
  created_by_name: string
}
export type StockMovementJoined = StockMovement & {
  phone?: { id: string; name: string }[] | null
  accessory?: { id: string; name: string }[] | null
  created_by_user?: { fullname: string }[] | null
}
export type StockMovementStats = {
  total_in: number
  total_out: number
  total_adjustments: number
  total_returns: number
  net_movement: number
  days_with_activity?: number
}

export type InsertStockMovement = Omit<
  StockMovement,
  'id' | 'createdat'
>

export type UpdateStockMovement = Partial<
  Omit<
    StockMovement,
    'id' | 'storeid' | 'createdat' | 'item_type' | 'phone_id' | 'accessory_id' | 'movement_type'
  >
>

export type UpdateStockMovementPartial = {
  notes?: string
  reference_number?: string
  source_reference_id?: string
  batch_id?: string
}
// ==================== Transaction Types ====================
export type TransactionStatus = 'draft' | 'posted' | 'cancelled'
export type SaleType = 'cash' | 'credit'
export type InvoiceType = 'full_invoice' | 'quick_sale'
export type PaymentMethod = 'cash' | 'card' | 'bank' | 'transfer'

// ==================== Sale (فاتورة البيع) ====================
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
  doc_sequence: number | null
  fiscal_year: number
  invoice_status: 'draft' | 'posted' | 'cancelled' | 'refunded'
  timestamp_posted: Date | null
  createdat: Date
  updatedat: Date
  deleted_at: Date | null
}

export type SaleWithDetails = Sale & {
  customer_name: string | null
  customer_phone: string | null
  created_by_name: string | null
  modified_by_name: string | null
  items_count: number
}

// ==================== Sale Item (سطر البيع) ====================
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

export type SaleItemInsert = Omit<SaleItem, 'id' | 'linetotal' | 'createdat'>

// ==================== Purchase (فاتورة الشراء) ====================
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
  doc_sequence: number | null
  fiscal_year: number
  payment_method: PaymentMethod | null
  createdat: Date
  updatedat: Date
  deleted_at: Date | null
}

export type PurchaseWithDetails = Purchase & {
  supplier_name: string | null
  supplier_phone: string | null
  created_by_name: string | null
  modified_by_name: string | null
  items_count: number
}

export type PurchaseInsert = Omit<
  Purchase,
  'id' | 'total' | 'paidamount' | 'remainingamount' | 'docnumber' | 'createdat' | 'updatedat' | 'deleted_at'
>

// ==================== Purchase Item (سطر الشراء) ====================
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

export type PurchaseItemWithDetails = PurchaseItem & {
  product_name: string
  brand_name: string | null
}

export type PurchaseItemInsert = Omit<PurchaseItem, 'id' | 'linetotal' | 'createdat'>

// ==================== Payment (الدفع) ====================
export type PaymentStatus = 'captured' | 'cancelled' | 'pending'

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
  status: PaymentStatus
  captured_at: Date
  cancelled_at: Date | null
  cancellation_reason: string | null
  doc_sequence: number | null
  notes: string | null
  is_reconciled: boolean
  reconciled_at: Date | null
  reconciled_by: string | null
  createdat: Date
}

export type PaymentWithDetails = Payment & {
  created_by_name: string | null
  sale_docnumber: string | null
  purchase_docnumber: string | null
  reconciled_by_name: string | null
}



// ==================== Cash Movement (حركات النقد) ====================
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

// ==================== Cash Register (صندوق النقد) ====================
export type CashRegisterStatus = 'open' | 'closed'

export type CashRegister = {
  id: string
  storeid: string
  opened_by: string | null
  opened_at: Date
  closed_by: string | null
  closed_at: Date | null
  opening_balance: number
  closing_balance: number | null
  expected_balance: number | null
  difference: number | null
  status: CashRegisterStatus
  notes: string | null
  createdat: Date
  total_cash_in: number
  total_cash_out: number
  payment_count_in: number
  payment_count_out: number
  reconciled: boolean
  reconciled_by: string | null
}

export type CashRegisterWithDetails = CashRegister & {
  opened_by_name: string | null
  closed_by_name: string | null
  reconciled_by_name: string | null
}

// ==================== Cash Register Snapshot ====================
export type SnapshotType = 'automatic' | 'manual' | 'reconciliation' | 'shift_close'

export type CashRegisterSnapshot = {
  id: string
  register_id: string
  snapshot_time: Date
  balance_at_time: number
  transactions_count: number | null
  last_transaction_id: string | null
  snapshot_type: SnapshotType
  notes: string | null
  created_by: string | null
}

// ==================== Settlement Record (تسوية الحساب) ====================
export type SettlementRecord = {
  id: string
  storeid: string
  register_id: string
  settlement_date: Date
  total_sales: number
  total_refunds: number
  total_expenses: number
  net_cash: number
  opening_balance: number
  closing_balance: number
  expected_balance: number
  difference: number
  difference_reason: string | null
  reconciled: boolean
  reconciled_by: string | null
  reconciled_at: Date | null
  createdat: Date
}

// ==================== Variance Record (فروقات المخزون) ====================
export type VarianceType = 'shortage' | 'overage'
export type InvestigationStatus = 'pending' | 'investigating' | 'resolved' | 'written_off'

export type VarianceRecord = {
  id: string
  storeid: string
  settlement_id: string
  variance_amount: number
  variance_type: VarianceType
  investigation_status: InvestigationStatus
  notes: string | null
  investigated_by: string | null
  investigated_at: Date | null
  createdat: Date
}

// ==================== Audit Log (سجل التدقيق) ====================
export type AuditLog = {
  id: string
  storeid: string
  userid: string | null
  action: string
  entity: string
  entityid: string | null
  old_value: Record<string, any> | null
  new_value: Record<string, any> | null
  meta: Record<string, any> | null
  createdat: string 
  deleted_at: Date | null
}

// ==================== Notification (الإشعارات) ====================
export type NotificationType = 'info' | 'warning' | 'error' | 'success'

export type Notification = {
  id: string
  storeid: string
  userid: string | null
  title: string
  message: string
  type: NotificationType
  entity_type: string | null
  entity_id: string | null
  read: boolean
  readat: Date | null
  createdat: Date
  deleted_at: Date | null
}

// ==================== Return Transaction (إرجاع البضاعة) ====================
export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'refunded' | 'completed'

export type ReturnTransaction = {
  id: string
  storeid: string
  saleid: string | null
  sale_item_id: string | null
  item_type: 'phone' | 'accessory'
  phone_id: string | null
  accessory_id: string | null
  qty: number
  refund_amount: number
  refund_method: PaymentMethod
  reason: string
  notes: string | null
  createdby: string | null
  status: ReturnStatus
  approved_by: string | null
  approved_at: Date | null
  rejection_reason: string | null
  refund_payment_id: string | null
  reason_code: string | null
  inspected_by: string | null
  inspection_notes: string | null
  refunded_at: Date | null
  createdat: Date
}

export type ReturnTransactionWithDetails = ReturnTransaction & {
  product_name: string
  customer_name: string | null
  created_by_name: string | null
  approved_by_name: string | null
  inspected_by_name: string | null
}

export type ReturnTransactionInsert = Omit<ReturnTransaction, 'id' | 'createdat'>

// ==================== Trade Transaction (مقايضة) ====================
export type TradeDirection = 'customer_pays' | 'store_pays' | 'even'
export type TradeStatus = 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected'

export type TradeTransaction = {
  id: string
  storeid: string
  customerid: string | null
  new_item_type: 'phone' | 'accessory' | null
  new_phone_id: string | null
  new_accessory_id: string | null
  used_item_type: 'phone' | 'accessory' | null
  used_phone_id: string | null
  used_accessory_id: string | null
  price_new: number
  price_used: number
  difference: number
  direction: TradeDirection
  sale_id: string | null
  purchase_id: string | null
  payment_id: string | null
  notes: string | null
  createdbyid: string | null
  status: TradeStatus
  approved_by: string | null
  approved_at: Date | null
  completed_at: Date | null
  customer_discount_applied: number
  inspection_notes: string | null
  createdat: Date
}

export type TradeTransactionWithDetails = TradeTransaction & {
  customer_name: string | null
  created_by_name: string | null
  approved_by_name: string | null
}

// ==================== Document Sequence (تسلسل المستندات) ====================
export type DocumentType = 'sale' | 'purchase' | 'expense' | 'return'

export type DocumentSequence = {
  id: string
  storeid: string
  document_type: DocumentType
  fiscal_year: number
  current_sequence: number
  prefix: string
  suffix: string
  min_digits: number
  is_active: boolean
  createdat: Date
  updated_at: Date
}




// ==================== RELATIONS ====================
export interface SaleWithItems extends Sale {
  items: SaleItem[];
  customer?: Customer;
  createdby?: User;
  payments?: Payment[];
}

export interface PurchaseWithItems extends Purchase {
  items: PurchaseItem[];
  supplier?: Supplier;
  createdby?: User;
  payments?: Payment[];
}

export interface PhoneWithRelations extends Phone {
  brand?: Brand;
  supplier?: Supplier;
}

export interface AccessoryWithRelations extends Accessory {
  brand?: Brand;
  category?: Category;
  supplier?: Supplier;
}

export interface CashRegisterWithRelations extends CashRegister {
  opened_by_user?: User;
  closed_by_user?: User;
  payments?: Payment[];
  snapshots?: CashRegisterSnapshot[];
}





// ==================== INSERT TYPES ====================
export type InsertStore = Omit<Store, 'id' | 'createdat'>;
export type InsertUser = Omit<User, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>;
export type InsertBrand = Omit<Brand, 'id' | 'createdat' | 'deleted_at'>;
export type InsertCategory = Omit<Category, 'id' | 'createdat' | 'deleted_at'>;
export type InsertSupplier = Omit<Supplier, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>;
export type InsertCustomer = Omit<Customer, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>;
export type InsertPhone = Omit<Phone, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>;
export type InsertAccessory = Omit<Accessory, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>;
export type InsertSale = Omit<Sale, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>;
export type InsertSaleItem = Omit<SaleItem, 'id' | 'createdat'>;
export type InsertPurchase = Omit<Purchase, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>;
export type InsertPurchaseItem = Omit<PurchaseItem, 'id' | 'createdat'>;
export type InsertPayment = Omit<
  Payment,
  | 'id'                      // UUID في الـ DB
  | 'createdat'               // DB default: now()
  | 'cancelled_at'            // عند cancelPayment()
  | 'cancellation_reason'     // عند cancelPayment()
  | 'reconciled_at'           // عند reconcilePayment()
  | 'reconciled_by'           // عند reconcilePayment()
  | 'doc_sequence'            // من Trigger
  | 'captured_at'            // عند إنشاء دفعة captured
  | 'is_reconciled'           // عند reconcilePayment()
  | 'status'                  // عند إنشاء دفعة جديدة تكون 'captured' افتراضياً
>
export type InsertReturnTransaction = Omit<ReturnTransaction, 'id' | 'createdat'>;
export type InsertTradeTransaction = Omit<TradeTransaction, 'id' | 'createdat'>;
export type InsertCashRegister = Omit<CashRegister, 'id' | 'createdat'>;
export type InsertCashMovement = Omit<CashMovement, 'id' | 'createdat'>;
export type InsertDocumentSequence = Omit<DocumentSequence, 'id' | 'createdat' | 'updated_at'>;

// ==================== UPDATE TYPES ====================
export type UpdateStore = Partial<Omit<Store, 'id' | 'createdat'>>;
export type UpdateUser = Partial<Omit<User, 'id' | 'createdat'>>;
export type UpdateBrand = Partial<Omit<Brand, 'id' | 'storeid' | 'createdat'>>;
export type UpdateCategory = Partial<Omit<Category, 'id' | 'storeid' | 'createdat'>>;
export type UpdateSupplier = Partial<Omit<Supplier, 'id' | 'storeid' | 'createdat'>>;
export type UpdateCustomer = Partial<Omit<Customer, 'id' | 'storeid' | 'createdat'>>;
export type UpdatePhone = Partial<Omit<Phone, 'id' | 'storeid' | 'createdat'>>;
export type UpdateAccessory = Partial<Omit<Accessory, 'id' | 'storeid' | 'createdat'>>;
export type UpdateSale = Partial<Omit<Sale, 'id' | 'storeid' | 'createdat'>>;
export type UpdateSaleItem = Partial<Omit<SaleItem, 'id' | 'saleid' | 'createdat'>>;
export type UpdatePurchase = Partial<Omit<Purchase, 'id' | 'storeid' | 'createdat'>>;
export type UpdatePurchaseItem = Partial<Omit<PurchaseItem, 'id' | 'purchaseid' | 'createdat'>>;
export type UpdatePayment = Partial<Omit<Payment, 'id' | 'storeid' | 'createdat'>>;
export type UpdateReturnTransaction = Partial<Omit<ReturnTransaction, 'id' | 'storeid' | 'createdat'>>;
export type UpdateTradeTransaction = Partial<Omit<TradeTransaction, 'id' | 'storeid' | 'createdat'>>;
export type UpdateCashRegister = Partial<Omit<CashRegister, 'id' | 'storeid' | 'createdat'>>;
export type UpdateDocumentSequence = Partial<Omit<DocumentSequence, 'id' | 'storeid' | 'createdat'>>;