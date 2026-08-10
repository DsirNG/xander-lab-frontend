import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogPlanService } from '@features/blog/services/blogPlanService';
import { useToast } from '@/hooks/useToast';

/**
 * 导航栏通知铃铛
 * 通过 SSE 实时接收计划执行事件，并展示历史通知列表。
 */
const NotificationBell = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await blogPlanService.listNotifications({ page: 1, size: 10 });
      setNotifications(data?.records || []);
      setUnread(data?.unreadCount ?? 0);
    } catch {
      // 静默失败，铃铛保持旧数据
    } finally {
      setLoading(false);
    }
  }, []);

  // 订阅 SSE：收到事件时把通知标记为未读。断线由服务端心跳兜底，
  // 前端不自动重连，下次打开铃铛会重新拉取列表。
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    blogPlanService.subscribeNotifications((event) => {
      if (!event || event.event !== 'notification') return;
      const payload = event.data;
      if (!payload?.type) return;
      setUnread((prev) => prev + 1);
      toast.info(`${payload.title || ''} · ${payload.message || ''}`.trim());
    }, { signal: controller.signal, _silent: true });
    return () => controller.abort();
  }, [toast]);

  const markAll = async () => {
    try {
      await blogPlanService.markAllNotificationsRead();
      setUnread(0);
      setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
      toast.success(t('notifications.markedAll'));
    } catch {
      // noop
    }
  };

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) load();
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const iconBadge = unread > 0
    ? <span className="absolute right-[-2px] top-[-2px] flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
        {unread > 99 ? '99+' : unread}
      </span>
    : null;

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={toggleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-ink-secondary transition hover:bg-surface-muted"
        aria-label={t('notifications.title')}
        aria-expanded={open}
        title={t('notifications.title')}
      >
        <Bell className="h-5 w-5" />
        {iconBadge}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-canvas shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-semibold text-ink">{t('notifications.title')}</span>
            {unread > 0 && (
              <button onClick={markAll} className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                <CheckCheck className="h-3 w-3" /> {t('notifications.markAll')}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-ink-faint">{t('notifications.loading')}</p>
            )}
            {!loading && notifications.length === 0 && (
              <p className="px-4 py-10 text-center text-xs text-ink-faint">{t('notifications.empty')}</p>
            )}
            {notifications.map((n) => (
              <div key={n.id} className={`px-4 py-3 text-sm ${n.isRead ? '' : 'bg-accent-soft/50'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-ink">{n.title}</span>
                  {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
                </div>
                {n.message && (
                  <p className="mt-1 line-clamp-2 text-xs text-ink-faint">{n.message}</p>
                )}
                {n.createdAt && (
                  <p className="mt-1 text-[10px] text-ink-faint">{new Date(n.createdAt).toLocaleString()}</p>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-border px-4 py-2">
            <Link
              to="/blog/plans"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-accent hover:underline"
            >
              {t('notifications.viewPlans')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;