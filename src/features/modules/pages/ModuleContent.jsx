import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, ExternalLink } from 'lucide-react';
import { ContentLayout, EnhancedDemoSection } from '@components/layouts/ContentLayout';
import { getModuleConfig } from '../constants';

const ModuleContent = ({ module }) => {
    const { t } = useTranslation();

    // 路由传入的 module 包含稳定的结构数据（id, detailPages），
    // 但显示字段（title, desc, tag）需要用当前语言重新解析。
    const translatedModule = useMemo(() => {
        if (!module) return null;
        const current = getModuleConfig(t).find(m => m.id === module.id);
        return current || module;
    }, [module, t]);

    if (!translatedModule) return null;

    // 额外的头部按钮（实现细节标签）
    const extraButtons = (
        <div className="flex items-center bg-slate-100  px-6 py-3 rounded-2xl font-bold text-sm text-slate-600  border border-slate-200">
            <Zap className="w-4 h-4 text-blue-600 mr-2" />
            <span>{t('common.implementationDetails')}</span>
        </div>
    );

    return (
        <ContentLayout
            item={translatedModule}
            basePath="/modules"
            detailButtonText={t('common.viewDeepDive')}
            detailButtonIcon={ExternalLink}
            extraHeaderButtons={extraButtons}
            themeColor="blue-600"
        >
            {translatedModule.scenarios && translatedModule.scenarios.length > 0 ? (
                translatedModule.scenarios.map((scenario, index) => (
                    <EnhancedDemoSection
                        key={index}
                        title={scenario.title}
                        desc={scenario.desc}
                        code={scenario.code}
                    >
                        {scenario.demo}
                    </EnhancedDemoSection>
                ))
            ) : null}
        </ContentLayout>
    );
};

export default ModuleContent;
