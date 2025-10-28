

// نوع ساعات العمل
export interface BusinessHours {
  saturday?: DaySchedule;
  sunday?: DaySchedule;
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
}

export interface DaySchedule {
  closed?: boolean;
  open?: string;  // HH:MM format
  close?: string; // HH:MM format
}

export type Currency = 'DZD' | 'EUR' | 'USD' | 'SAR' | 'AED';
export type Locale = 'ar-DZ' | 'fr-DZ' | 'en-US';
export type Frequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'manual';


export interface StoreSettings {
  storeid: string;
  invoice_footer: string;
  receipt_footer: string;
  phone: string;
  tax_number?: string;
  logo_url?: string;
  currency: Currency;
  locale: Locale;
  print_logo: boolean;
  print_qr: boolean;
  auto_print_invoice: boolean;
  notify_low_stock: boolean;
  notify_warranty_expiry: boolean;
  notify_daily_report: boolean;
  auto_close_register: boolean;
  close_register_frequency: Frequency;
  require_cash_count: boolean;
  max_cash_difference: number;
  auto_sequence_documents: boolean;
  enable_batch_operations: boolean;
  backup_frequency: Frequency;
  
  // ✨ الحقول الجديدة
  allow_negative_stock: boolean;
  default_warranty_months: number;
  price_includes_tax: boolean;
  tax_rate: number;
  allow_discount: boolean;
  max_discount_percent: number;
  require_customer_phone: boolean;
  minimum_sale_amount: number;
  receipt_template: 'standard' | 'compact' | 'detailed';
  enable_barcode_scanner: boolean;
  auto_backup_enabled: boolean;
  last_backup_at?: Date;
  business_hours: BusinessHours;
  email_notifications: boolean;
  notification_email?: string;
  sms_notifications: boolean;
  notification_phone?: string;
  low_stock_threshold: number;
  warranty_expiry_alert_days: number;
  
  createdat: Date;
  updatedat: Date;
  deleted_at?: Date;
}
export type InsertStoreSettings = Omit<StoreSettings, 'createdat' | 'updatedat' | 'deleted_at' | 'last_backup_at'>;
export type UpdateStoreSettings = Partial<Omit<StoreSettings, 'storeid' | 'createdat'>>;
