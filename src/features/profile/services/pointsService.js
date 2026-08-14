import { get } from '@api/http';

const BASE = '/api/points';

/**
 * 积分账户数据服务
 * 所有接口均需登录，由 http.js 拦截器统一处理 401。
 */
export const pointsService = {
    /**
     * GET /api/points
     * @returns {Promise<{ balance: number, consumedToday: number, enablePreCheck: boolean }>}
     */
    overview: (config) => get(BASE, undefined, config),

    /**
     * GET /api/points/ledger?page=&size=
     * 积分流水（分页）
     */
    ledger: ({ page = 1, size = 20 } = {}, config) => {
        const params = Object.fromEntries(
            Object.entries({ page, size }).filter(([, value]) => value !== '' && value !== undefined && value !== null)
        );
        return get(`${BASE}/ledger`, params, config);
    },

    /**
     * GET /api/points/prices
     * 计价目录（注册赠送、Token 单价、一口价）
     */
    prices: (config) => get(`${BASE}/prices`, undefined, config),
};