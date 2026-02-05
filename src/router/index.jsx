/**
 * 路由配置
 * Router Configuration
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

// 配置路由数据
export const routerConfig = [
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
          {
            path: ':systemId',
            element: <InfraContent />,
          },
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
          {
            path: ':moduleId',
            element: <ModuleContent />,
          },
          {
            path: 'drag-drop/deep-dive',
            element: <DragDropSystem />,
          },
        ],
      },
      {
        path: 'components',
        element: <ComponentsPage />,
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

// 创建路由实例
const router = createBrowserRouter(routerConfig);

export default router;

