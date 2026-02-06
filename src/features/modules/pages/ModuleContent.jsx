import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, ExternalLink } from 'lucide-react';
import { ContentLayout, EnhancedDemoSection } from '@components/layouts/ContentLayout';

const ModuleContent = ({ module }) => {
    const { t } = useTranslation();

    if (!module) return null;

    // 渲染增强的演示区域（带代码展示）
    const renderDemoSection = (scenario, index) => (
        <EnhancedDemoSection
            key={index}
            title={scenario.title}
            desc={scenario.desc}
            code={scenario.code}
        >
            {scenario.demo}
        </EnhancedDemoSection>
    );

    // 额外的头部按钮（实现细节标签）
    const extraButtons = (
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-6 py-3 rounded-2xl font-bold text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Zap className="w-4 h-4 text-blue-600 mr-2" />
            <span>{t('common.implementationDetails')}</span>
        </div>
    );

    return (
        <ContentLayout
            item={module}
            scenarios={module.scenarios}
            renderDemoSection={renderDemoSection}
            basePath="/modules"
            detailButtonText={t('common.viewDeepDive')}
            detailButtonIcon={ExternalLink}
            extraHeaderButtons={extraButtons}
            themeColor="blue-600"
        />
    );
};

export default ModuleContent;
