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
const AgentChat = React.lazy(() => import('@features/agent/pages/AgentChat'));
const BlogPlans = React.lazy(() => import('@features/blog/pages/BlogPlans'));
const BlogPlanDetail = React.lazy(() => import('@features/blog/pages/BlogPlanDetail'));
const LoginPage = React.lazy(() => import('@features/auth/pages/LoginPage'));
const StudioPage = React.lazy(() => import('@features/studio/pages/StudioPage'));
const ProjectUploadPage = React.lazy(() => import('@features/studio/pages/ProjectUploadPage'));
const ComponentUploadPage = React.lazy(() => import('@features/studio/pages/ComponentUploadPage'));
const CompilerPage = React.lazy(() => import('@features/studio/pages/CompilerPage'));
const PublicSourcePage = React.lazy(() => import('@features/studio/pages/PublicSourcePage'));
const ProfilePage = React.lazy(() => import('@features/profile/pages/ProfilePage'));
const Img2ThreePage = React.lazy(() => import('@features/img2three/pages/Img2ThreePage'));
const WorkspaceLayout = React.lazy(() => import('@features/workspace/WorkspaceLayout'));
const BlogManagePage = React.lazy(() => import('@features/workspace/pages/BlogManagePage'));
const EmailRemindersPage = React.lazy(() => import('@features/workspace/pages/EmailRemindersPage'));

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

  // ─── 工作台（后台功能集中地：左侧菜单 + 右侧内容，需登录） ───
  const workspaceRoutes = [
    {
      path: '/workspace',
      element: <LazyPage><WorkspaceLayout /></LazyPage>,
      children: [
        {
          index: true,
          element: <Navigate to="/workspace/plans" replace />,
        },
        {
          path: 'plans',
          element: <LazyPage><BlogPlans /></LazyPage>,
        },
        {
          path: 'plans/:id',
          element: <LazyPage><BlogPlanDetail /></LazyPage>,
        },
        {
          path: 'img2three',
          element: <LazyPage><Img2ThreePage /></LazyPage>,
        },
        {
          path: 'img2three/:taskId',
          element: <LazyPage><Img2ThreePage /></LazyPage>,
        },
        {
          path: 'blog-manage',
          element: <LazyPage><BlogManagePage /></LazyPage>,
        },
        {
          path: 'email-reminders',
          element: <LazyPage><EmailRemindersPage /></LazyPage>,
        },
        {
          path: 'studio',
          element: <LazyPage><StudioPage /></LazyPage>,
        },
      ],
    },
    // 发文 / 博客智能体（独立全屏页面，进入后展开为完整创作界面）
    {
      path: '/workspace/publish',
      element: <ProtectedPage page={<BlogPublish />} />,
    },
    // 博客智能体（独立全屏对话页，进入后展开为完整创作界面）
    {
      path: '/workspace/agent',
      element: <ProtectedPage page={<AgentChat />} />,
    },
    {
      path: '/workspace/agent/:conversationId',
      element: <ProtectedPage page={<AgentChat />} />,
    },
    // 博客生成助手（原博客智能体流水线，独立全屏页面）
    {
      path: '/workspace/blog-tool',
      element: <ProtectedPage page={<BlogAgent />} />,
    },
    {
      path: '/workspace/blog-tool/:taskId',
      element: <ProtectedPage page={<BlogAgent />} />,
    },
    // 工作室深层全屏页面（上传/编译器，独立于侧边栏布局）
    {
      path: '/workspace/studio/project',
      element: <ProtectedPage page={<ProjectUploadPage />} />,
    },
    {
      path: '/workspace/studio/component',
      element: <ProtectedPage page={<ComponentUploadPage />} />,
    },
    {
      path: '/workspace/studio/compiler/:projectId',
      element: <ProtectedPage page={<CompilerPage />} />,
    },
    {
      path: '/workspace/studio/source/:projectId',
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
      ...workspaceRoutes,
    ],
  }];

  return createBrowserRouter(routerConfig);
};

export default createRouter;
