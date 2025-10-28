// lib/db/types.ts

// ==================== ENUMS ====================
export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'credit_card' | 'other';
export type ProductStatus = 'available' | 'sold' | 'reserved' | 'damaged' | 'returned';
export type TransactionStatus = 'draft' | 'posted' | 'cancelled' | 'refunded';
export type SaleType = 'cash' | 'credit' | 'installment';
export type InvoiceType = 'full_invoice' | 'quick_sale' | 'receipt' | 'proforma';
export type UserRole = 'admin' | 'owner' | 'seller' | 'technician';
export type MovementType = 'in' | 'out' | 'adjustment' | 'return';
export type ItemType = 'phone' | 'accessory';
export type PaymentDirection = 'in' | 'out';
export type PaymentStatus = 'captured' | 'cancelled' | 'pending';
export type ExpenseStatus = 'pending' | 'paid' | 'cancelled';
export type RegisterStatus = 'open' | 'closed';
export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'refunded' | 'completed';
export type TradeStatus = 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected';
export type VarianceType = 'shortage' | 'overage';
export type InvestigationStatus = 'pending' | 'investigating' | 'resolved' | 'written_off';
export type SnapshotType = 'automatic' | 'manual' | 'reconciliation' | 'shift_close';
export type DocumentType = 'sale' | 'purchase' | 'expense' | 'return';

// ==================== BASE TYPES ====================
export interface Store {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  plan: 'free' | 'paid';
  startdate: Date;
  enddate?: Date;
  active: boolean;
  createdat: Date;
}


export interface User {
  id: string;
  storeid?: string;
  fullname: string;
  role: UserRole;
  active: boolean;
  lastloginat?: Date;
  createdat: Date;
  updatedat: Date;
  deleted_at?: Date;
}

export interface Brand {
  id: string;
  storeid: string;
  name: string;
  createdat: Date;
  deleted_at?: Date;
}

export interface Category {
  id: string;
  storeid: string;
  name: string;
  createdat: Date;
  deleted_at?: Date;
}

export interface Supplier {
  id: string;
  storeid: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  active: boolean;
  createdat: Date;
  updatedat: Date;
  deleted_at?: Date;
}

export interface Customer {
  id: string;
  storeid: string;
  fullname: string;
  phone?: string;
  address?: string;
  notes?: string;
  active: boolean;
  createdat: Date;
  updatedat: Date;
  deleted_at?: Date;
}

export interface Phone {
  id: string;
  storeid: string;
  name: string;
  brandid?: string;
  model?: string;
  imei: string;
  supplierid?: string;
  status: ProductStatus;
  buyprice: number;
  sellprice: number;
  warranty_months: number;
  warranty_notes?: string;
  notes?: string;
  createdat: Date;
  updatedat: Date;
  deleted_at?: Date;
}

export interface Accessory {
  id: string;
  storeid: string;
  name: string;
  categoryid?: string;
  brandid?: string;
  supplierid?: string;
  barcode?: string;
  sku?: string;
  buyprice: number;
  sellprice: number;
  quantity: number;
  minqty: number;
  notes?: string;
  active: boolean;
  createdat: Date;
  updatedat: Date;
  deleted_at?: Date;
}

// ==================== TRANSACTIONS ====================
export interface Sale {
  id: string;
  storeid: string;
  customerid?: string;
  docnumber?: string;
  docdate: Date;
  saletype: SaleType;
  invoice_type: InvoiceType;
  total: number;
  paidamount: number;
  remainingamount: number;
  notes?: string;
  status: TransactionStatus;
  invoice_status: 'draft' | 'posted' | 'cancelled' | 'refunded';
  createdbyid?: string;
  modifiedbyid?: string;
  createdat: Date;
  updatedat: Date;
  deleted_at?: Date;
  doc_sequence?: number;
  fiscal_year: number;
  timestamp_posted?: Date;
}

export interface SaleItem {
  id: string;
  saleid: string;
  item_type: ItemType;
  phone_id?: string;
  accessory_id?: string;
  qty: number;
  base_price: number;
  unitprice: number;
  discount: number;
  linetotal: number;
  imei_snapshot?: string;
  createdat: Date;
}

export interface Purchase {
  id: string;
  storeid: string;
  supplierid?: string;
  docnumber?: string;
  docdate: Date;
  total: number;
  paidamount: number;
  remainingamount: number;
  status: TransactionStatus;
  notes?: string;
  createdbyid?: string;
  modifiedbyid?: string;
  createdat: Date;
  updatedat: Date;
  deleted_at?: Date;
  doc_sequence?: number;
  fiscal_year: number;
}

export interface PurchaseItem {
  id: string;
  purchaseid: string;
  item_type: ItemType;
  phone_id?: string;
  accessory_id?: string;
  qty: number;
  unitprice: number;
  linetotal: number;
  createdat: Date;
}

export interface Expense {
  id: string;
  storeid: string;
  category: string;
  amount: number;
  description?: string;
  expense_date: Date;
  status: ExpenseStatus;
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'other';
  register_id?: string;
  paid_at?: Date;
  paid_by?: string;
  createdby?: string;
  createdat: Date;
  deleted_at?: Date;
}

export interface Payment {
  id: string;
  storeid: string;
  sale_id?: string;
  purchase_id?: string;
  expense_id?: string;
  amount: number;
  method: PaymentMethod;
  direction: PaymentDirection;
  reference?: string;
  register_id?: string;
  createdbyid?: string;
  createdat: Date;
  status: PaymentStatus;
  captured_at: Date;
  cancelled_at?: Date;
  cancellation_reason?: string;
  doc_sequence?: number;
  notes?: string;
  is_reconciled: boolean;
  reconciled_at?: Date;
  reconciled_by?: string;
}

