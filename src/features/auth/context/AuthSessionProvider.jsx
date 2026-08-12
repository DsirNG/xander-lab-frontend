import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authService } from '@features/auth/services/authService';
import AuthSessionContext from './authSessionContextValue';

/**
 * 全局登录会话状态
 *
 * 主布局之外的全屏页面（博客发布、工作室、定时发文等）同样依赖登录态，
 * 而原来的 SessionHealthCheck 只在应用启动时校验一次。此 Provider 在
 * 应用根级持有 userInfo 并主动保持会话新鲜：
 *
 *  - 挂载时校验本地保存的会话（网络失败保留本地状态）
 *  - 登录后按固定间隔轮询 /me，主动发现令牌过期
 *  - 标签页重新可见、窗口重新聚焦、token 刷新后立即复检
 *  - 监听 auth:login / auth:logout 事件同步 userInfo
 *
 * 任意页面通过 useAuthSession() 读取登录态，避免各页面各自读取 localStorage。
 */

const SESSION_CHECK_INTERVAL_MS = 5 * 60 * 1000;

export const AuthSessionProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => authService.getLocalUserInfo());
  const checkingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (checkingRef.current) return;
    if (!authService.isLoggedIn()) {
      setUserInfo(null);
      return;
    }
    checkingRef.current = true;
    try {
      const info = await authService.checkCurrentSession();
      if (info) setUserInfo(info);
    } catch {
      // 401/刷新失败已由 HTTP 拦截器统一处理（forceLoggedOut → auth:logout）
    } finally {
      checkingRef.current = false;
    }
  }, []);

  // 挂载时校验一次（替代原 SessionHealthCheck）
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 登录态下周期性复检 + 可见/聚焦/刷新事件触发复检
  useEffect(() => {
    const onLogin = () => {
      setUserInfo(authService.getLocalUserInfo());
      refresh();
    };
    const onLogout = () => setUserInfo(null);
    const onTokenRefresh = () => refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const onFocus = () => refresh();
    const onOnline = () => refresh();

    window.addEventListener('auth:login', onLogin);
    window.addEventListener('auth:logout', onLogout);
    window.addEventListener('auth:token-refreshed', onTokenRefresh);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    const timer = window.setInterval(refresh, SESSION_CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener('auth:login', onLogin);
      window.removeEventListener('auth:logout', onLogout);
      window.removeEventListener('auth:token-refreshed', onTokenRefresh);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
      window.clearInterval(timer);
    };
  }, [refresh]);

  const value = useMemo(() => ({
    userInfo,
    isAuthenticated: !!userInfo,
    refresh,
  }), [userInfo, refresh]);

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
};

export default AuthSessionProvider;
