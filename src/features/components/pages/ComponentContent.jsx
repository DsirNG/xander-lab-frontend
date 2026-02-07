import React from 'react';
import { useTranslation } from 'react-i18next';
import { Code } from 'lucide-react';
import { ContentLayout, EnhancedDemoSection } from '@components/layouts/ContentLayout';

const ComponentContent = ({ component }) => {
    const { t } = useTranslation();

    if (!component) return null;

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
            item={component}
            scenarios={component.scenarios}
            renderDemoSection={renderDemoSection}
            basePath="/components"
            detailButtonText={t('common.viewSource')}
            detailButtonIcon={Code}
            themeColor="emerald-600"
        />
    );
};

export default ComponentContent;
