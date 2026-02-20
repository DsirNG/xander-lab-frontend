import React from 'react';

/**
 * 页面注册表：将数据库中的 key 映射到页面组件（如指南、API 文档）。
 * keys 必须与 `component_detail_page` 表中的 `component_key` 一致。
 */
export const PAGE_REGISTRY = {
    'CustomSelectGuide': React.lazy(() => import('../pages/CustomSelectGuide')),
    'ToastGuide': React.lazy(() => import('../pages/ToastGuide')),
};
