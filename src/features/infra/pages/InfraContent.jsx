import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollText } from 'lucide-react';
import { ContentLayout, EnhancedDemoSection } from '@components/layouts/ContentLayout';
import { getInfraConfig } from '../constants';

const InfraContent = ({ system }) => {
    const { t } = useTranslation();

    // 路由传入的 system 包含稳定的结构数据（id, detailPages），
    // 但显示字段需要用当前语言重新解析。
    const translatedSystem = useMemo(() => {
        if (!system) return null;
        const current = getInfraConfig(t).find(s => s.id === system.id);
        return current || system;
    }, [system, t]);

    if (!translatedSystem) return null;

    // 处理描述（兼容旧数据）
    const systemWithDesc = {
        ...translatedSystem,
        desc: translatedSystem.id === 'anchored' ? t('infra.anchored.desc') : 'System preview coming soon.'
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
