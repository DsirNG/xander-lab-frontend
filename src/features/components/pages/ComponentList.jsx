// React 相关
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

// Layout
import SidebarLayout from '@components/layouts/SidebarLayout';

// 配置
import { getComponentConfig } from '../constants';

const ComponentList = () => {
    const { t } = useTranslation();
    const location = useLocation();

    // 获取组件配置
    const components = useMemo(() => getComponentConfig(t), [t]);

    const activeId = location.pathname.split('/')[2] || 'button';

    // 定义底部卡片
    const bottomCard = (
        <div className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 p-4 rounded-2xl border border-emerald-600/10">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">UI Kit</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Atomic components for building consistent interfaces.</p>
        </div>
    );

    return (
        <SidebarLayout
            title={t('nav.components', 'Components')}
            description={t('components.desc', 'Explore our atomic component library.')}
            items={components}
            activeId={activeId}
            bottomCard={bottomCard}
            subtitleKey="tag"
        />
    );
};

export default ComponentList;


