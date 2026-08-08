/**
 * 路由配置
 * Router Configuration
 * @module router
 * @author Xander Lab Team
 * @created 2026-02-05
 */

import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts (始终需要，保持静态导入)
import MainLayout from '@components/layouts/MainLayout';
import BlogLayout from '@features/blog/layouts/BlogLayout';
import RouteSEOLayout from '@components/seo/RouteSEOLayout';
import { LazyPage, ProtectedPage } from './RouteElements';

// Features (路由级懒加载)
const HomePage = React.lazy(() => import('@features/home/pages/HomePage'));
const ModuleList = React.lazy(() => import('@features/modules/pages/ModuleList'));
const ModuleContent = React.lazy(() => import('@features/modules/pages/ModuleContent'));
const ComponentList = React.lazy(() => import('@features/components/pages/ComponentList'));
const ComponentDetailWrapper = React.lazy(() => import('@features/components/pages/ComponentDetailWrapper'));
const ComponentShare = React.lazy(() => import('@features/components/pages/ComponentShare'));
const BlogHome = React.lazy(() => import('@features/blog/pages/BlogHome'));
const BlogDetail = React.lazy(() => import('@features/blog/pages/BlogDetail'));
const BlogTags = React.lazy(() => import('@features/blog/pages/BlogTags'));
const BlogPublish = React.lazy(() => import('@features/blog/pages/BlogPublish'));
const BlogAgent = React.lazy(() => import('@features/blog/pages/BlogAgent'));
const LoginPage = React.lazy(() => import('@features/auth/pages/LoginPage'));
const StudioPage = React.lazy(() => import('@features/studio/pages/StudioPage'));
const ProjectUploadPage = React.lazy(() => import('@features/studio/pages/ProjectUploadPage'));
const ComponentUploadPage = React.lazy(() => import('@features/studio/pages/ComponentUploadPage'));
const CompilerPage = React.lazy(() => import('@features/studio/pages/CompilerPage'));
const PublicSourcePage = React.lazy(() => import('@features/studio/pages/PublicSourcePage'));
const ProfilePage = React.lazy(() => import('@features/profile/pages/ProfilePage'));
const Img2ThreePage = React.lazy(() => import('@features/img2three/pages/Img2ThreePage'));

// 配置数据
import { getModuleConfig } from '@features/modules/constants';

// 通用组件
const NotFoundPage = React.lazy(() => import('@components/common/NotFoundPage'));

// 通用 Suspense 包裹器
/**
 * 创建路由配置
 * 路由结构仅依赖语言无关的 ID 和 detailPages，翻译由页面组件内部解析。
 * @returns {Object} 路由器实例
 */
export const createRouter = () => {
  // 获取业务配置数据（路由结构仅需 id / detailPages 等静态字段）
  const featureModules = getModuleConfig();

  // ─── 业务路由：模块展示（MainLayout 内） ───
  const moduleRoutes = {
    path: 'modules',
    element: <LazyPage><ModuleList /></LazyPage>,
    children: [
      {
        index: true,
        element: <Navigate to="drag-drop" replace />,
      },
      ...featureModules.map(module => ({
        path: module.id,
        children: [
          {
            index: true,
            element: <LazyPage><ModuleContent module={module} /></LazyPage>,
          },
          ...(module.detailPages || []).map(detailPage => ({
            path: detailPage.type,
            element: <LazyPage><detailPage.component /></LazyPage>,
          })),
        ],
      })),
    ],
  };

  // ─── 业务路由：组件库（MainLayout 内） ───
  const componentRoutes = {
    path: 'components',
    element: <LazyPage><ComponentList /></LazyPage>,
    children: [
      {
        path: ':componentId/*',
        element: <LazyPage><ComponentDetailWrapper /></LazyPage>,
      },
    ],
  };

  // ─── 业务路由：博客（MainLayout 内，独立 BlogLayout） ───
  const blogRoutes = {
    path: 'blog',
    element: <BlogLayout />,
    children: [
      {
        index: true,
        element: <LazyPage><BlogHome /></LazyPage>,
      },
      {
        path: 'tags',
        element: <LazyPage><BlogTags /></LazyPage>,
      },
      {
        path: ':id',
        element: <LazyPage><BlogDetail /></LazyPage>,
      },
    ],
  };

  // ─── 业务路由：实验室（MainLayout 内） ───
  const labRoutes = [
    {
      path: 'lab/img2three',
      element: <LazyPage><Img2ThreePage /></LazyPage>,
    },
    {
      path: 'lab/img2three/:taskId',
      element: <LazyPage><Img2ThreePage /></LazyPage>,
    },
  ];

  // ─── 平台主站（MainLayout 包裹） ───
  const mainLayoutRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <LazyPage><HomePage /></LazyPage>,
      },
      moduleRoutes,
      componentRoutes,
      blogRoutes,
      {
        path: 'studio',
        element: <ProtectedPage page={<StudioPage />} />,
      },
      ...labRoutes,
      {
        path: 'profile',
        element: <ProtectedPage page={<ProfilePage />} />,
      },
      {
        path: '*',
        element: <LazyPage><NotFoundPage /></LazyPage>,
      },
    ],
  };

  // ─── 独立路由（不使用 MainLayout） ───
  // 分享组件工作台
  const shareRoutes = [
    {
      path: 'components/share',
      element: <LazyPage><ComponentShare /></LazyPage>,
    },
  ];

  // 博客发布/代理（独立页面）
  const blogStandaloneRoutes = [
    {
      path: 'blog/publish',
      element: <ProtectedPage page={<BlogPublish />} />,
    },
    {
      path: 'blog/agent',
      element: <ProtectedPage page={<BlogAgent />} />,
    },
    {
      path: 'blog/agent/:taskId',
      element: <ProtectedPage page={<BlogAgent />} />,
    },
  ];

  // 工作室编辑器（独立页面）
  const studioRoutes = [
    {
      path: 'studio/project',
      element: <ProtectedPage page={<ProjectUploadPage />} />,
    },
    {
      path: 'studio/component',
      element: <ProtectedPage page={<ComponentUploadPage />} />,
    },
    {
      path: 'studio/compiler/:projectId',
      element: <ProtectedPage page={<CompilerPage />} />,
    },
    {
      path: 'studio/source/:projectId',
      element: <LazyPage><PublicSourcePage /></LazyPage>,
    },
  ];

  // 组装完整路由
  const routerConfig = [{
    element: <RouteSEOLayout />,
    children: [
      {
        path: '/login',
        element: <LazyPage><LoginPage /></LazyPage>,
      },
      mainLayoutRoutes,
      ...shareRoutes,
      ...blogStandaloneRoutes,
      ...studioRoutes,
    ],
  }];

  return createBrowserRouter(routerConfig);
};

export default createRouter;
