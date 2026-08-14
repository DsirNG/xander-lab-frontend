import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import usePublishSubmitHook from './usePublishSubmit.js'

const navigateMock = vi.hoisted(() => vi.fn())
const blogServiceMock = vi.hoisted(() => ({
  publishBlog: vi.fn(),
  getPublishStatus: vi.fn(),
  updateBlog: vi.fn(),
  updateBlogStatus: vi.fn(),
}))
const storeMock = vi.hoisted(() => ({
  ensurePublishRequestId: vi.fn(() => 'req-1'),
  getPublishRequestId: vi.fn(() => 'req-1'),
  clearPublishRequestId: vi.fn(),
  saveDraft: vi.fn(() => true),
}))
const i18nMock = vi.hoisted(() => ({
  t: (key) => `t:${key}`,
}))

vi.mock('react-router-dom', () => ({ useNavigate: () => navigateMock }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: i18nMock.t }) }))
vi.mock('../services/blogService', () => ({ blogService: blogServiceMock, BLOG_STATUS: { DRAFT: 0, PUBLISHED: 1, TRASH: -1 } }))
vi.mock('../services/publishStorage', () => storeMock)

const formData = { title: '标题', content: '内容', summary: '', categoryId: 1, tags: [] }

const toast = { success: vi.fn(), warning: vi.fn(), error: vi.fn() }
const consumeDraft = vi.fn()

const defaultProps = {
  formData,
  isEditMode: false,
  editId: null,
  toast,
  consumeDraft,
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('usePublishSubmit 表单校验', () => {
  it('缺少必填字段时仅提示警告且不发请求', async () => {
    const { result } = renderHook(() =>
      usePublishSubmitHook({ ...defaultProps, formData: { title: '', content: '内容', categoryId: 1 } })
    )
    await act(async () => {
      await result.current.handlePublish()
    })
    expect(toast.warning).toHaveBeenCalledWith('t:blog.fillRequired')
    expect(blogServiceMock.publishBlog).not.toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
  })
})

describe('usePublishSubmit 发布流程', () => {
  it('新帖：携带幂等键发布，成功后清请求 ID、消费草稿并跳转', async () => {
    blogServiceMock.publishBlog.mockResolvedValue({})
    const { result } = renderHook(() => usePublishSubmitHook(defaultProps))

    await act(async () => {
      await result.current.handlePublish()
    })

    expect(storeMock.ensurePublishRequestId).toHaveBeenCalled()
    expect(blogServiceMock.publishBlog).toHaveBeenCalledWith(
      { title: '标题', summary: '', content: '内容', categoryId: 1, tags: [], publish: true },
      { headers: { 'Idempotency-Key': 'req-1' }, timeout: 0 }
    )
    expect(storeMock.clearPublishRequestId).toHaveBeenCalled()
    expect(consumeDraft).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('t:blog.publishSuccess')
    expect(navigateMock).toHaveBeenCalledWith('/blog/')
    expect(result.current.loading).toBe(false)
  })

  it('编辑模式：更新草稿为已发布状态并跳转个人页', async () => {
    blogServiceMock.updateBlog.mockResolvedValue({})
    blogServiceMock.updateBlogStatus.mockResolvedValue({})
    const { result } = renderHook(() =>
      usePublishSubmitHook({ ...defaultProps, isEditMode: true, editId: 7 })
    )

    await act(async () => {
      await result.current.handlePublish()
    })

    expect(blogServiceMock.updateBlog).toHaveBeenCalledWith(7, expect.objectContaining({ publish: true }))
    expect(blogServiceMock.updateBlogStatus).toHaveBeenCalledWith(7, 1)
    expect(blogServiceMock.publishBlog).not.toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith('/profile')
  })
})

describe('usePublishSubmit 发布失败降级', () => {
  it('网络状态不确定时轮询发布状态，命中已发布即视为成功', async () => {
    blogServiceMock.publishBlog.mockRejectedValue({ code: 'ECONNABORTED' })
    blogServiceMock.getPublishStatus.mockResolvedValue({ status: 'published' })
    const { result } = renderHook(() => usePublishSubmitHook(defaultProps))

    await act(async () => {
      await result.current.handlePublish()
    })

    expect(blogServiceMock.getPublishStatus).toHaveBeenCalledWith('req-1', {
      timeout: 5000, _silent: true, dedupe: false,
    })
    expect(storeMock.clearPublishRequestId).toHaveBeenCalled()
    expect(consumeDraft).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('t:blog.publishSuccess')
    expect(navigateMock).toHaveBeenCalledWith('/blog/')
  })

  it('无响应错误时轮询 5 次全部未发布，提示状态未知', async () => {
    vi.useFakeTimers()
    blogServiceMock.publishBlog.mockRejectedValue({})
    blogServiceMock.getPublishStatus.mockResolvedValue({ status: 'processing' })
    const { result } = renderHook(() => usePublishSubmitHook(defaultProps))

    let promise
    await act(async () => {
      promise = result.current.handlePublish()
      await vi.advanceTimersByTimeAsync(5000)
      await promise
    })

    expect(blogServiceMock.getPublishStatus).toHaveBeenCalledTimes(5)
    expect(toast.warning).toHaveBeenCalledWith('t:blog.publishStatusUnknown')
    expect(navigateMock).not.toHaveBeenCalled()
    expect(storeMock.clearPublishRequestId).not.toHaveBeenCalled()
  })

  it('轮询接口报错时计入尝试次数，最终提示状态未知', async () => {
    vi.useFakeTimers()
    blogServiceMock.publishBlog.mockRejectedValue({})
    blogServiceMock.getPublishStatus.mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => usePublishSubmitHook(defaultProps))

    await act(async () => {
      const promise = result.current.handlePublish()
      await vi.advanceTimersByTimeAsync(5000)
      await promise
    })

    expect(toast.warning).toHaveBeenCalledWith('t:blog.publishStatusUnknown')
  })

  it('明确的业务错误直接提示错误信息', async () => {
    blogServiceMock.publishBlog.mockRejectedValue({ response: { status: 400 }, message: 'bad' })
    const { result } = renderHook(() => usePublishSubmitHook(defaultProps))

    await act(async () => {
      await result.current.handlePublish()
    })

    expect(blogServiceMock.getPublishStatus).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('bad')
    expect(navigateMock).not.toHaveBeenCalled()
  })
})

