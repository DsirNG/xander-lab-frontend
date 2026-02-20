import { get, post } from '@/api';

/**
 * 组件服务
 * 负责动态组件库的数据获取
 */
const ComponentService = {
    /**
     * 获取侧边栏菜单结构
     * @param {string} lang - 语言代码 ('zh' 或 'en')
     * @returns {Promise<Array>} 包含组件的分类列表
     */
    getMenu: (lang = 'zh') => {
        return get('/components/menu', { lang });
    },

    /**
     * 获取组件详情
     * @param {string} id - 组件ID
     * @param {string} lang - 语言代码
     * @returns {Promise<Object>} 组件详情对象
     */
    getComponentDetail: (id, lang = 'zh') => {
        return get(`/components/${id}`, { lang });
    },

    /**
     * 提交分享组件
     * @param {Object} data - 组件数据 (titleZh, titleEn, author, demoCode, descriptionZh)
     * @returns {Promise<string>} 返回生成的组件ID
     */
    shareComponent: (data) => {
        return post('/components/share', data);
    }
};

export default ComponentService;
