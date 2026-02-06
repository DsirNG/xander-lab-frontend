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

    // 渲染演示区域（不使用 BrowserWindow 包裹）
    const renderDemoSection = (scenario, index) => (
        <EnhancedDemoSection
            key={index}
            title={scenario.title}
            desc={scenario.desc}
            code={scenario.code}
            useBrowserWindow={false}
        >
            {scenario.demo}
        </EnhancedDemoSection>
    );

    return (
        <ContentLayout
            item={systemWithDesc}
            scenarios={system.scenarios}
            renderDemoSection={renderDemoSection}
            basePath="/infra"
            detailButtonText={t('common.viewTheory')}
            detailButtonIcon={ScrollText}
            themeColor="primary"
        />
    );
};

export default InfraContent;
