/**
 * 应用根组件
 * @module App
 * @author Xander Lab Team
 * @created 2026-02-05
 */

import { RouterProvider } from 'react-router-dom'
import { useMemo } from 'react'
import { createRouter } from './router'
import { ToastProvider, ToastContainer } from './components/common/Toast'
import ErrorBoundary from './components/common/ErrorBoundary'

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
    <ErrorBoundary>
      <ToastProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App