describe('usePublishSubmit 保存草稿', () => {
  it('新帖：发布草稿成功并跳转个人页', async () => {
    blogServiceMock.publishBlog.mockResolvedValue({})
    const { result } = renderHook(() => usePublishSubmitHook(defaultProps))

    await act(async () => {
      await result.current.handleSaveDraft()
    })

    expect(blogServiceMock.publishBlog).toHaveBeenCalledWith(expect.objectContaining({ publish: false }))
    expect(consumeDraft).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('t:blog.saveDraftServerSuccess')
    expect(navigateMock).toHaveBeenCalledWith('/profile')
  })

  it('编辑模式：更新文章为草稿状态', async () => {
    blogServiceMock.updateBlog.mockResolvedValue({})
    blogServiceMock.updateBlogStatus.mockResolvedValue({})
    const { result } = renderHook(() =>
      usePublishSubmitHook({ ...defaultProps, isEditMode: true, editId: 7 })
    )

    await act(async () => {
      await result.current.handleSaveDraft()
    })

    expect(blogServiceMock.updateBlog).toHaveBeenCalledWith(7, expect.objectContaining({ publish: false }))
    expect(blogServiceMock.updateBlogStatus).toHaveBeenCalledWith(7, 0)
  })

  it('保存失败且本地草稿回退成功时提示降级警告', async () => {
    blogServiceMock.publishBlog.mockRejectedValue(new Error('offline'))
    storeMock.saveDraft.mockReturnValue(true)
    const { result } = renderHook(() => usePublishSubmitHook(defaultProps))

    await act(async () => {
      await result.current.handleSaveDraft()
    })

    expect(storeMock.saveDraft).toHaveBeenCalledWith(formData)
    expect(toast.warning).toHaveBeenCalledWith('t:blog.saveDraftLocalFallback')
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('保存失败且本地回退也失败时提示错误', async () => {
    blogServiceMock.publishBlog.mockRejectedValue(new Error('offline'))
    storeMock.saveDraft.mockReturnValue(false)
    const { result } = renderHook(() => usePublishSubmitHook(defaultProps))

    await act(async () => {
      await result.current.handleSaveDraft()
    })

    expect(toast.error).toHaveBeenCalledWith('offline')
  })
})