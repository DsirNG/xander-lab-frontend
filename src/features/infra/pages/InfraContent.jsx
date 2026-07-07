import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollText } from 'lucide-react';
import { ContentLayout, EnhancedDemoSection } from '@components/layouts/ContentLayout';

const InfraContent = ({ system }) => {
    const { t } = useTranslation();

    if (!system) return null;

    // 处理描述（兼容旧数据）
    const systemWithDesc = {
        ...system,
        desc: system.id === 'anchored' ? t('infra.anchored.desc') : 'System preview coming soon.'
    };

    return (
        <ContentLayout
            item={systemWithDesc}
            basePath="/infra"
            detailButtonText={t('common.viewTheory')}
            detailButtonIcon={ScrollText}
            themeColor="primary"
        >
            {system.scenarios && system.scenarios.length > 0 ? (
                system.scenarios.map((scenario, index) => (
                    <EnhancedDemoSection
                        key={index}
                        title={scenario.title}
                        desc={scenario.desc}
                        code={scenario.code}
                        useBrowserWindow={false}
                    >
                        {scenario.demo}
                    </EnhancedDemoSection>
                ))
            ) : null}
        </ContentLayout>
    );
};

export default InfraContent;
