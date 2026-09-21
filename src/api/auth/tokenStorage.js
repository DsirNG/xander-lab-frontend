const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_INFO_KEY = "user_info";

/**
 * 浏览器端凭据存储。它只负责 access/refresh token 与用户信息的本地生命周期，
 * 不处理刷新策略、请求拦截器或业务鉴权判断。
 */
export const tokenStorage = {
    getToken: () => localStorage.getItem(TOKEN_KEY),
    setToken: (token, { notify = true } = {}) => {
        localStorage.setItem(TOKEN_KEY, token);
        if (notify) {
            window.dispatchEvent(
                new CustomEvent("auth:token-refreshed", { detail: { token } }),
            );
        }
    },
    removeToken: () => localStorage.removeItem(TOKEN_KEY),

    getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
    setRefreshToken: (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
    removeRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),

    /** 清除全部登录态（token + 本地用户信息），与未登录一致。 */
    clear: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_INFO_KEY);
    },
};
