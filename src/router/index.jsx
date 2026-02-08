/**
 * 路由配置
 * Router Configuration
 * @module router
 * @author Xander Lab Team
 * @created 2026-02-05
 */

import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '@components/layouts/MainLayout';
import BlogLayout from '@features/blog/layouts/BlogLayout';

// Features
import HomePage from '@features/home/pages/HomePage';
import InfraList from '@features/infra/pages/InfraList';
import InfraContent from '@features/infra/pages/InfraContent';
import ModuleList from '@features/modules/pages/ModuleList';
import ModuleContent from '@features/modules/pages/ModuleContent';
import ComponentList from '@features/components/pages/ComponentList';
import ComponentContent from '@features/components/pages/ComponentContent';
import BlogHome from '@features/blog/pages/BlogHome';
import BlogDetail from '@features/blog/pages/BlogDetail';
import BlogTags from '@features/blog/pages/BlogTags';

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
            ...infraSystems.map(system => ({
              path: system.id,
              children: [
                {
                  index: true,
                  element: <InfraContent system={system} />,
                },
                ...(system.detailPages || []).map(detailPage => ({
                  path: detailPage.type,
                  element: (
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                      <detailPage.component />
                    </Suspense>
                  ),
                })),
              ],
            })),
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
            ...featureModules.map(module => ({
              path: module.id,
              children: [
                {
                  index: true,
                  element: <ModuleContent module={module} />,
                },
                ...(module.detailPages || []).map(detailPage => ({
                  path: detailPage.type,
                  element: (
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                      <detailPage.component />
                    </Suspense>
                  ),
                })),
              ],
            })),
          ],
        },
        {
          path: 'components',
          element: <ComponentList />,
          children: [
            {
              index: true,
              element: <Navigate to="custom-select" replace />,
            },
            ...components.map(component => ({
              path: component.id,
              children: [
                {
                  index: true,
                  element: <ComponentContent component={component} />,
                },
                ...(component.detailPages || []).map(detailPage => ({
                  path: detailPage.type,
                  element: (
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                      <detailPage.component />
                    </Suspense>
                  ),
                })),
              ],
            })),
          ],
        },
        // 博客路由 - 独立 Layout
        {
          path: 'blog',
          element: <BlogLayout />,
          children: [
            {
              index: true,
              element: <BlogHome />,
            },
            {
              path: 'tags',
              element: <BlogTags />,
            },
            {
              path: ':id',
              element: <BlogDetail />,
            },
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

export default createRouter;
