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
            // 主动登出：跳过过期恢复逻辑，避免误弹「登录已过期」
            await post(`${BASE}/logout`, { refreshToken }, {
                _silent: true,
                _skipAuthRecovery: true,
            });
        } finally {
            // tokenStorage.clear 同步清除 access/refresh/user_info
            tokenStorage.clear();
            window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'logout' } }));
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
     * 应用启动时校验当前浏览器保存的会话。
     * /me 发生 401 时由共享 HTTP 层携带当前 refresh token 静默刷新并重试；
     * 刷新失败时也由该层统一清理当前会话并派发 auth:logout。
     */
    checkCurrentSession: async () => {
        if (!tokenStorage.getToken() && !tokenStorage.getRefreshToken()) return null;
        const userInfo = await get(`${BASE}/me`, undefined, { _silent: true, dedupe: false });
        if (userInfo) localStorage.setItem('user_info', JSON.stringify(userInfo));
        return userInfo;
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
