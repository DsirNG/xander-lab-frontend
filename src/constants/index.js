/**
 * 应用常量定义
 * 统一管理应用中使用的常量
 */

// 路由路径常量
export const ROUTES = {
  HOME: '/',
  INFRA: '/infra',
  MODULES: '/modules',
  COMPONENTS: '/components',
};

// 本地存储键名
export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  USER_PREFERENCES: 'user_preferences',
};

// 事件名称
export const EVENTS = {
  THEME_CHANGE: 'theme:change',
  LANGUAGE_CHANGE: 'language:change',
};

export default {
  ROUTES,
  STORAGE_KEYS,
  EVENTS,
};

