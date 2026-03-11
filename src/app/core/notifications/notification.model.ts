/**
 * Notification type for styling and icons (Google Cloud–style).
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Notification model – matches REST API and UI.
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

/**
 * API response item (snake_case or camelCase from backend).
 */
export interface NotificationApiItem {
  id?: string;
  title?: string;
  message?: string;
  type?: string;
  isRead?: boolean;
  is_read?: boolean;
  createdAt?: string;
  created_at?: string;
  [key: string]: unknown;
}
