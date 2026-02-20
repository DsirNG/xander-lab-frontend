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

    // 解析多文件逻辑
    const parseLibraryFiles = (rawCode) => {
        if (!rawCode) return [];
        const fileMarkerRegex = /\/\* === FILE: (.*?) === \*\//g;
        const files = [];
        let lastMatch;
        let lastIndex = 0;

        while ((lastMatch = fileMarkerRegex.exec(rawCode)) !== null) {
            if (files.length > 0) {
                files[files.length - 1].content = rawCode.slice(lastIndex, lastMatch.index).trim();
            }
            files.push({ name: lastMatch[1], content: '' });
            lastIndex = fileMarkerRegex.lastIndex;
        }

        if (files.length > 0) {
            files[files.length - 1].content = rawCode.slice(lastIndex).trim();
            return files;
        }

        // 如果没有标记，返回单一文件
        return [{ name: 'Implementation.jsx', content: rawCode }];
    };

    useEffect(() => {
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

    const libraryFiles = parseLibraryFiles(data.libraryCode);

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
                        {data.title} <span className="text-indigo-500">Structure</span>
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed font-medium">
                        {data.desc || "该组件通过动态沙箱引擎实现，包含了完整的组件逻辑层与环境包裹层。"}
                    </p>
                </div>

                {/* Implementation Layers */}
                <div className="space-y-24">
                    {/* Layer 1: Implementation */}
                    <section>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                                <Boxes className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Implementation Layers</h2>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Modular Logic Files</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {libraryFiles.map((file, idx) => (
                                <CodeBlock
                                    key={idx}
                                    code={file.content}
                                    language="jsx"
                                    title={file.name}
                                    icon={Boxes}
                                />
                            ))}
                        </div>
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
