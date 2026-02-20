import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    Copy, Check, FileCode, Layers,
    ArrowLeft, Cpu, Zap, Library, Boxes, Layout
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ComponentService from '../services/componentService';

const CodeBlock = ({ code, language, title, icon: Icon = FileCode }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!code) return null;

    return (
        <div className="rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5 bg-[#0f172a] shadow-2xl mb-12 group">
            <div className="flex items-center justify-between px-8 py-5 bg-white/5 border-b border-white/5">
                <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-xl bg-indigo-500/10">
                        <Icon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/60 block">Source Layer</span>
                        <span className="text-sm font-bold text-slate-200">{title}</span>
                    </div>
                </div>
                <button
                    onClick={handleCopy}
                    className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-90"
                >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
            <div className="overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent max-h-[700px]">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: '2.5rem',
                        fontSize: '0.85rem',
                        background: 'transparent',
                        lineHeight: '1.7',
                        fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace'
                    }}
                    showLineNumbers={true}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

const FeatureCard = ({ title, desc, icon: Icon, color }) => (
    <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
    </div>
);

const DynamicComponentGuide = ({ componentId, initialData }) => {
    const { t, i18n } = useTranslation();
    const [data, setData] = useState(initialData || null);
    const [loading, setLoading] = useState(!initialData);

    useEffect(() => {
        // 如果已经有 initialData 且 componentId 没变，就不重复拉取
        if (initialData && String(initialData.id) === String(componentId)) {
            return;
        }

        const fetchDetail = async () => {
            try {
                const res = await ComponentService.getComponentDetail(componentId, i18n.language);
                setData(res);
            } catch (err) {
                console.error("加载组件详情失败", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [componentId, i18n.language]);

    if (loading) return <div className="p-20 text-center text-slate-400 animate-pulse">正在解析架构细节...</div>;
    if (!data) return <div className="p-20 text-center text-rose-500">无法加载组件源码。</div>;

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#080b14] pb-32">
            {/* 渐变装饰背景 */}
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

            <div className="max-w-6xl mx-auto pt-12 px-6 relative z-10">
                {/* Navigation */}
                <Link to={`/components/${componentId}`} className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 mb-12 transition-all group">
                    <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center mr-3 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5">
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                    </div>
                    {t('common.backToComponents', 'Back to Showcase')}
                </Link>

                {/* Header Section */}
                <div className="mb-20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                            Source Analysis
                        </div>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            v{data.version || '1.0.0'}
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter italic uppercase">
                        {data.title} <span className="text-indigo-500">Architecture</span>
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed font-medium">
                        {data.desc || "该组件通过动态沙箱引擎实现，包含了完整的组件逻辑层与环境包裹层。"}
                    </p>
                </div>

                {/* Technical Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <FeatureCard
                        title="核心实现 (Lib)"
                        desc="包含所有的 Hooks、Contexts 和业务组件逻辑，作为底层基础注入沙箱。"
                        icon={Boxes}
                        color="bg-indigo-600"
                    />
                    <FeatureCard
                        title="环境包裹 (Env)"
                        desc="定义了组件运行所需的 Provider 容器或布局结构，确保跨场景的一致性。"
                        icon={Layout}
                        color="bg-violet-600"
                    />
                    <FeatureCard
                        title="多场景演示"
                        desc="通过隔离的沙箱环境展示不同的交互用例，支持实时代码编辑与预览。"
                        icon={Zap}
                        color="bg-emerald-600"
                    />
                </div>

                {/* Implementation Layers */}
                <div className="space-y-24">
                    {/* Layer 1: Implementation */}
                    <section>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Implementation Layer</h2>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">library_code.js</p>
                            </div>
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                            <p className="text-slate-600 dark:text-slate-400 italic">
                                这里是组件的灵魂。它定义了所有的内部状态管理、副作用处理以及可导出的 API。
                                在沙箱运行期间，这些导出将被直接注入到演示代码的执行作用域中。
                            </p>
                        </div>

                        <CodeBlock
                            code={data.libraryCode}
                            language="jsx"
                            title="Implementation (Lib)"
                            icon={Boxes}
                        />
                    </section>

                    {/* Layer 2: Wrapper */}
                    {data.wrapperCode && (
                        <section>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 shadow-inner">
                                    <Layout className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Environment Wrapper</h2>
                                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">wrapper_code.jsx</p>
                                </div>
                            </div>

                            <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                                <p className="text-slate-600 dark:text-slate-400 italic">
                                    包裹器提供了组件运行的温床。通常用于放置 Context Providers 或通用的样式容器。
                                    演示代码生成的 React 节点将作为 <code className="text-indigo-400 font-bold">{"{children}"}</code> 渲染在其中。
                                </p>
                            </div>

                            <CodeBlock
                                code={data.wrapperCode}
                                language="jsx"
                                title="Environment (Wrapper)"
                                icon={Layout}
                            />
                        </section>
                    )}

                    {/* Layer 3: Styles (CSS) */}
                    {data.cssCode && (
                        <section>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                                    <FileCode className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Styling Specification</h2>
                                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">custom_styles.css</p>
                                </div>
                            </div>

                            <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                                <p className="text-slate-600 dark:text-slate-400 italic">
                                    这里定义了组件的原始 CSS 样式。在预览环境中，这些样式将被动态挂载到 HEAD 标签中，
                                    支持 BEM 规范、CSS 变量以及所有的自定义动画关键帧。
                                </p>
                            </div>

                            <CodeBlock
                                code={data.cssCode}
                                language="css"
                                title="Global Styles (CSS)"
                                icon={FileCode}
                            />
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DynamicComponentGuide;
