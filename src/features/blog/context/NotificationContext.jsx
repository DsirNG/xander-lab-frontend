import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { blogPlanService } from '@features/blog/services/blogPlanService';
import { authService } from '@features/auth/services/authService';
import { useToast } from '@/hooks/useToast';
import NotificationContext from './notificationContextValue';

/**
 * 全局通知状态与 SSE 连接
 *
 * SSE 订阅从导航栏铃铛抽离到应用根级：连接生命周期跟随登录态，而非
 * 某个页面/布局。这样即使切到不使用 MainLayout 的独立路由（博客发布、
 * 计划页、工作室等），用户仍能收到计划执行事件的实时通知。
 *
 * 连接策略：
 *  - 登录态下常驻一条连接，多标签页各自建立（服务端按用户保留多条 emitter）
 *  - 断线按指数退避自动重连（2s → 30s），收到事件即重置退避
 *  - token 刷新 / 网络恢复 / 标签页可见时立即重连
 *  - 登出（auth:logout）主动断开
 *  - 90s 无数据看门狗：检测半开连接，强制重连
 */

export const NotificationProvider = ({ children }) => {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const isLoggedInRef = useRef(false);
  const loadedRef = useRef(false);

  // 加载历史通知（登录态可用）
  const load = useCallback(async () => {
    if (!isLoggedInRef.current) return;
    setLoading(true);
    try {
      const data = await blogPlanService.listNotifications({ page: 1, size: 20 });
      setNotifications(data?.records || []);
      setUnread(data?.unreadCount ?? 0);
      loadedRef.current = true;
    } catch {
      // 静默失败，铃铛保持旧数据
    } finally {
      setLoading(false);
    }
  }, []);

  const markAll = useCallback(async () => {
    try {
      await blogPlanService.markAllNotificationsRead();
      setUnread(0);
      setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
    } catch {
      // noop
    }
  }, []);

  // ── SSE 连接生命周期 ──
  useEffect(() => {
    let alive = true;
    let controller = null;
    let retryTimer = null;
    let attempt = 0;

    const teardown = () => {
      if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
      if (controller) { controller.abort(); controller = null; }
    };

    const scheduleReconnect = (immediate = false) => {
      if (!alive || !isLoggedInRef.current) return;
      teardown();
      setConnected(false);
      if (immediate) {
        attempt = 0;
        connect();
        return;
      }
      const delay = Math.min(30000, 2000 * (2 ** attempt));
      attempt += 1;
      console.log(`[SSE] reconnect in ${delay}ms (attempt ${attempt})`);
      retryTimer = setTimeout(connect, delay);
    };

    const connect = () => {
      if (!alive || !isLoggedInRef.current) return;
      const ctrl = new AbortController();
      controller = ctrl;
      console.log('[SSE] connection starting: /api/notifications/events');
      setConnected(false);

      let watchdog = null;
      const armWatchdog = () => {
        if (watchdog) clearTimeout(watchdog);
        watchdog = setTimeout(() => {
          console.warn('[SSE] watchdog: no data for 90s, forcing reconnect');
          ctrl.abort();
        }, 90000);
      };

      blogPlanService.subscribeNotifications((event) => {
        if (event?.event === 'connected') {
          console.log('[SSE] connection established');
          attempt = 0;
          setConnected(true);
          return;
        }
        if (!event || event.event !== 'notification') return;
        attempt = 0;
        const payload = event.data;
        if (!payload?.type) return;
        setUnread((prev) => prev + 1);
        // 全局 toast 提醒
        toast.info(`${payload.title || ''} · ${payload.message || ''}`.trim());
      }, {
        signal: ctrl.signal,
        _silent: true,
        onProgress: () => { armWatchdog(); },
      })
        .then(() => {
          if (watchdog) clearTimeout(watchdog);
          if (alive && controller === ctrl) { setConnected(false); console.warn('[SSE] connection closed, scheduling reconnect'); scheduleReconnect(); }
        })
        .catch((err) => {
          if (watchdog) clearTimeout(watchdog);
          if (!alive) return;
          if (controller !== ctrl) return;
          const aborted = err?.code === 'ERR_CANCELED' || err?.isCancelled;
          if (aborted) {
            setConnected(false);
            console.warn('[SSE] stream cancelled, scheduling reconnect');
            scheduleReconnect();
            return;
          }
          setConnected(false);
          console.error('[SSE] connection failed, scheduling reconnect:', err?.code, err?.message, err?.response?.status);
          scheduleReconnect();
        });
    };

    const onTokenRefresh = () => { if (alive && isLoggedInRef.current) { console.log('[SSE] token refreshed, reconnecting'); scheduleReconnect(true); } };
    const onLogin = () => {
      if (!alive || !authService.isLoggedIn()) return;
      isLoggedInRef.current = true;
      console.log('[SSE] login successful, connecting');
      scheduleReconnect(true);
    };
    const onOnline = () => { if (alive && isLoggedInRef.current) { console.log('[SSE] network online, reconnecting'); scheduleReconnect(true); } };
    const onVisibility = () => { if (alive && isLoggedInRef.current && document.visibilityState === 'visible') { console.log('[SSE] tab visible, reconnecting'); scheduleReconnect(true); } };
    const onLogout = () => {
      console.log('[SSE] logged out, disconnecting');
      alive = false;
      teardown();
      isLoggedInRef.current = false;
      setConnected(false);
      setUnread(0);
      setNotifications([]);
    };

    // 首次登录判定
    // The access token is authoritative. user_info is merely a UI cache and
    // can be absent while session restoration is still in progress.
    isLoggedInRef.current = authService.isLoggedIn();
    if (isLoggedInRef.current) {
      connect();
    }

    window.addEventListener('auth:token-refreshed', onTokenRefresh);
    window.addEventListener('auth:login', onLogin);
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('auth:logout', onLogout);

    return () => {
      alive = false;
      window.removeEventListener('auth:token-refreshed', onTokenRefresh);
      window.removeEventListener('auth:login', onLogin);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('auth:logout', onLogout);
      teardown();
    };
  }, [toast]);

  const value = useMemo(() => ({
    notifications,
    unread,
    loading,
    connected,
    load,
    markAll,
  }), [notifications, unread, loading, connected, load, markAll]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
