import { useContext } from 'react';
import NotificationContext from './notificationContextValue';

/** 读取全局通知状态（unread / 通知列表 / 连接状态等）。需在 NotificationProvider 内使用。 */
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
};
