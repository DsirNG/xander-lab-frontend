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

    const renderDemoSection = (scenario, index) => (
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
            item={enrichedComponent}
            scenarios={component.scenarios}
            renderDemoSection={renderDemoSection}
            basePath="/components"
            detailButtonText={isShared ? "架构深度解析" : t('common.viewSource')}
            detailButtonIcon={Code}
            extraHeaderButtons={metadata}
            themeColor="emerald-600"
        >
            {/* 技术实现预览（如果是分享组件且有实现代码） */}
            {isShared && (
                <div className="mb-20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                            <Code className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                技术实现概览 <span className="text-indigo-500 text-xs ml-2 opacity-50 font-black">Implementation Analysis</span>
                            </h3>
                            <p className="text-xs text-slate-500 font-bold">该组件包含自定义逻辑层，点击右上角按钮查看完整架构解析。</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="group relative rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 p-8 hover:shadow-2xl transition-all h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                <Code className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">核心逻辑 (Lib)</span>
                            </div>
                            <div className="flex-1 max-h-[200px] overflow-hidden relative rounded-xl border border-slate-100 dark:border-white/5">
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
                            <div className="group relative rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 p-8 hover:shadow-2xl transition-all h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileCode className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">样式定义 (CSS)</span>
                                </div>
                                <div className="flex-1 max-h-[200px] overflow-hidden relative rounded-xl border border-slate-100 dark:border-white/5">
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

                        <div className={`bg-indigo-600 rounded-[2rem] p-8 text-white flex flex-col justify-center relative overflow-hidden group ${!component.cssCode ? 'lg:col-span-2' : ''}`}>
                            {/* 装饰背景 */}
                            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                            <h4 className="text-2xl font-black mb-4 tracking-tighter italic uppercase leading-tight">
                                深入理解此组件的<br />运行机制
                            </h4>
                            <p className="text-sm text-indigo-100 font-medium mb-8 leading-relaxed opacity-80">
                                不仅是 UI 演示。查看我们如何通过 Context API 和自定义 Hooks 构建这一交互系统。
                            </p>
                            <Link
                                to={`/components/${component.id}/guide`}
                                className="inline-flex items-center justify-center bg-white text-indigo-600 px-6 py-3 rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                            >
                                查看完整实现指南
                            </Link>
                        </div>
                    </div>
                </div>
            )}
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
