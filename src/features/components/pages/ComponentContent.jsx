import React from 'react';
import { useTranslation } from 'react-i18next';
import { Code } from 'lucide-react';
import { ContentLayout, EnhancedDemoSection } from '@components/layouts/ContentLayout';
import { resolveDemo } from '../registries/demoRegistry';

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
            {/* 优先用旧版 demo 节点；否则用 resolveDemo 解析（注册表 → demoCode沙箱 → 空白沙箱） */}
            {scenario.demo || resolveDemo(scenario.demoKey, scenario.demoCode)}
        </EnhancedDemoSection>
    );

    const metadata = (
        <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-400 mr-2">
            {component.author && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10">
                    <span className="opacity-70">by</span>
                    <span className="text-slate-700 dark:text-slate-200 font-bold">{component.author}</span>
                </div>
            )}
            {component.version && (
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-500/20 font-bold">
                    <span>v{component.version}</span>
                </div>
            )}
        </div>
    );

    return (
        <ContentLayout
            item={component}
            scenarios={component.scenarios}
            renderDemoSection={renderDemoSection}
            basePath="/components"
            detailButtonText={t('common.viewSource')}
            detailButtonIcon={Code}
            extraHeaderButtons={metadata}
            themeColor="emerald-600"
        />
    );
};

export default ComponentContent;
