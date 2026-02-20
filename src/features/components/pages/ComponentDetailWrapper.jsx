import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ComponentService from '../services/componentService';
import ComponentContent from './ComponentContent';
import { PAGE_REGISTRY } from '../registries/pageRegistry';

const ComponentDetailWrapper = () => {
    const { componentId, '*': subPath } = useParams();
    const { i18n } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!componentId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await ComponentService.getComponentDetail(componentId, i18n.language);
                setData(res);
            } catch (err) {
                console.error(err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // 切换组件时重置数据
        setData(null);
    }, [componentId, i18n.language]);

    if (loading && !data) {
        return <div className="p-8 text-center text-slate-500">正在加载组件详情...</div>;
    }

    if (error || !data) {
        return <div className="p-8 text-center text-red-500">加载失败或组件不存在。</div>;
    }

    // 检查是否在特定的子详情页（如 /guide）
    // 如果路由定义为 ':componentId/*'，subPath 将是 'guide'
    if (subPath) {
        // 查找 subPath 是否匹配任何详情页类型
        const pageConfig = data.detailPages?.find(p => p.type === subPath);
        if (pageConfig) {
            const PageComponent = PAGE_REGISTRY[pageConfig.componentKey];
            if (PageComponent) {
                return (
                    <Suspense fallback={<div>正在加载页面...</div>}>
                        <PageComponent />
                    </Suspense>
                );
            }
        }
        // 如果 subPath 存在但配置中未找到，可能跳转到 404 或重定向回主页
        return <Navigate to={`/components/${componentId}`} replace />;
    }

    // 渲染默认视图（场景演示）
    return <ComponentContent component={data} />;
};

export default ComponentDetailWrapper;
