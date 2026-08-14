import { afterEach, describe, expect, it, vi } from 'vitest'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  'delete': vi.fn(),
}))

vi.mock('@api', () => apiMock)

const { blogService, BLOG_STATUS } = await import('./blogService.js')

afterEach(() => {
  vi.clearAllMocks()
})

describe('BLOG_STATUS 常量', () => {
  it('定义草稿/已发布/回收站状态码', () => {
    expect(BLOG_STATUS).toEqual({ DRAFT: 0, PUBLISHED: 1, TRASH: -1 })
  })
})

describe('blogService.getMyBlogs 参数过滤', () => {
  it('过滤空值与 undefined/null，保留 0 状态', () => {
    blogService.getMyBlogs({ search: '', status: 0, page: 2, size: 5 })
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog/posts/mine', { status: 0, page: 2, size: 5 }, undefined)
  })

  it('全部为空时退化为默认分页参数', () => {
    blogService.getMyBlogs()
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog/posts/mine', { page: 1, size: 10 }, undefined)
  })

  it('显式传入 -1 回收站状态保留入参', () => {
    blogService.getMyBlogs({ status: -1 })
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog/posts/mine', { status: -1, page: 1, size: 10 }, undefined)
  })
})

describe('blogService.getBlogs 参数过滤', () => {
  it('过滤空 category/tag/search', () => {
    blogService.getBlogs({ search: '', category: 'tech', tag: '', page: 3 })
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog/posts', { category: 'tech', page: 3, size: 10 }, undefined)
  })
})

describe('blogService 端点映射', () => {
  it('发布/草稿与发布状态查询', () => {
    blogService.publishBlog({ title: 't' })
    expect(apiMock.post).toHaveBeenCalledWith('/api/blog/posts', { title: 't' }, undefined)
    blogService.getPublishStatus('rid-1')
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog/posts/publish-status', { requestId: 'rid-1' }, undefined)
  })

  it('单品查询与同步', () => {
    blogService.getMyBlogById(5)
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog/posts/mine/5', undefined, undefined)
    blogService.syncToCsdn(5)
    expect(apiMock.post).toHaveBeenCalledWith('/api/blog/posts/5/sync/csdn', undefined, undefined)
  })

  it('更新、状态切换与删除', () => {
    blogService.updateBlog(5, { title: 'x' })
    expect(apiMock.put).toHaveBeenCalledWith('/api/blog/posts/5', { title: 'x' }, undefined)
    blogService.updateBlogStatus(5, 1)
    expect(apiMock.patch).toHaveBeenCalledWith('/api/blog/posts/5/status', { status: 1 }, undefined)
    blogService.softDeleteBlog(5)
    expect(apiMock['delete']).toHaveBeenCalledWith('/api/blog/posts/5', undefined, undefined)
    blogService.permanentlyDeleteBlog(5)
    expect(apiMock['delete']).toHaveBeenCalledWith('/api/blog/posts/5/permanent', undefined, undefined)
  })

  it('浏览端列表、分类、标签', () => {
    blogService.getRecentBlogs()
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog/posts/recent', { limit: 5 }, undefined)
    blogService.getRecentBlogs(3)
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog/posts/recent', { limit: 3 }, undefined)
    blogService.getBlogById(9)
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog/posts/9', undefined, undefined)
    blogService.getCategories()
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog/categories', undefined, undefined)
    blogService.getAllTags()
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog/tags', undefined, undefined)
    blogService.getPopularTags()
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog/tags/popular', { limit: 8 }, undefined)
    blogService.recordView(9)
    expect(apiMock.post).toHaveBeenCalledWith('/api/blog/posts/9/view', undefined, undefined)
  })
})