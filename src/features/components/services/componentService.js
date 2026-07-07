import { get, post } from '@/api';

/**
 * 组件服务
 * 负责动态组件库的数据获取
 */
const ComponentService = {
    /**
     * 获取侧边栏菜单结构
     * @param {string} lang - 语言代码 ('zh' 或 'en')
     * @param {Object} [config] - 额外 axios 配置（如 { signal }）
     * @returns {Promise<Array>} 包含组件的分类列表
     */
    getMenu: (lang = 'zh', config) => {
        return get('/api/components/menu', { lang }, config);
    },

    /**
     * 获取组件详情
     * @param {string} id - 组件ID
     * @param {string} lang - 语言代码
     * @param {Object} [config] - 额外 axios 配置（如 { signal }）
     * @returns {Promise<Object>} 组件详情对象
     */
    getComponentDetail: (id, lang = 'zh', config) => {
        return get(`/api/components/${id}`, { lang }, config);
    },

    /**
     * 提交分享组件（支持多场景）
     * @param {Object} data - { titleZh, titleEn, version, descriptionZh, sourceCode, scenarios[] }
     * @param {Object} [config] - 额外 axios 配置（如 { signal }）
     * @returns {Promise<string>} 返回生成的组件ID
     */
    shareComponent: (data, config) => {
        return post('/api/components/share', data, config);
    }
};

export default ComponentService;
