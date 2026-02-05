/**
 * 路由配置
 * Router Configuration
 * @module router
 * @author Xander Lab Team
 * @created 2026-02-05
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '@components/layouts/MainLayout';

// Features
import HomePage from '@features/home/pages/HomePage';
import InfraList from '@features/infra/pages/InfraList';
import InfraContent from '@features/infra/pages/InfraContent';
import AnchoredOverlay from '@features/infra/pages/AnchoredOverlay';
import ModuleList from '@features/modules/pages/ModuleList';
import ModuleContent from '@features/modules/pages/ModuleContent';
import DragDropSystem from '@features/modules/pages/DragDropSystem';
import ComponentsPage from '@features/components/pages/ComponentsPage';
import ComponentContent from '@features/components/pages/ComponentContent';

// 配置数据
import { getInfraConfig } from '@features/infra/constants';
import { getModuleConfig } from '@features/modules/constants';
import { getComponentConfig } from '@features/components/constants';

/**
 * 创建路由配置
 * @param {Function} t - i18n 翻译函数
 * @returns {Object} 路由器实例
 */
export const createRouter = (t) => {
  // 获取业务配置数据
  const infraSystems = getInfraConfig(t);
  const featureModules = getModuleConfig(t);
  const components = getComponentConfig(t);

  // 动态生成路由配置
  const routerConfig = [
    {
      path: '/',
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: 'infra',
          element: <InfraList />,
          children: [
            {
              index: true,
              element: <Navigate to="anchored" replace />,
            },
            // 动态生成基础设施路由
            ...infraSystems.map(system => ({
              path: system.id,
              element: <InfraContent system={system} />,
            })),
            // 特殊路由
            {
              path: 'anchored/theory',
              element: <AnchoredOverlay />,
            },
          ],
        },
        {
          path: 'modules',
          element: <ModuleList />,
          children: [
            {
              index: true,
              element: <Navigate to="popover" replace />,
            },
            // 动态生成模块路由（排除自定义路由）
            ...featureModules
              .filter(m => !m.hasCustomRouting)
              .map(module => ({
                path: module.id,
                element: <ModuleContent module={module} />,
              })),
            // drag-drop 特殊路由
            {
              path: 'drag-drop',
              children: [
                {
                  index: true,
                  element: <ModuleContent module={featureModules.find(m => m.id === 'drag-drop')} />,
                },
                {
                  path: 'deep-dive',
                  element: <DragDropSystem />,
                },
              ],
            },
          ],
        },
        {
          path: 'components',
          element: <ComponentsPage />,
          children: [
            {
              index: true,
              element: <Navigate to="button" replace />,
            },
            // 动态生成组件路由
            ...components.map(component => ({
              path: component.id,
              element: <ComponentContent component={component} />,
            })),
          ],
        },
        {
          path: '*',
          element: (
            <div className="p-10 text-center">
              <h1 className="text-2xl font-bold">404 - 页面未找到</h1>
            </div>
          ),
        },
      ],
    },
  ];

  return createBrowserRouter(routerConfig);
};

// 默认导出（将在 main.jsx 中初始化）
export default createRouter;

