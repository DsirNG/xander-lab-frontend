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
            code={scenario.demoCode || scenario.code}
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
        >
            {/* 组件完整源码说明（由用户通过分享功能配置） */}
            {component.sourceCode && (
                <div className="mt-16 pt-10 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                            <Code className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">组件实现源码</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">完整的文件结构与实现细节参考</p>
                        </div>
                    </div>

                    <div className="relative group rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl bg-[#0f172a]">
                        <div className="max-h-[800px] overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            <EnhancedDemoSection.SyntaxHighlighter
                                language="javascript"
                                style={EnhancedDemoSection.vscDarkPlus}
                                customStyle={{
                                    margin: 0,
                                    padding: '2.5rem',
                                    fontSize: '0.85rem',
                                    background: '#0f172a',
                                    lineHeight: '1.6',
                                    width: '100%'
                                }}
                            >
                                {component.sourceCode}
                            </EnhancedDemoSection.SyntaxHighlighter>
                        </div>
                    </div>
                </div>
            )}
        </ContentLayout>
    );
};

export default ComponentContent;
