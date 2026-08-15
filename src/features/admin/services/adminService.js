/**
 * 后台管理数据服务（仅 ADMIN 角色可调用，后端拦截器强制校验）
 * Admin Data Service - connects to Spring Boot backend
 * @module admin/services
 */

import { delete as del, get, patch, post, put } from '@api';

export const FEATURE_KEYS = ['agent', 'blog_agent', 'blog_agent_image', 'img2three_vision'];

export const adminService = {
  /* ---------- 用户封禁/解封 ---------- */
  listUsers: ({ keyword, page = 1, size = 10 } = {}, config) =>
    get('/api/admin/users', { keyword, page, size }, config),
  updateUserStatus: (id, status, config) =>
    patch(`/api/admin/users/${id}/status`, { status }, config),

  /* ---------- 模型供应商 ---------- */
  listProviders: (config) => get('/api/admin/model-providers', undefined, config),
  createProvider: (payload, config) => post('/api/admin/model-providers', payload, config),
  updateProvider: (id, payload, config) =>
    put(`/api/admin/model-providers/${id}`, payload, config),
  setProviderEnabled: (id, enabled, config) =>
    patch(`/api/admin/model-providers/${id}/enabled`, { enabled }, config),
  deleteProvider: (id, config) => del(`/api/admin/model-providers/${id}`, undefined, config),

  /* ---------- 功能模型配置（主模型 + 兜底模型） ---------- */
  listFeatureConfigs: (config) => get('/api/admin/feature-model-configs', undefined, config),
  updateFeatureConfig: (featureKey, payload, config) =>
    put(`/api/admin/feature-model-configs/${featureKey}`, payload, config),
};