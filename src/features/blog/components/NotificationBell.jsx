import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@components/common/Button';
import { useNotifications } from '@features/blog/context/useNotifications';
import { blogPlanService } from '@features/blog/services/blogPlanService';
import { authService } from '@features/auth/services/authService';
import { useToast } from '@/hooks/useToast';

/**
 * 导航栏通知铃铛
 * 仅负责展示全局通知状态（SSE 连接与数据由 NotificationProvider 在应用根级维护，
 * 因此切到无导航的独立路由时仍能收到实时通知）。打开铃铛时拉取最新列表。
 */
const NotificationBell = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { notifications, unread, loading, load, markAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const boxRef = useRef(null);
  const isAdmin = authService.getLocalUserInfo()?.role === 'ADMIN';

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

  const handleMarkAll = async () => {
    await markAll();
    toast.success(t('notifications.markedAll'));
  };

  const handleTestBroadcast = async () => {
    setBroadcasting(true);
    try {
      const recipients = await blogPlanService.testSseBroadcast();
      toast.success(`SSE 测试广播已发送（${recipients} 条连接）`);
    } catch {
      toast.error('SSE 测试广播发送失败');
    } finally {
      setBroadcasting(false);
    }
  };

  const iconBadge = unread > 0
    ? <span className="absolute right-[-2px] top-[-2px] flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
        {unread > 99 ? '99+' : unread}
      </span>
    : null;

  return (
    <div className="relative" ref={boxRef}>
      <Button
        onClick={toggleOpen}
        variant="ghost"
        size="md"
        icon={Bell}
        className="relative h-10 w-10 px-0"
        aria-label={t('notifications.title')}
        aria-expanded={open}
        title={t('notifications.title')}
      >
        {iconBadge}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-canvas shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-border px-4 py-2.5">
            <span className="truncate text-sm font-semibold text-ink">{t('notifications.title')}</span>
            {unread > 0 && (
              <Button onClick={handleMarkAll} variant="link" size="xs" icon={CheckCheck} className="gap-1">
                {t('notifications.markAll')}
              </Button>
            )}
            {isAdmin && (
              <Button onClick={handleTestBroadcast} disabled={broadcasting} variant="link" size="xs">
                {broadcasting ? '广播中…' : '测试 SSE 广播'}
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-ink-faint">{t('notifications.loading')}</div>
            )}
            {!loading && notifications.length === 0 && (
              <div className="px-4 py-10 text-center text-xs text-ink-faint">{t('notifications.empty')}</div>
            )}
            {notifications.map((n) => (
              <div key={n.id} className={`px-4 py-3 text-sm ${n.isRead ? '' : 'bg-accent-soft/50'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-ink">{n.title}</span>
                  {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
                </div>
                {n.message && (
                  <div className="mt-1 line-clamp-2 text-xs text-ink-faint">{n.message}</div>
                )}
                {n.createdAt && (
                  <div className="mt-1 text-[10px] text-ink-faint">{new Date(n.createdAt).toLocaleString()}</div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-border px-4 py-2">
            <Link
              to="/workspace/plans"
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
