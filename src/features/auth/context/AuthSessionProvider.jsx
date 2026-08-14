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
  const [userInfo, setUserInfo] = useState(() => (
    authService.hasSessionCredentials() ? authService.getLocalUserInfo() : null
  ));
  const [sessionStatus, setSessionStatus] = useState(() => (
    authService.hasSessionCredentials() ? 'checking' : 'anonymous'
  ));
  const mountedRef = useRef(false);
  const sessionGenerationRef = useRef(0);
  const refreshPromiseRef = useRef(null);
  const refreshQueuedRef = useRef(false);
  const refreshControllerRef = useRef(null);

  const refresh = useCallback(() => {
    // Login and token-refresh events can arrive while /me is already pending.
    // Queue one fresh validation instead of dropping the newer credentials.
    if (refreshPromiseRef.current) {
      refreshQueuedRef.current = true;
      return refreshPromiseRef.current;
    }

    const run = async () => {
      do {
        refreshQueuedRef.current = false;
        const generation = sessionGenerationRef.current;

        if (!authService.hasSessionCredentials()) {
          if (mountedRef.current && generation === sessionGenerationRef.current) {
            setUserInfo(null);
            setSessionStatus('anonymous');
          }
          continue;
        }

        const controller = new AbortController();
        refreshControllerRef.current = controller;
        try {
          const info = await authService.checkCurrentSession({ signal: controller.signal });
          // A logout/login/token rotation invalidates every earlier /me result.
          if (!mountedRef.current || generation !== sessionGenerationRef.current) continue;
          if (!authService.hasSessionCredentials() || !info) {
            authService.setLocalUserInfo(null);
            setUserInfo(null);
            setSessionStatus('anonymous');
          } else {
            // Persistence belongs inside the same generation fence as state.
            authService.setLocalUserInfo(info);
            setUserInfo(info);
            setSessionStatus('authenticated');
          }
        } catch {
          if (!mountedRef.current || generation !== sessionGenerationRef.current) continue;
          // 401/刷新失败由 HTTP 层清理凭据并派发 auth:logout。
          // 网络失败时保留此前已验证的状态；首次恢复仍停留 checking，
          // 不能仅凭缓存 user_info 放行受保护路由。
          if (!authService.hasSessionCredentials()) {
            setUserInfo(null);
            setSessionStatus('anonymous');
          }
        } finally {
          if (refreshControllerRef.current === controller) {
            refreshControllerRef.current = null;
          }
        }
      } while (mountedRef.current && refreshQueuedRef.current);
    };

    const promise = run().finally(() => {
      if (refreshPromiseRef.current === promise) refreshPromiseRef.current = null;
    });
    refreshPromiseRef.current = promise;
    return promise;
  }, []);

  // 挂载时校验一次（替代原 SessionHealthCheck）
  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
      sessionGenerationRef.current += 1;
      refreshControllerRef.current?.abort();
      refreshControllerRef.current = null;
    };
  }, [refresh]);

  // 登录态下周期性复检 + 可见/聚焦/刷新事件触发复检
  useEffect(() => {
    const onLogin = () => {
      sessionGenerationRef.current += 1;
      refreshControllerRef.current?.abort();
      setUserInfo(authService.getLocalUserInfo());
      setSessionStatus('checking');
      refresh();
    };
    const onLogout = () => {
      sessionGenerationRef.current += 1;
      refreshControllerRef.current?.abort();
      authService.setLocalUserInfo(null);
      setUserInfo(null);
      setSessionStatus('anonymous');
    };
    // 账户信息（昵称/头像）更新后同步到本地缓存与全局状态。
    const onUserUpdated = (event) => {
      const user = event?.detail?.user;
      if (!user) return;
      authService.setLocalUserInfo(user);
      setUserInfo(user);
    };
    const onTokenRefresh = () => {
      sessionGenerationRef.current += 1;
      refresh();
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const onFocus = () => refresh();
    const onOnline = () => refresh();

    window.addEventListener('auth:login', onLogin);
    window.addEventListener('auth:logout', onLogout);
    window.addEventListener('auth:user-updated', onUserUpdated);
    window.addEventListener('auth:token-refreshed', onTokenRefresh);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    const timer = window.setInterval(refresh, SESSION_CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener('auth:login', onLogin);
      window.removeEventListener('auth:logout', onLogout);
      window.removeEventListener('auth:user-updated', onUserUpdated);
      window.removeEventListener('auth:token-refreshed', onTokenRefresh);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
      window.clearInterval(timer);
    };
  }, [refresh]);

  const value = useMemo(() => ({
    userInfo,
    sessionStatus,
    isAuthenticated: sessionStatus === 'authenticated',
    refresh,
  }), [userInfo, sessionStatus, refresh]);

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
};

export default AuthSessionProvider;
