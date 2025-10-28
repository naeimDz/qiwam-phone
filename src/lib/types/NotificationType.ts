
export type NotificationType = 'info' | 'warning' | 'error' | 'success';


export interface Notification {
  id: string;
  storeid: string;
  userid?: string;
  title: string;
  message: string;
  type: NotificationType;
  entity_type?: string;
  entity_id?: string;
  read: boolean;
  readat?: Date;
  

  priority: 'low' | 'normal' | 'high' | 'urgent';
  category?: 'stock' | 'sales' | 'finance' | 'system' | 'warranty' | 'user';
  action_url?: string;
  action_label?: string;
  expires_at?: Date;
  sent_via: Array<'app' | 'email' | 'sms'>;
  metadata: Record<string, any>;
  dismissed: boolean;
  dismissed_at?: Date;
  auto_generated: boolean;
  notification_group?: string;
  repeat_interval?: number; // بالدقائق
  last_sent_at?: Date;
  
  createdat: Date;
  deleted_at?: Date;
}

export interface QuickNotification {
  storeid: string;
  userid?: string;
  title: string;
  message: string;
  type?: NotificationType;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: Notification['category'];
  entity_type?: string;
  entity_id?: string;
  action_url?: string;
  action_label?: string;
}

export interface NotificationFilter {
  storeid?: string;
  userid?: string;
  read?: boolean;
  dismissed?: boolean;
  type?: NotificationType;
  priority?: Notification['priority'];
  category?: Notification['category'];
  from_date?: Date;
  to_date?: Date;
}

// ملخص الإشعارات
export interface NotificationSummary {
  total: number;
  unread: number;
  by_priority: {
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
  by_category: Record<string, number>;
}


// need migration view on sql (not yet)
export interface UnreadNotification extends Notification {
  user_fullname?: string;
}

export type InsertNotification = Omit<Notification, 'id' | 'createdat' | 'deleted_at' | 'readat' | 'dismissed_at' | 'last_sent_at'>;
export type UpdateNotification = Partial<Omit<Notification, 'id' | 'storeid' | 'createdat'>>;
