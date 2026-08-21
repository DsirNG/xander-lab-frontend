import { get } from '@api/http';

const BASE = '/api/points';

/**
 * 积分数值格式化：后端账本单位为毫分（1 分 = 1000 毫分），
 * 展示统一换算为分；整数不带小数，小数最多保留两位并去尾零。
 * @param {number|string|null} milli 后端返回的毫分数值
 * @returns {string} 形如 "2000" 或 "7.84"；空值返回 "—"
 */
export const formatPoints = (milli) => {
    if (milli === null || milli === undefined || milli === '' || Number.isNaN(Number(milli))) return '—';
    const points = Number(milli) / 1000;
    return Number.isInteger(points) ? String(points) : points.toFixed(2).replace(/\.?0+$/, '');
};

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