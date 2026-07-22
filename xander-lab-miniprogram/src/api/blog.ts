import { request } from './http'

export type Article = {
  id: number
  title: string
  summary: string
  content: string | null
  category: string
  categoryName: string
  tags: string[]
  userId: number
  author: string
  date: string
  readTime: string
  tips: string | null
  views: number
}

export type ArticlePage = {
  records: Article[]
  total: number
  current: number
  pages: number
  size: number
  hasMore: boolean
}

export type Category = {
  id?: number
  name: string
  code?: string
  count?: number
}

export type ArticleQuery = {
  search?: string
  category?: string
  tag?: string
  page?: number
  size?: number
}

const toQuery = (params: ArticleQuery) => {
  const entries = Object.entries(params).filter(([, value]) => value !== '' && value != null)
  return entries.length
    ? `?${entries.map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`).join('&')}`
    : ''
}

export const blogApi = {
  getArticles: (params: ArticleQuery = {}) =>
    request<ArticlePage>(`/api/blog/posts${toQuery({ page: 1, size: 10, ...params })}`),
  getRecentArticles: (limit = 5) => request<Article[]>(`/api/blog/posts/recent?limit=${limit}`),
  getArticle: (id: string | number) => request<Article>(`/api/blog/posts/${id}`),
  getCategories: () => request<Category[]>('/api/blog/categories'),
  getPopularTags: (limit = 8) =>
    request<Array<{ name: string; count: number }>>(`/api/blog/tags/popular?limit=${limit}`),
  recordView: (id: string | number) =>
    request<{ counted: boolean }>(`/api/blog/posts/${id}/view`, { method: 'POST' }),
}
