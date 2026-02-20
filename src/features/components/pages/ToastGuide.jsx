import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    Copy, Check, FileCode, FileJson, Layers,
    ArrowLeft, Terminal, Cpu, Zap, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Import raw code using Vite's ?raw suffix for source display
import ToastItemCode from '@/components/common/Toast/ToastItem.jsx?raw';
import ToastContextCode from '@/components/common/Toast/ToastContext.jsx?raw';
import ToastContainerCode from '@/components/common/Toast/ToastContainer.jsx?raw';
import ToastIndexCode from '@/components/common/Toast/index.js?raw';

const CodeBlock = ({ code, language, title, path }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#1e1e1e] shadow-xl mb-12">
            <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-white/5">
                <div className="flex items-center space-x-3 text-slate-400">
                    <FileCode className="w-4 h-4 text-primary" />
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest block opacity-50">Module</span>
                        <span className="text-xs font-mono font-bold text-slate-200">{title}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-slate-500 hidden md:inline">{path}</span>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>
            <div className="overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent max-h-[600px]">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        fontSize: '0.85rem',
                        background: 'transparent',
                        lineHeight: '1.6'
                    }}
                    showLineNumbers={true}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

const DependencyCard = ({ title, items, icon: Icon }) => (
    <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-4 flex items-center gap-2">
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {title}
        </h3>
        <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-[10px] font-bold border border-slate-100 dark:border-slate-800">
                    {item}
                </span>
            ))}
        </div>
    </div>
);

const ToastGuide = ({ componentId }) => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#080b14] pb-20">
            <div className="max-w-6xl mx-auto pt-10 px-6">
                {/* Navigation */}
                <Link to={`/components/${componentId}`} className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {t('components.toast.guide.back')}
                </Link>

                {/* Header */}
                <div className="mb-16 border-b border-slate-200 dark:border-slate-800 pb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                            <Zap className="w-7 h-7 text-primary" />
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">
                            {t('components.toast.guide.title').split(' // ')[0]} // <span className="text-primary">{t('components.toast.guide.title').split(' // ')[1]}</span>
                        </h1>
                    </div>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl font-medium leading-relaxed italic">
                        {t('components.toast.guide.subtitle')}
                    </p>
                </div>

                {/* Architecture Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <DependencyCard
                        title={t('components.toast.guide.architecture.engine')}
                        icon={Cpu}
                        items={['React hooks', 'useRef Timing', 'Context API', 'Portal']}
                    />
                    <DependencyCard
                        title={t('components.toast.guide.architecture.physics')}
                        icon={Activity}
                        items={['CSS Keyframes', 'GPU Compositing', 'Bouncy Physics']}
                    />
                    <div className="p-8 rounded-[2rem] bg-primary text-white shadow-2xl shadow-primary/20 flex flex-col justify-between">
                        <h3 className="text-[10px] uppercase tracking-[0.2em] font-black mb-4 flex items-center gap-2 opacity-80">
                            <Layers className="w-3.5 h-3.5" />
                            {t('components.toast.guide.architecture.logic')}
                        </h3>
                        <p className="text-xs font-bold leading-relaxed">
                            {t('components.toast.guide.architecture.logicDesc')}
                        </p>
                    </div>
                </div>

                {/* Source Code Section */}
                <div className="space-y-16">
                    {/* 1. Item Logic */}
                    <section>
                        <div className="mb-6 px-2">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 italic uppercase tracking-tighter">
                                {t('components.toast.guide.sections.physics.title')}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                {t('components.toast.guide.sections.physics.desc')}
                            </p>
                        </div>
                        <CodeBlock
                            code={ToastItemCode}
                            language="jsx"
                            title="ToastItem.jsx"
                            path="src/components/common/Toast/ToastItem.jsx"
                        />
                    </section>

                    {/* 2. Context Management */}
                    <section>
                        <div className="mb-6 px-2">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 italic uppercase tracking-tighter">
                                {t('components.toast.guide.sections.orchestration.title')}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                {t('components.toast.guide.sections.orchestration.desc')}
                            </p>
                        </div>
                        <CodeBlock
                            code={ToastContextCode}
                            language="jsx"
                            title="ToastContext.jsx"
                            path="src/components/common/Toast/ToastContext.jsx"
                        />
                    </section>

                    {/* 3. Container & Portal */}
                    <section>
                        <div className="mb-6 px-2">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 italic uppercase tracking-tighter">
                                {t('components.toast.guide.sections.portal.title')}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                {t('components.toast.guide.sections.portal.desc')}
                            </p>
                        </div>
                        <CodeBlock
                            code={ToastContainerCode}
                            language="jsx"
                            title="ToastContainer.jsx"
                            path="src/components/common/Toast/ToastContainer.jsx"
                        />
                    </section>

                    {/* 4. Entry Point */}
                    <section>
                        <div className="mb-6 px-2">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 italic uppercase tracking-tighter">
                                {t('components.toast.guide.sections.entry.title')}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                {t('components.toast.guide.sections.entry.desc')}
                            </p>
                        </div>
                        <CodeBlock
                            code={ToastIndexCode}
                            language="javascript"
                            title="index.js"
                            path="src/components/common/Toast/index.js"
                        />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ToastGuide;
