import { afterEach, describe, expect, it, vi } from 'vitest'

const apiMock = vi.hoisted(() => ({
  download: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}))

vi.mock('@api/http', () => apiMock)

const {
  fetchProjects,
  fetchProject,
  uploadProject,
  uploadComponent,
  uploadVueComponent,
  fetchFileTree,
  fetchFileContent,
  updateProjectVisibility,
  fetchPublicProject,
  fetchPublicFileTree,
  fetchPublicFileContent,
  downloadPublicProjectSource,
  convertPreviewUrl,
  isTerminalStatus,
  getStatusColor,
  getStatusLabel,
} = await import('./studioService.js')

afterEach(() => {
  vi.clearAllMocks()
})

describe('studioService 项目接口', () => {
  it('fetchProjects/fetchProject 使用 baseURL 覆盖配置', () => {
    fetchProjects()
    expect(apiMock.get).toHaveBeenCalledWith('/studio-api/projects', {}, { baseURL: '' })
    fetchProject(7)
    expect(apiMock.get).toHaveBeenCalledWith('/studio-api/projects/7', {}, { baseURL: '' })
  })

  it('uploadProject 构建 FormData 并设置 multipart 请求头', () => {
    const file = new File(['x'], 'p.zip')
    uploadProject(file)
    expect(apiMock.post).toHaveBeenCalledTimes(1)
    const [url, body, config] = apiMock.post.mock.calls[0]
    expect(url).toBe('/studio-api/projects/upload')
    expect(body).toBeInstanceOf(FormData)
    expect(body.get('project')).toBe(file)
    expect(config).toEqual({
      baseURL: '',
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  })

  it('uploadComponent 按需附加 demo 与 externalCss（已 trim）', () => {
    const component = new File(['a'], 'c.vue')
    const demo = new File(['d'], 'd.vue')
    uploadComponent(component, demo, '  theme.css  ')
    const [url, body] = apiMock.post.mock.calls[0]
    expect(url).toBe('/studio-api/components/vue/upload')
    expect(body.get('component')).toBe(component)
    expect(body.get('demo')).toBe(demo)
    expect(body.get('externalCss')).toBe('theme.css')
  })

  it('uploadComponent 空 demo 与空白 externalCss 时不附加', () => {
    const component = new File(['a'], 'c.vue')
    uploadComponent(component, null, '   ')
    const [, body] = apiMock.post.mock.calls[0]
    expect(body.has('demo')).toBe(false)
    expect(body.has('externalCss')).toBe(false)
    uploadVueComponent(component)
    expect(apiMock.post).toHaveBeenCalledTimes(2)
  })

  it('文件树/内容/可见性/公开接口端点映射', () => {
    fetchFileTree(7)
    expect(apiMock.get).toHaveBeenCalledWith('/studio-api/projects/7/files', {}, { baseURL: '' })
    fetchFileContent(7, 'src/main.js')
    expect(apiMock.get).toHaveBeenCalledWith(
      '/studio-api/projects/7/files/content', { path: 'src/main.js' }, { baseURL: '' }
    )
    updateProjectVisibility(7, 'public')
    expect(apiMock.patch).toHaveBeenCalledWith(
      '/studio-api/projects/7/visibility', { visibility: 'public' }, { baseURL: '' }
    )
    fetchPublicProject(7)
    expect(apiMock.get).toHaveBeenCalledWith('/studio-api/public/projects/7', {}, { baseURL: '' })
    fetchPublicFileTree(7)
    expect(apiMock.get).toHaveBeenCalledWith('/studio-api/public/projects/7/files', {}, { baseURL: '' })
    fetchPublicFileContent(7, 'a.txt')
    expect(apiMock.get).toHaveBeenCalledWith(
      '/studio-api/public/projects/7/files/content', { path: 'a.txt' }, { baseURL: '' }
    )
  })

  it('downloadPublicProjectSource 使用指定文件名（缺省回退 projectId）', () => {
    downloadPublicProjectSource(7, 'demo')
    expect(apiMock.download).toHaveBeenCalledWith('/studio-api/public/projects/7/download', {
      filename: 'demo-source.zip',
      config: { baseURL: '' },
    })
    downloadPublicProjectSource(7)
    expect(apiMock.download).toHaveBeenCalledWith('/studio-api/public/projects/7/download', {
      filename: '7-source.zip',
      config: { baseURL: '' },
    })
  })
})

describe('studioService 工具函数', () => {
  it('convertPreviewUrl 原样返回，空值回退空串', () => {
    expect(convertPreviewUrl('http://1.localhost:3010/')).toBe('http://1.localhost:3010/')
    expect(convertPreviewUrl(undefined)).toBe('')
    expect(convertPreviewUrl('')).toBe('')
  })

  it('isTerminalStatus 仅 ready/failed 为终态', () => {
    expect(isTerminalStatus('ready')).toBe(true)
    expect(isTerminalStatus('failed')).toBe(true)
    expect(isTerminalStatus('building')).toBe(false)
    expect(isTerminalStatus('')).toBe(false)
  })

  it('getStatusColor 按状态返回对应样式类，未知状态回退默认', () => {
    expect(getStatusColor('ready')).toContain('text-success-fg')
    expect(getStatusColor('failed')).toContain('text-danger-fg')
    expect(getStatusColor('building')).toContain('text-warning-fg')
    expect(getStatusColor('queued')).toContain('text-warning-fg')
    expect(getStatusColor('unknown')).toContain('text-ink-muted')
  })

  it('getStatusLabel 已知映射中文标签，未知回退原值/空串回退未知', () => {
    expect(getStatusLabel('ready')).toBe('已就绪')
    expect(getStatusLabel('failed')).toBe('失败')
    expect(getStatusLabel('building')).toBe('构建中')
    expect(getStatusLabel('custom-status')).toBe('custom-status')
    expect(getStatusLabel('')).toBe('未知')
  })
})