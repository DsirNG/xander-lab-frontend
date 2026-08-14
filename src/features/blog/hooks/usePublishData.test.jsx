import { describe, expect, it, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import usePublishData from './usePublishData.js'

const blogServiceMock = vi.hoisted(() => ({
  getCategories: vi.fn(),
  getAllTags: vi.fn(),
  getMyBlogById: vi.fn(),
}))

vi.mock('../services/blogService', () => ({ blogService: blogServiceMock }))

const CanceledError = (message) => {
  const err = new Error(message)
  err.name = 'CanceledError'
  err.code = 'ERR_CANCELED'
  return err
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('usePublishData', () => {
  it('加载分类/标签并格式化选项', async () => {
    blogServiceMock.getCategories.mockResolvedValue([
      { id: 1, name: '技术' },
      { id: 2, name: '生活' },
    ])
    blogServiceMock.getAllTags.mockResolvedValue([{ name: 'React' }, { name: 'AI' }])
    blogServiceMock.getMyBlogById.mockResolvedValue({ id: 5 })

    let result
    const onDataReady = vi.fn()
    await act(async () => {
      const { result: r } = renderHook(() =>
        usePublishData({ editId: 5, isEditMode: true, onDataReady })
      )
      result = r
    })

    expect(result.current.categories).toEqual([
      { value: '1', label: '技术' },
      { value: '2', label: '生活' },
    ])
    expect(result.current.availableTags).toEqual(['React', 'AI'])
    expect(result.current.pageLoading).toBe(false)
    expect(onDataReady).toHaveBeenCalledWith({
      post: { id: 5 },
      formattedOptions: [
        { value: '1', label: '技术' },
        { value: '2', label: '生活' },
      ],
    })
  })

  it('非编辑模式不请求文章详情，post 为 null', async () => {
    blogServiceMock.getCategories.mockResolvedValue([])
    blogServiceMock.getAllTags.mockResolvedValue([])

    const onDataReady = vi.fn()
    await act(async () => {
      renderHook(() => usePublishData({ editId: null, isEditMode: false, onDataReady }))
    })

    expect(blogServiceMock.getMyBlogById).not.toHaveBeenCalled()
    expect(onDataReady).toHaveBeenCalledWith({ post: null, formattedOptions: [] })
  })

  it('请求失败时通过 onDataReady 回调错误', async () => {
    blogServiceMock.getCategories.mockRejectedValue(new Error('boom'))

    const onDataReady = vi.fn()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await act(async () => {
      renderHook(() => usePublishData({ editId: null, isEditMode: false, onDataReady }))
    })

    expect(onDataReady).toHaveBeenCalledWith({ error: new Error('boom') })
    consoleSpy.mockRestore()
  })

  it('卸载时中止请求，取消错误被静默吞掉', async () => {
    let rejectFn
    blogServiceMock.getCategories.mockReturnValue(
      new Promise((_, reject) => { rejectFn = reject })
    )
    blogServiceMock.getAllTags.mockResolvedValue([])

    const onDataReady = vi.fn()
    const { unmount } = renderHook(() =>
      usePublishData({ editId: null, isEditMode: false, onDataReady })
    )

    await act(async () => {
      unmount()
      rejectFn(CanceledError('canceled'))
    })

    expect(onDataReady).not.toHaveBeenCalled()
  })

  it('onDataReady 引用变化不触发重新加载', async () => {
    blogServiceMock.getCategories.mockResolvedValue([])
    blogServiceMock.getAllTags.mockResolvedValue([])

    const onDataReady = vi.fn()
    const { rerender } = renderHook((props) => usePublishData(props), {
      initialProps: { editId: null, isEditMode: false, onDataReady },
    })
    await act(async () => {
      rerender({ editId: null, isEditMode: false, onDataReady: vi.fn() })
    })

    expect(blogServiceMock.getCategories).toHaveBeenCalledTimes(1)
  })
})