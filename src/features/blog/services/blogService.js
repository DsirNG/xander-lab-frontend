/**
 * 博客数据服务（对接后端 REST API）
 * Blog Data Service - connects to Spring Boot backend
 * @module blog/services
 */

const BASE_URL = '/api/blog';

/**
 * 通用请求方法
 * @param {string} url
 * @param {Object} params - URL 查询参数
 * @returns {Promise<any>} 后端 data 字段
 */
async function request(url, params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  ).toString();
  const fullUrl = query ? `${url}?${query}` : url;

  const res = await fetch(fullUrl);
  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }
  const json = await res.json();
  if (json.code !== 200) {
    throw new Error(json.message || '请求失败');
  }
  return json.data;
}

export const blogService = {
  /**
   * 获取博客列表（支持搜索、分类、标签筛选，支持分页）
   * GET /api/blog/posts?search=&category=&tag=&page=1&size=10
   *
   * @param {Object} params - 查询参数 { search, category, tag, page, size }
   * @returns {Promise<Object>} 分页对象 { records: [], total: 0, current: 1, ... }
   */
  getBlogs: ({ search = '', category = '', tag = '', page = 1, size = 10 } = {}) => {
    return request(`${BASE_URL}/posts`, { search, category, tag, page, size });
  },

  /**
   * 获取最新发布的文章（前N条）
   * GET /api/blog/posts/recent?limit=N
   *
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  getRecentBlogs: (limit = 5) => {
    return request(`${BASE_URL}/posts/recent`, { limit });
  },

  /**
   * 获取博客详情
   * GET /api/blog/posts/{id}
   *
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  getBlogById: (id) => {
    return request(`${BASE_URL}/posts/${id}`);
  },

  /**
   * 获取所有分类（含文章数量）
   * GET /api/blog/categories
   *
   * @returns {Promise<Array>}
   */
  getCategories: () => {
    return request(`${BASE_URL}/categories`);
  },

  /**
   * 获取所有标签（含文章数量，按数量降序）
   * GET /api/blog/tags
   *
   * @returns {Promise<Array<{ name: string, count: number }>>}
   */
  getAllTags: () => {
    return request(`${BASE_URL}/tags`);
  },

  /**
   * 获取热门标签（前N个）
   * GET /api/blog/tags/popular?limit=N
   *
   * @param {number} limit
   * @returns {Promise<Array<{ name: string, count: number }>>}
   */
  getPopularTags: (limit = 8) => {
    return request(`${BASE_URL}/tags/popular`, { limit });
  },
};
