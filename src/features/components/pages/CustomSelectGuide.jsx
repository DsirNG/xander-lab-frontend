import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, FileCode, FileJson, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Import raw code
import ComponentCode from './codeComponent/CustomSelect/index.jsx?raw';
import StyleCode from './codeComponent/CustomSelect/index.module.css?raw';

const CodeBlock = ({ code, language, title }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#1e1e1e] shadow-xl mb-8">
            <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-white/5">
                <div className="flex items-center space-x-2 text-slate-400">
                    {language === 'css' ? <FileCode className="w-4 h-4" /> : <FileJson className="w-4 h-4" />}
                    <span className="text-xs font-mono font-bold">{title}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            </div>
            <div className="overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent max-h-[600px]">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        fontSize: '0.9rem',
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

const DependencyCard = ({ title, items }) => (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4">{title}</h3>
        <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono border border-slate-200 dark:border-slate-700">
                    {item}
                </span>
            ))}
        </div>
    </div>
);

const CustomSelectGuide = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <div className="max-w-6xl mx-auto pt-10 px-6">
                {/* Navigation */}
                <Link to="/components/custom-select" className="inline-flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('common.backToComponents')}
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
                        CustomSelect
                        <span className="ml-4 text-lg font-normal text-slate-500 dark:text-slate-400">{t('common.componentSource')}</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                        {t('components.customSelect.desc')}
                    </p>
                </div>

                {/* Dependencies & Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <DependencyCard
                        title="React Hooks"
                        items={['useState', 'useEffect', 'useRef', 'useCallback']}
                    />
                    <DependencyCard
                        title="External Libs"
                        items={['lucide-react', 'prop-types']}
                    />
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                        <h3 className="text-sm uppercase tracking-wider text-emerald-600 font-bold mb-4 flex items-center">
                            <Layers className="w-4 h-4 mr-2" />
                            {t('common.coreFeatures')}
                        </h3>
                        <ul className="space-y-2">
                            {t('components.customSelect.featureList', { returnObjects: true })?.map((feat, i) => (
                                <li key={i} className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                                    {feat}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Source Code Section */}
                <div className="space-y-12">
                    <div>
                        <div className="flex items-end justify-between mb-4 px-2">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('common.logicLayer')}</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">{t('common.logicLayerDesc')}</p>
                            </div>
                            <span className="text-xs font-mono text-slate-400">src/.../CustomSelect/index.jsx</span>
                        </div>
                        <CodeBlock
                            code={ComponentCode}
                            language="javascript"
                            title="index.jsx"
                        />
                    </div>

                    <div>
                        <div className="flex items-end justify-between mb-4 px-2">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('common.styleLayer')}</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">{t('common.styleLayerDesc')}</p>
                            </div>
                            <span className="text-xs font-mono text-slate-400">src/.../CustomSelect/index.module.css</span>
                        </div>
                        <CodeBlock
                            code={StyleCode}
                            language="css"
                            title="index.module.css"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomSelectGuide;
