/**
 * 博客数据服务（对接后端 REST API）
 * Blog Data Service - connects to Spring Boot backend
 *
 * 已迁移至企业级 axios 封装 / Migrated to enterprise axios http client
 * @module blog/services
 */

import { delete as del, get, patch, post, put } from '@api';

const BASE = '/api/blog';

export const BLOG_STATUS = {
  DRAFT: 0,
  PUBLISHED: 1,
  TRASH: -1,
};

export const blogService = {
  /**
   * 发布博客或保存草稿（publish=false）
   * POST /api/blog/posts
   */
  publishBlog: (blogData, config) => {
    return post(`${BASE}/posts`, blogData, config);
  },
  getPublishStatus: (requestId, config) => get(`${BASE}/posts/publish-status`, { requestId }, config),

  /**
   * 我的文章管理列表
   * GET /api/blog/posts/mine?status=&search=&page=&size=
   * status 不传 = 草稿+已发布；0 草稿；1 已发布；-1 回收站
   */
  getMyBlogs: ({ status, search = '', page = 1, size = 10 } = {}, config) => {
    const params = Object.fromEntries(
      Object.entries({ status, search, page, size }).filter(
        ([, v]) => v !== '' && v !== undefined && v !== null
      )
    );
    return get(`${BASE}/posts/mine`, params, config);
  },

  /** GET /api/blog/posts/mine/{id} */
  getMyBlogById: (id, config) => get(`${BASE}/posts/mine/${id}`, undefined, config),

  /** PUT /api/blog/posts/{id} */
  updateBlog: (id, blogData, config) => put(`${BASE}/posts/${id}`, blogData, config),

  /** PATCH /api/blog/posts/{id}/status */
  updateBlogStatus: (id, status, config) =>
    patch(`${BASE}/posts/${id}/status`, { status }, config),

  /** DELETE /api/blog/posts/{id} — soft delete → trash */
  softDeleteBlog: (id, config) => del(`${BASE}/posts/${id}`, undefined, config),

  /** DELETE /api/blog/posts/{id}/permanent — only from trash */
  permanentlyDeleteBlog: (id, config) =>
    del(`${BASE}/posts/${id}/permanent`, undefined, config),

  /**
   * 获取博客列表（支持搜索、分类、标签筛选，支持分页）
   * GET /api/blog/posts?search=&category=&tag=&page=1&size=10
   */
  getBlogs: ({ search = '', category = '', tag = '', page = 1, size = 10 } = {}, config) => {
    const params = Object.fromEntries(
      Object.entries({ search, category, tag, page, size }).filter(
        ([, v]) => v !== '' && v !== undefined && v !== null
      )
    );
    return get(`${BASE}/posts`, params, config);
  },

  getRecentBlogs: (limit = 5, config) => {
    return get(`${BASE}/posts/recent`, { limit }, config);
  },

  getBlogById: (id, config) => {
    return get(`${BASE}/posts/${id}`, undefined, config);
  },

  getCategories: (config) => {
    return get(`${BASE}/categories`, undefined, config);
  },

  getAllTags: (config) => {
    return get(`${BASE}/tags`, undefined, config);
  },

  getPopularTags: (limit = 8, config) => {
    return get(`${BASE}/tags/popular`, { limit }, config);
  },

  recordView: (id, config) => {
    return post(`${BASE}/posts/${id}/view`, undefined, config);
  },
};
