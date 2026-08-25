import { afterEach, describe, expect, it, vi } from 'vitest'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  upload: vi.fn(),
}))

vi.mock('@api', () => apiMock)

const { knowledgeService } = await import('./knowledgeService.js')

afterEach(() => {
  vi.clearAllMocks()
})

describe('knowledgeService', () => {
  it('测验成绩单和录音记录是两条独立的历史，端点不能串', () => {
    knowledgeService.listQuizzes(9)
    expect(apiMock.get).toHaveBeenCalledWith('/api/recitations/materials/9/quizzes', undefined, undefined)
    knowledgeService.listAttempts(9)
    expect(apiMock.get).toHaveBeenCalledWith('/api/recitations/materials/9/attempts', undefined, undefined)
  })

  it('config 原样透传，页面才能用 signal 取消和 _silent 静默', () => {
    const config = { signal: 1, _silent: true }
    knowledgeService.listQuizzes(9, config)
    expect(apiMock.get).toHaveBeenCalledWith('/api/recitations/materials/9/quizzes', undefined, config)
  })

  it('materials 的增删查与上传端点映射', () => {
    knowledgeService.list()
    expect(apiMock.get).toHaveBeenCalledWith('/api/recitations/materials', undefined, undefined)
    knowledgeService.get(9)
    expect(apiMock.get).toHaveBeenCalledWith('/api/recitations/materials/9', undefined, undefined)
    knowledgeService.getAttempt(5)
    expect(apiMock.get).toHaveBeenCalledWith('/api/recitations/attempts/5', undefined, undefined)
    knowledgeService.create({ title: '和角公式' })
    expect(apiMock.post).toHaveBeenCalledWith('/api/recitations/materials', { title: '和角公式' }, undefined)
    const file = new File(['x'], 'a.webm')
    knowledgeService.uploadRecording(9, file, { signal: 1 })
    expect(apiMock.upload).toHaveBeenCalledWith(
      '/api/recitations/materials/9/attempts', file, { fieldName: 'file', config: { signal: 1 } },
    )
  })
})
