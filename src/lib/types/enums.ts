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


