/**
 * Studio API service.
 * 统一使用 http.js 封装的 axios 实例发起请求，通过 baseURL: '' 覆盖 /api 前缀。
 * 自动携带 token、统一错误 toast、401 处理等逻辑均由 http.js 拦截器处理。
 *
 * @module features/studio/services/studioService
 */

import { download, get, post, put } from '@api/http';

/** studio 请求通用配置：覆盖 http.js 的 /api baseURL */
const STUDIO_CONFIG = { baseURL: '' };

export async function fetchProjects() {
  return get('/studio-api/projects', {}, STUDIO_CONFIG);
}

export async function fetchProject(projectId) {
  return get(`/studio-api/projects/${projectId}`, {}, STUDIO_CONFIG);
}

export async function uploadProject(file) {
  const formData = new FormData();
  formData.append('project', file);

  return post('/studio-api/projects/upload', formData, {
    ...STUDIO_CONFIG,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function uploadComponent(componentFile, demoFile = null, externalCss = '') {
  const formData = new FormData();
  formData.append('component', componentFile);

  if (demoFile) {
    formData.append('demo', demoFile);
  }

  if (externalCss.trim()) {
    formData.append('externalCss', externalCss.trim());
  }

  return post('/studio-api/components/vue/upload', formData, {
    ...STUDIO_CONFIG,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function uploadVueComponent(componentFile, demoFile = null, externalCss = '') {
  return uploadComponent(componentFile, demoFile, externalCss);
}

export async function fetchFileTree(projectId) {
  return get(`/studio-api/projects/${projectId}/files`, {}, STUDIO_CONFIG);
}

export async function fetchFileContent(projectId, filePath) {
  return get(`/studio-api/projects/${projectId}/files/content`, { path: filePath }, STUDIO_CONFIG);
}

export async function updateProjectVisibility(projectId, visibility) {
  return put(`/studio-api/projects/${projectId}/visibility`, { visibility }, STUDIO_CONFIG);
}

export async function fetchPublicProject(projectId) {
  return get(`/studio-api/public/projects/${projectId}`, {}, STUDIO_CONFIG);
}

export async function fetchPublicFileTree(projectId) {
  return get(`/studio-api/public/projects/${projectId}/files`, {}, STUDIO_CONFIG);
}

export async function fetchPublicFileContent(projectId, filePath) {
  return get(`/studio-api/public/projects/${projectId}/files/content`, { path: filePath }, STUDIO_CONFIG);
}

export function downloadPublicProjectSource(projectId, name) {
  return download(`/studio-api/public/projects/${projectId}/download`, { filename: `${name || projectId}-source.zip`, config: STUDIO_CONFIG });
}

/**
 * 返回后端提供的预览 URL（子域名格式 http://<projectId>.localhost:3010/）
 * *.localhost 在大多数系统上默认解析到 127.0.0.1，iframe 可直接加载
 */
export function convertPreviewUrl(previewUrl, _projectId) {
  return previewUrl || '';
}

export function isTerminalStatus(status) {
  return status === 'ready' || status === 'failed';
}

export function getStatusColor(status) {
  switch (status) {
    case 'ready':
      return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    case 'failed':
      return 'text-red-700 bg-red-50 border-red-100';
    case 'building':
    case 'installing':
    case 'extracting':
    case 'preparing':
    case 'publishing':
    case 'queued':
      return 'text-amber-700 bg-amber-50 border-amber-100';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-100';
  }
}

export function getStatusLabel(status) {
  const labels = {
    queued: '排队中',
    extracting: '解压中',
    installing: '安装依赖',
    building: '构建中',
    preparing: '准备预览',
    publishing: '发布预览',
    ready: '已就绪',
    failed: '失败',
  };

  return labels[status] || status || '未知';
}
