/**
 * Studio API service.
 *
 * @module features/studio/services/studioService
 */

export async function fetchProjects() {
  const res = await fetch('/studio-api/projects');

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '获取项目列表失败' }));
    throw new Error(err.error || '获取项目列表失败');
  }

  return res.json();
}

export async function fetchProject(projectId) {
  const res = await fetch(`/studio-api/projects/${projectId}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '获取项目详情失败' }));
    throw new Error(err.error || '获取项目详情失败');
  }

  return res.json();
}

export async function uploadProject(file) {
  const formData = new FormData();
  formData.append('project', file);

  const res = await fetch('/studio-api/projects/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '项目上传失败' }));
    throw new Error(err.error || '项目上传失败');
  }

  return res.json();
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

  const res = await fetch('/studio-api/components/vue/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '组件上传失败' }));
    throw new Error(err.error || '组件上传失败');
  }

  return res.json();
}

export async function uploadVueComponent(componentFile, demoFile = null, externalCss = '') {
  return uploadComponent(componentFile, demoFile, externalCss);
}

export async function fetchFileTree(projectId) {
  const res = await fetch(`/studio-api/projects/${projectId}/files`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '获取文件目录失败' }));
    throw new Error(err.error || '获取文件目录失败');
  }

  return res.json();
}

export async function fetchFileContent(projectId, filePath) {
  const res = await fetch(
    `/studio-api/projects/${projectId}/files/content?path=${encodeURIComponent(filePath)}`
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '获取文件内容失败' }));
    throw new Error(err.error || '获取文件内容失败');
  }

  return res.json();
}

export function convertPreviewUrl(previewUrl, projectId) {
  if (!previewUrl) return `/studio-preview/${projectId}/`;
  if (previewUrl.startsWith('/studio-preview/')) return previewUrl;

  return `/studio-preview/${projectId}/`;
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
