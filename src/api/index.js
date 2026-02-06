/**
 * API 接口层
 * 统一管理所有 API 请求
 */

// API 基础配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// API 请求封装
export const request = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default {
  request,
};


