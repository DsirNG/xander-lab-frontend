/**
 * 定时发文计划 / 用户通知数据服务
 * Content Plan & Notification Data Service - connects to Spring Boot backend
 * @module blog/services
 */

import { delete as del, get, getStream, patch, post } from '@api';

export const PLAN_STATUS = {
  ACTIVE: 'ACTIVE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  CANCELLED: 'CANCELLED',
};

export const RUN_STATUS = {
  GENERATING: 'GENERATING',
  REVIEWING: 'REVIEWING',
  PUBLISHING: 'PUBLISHING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  REVIEW_REJECTED: 'REVIEW_REJECTED',
};

export const blogPlanService = {
  /* ---------- 定时发文计划 ---------- */
  createPlan: (payload, config) => post('/api/blog-plans', payload, config),
  listPlans: (config) => get('/api/blog-plans', undefined, config),
  getPlan: (id, config) => get(`/api/blog-plans/${id}`, undefined, config),
  updatePlan: (id, payload, config) => patch(`/api/blog-plans/${id}`, payload, config),
  updatePlanStatus: (id, action, config) => patch(`/api/blog-plans/${id}/status`, { action }, config),
  deletePlan: (id, config) => del(`/api/blog-plans/${id}`, undefined, config),
  /** 手动立即执行一次（走同一条生成-审核-发布管线） */
  triggerPlan: (id, config) => post(`/api/blog-plans/${id}/trigger`, undefined, config),
  listRuns: (planId, { page = 1, size = 10 } = {}, config) =>
    get(`/api/blog-plans/${planId}/runs`, { page, size }, config),
  getRun: (planId, runId, config) =>
    get(`/api/blog-plans/${planId}/runs/${runId}`, undefined, config),
  nextRun: (planId, count = 1, config) =>
    get(`/api/blog-plans/${planId}/next`, { count }, config),

  /* ---------- 用户通知 ---------- */
  listNotifications: ({ page = 1, size = 20 } = {}, config) =>
    get('/api/notifications', { page, size }, config),
  markNotificationRead: (id, config) =>
    patch(`/api/notifications/${id}/read`, undefined, config),
  markAllNotificationsRead: (config) =>
    patch('/api/notifications/read-all', undefined, config),
  /** 实时事件流：type/title/message/planId/runId */
  subscribeNotifications: (onEvent, config) =>
    getStream('/api/notifications/events', { ...config, onEvent }),
};