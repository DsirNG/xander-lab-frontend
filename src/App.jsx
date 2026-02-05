/**
 * 应用根组件
 * @module App
 * @author Xander Lab Team
 * @created 2026-02-05
 */

// React 相关
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// 第三方库
import { Box as BoxIcon, Layout as LayoutIcon, Move as MoveIcon, MessageSquare, List, HelpCircle, MousePointer2 } from 'lucide-react'

// 内部模块（路径别名）
import MainLayout from '@components/layouts/MainLayout'
import HomePage from '@features/home/pages/HomePage'
import InfraList from '@features/infra/pages/InfraList'
import InfraContent from '@features/infra/pages/InfraContent'
import AnchoredOverlay from '@features/infra/pages/AnchoredOverlay'
import ModuleList from '@features/modules/pages/ModuleList'
import ModuleContent from '@features/modules/pages/ModuleContent'
import DragDropSystem from '@features/modules/pages/DragDropSystem'
import ComponentsPage from '@features/components/pages/ComponentsPage'

/**
 * App - 应用根组件
 * 负责配置应用路由结构和全局数据
 * 
 * @returns {JSX.Element} 应用根组件
 */
function App() {
  // Hooks
  const { t } = useTranslation()

  // 基础设施系统配置
  const infraSystems = [
    {
      id: 'anchored',
      title: t('infra.anchored.title'),
      tag: t('infra.anchored.tag'),
      icon: <BoxIcon className="w-5 h-5" />,
      path: 'anchored/theory',
      scenarios: [
        {
          title: 'Scenario A: Smart Positioning',
          desc: 'Automatically calculates the best axis coordinates relative to the anchor point with dual-RAF synchronization.',
          demo: (
            <div className="flex flex-col items-center space-y-8">
              <div className="w-24 h-12 bg-blue-600/20 border-2 border-dashed border-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600 font-mono">
                ANCHOR
              </div>
              <div className="bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <span className="text-xs font-bold">POS</span>
                </div>
                <div>
                  <p className="text-xs font-bold dark:text-white">Floating Content</p>
                  <p className="text-[10px] text-slate-400">Aligned to Main Axis</p>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    { id: 'focus', title: 'Focus Trap', tag: 'Accessibility', icon: <LayoutIcon className="w-5 h-5" /> },
    { id: 'scroll', title: 'Scroll Management', tag: 'Interaction Physics', icon: <MoveIcon className="w-5 h-5" /> }
  ]

  // 功能模块配置
  const featureModules = [
    { id: 'popover', title: t('modules.popover.title'), desc: t('modules.popover.desc'), icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'dropdown', title: t('modules.dropdown.title'), desc: t('modules.dropdown.desc'), icon: <List className="w-5 h-5" /> },
    { id: 'tooltip', title: t('modules.tooltip.title'), desc: t('modules.tooltip.desc'), icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'drag-drop', title: t('modules.dragdrop.title'), desc: t('modules.dragdrop.desc'), icon: <MoveIcon className="w-5 h-5" />, path: 'drag-drop', hasCustomRouting: true },
    { id: 'context', title: t('modules.context.title'), desc: t('modules.context.desc'), icon: <MousePointer2 className="w-5 h-5" /> }
  ]

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />

          <Route path="infra" element={<InfraList />}>
            <Route index element={<Navigate to="anchored" replace />} />
            {infraSystems.map(system => (
              <Route key={system.id} path={system.id} element={<InfraContent system={system} />} />
            ))}
            <Route path="anchored/theory" element={<AnchoredOverlay />} />
          </Route>

          <Route path="modules" element={<ModuleList />}>
            <Route index element={<Navigate to="popover" replace />} />
            {featureModules.filter(m => !m.hasCustomRouting).map(module => (
              <Route key={module.id} path={module.id} element={<ModuleContent module={module} />} />
            ))}
            <Route path="drag-drop">
              <Route index element={<ModuleContent module={featureModules.find(m => m.id === 'drag-drop')} />} />
              <Route path="deep-dive" element={<DragDropSystem />} />
            </Route>
          </Route>

          <Route path="components" element={<ComponentsPage />} />

          <Route path="*" element={<div className="p-10 text-center">{t('common.notFound')}</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
