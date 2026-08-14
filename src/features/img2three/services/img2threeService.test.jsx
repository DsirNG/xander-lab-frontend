import { afterEach, describe, expect, it, vi } from 'vitest'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  postStream: vi.fn(),
  upload: vi.fn(),
}))

vi.mock('@api', () => apiMock)

const { img2threeService } = await import('./img2threeService.js')

afterEach(() => {
  vi.clearAllMocks()
})

describe('img2threeService', () => {
  it('createTask 走 upload 并携带 fieldName', () => {
    const file = new File(['x'], 'a.png')
    img2threeService.createTask(file, { signal: 1 })
    expect(apiMock.upload).toHaveBeenCalledWith(
      '/api/img2three/tasks', file, { fieldName: 'file', config: { signal: 1 } }
    )
  })

  it('listTasks/getTask 端点映射', () => {
    img2threeService.listTasks()
    expect(apiMock.get).toHaveBeenCalledWith('/api/img2three/tasks', undefined, undefined)
    img2threeService.getTask(3)
    expect(apiMock.get).toHaveBeenCalledWith('/api/img2three/tasks/3', undefined, undefined)
  })

  it('runTaskStream 合并 onEvent', () => {
    const onEvent = vi.fn()
    img2threeService.runTaskStream(3, onEvent, { signal: 1 })
    expect(apiMock.postStream).toHaveBeenCalledWith(
      '/api/img2three/tasks/3/run/stream', undefined, { onEvent, signal: 1 }
    )
  })
})