export interface ReturnTransaction {
  id: string;
  storeid: string;
  saleid?: string;
  sale_item_id?: string;
  item_type: ItemType;
  phone_id?: string;
  accessory_id?: string;
  qty: number;
  refund_amount: number;
  refund_method: PaymentMethod;
  reason: string;
  notes?: string;
  createdby?: string;
  createdat: Date;
  status: ReturnStatus;
  approved_by?: string;
  approved_at?: Date;
  rejection_reason?: string;
  refund_payment_id?: string;
  reason_code?: string;
  inspected_by?: string;
  inspection_notes?: string;
  refunded_at?: Date;
}

export interface TradeTransaction {
  id: string;
  storeid: string;
  customerid?: string;
  new_item_type?: ItemType;
  new_phone_id?: string;
  new_accessory_id?: string;
  used_item_type?: ItemType;
  used_phone_id?: string;
  used_accessory_id?: string;
  price_new: number;
  price_used: number;
  difference: number;
  direction: 'customer_pays' | 'store_pays' | 'even';
  sale_id?: string;
  purchase_id?: string;
  payment_id?: string;
  notes?: string;
  createdbyid?: string;
  createdat: Date;
  status: TradeStatus;
  approved_by?: string;
  approved_at?: Date;
  completed_at?: Date;
  customer_discount_applied: number;
  inspection_notes?: string;
}

// ==================== CASH MANAGEMENT ====================
export interface CashRegister {
  id: string;
  storeid: string;
  opened_by?: string;
  opened_at: Date;
  closed_by?: string;
  closed_at?: Date;
  opening_balance: number;
  closing_balance?: number;
  expected_balance?: number;
  difference?: number;
  status: RegisterStatus;
  notes?: string;
  createdat: Date;
  total_cash_in: number;
  total_cash_out: number;
  payment_count_in: number;
  payment_count_out: number;
  reconciled: boolean;
  reconciled_by?: string;
}

export interface CashRegisterSnapshot {
  id: string;
  register_id: string;
  snapshot_time: Date;
  balance_at_time: number;
  transactions_count: number;
  last_transaction_id?: string;
  snapshot_type: SnapshotType;
  notes?: string;
  created_by?: string;
}

export interface CashMovement {
  id: string;
  storeid: string;
  movement_type: 'in' | 'out';
  source_table: string;
  source_id?: string;
  related_sale?: string;
  related_purchase?: string;
  related_expense?: string;
  amount: number;
  method: PaymentMethod;
  payment_id?: string;
  createdby?: string;
  createdat: Date;
  meta?: Record<string, any>;
}

export interface SettlementRecord {
  id: string;
  storeid: string;
  register_id: string;
  settlement_date: Date;
  total_sales: number;
  total_refunds: number;
  total_expenses: number;
  net_cash: number;
  opening_balance: number;
  closing_balance: number;
  expected_balance: number;
  difference: number;
  difference_reason?: string;
  reconciled: boolean;
  reconciled_by?: string;
  reconciled_at?: Date;
  createdat: Date;
}

export interface VarianceRecord {
  id: string;
  storeid: string;
  settlement_id: string;
  variance_amount: number;
  variance_type: VarianceType;
  investigation_status: InvestigationStatus;
  notes?: string;
  investigated_by?: string;
  investigated_at?: Date;
  createdat: Date;
}

// ==================== STOCK & INVENTORY ====================
export interface StockMovement {
  id: string;
  storeid: string;
  item_type: ItemType;
  phone_id?: string;
  accessory_id?: string;
  movement_type: MovementType;
  source_table: string;
  source_id: string;
  qty: number;
  createdat: Date;
  createdby?: string;
  notes?: string;
  batch_id?: string;
  cost_per_unit: number;
  source_reference_id?: string;
  reference_number?: string;
  is_adjustment: boolean;
  adjustment_reason?: string;
  reverse_of_movement_id?: string;
}

// ==================== SYSTEM ====================
export interface DocumentSequence {
  id: string;
  storeid: string;
  document_type: DocumentType;
  fiscal_year: number;
  current_sequence: number;
  prefix: string;
  suffix: string;
  min_digits: number;
  is_active: boolean;
  createdat: Date;
  updated_at: Date;
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
export type InsertExpense = Omit<Expense, 'id' | 'createdat' | 'deleted_at'>;
export type InsertPayment = Omit<Payment, 'id' | 'createdat'>;
export type InsertReturnTransaction = Omit<ReturnTransaction, 'id' | 'createdat'>;
export type InsertTradeTransaction = Omit<TradeTransaction, 'id' | 'createdat'>;
export type InsertCashRegister = Omit<CashRegister, 'id' | 'createdat'>;
export type InsertCashMovement = Omit<CashMovement, 'id' | 'createdat'>;
export type InsertStockMovement = Omit<StockMovement, 'id' | 'createdat'>;
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
export type UpdateExpense = Partial<Omit<Expense, 'id' | 'storeid' | 'createdat'>>;
export type UpdatePayment = Partial<Omit<Payment, 'id' | 'storeid' | 'createdat'>>;
export type UpdateReturnTransaction = Partial<Omit<ReturnTransaction, 'id' | 'storeid' | 'createdat'>>;
export type UpdateTradeTransaction = Partial<Omit<TradeTransaction, 'id' | 'storeid' | 'createdat'>>;
export type UpdateCashRegister = Partial<Omit<CashRegister, 'id' | 'storeid' | 'createdat'>>;
export type UpdateStockMovement = Partial<Omit<StockMovement, 'id' | 'storeid' | 'createdat'>>;
export type UpdateDocumentSequence = Partial<Omit<DocumentSequence, 'id' | 'storeid' | 'createdat'>>;

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