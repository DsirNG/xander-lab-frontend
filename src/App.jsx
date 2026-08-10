/**
 * 应用根组件
 * @module App
 * @author Xander Lab Team
 * @created 2026-02-05
 */

import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { useMemo, useEffect } from 'react'
import { createRouter } from './router'
import { ToastProvider, ToastContainer } from './components/common/Toast'
import { useToast } from './hooks/useToast'
import ErrorBoundary from './components/common/ErrorBoundary'
import { authService } from './features/auth/services/authService'
import { NotificationProvider } from './features/blog/context/NotificationContext'

/**
 * 全局 Toast 桥接
 * 将 React Toast 上下文暴露为 window.__toast，
 * 使 http.js 等纯 JS 模块也能直接调用 toast 提示。
 */
function ToastBridge() {
  const toast = useToast()

  useEffect(() => {
    window.__toast = (type, msg) => toast[type]?.(msg)
    return () => { delete window.__toast }
  }, [toast])

  return null
}

/**
 * 启动时只验证当前浏览器保存的登录态。
 * 网络暂时不可用时保留本地会话；真正过期会由 HTTP 层刷新或统一登出。
 */
function SessionHealthCheck() {
  useEffect(() => {
    authService.checkCurrentSession().catch(() => {
      // 401/刷新失败已由 HTTP 拦截器处理；网络错误不应误登出用户。
    })
  }, [])

  return null
}

/**
 * App - 应用根组件
 * 负责初始化路由和应用级配置
 *
 * @returns {JSX.Element} 应用根组件
 */
function App() {
  // 路由实例只创建一次，翻译由页面组件内部解析
  const router = useMemo(() => createRouter(), [])

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <ToastProvider>
          <ToastBridge />
          <SessionHealthCheck />
          <NotificationProvider>
            <RouterProvider router={router} />
          </NotificationProvider>
          <ToastContainer />
        </ToastProvider>
      </ErrorBoundary>
    </HelmetProvider>
  )
}

export default App


