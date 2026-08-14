import { afterEach, describe, expect, it, vi } from 'vitest'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  'delete': vi.fn(),
}))

vi.mock('@api', () => apiMock)

const { csdnService, mcpOAuthService } = await import('./mcpService.js')
const { default: ComponentService } = await import('@/features/components/services/componentService.js')

afterEach(() => {
  vi.clearAllMocks()
})

describe('csdnService', () => {
  it('授权流程端点映射', () => {
    csdnService.startAuthorization()
    expect(apiMock.post).toHaveBeenCalledWith('/api/publishing/csdn/authorization/start')
    csdnService.getAuthorizationStatus()
    expect(apiMock.get).toHaveBeenCalledWith(
      '/api/publishing/csdn/authorization/status', undefined, { _silent: true, dedupe: false }
    )
    csdnService.cancelAuthorization()
    expect(apiMock.post).toHaveBeenCalledWith(
      '/api/publishing/csdn/authorization/cancel', undefined, { _silent: true, dedupe: false }
    )
    csdnService.disconnect()
    expect(apiMock['delete']).toHaveBeenCalledWith('/api/publishing/csdn/authorization')
  })
})

describe('mcpOAuthService', () => {
  it('授权请求查询/审批/拒绝端点映射', () => {
    mcpOAuthService.getAuthorizationRequest('abc/1')
    expect(apiMock.get).toHaveBeenCalledWith(
      '/api/mcp/oauth/authorize/requests/abc%2F1', undefined, { _silent: true, dedupe: false }
    )
    mcpOAuthService.approveAuthorization('req-1')
    expect(apiMock.post).toHaveBeenCalledWith('/api/mcp/oauth/authorize/requests/req-1/approve')
    mcpOAuthService.denyAuthorization('req-1')
    expect(apiMock.post).toHaveBeenCalledWith('/api/mcp/oauth/authorize/requests/req-1/deny')
  })

  it('客户端列表与吊销端点映射（requestId 编码）', () => {
    mcpOAuthService.listClients()
    expect(apiMock.get).toHaveBeenCalledWith(
      '/api/mcp/oauth/clients', undefined, { _silent: true, dedupe: false }
    )
    mcpOAuthService.revokeClient('client/1')
    expect(apiMock['delete']).toHaveBeenCalledWith('/api/mcp/oauth/clients/client%2F1')
  })
})

describe('ComponentService', () => {
  it('getMenu 默认 zh 并可传语言', () => {
    ComponentService.getMenu()
    expect(apiMock.get).toHaveBeenCalledWith('/api/components/menu', { lang: 'zh' }, undefined)
    ComponentService.getMenu('en', { signal: 1 })
    expect(apiMock.get).toHaveBeenCalledWith('/api/components/menu', { lang: 'en' }, { signal: 1 })
  })

  it('getComponentDetail 与 shareComponent 端点映射', () => {
    ComponentService.getComponentDetail('comp-1')
    expect(apiMock.get).toHaveBeenCalledWith('/api/components/comp-1', { lang: 'zh' }, undefined)
    ComponentService.getComponentDetail('comp-1', 'en')
    expect(apiMock.get).toHaveBeenCalledWith('/api/components/comp-1', { lang: 'en' }, undefined)
    ComponentService.shareComponent({ titleZh: 't' })
    expect(apiMock.post).toHaveBeenCalledWith('/api/components/share', { titleZh: 't' }, undefined)
  })
})