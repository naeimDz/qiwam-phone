

export interface AuditLog {
  id: string;
  storeid: string;
  userid?: string;
  action: string;
  entity: string;
  entityid?: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  meta?: Record<string, any>;
  
  // ✨ الحقول الجديدة
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  session_id?: string;
  duration_ms?: number;
  status: 'success' | 'failed' | 'warning';
  error_message?: string;
  changes_summary?: string;
  affected_records: number;
  action_category?: 'create' | 'update' | 'delete' | 'restore' | 'login' | 'logout' | 'permission_change' | 'bulk_operation';
  severity: 'info' | 'warning' | 'error' | 'critical';
  rollback_id?: string;
  parent_log_id?: string;
  tags?: string[];
  device_info: DeviceInfo;
  
  createdat: Date;
  deleted_at?: Date;
}

// معلومات الجهاز
export interface DeviceInfo {
  platform?: string;
  browser?: string;
  version?: string;
  screen_resolution?: string;
  timezone?: string;
  language?: string;
}

export interface AuditLogFilter {
  storeid?: string;
  userid?: string;
  entity?: string;
  entityid?: string;
  action?: string;
  action_category?: AuditLog['action_category'];
  severity?: AuditLog['severity'];
  status?: AuditLog['status'];
  from_date?: Date;
  to_date?: Date;
  tags?: string[];
}


// ملخص سجل التدقيق
export interface AuditLogSummary {
  total_actions: number;
  unique_users: number;
  failed_actions: number;
  error_count: number;
  by_category: Record<string, number>;
  by_entity: Record<string, number>;
}


// need migration view on sql (not yet)
export interface DailyAuditSummary {
  storeid: string;
  audit_date: Date;
  action_category: string;
  entity: string;
  total_actions: number;
  unique_users: number;
  failed_actions: number;
  error_count: number;
}

export type InsertAuditLog = Omit<AuditLog, 'id' | 'createdat' | 'deleted_at'>;
export type UpdateAuditLog = Partial<Omit<AuditLog, 'id' | 'storeid' | 'createdat'>>;




