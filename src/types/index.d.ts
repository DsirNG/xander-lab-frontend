/**
 * TypeScript 类型定义
 * 统一管理应用的类型定义
 */

// 通用类型
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'zh';

// 路由类型
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  children?: RouteConfig[];
}

// 组件通用 Props
export interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// 导航项类型
export interface NavItem {
  id: string;
  title: string;
  path: string;
  icon?: React.ReactNode;
}

// 系统配置类型
export interface SystemConfig {
  id: string;
  title: string;
  tag: string;
  icon: React.ReactNode;
  path?: string;
  scenarios?: Array<{
    title: string;
    desc: string;
    demo: React.ReactNode;
  }>;
}

// 模块配置类型
export interface ModuleConfig {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  path?: string;
  hasCustomRouting?: boolean;
}

