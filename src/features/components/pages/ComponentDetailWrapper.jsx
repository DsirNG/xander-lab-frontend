import React, { useState, useEffect, Suspense } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ComponentService from '../services/componentService';
import ComponentContent from './ComponentContent';
import { PAGE_REGISTRY } from '../registries/pageRegistry';

const ComponentDetailWrapper = () => {
    const { componentId, '*': subPath } = useParams();
    const { t, i18n } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!componentId) return;

        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await ComponentService.getComponentDetail(
                    componentId,
                    i18n.language,
                    { signal: controller.signal }
                );
                setData(res);
            } catch (err) {
                if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
                console.error(err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // 切换组件时重置数据
        setData(null);

        return () => controller.abort();
    }, [componentId, i18n.language]);

    if (loading && !data) {
        return <div className="p-8 text-center text-slate-500">{t('components.detail.loading')}</div>;
    }

    if (error || !data) {
        return <div className="p-8 text-center text-red-500">{t('components.detail.error')}</div>;
    }

    // 检查是否在特定的子详情页（如 /guide）
    // 如果路由定义为 ':componentId/*'，subPath 将是 'guide'
    if (subPath) {
        const isShared = !!data.libraryCode;
        // 查找 subPath 是否匹配任何详情页类型
        let pageConfig = data.detailPages?.find(p => p.type === subPath);

        // 如果数据库没配，但是是分享组件且访问的是 guide，我们手动指定 DynamicGuide
        if (!pageConfig && isShared && subPath === 'guide') {
            pageConfig = { type: 'guide', componentKey: 'DynamicGuide' };
        }

        if (pageConfig) {
            const PageComponent = PAGE_REGISTRY[pageConfig.componentKey];
            if (PageComponent) {
                return (
                    <Suspense fallback={<div>{t('components.detail.loadingPage')}</div>}>
                        <PageComponent componentId={componentId} initialData={data} />
                    </Suspense>
                );
            }
        }
        // 如果 subPath 存在但配置中未找到，且不是合法的动态路径，重定向回主页
        return <Navigate to={`/components/${componentId}`} replace />;
    }

    // 渲染默认视图（场景演示）
    return <ComponentContent component={data} />;
};

export default ComponentDetailWrapper;
