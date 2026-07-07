import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, ExternalLink } from 'lucide-react';
import { ContentLayout, EnhancedDemoSection } from '@components/layouts/ContentLayout';

const ModuleContent = ({ module }) => {
    const { t } = useTranslation();

    if (!module) return null;

    // 额外的头部按钮（实现细节标签）
    const extraButtons = (
        <div className="flex items-center bg-slate-100  px-6 py-3 rounded-2xl font-bold text-sm text-slate-600  border border-slate-200">
            <Zap className="w-4 h-4 text-blue-600 mr-2" />
            <span>{t('common.implementationDetails')}</span>
        </div>
    );

    return (
        <ContentLayout
            item={module}
            basePath="/modules"
            detailButtonText={t('common.viewDeepDive')}
            detailButtonIcon={ExternalLink}
            extraHeaderButtons={extraButtons}
            themeColor="blue-600"
        >
            {module.scenarios && module.scenarios.length > 0 ? (
                module.scenarios.map((scenario, index) => (
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
