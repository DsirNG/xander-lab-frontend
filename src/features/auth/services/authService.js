/**
 * 认证数据服务
 * Auth Data Service
 */

import { post, get, tokenStorage } from '@api';

const BASE = '/api/auth';

export const authService = {
    /**
     * 发送邮箱验证码
     * GET /api/auth/code
     * 
     * @param {string} email
     * @returns {Promise<void>}
     */
    sendCode: (email) => {
        return get(`${BASE}/code`, { email });
    },

    /**
     * 登录（支持密码或验证码）
     * POST /api/auth/login
     * 
     * @param {Object} data - { account, password, code, type }
     * @returns {Promise<Object>} TokenResponse { accessToken, refreshToken, userInfo }
     */
    login: async (data) => {
        const res = await post(`${BASE}/login`, data);
        // 登录成功存入 Token
        if (res.accessToken) {
            tokenStorage.setToken(res.accessToken);
            tokenStorage.setRefreshToken(res.refreshToken);
            // 也可以存入用户信息到 localStorage 或状态管理中
            localStorage.setItem('user_info', JSON.stringify(res.userInfo));
        }
        return res;
    },

    /**
     * 登出
     * POST /api/auth/logout
     */
    logout: async () => {
        const refreshToken = tokenStorage.getRefreshToken();
        try {
            await post(`${BASE}/logout`, { refreshToken });
        } finally {
            tokenStorage.clear();
            localStorage.removeItem('user_info');
        }
    },

    /**
     * 获取当前用户信息
     * GET /api/auth/me
     */
    getCurrentUser: () => {
        return get(`${BASE}/me`);
    },

    /**
     * 获取本地存储的用户信息
     */
    getLocalUserInfo: () => {
        const info = localStorage.getItem('user_info');
        return info ? JSON.parse(info) : null;
    },

    /**
     * 检查是否已登录
     */
    isLoggedIn: () => {
        return !!tokenStorage.getToken();
    }
};
