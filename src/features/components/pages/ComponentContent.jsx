import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Code, FileCode } from 'lucide-react';
import { ContentLayout, EnhancedDemoSection } from '@components/layouts/ContentLayout';
import { resolveDemo } from '../registries/demoRegistry';

const ComponentContent = ({ component }) => {
    const { t } = useTranslation();

    if (!component) return null;

    const isShared = !!component.libraryCode;

    // 1. 如果是分享组件且有 libraryCode，自动注入一个 "DynamicGuide" 详情页配置
    const enrichedComponent = {
        ...component,
        detailPages: (component.detailPages && component.detailPages.length > 0)
            ? component.detailPages
            : (isShared ? [{ type: 'guide', componentKey: 'DynamicGuide' }] : [])
    };

    const metadata = (
        <div className="hidden sm:flex items-center gap-3 text-caption font-mono text-ink-faint mr-2">
            {component.author && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-surface  rounded-lg border border-border">
                    <span className="opacity-70">by</span>
                    <span className="text-ink-secondary  font-bold">{component.author}</span>
                </div>
            )}
            {component.version && (
                <div className="flex items-center gap-1 px-2 py-1 bg-success-soft text-success  rounded-lg border border-success/20 font-bold">
                    <span>v{component.version}</span>
                </div>
            )}
        </div>
    );

    return (
        <ContentLayout
            item={enrichedComponent}
            basePath="/components"
            detailButtonText={isShared ? t('components.content.architectureDeepDive') : t('common.viewSource')}
            detailButtonIcon={Code}
            extraHeaderButtons={metadata}
            themeColor="emerald-600"
        >
            {/* 场景演示 */}
            {component.scenarios && component.scenarios.length > 0 ? (
                component.scenarios.map((scenario, index) => (
                    <EnhancedDemoSection
                        key={index}
                        title={scenario.title}
                        desc={scenario.desc}
                        code={scenario.demoCode || scenario.code}
                        useBrowserWindow={false}
                    >
                        {/* 优先用旧版 demo 节点；否则用 resolveDemo 解析（注册表 → demoCode沙箱 → 空白沙箱） */}
                        {scenario.demo || resolveDemo(scenario.demoKey, scenario.demoCode, component.libraryCode, component.wrapperCode, component.cssCode)}
                    </EnhancedDemoSection>
                ))
            ) : null}

            {/* 技术实现预览（如果是分享组件且有实现代码） */}
            {isShared && (
                <div className="mb-20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-2xl bg-accent/10 text-accent">
                            <Code className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="text-lg font-black text-ink-secondary  uppercase tracking-tight">
                                {t('components.content.implementationOverview')} <span className="text-accent text-caption ml-2 opacity-50 font-black">Implementation Analysis</span>
                            </div>
                            <div className="text-caption text-ink-muted font-bold">{t('components.content.implementationHint')}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="group relative rounded-[2rem] border border-border  bg-canvas p-8 hover:shadow-2xl transition-all h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                <Code className="w-4 h-4 text-accent" />
                                <span className="text-caption font-black uppercase tracking-widest text-ink-faint">{t('components.content.coreLogic')}</span>
                            </div>
                            <div className="flex-1 max-h-[200px] overflow-hidden relative rounded-xl border border-border ">
                                <EnhancedDemoSection.SyntaxHighlighter
                                    language="javascript"
                                    style={EnhancedDemoSection.vscDarkPlus}
                                    customStyle={{ margin: 0, padding: '1rem', fontSize: '0.75rem', background: '#0f172a' }}
                                >
                                    {component.libraryCode}
                                </EnhancedDemoSection.SyntaxHighlighter>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
                            </div>
                        </div>

                        {component.cssCode && (
                            <div className="group relative rounded-[2rem] border border-border  bg-canvas p-8 hover:shadow-2xl transition-all h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileCode className="w-4 h-4 text-success" />
                                    <span className="text-caption font-black uppercase tracking-widest text-ink-faint">{t('components.content.stylesDef')}</span>
                                </div>
                                <div className="flex-1 max-h-[200px] overflow-hidden relative rounded-xl border border-border ">
                                    <EnhancedDemoSection.SyntaxHighlighter
                                        language="css"
                                        style={EnhancedDemoSection.vscDarkPlus}
                                        customStyle={{ margin: 0, padding: '1rem', fontSize: '0.75rem', background: '#0f172a' }}
                                    >
                                        {component.cssCode}
                                    </EnhancedDemoSection.SyntaxHighlighter>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
                                </div>
                            </div>
                        )}

                        <div className={`bg-ink rounded-[2rem] p-8 text-white flex flex-col justify-center relative overflow-hidden group ${!component.cssCode ? 'lg:col-span-2' : ''}`}>
                            {/* 装饰背景 */}
                            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-canvas/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                            <div className="text-2xl font-black mb-4 tracking-tighter italic uppercase leading-tight"
                                dangerouslySetInnerHTML={{ __html: t('components.content.understandTitle') }}
                            />
                            <div className="text-body text-ink-faint font-medium mb-8 leading-relaxed opacity-80">
                                {t('components.content.understandDesc')}
                            </div>
                            <Link
                                to={`/components/${component.id}/guide`}
                                className="inline-flex items-center justify-center bg-accent text-white px-6 py-3 rounded-xl font-black text-caption hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                            >
                                {t('components.content.viewGuide')}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            {/* 组件完整源码说明（由用户通过分享功能配置） */}
            {component.sourceCode && (
                <div className="mt-16 pt-10 border-t border-border ">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-accent/10 rounded-xl">
                            <Code className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <div className="text-xl font-black text-ink ">{t('components.content.sourceCode')}</div>
                            <div className="text-body text-ink-muted ">{t('components.content.sourceCodeDesc')}</div>
                        </div>
                    </div>

                    <div className="relative group rounded-[2.5rem] overflow-hidden border border-border  shadow-2xl bg-ink">
                        <div className="max-h-[800px] overflow-auto scrollbar-thin scrollbar-thumb-ink-secondary scrollbar-track-transparent">
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
