/**
 * 博客数据服务（对接后端 REST API）
 * Blog Data Service - connects to Spring Boot backend
 *
 * 已迁移至企业级 axios 封装 / Migrated to enterprise axios http client
 * @module blog/services
 */

import { get } from '@api';

const BASE = '/api/blog';

export const blogService = {
  /**
   * 获取博客列表（支持搜索、分类、标签筛选，支持分页）
   * GET /api/blog/posts?search=&category=&tag=&page=1&size=10
   *
   * @param {Object} params - 查询参数 { search, category, tag, page, size }
   * @returns {Promise<Object>} 分页对象 { records: [], total: 0, current: 1, ... }
   */
  getBlogs: ({ search = '', category = '', tag = '', page = 1, size = 10 } = {}) => {
    // 过滤空值参数
    const params = Object.fromEntries(
      Object.entries({ search, category, tag, page, size }).filter(
        ([, v]) => v !== '' && v !== undefined && v !== null
      )
    );
    return get(`${BASE}/posts`, params);
  },

  /**
   * 获取最新发布的文章（前N条）
   * GET /api/blog/posts/recent?limit=N
   *
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  getRecentBlogs: (limit = 5) => {
    return get(`${BASE}/posts/recent`, { limit });
  },

  /**
   * 获取博客详情
   * GET /api/blog/posts/{id}
   *
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  getBlogById: (id) => {
    return get(`${BASE}/posts/${id}`);
  },

  /**
   * 获取所有分类（含文章数量）
   * GET /api/blog/categories
   *
   * @returns {Promise<Array>}
   */
  getCategories: () => {
    return get(`${BASE}/categories`);
  },

  /**
   * 获取所有标签（含文章数量，按数量降序）
   * GET /api/blog/tags
   *
   * @returns {Promise<Array<{ name: string, count: number }>>}
   */
  getAllTags: () => {
    return get(`${BASE}/tags`);
  },

  /**
   * 获取热门标签（前N个）
   * GET /api/blog/tags/popular?limit=N
   *
   * @param {number} limit
   * @returns {Promise<Array<{ name: string, count: number }>>}
   */
  getPopularTags: (limit = 8) => {
    return get(`${BASE}/tags/popular`, { limit });
  },
};
