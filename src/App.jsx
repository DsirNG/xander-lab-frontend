/**
 * 应用根组件
 * @module App
 * @author Xander Lab Team
 * @created 2026-02-05
 */

import { RouterProvider } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { createRouter } from './router'
import { ToastProvider, ToastContainer } from './components/common/Toast'

/**
 * App - 应用根组件
 * 负责初始化路由和应用级配置
 *
 * @returns {JSX.Element} 应用根组件
 */
function App() {
  const { t } = useTranslation()

  // 使用 t 函数创建路由实例
  const router = useMemo(() => createRouter(t), [t])

  return (
    <ToastProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </ToastProvider>
  )
}

export default App


