import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    Zap,
    MousePointer2,
    ExternalLink,
    MousePointerClick,
    Code,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    RotateCcw
} from 'lucide-react';
import SingleFileTransferDemo from './demos/SingleFileTransferDemo';
import MultiFileTransferDemo from './demos/MultiFileTransferDemo';
import SortableListDemo from './demos/SortableListDemo';
import { SINGLE_FILE_CODE, MULTI_FILE_CODE, SORTABLE_CODE } from './demos/demo-code';
import { BrowserWindow } from '../../components';

const DemoSection = ({ title, desc, children, code }) => {
    const [showCode, setShowCode] = useState(false);
    const [copied, setCopied] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        setResetKey(prev => prev + 1);
    };

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="h-6 w-1 bg-blue-600 rounded-full" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleReset}
                        className="flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                        title="Reset Demo"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                    </button>
                    {code && (
                        <button
                            onClick={() => setShowCode(!showCode)}
                            className="flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                            {showCode ? <ChevronUp className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
                            <span>{showCode ? 'Hide Code' : 'View Code'}</span>
                        </button>
                    )}
                </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-2xl">{desc}</p>
            <BrowserWindow>
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-10 min-h-[300px] flex items-center justify-center relative overflow-hidden transition-all">
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    <div key={resetKey} className="w-full relative z-10">{children}</div>
                </div>
            </BrowserWindow>
            <AnimatePresence>
                {showCode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4 w-full"
                    >
                        <div className="relative group rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl w-full">
                            {/* Copy Button */}
                            <button
                                onClick={handleCopy}
                                className="absolute right-6 top-6 z-20 p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all backdrop-blur-md border border-white/5 opacity-0 group-hover:opacity-100 shadow-xl"
                                title="Copy code"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>

                            <div className="max-h-[500px] overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent w-full">
                                <SyntaxHighlighter
                                    language="javascript"
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: 0,
                                        padding: '2.5rem',
                                        fontSize: '0.85rem',
                                        background: '#0f172a',
                                        lineHeight: '1.6',
                                        width: '100%',
                                        maxWidth: '100%'
                                    }}
                                >
                                    {code}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ModuleContent = ({ module }) => {
    const { t } = useTranslation();
    const [selectedFiles] = useState(new Set(['1', '2']));

    // Dynamically inject demos if they match certain IDs
    const scenarios = useMemo(() => {
        if (!module) return null;

        if (module.id === 'popover') {
            return [
                {
                    title: 'Standard Click Trigger',
                    desc: 'A general floating container that appears when clicking an element, maintaining its position relative to the trigger.',
                    demo: (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-6 rounded-2xl flex flex-col items-center space-y-4 cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                <MousePointerClick className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold dark:text-white">Click Me</span>
                        </motion.div>
                    )
                }
            ];
        }
        if (module.id === 'drag-drop') {
            return [
                {
                    title: 'Scenario A-1: Single File Transfer',
                    desc: 'Clean, focused dragging for individual entities with premium visual feedback.',
                    demo: <SingleFileTransferDemo />,
                    code: SINGLE_FILE_CODE
                },
                {
                    title: 'Scenario A-2: Multi-File Batch Operations',
                    desc: 'Advanced stacking mechanism for multiple items with count indicators and batch processing.',
                    demo: <MultiFileTransferDemo />,
                    code: MULTI_FILE_CODE
                },
                {
                    title: 'Scenario B: Sortable Core',
                    desc: 'Lightweight list reordering with visual gap detection and ghost states.',
                    demo: <SortableListDemo />,
                    code: SORTABLE_CODE
                }
            ];
        }
        return null;
    }, [module, selectedFiles]);

    if (!module) return null;

    return (
        <motion.div
            key={module.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex justify-between items-start mb-12">
                <div className="max-w-2xl">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
                        {module.title}
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        {module.desc}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="bg-slate-100 dark:bg-slate-800 px-6 py-3 rounded-2xl font-bold text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span>{t('common.implementationDetails')}</span>
                    </div>
                    {module.path && (
                        <Link
                            to={`/modules/${module.path}/deep-dive`}
                            className="flex items-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition-transform shadow-xl ml-4"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>{t('common.viewDeepDive')}</span>
                        </Link>
                    )}
                </div>
            </div>

            <div className="space-y-4 mb-10">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center">
                    <MousePointer2 className="w-3 h-3 mr-2" />
                    {t('common.liveScenarios')}
                </h4>
                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
            </div>

            <div className="grid grid-cols-1">
                {scenarios ? (
                    scenarios.map((scenario, index) => (
                        <DemoSection
                            key={index}
                            title={scenario.title}
                            desc={scenario.desc}
                            code={scenario.code}
                        >
                            {scenario.demo}
                        </DemoSection>
                    ))
                ) : (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-400">
                        <Zap className="w-12 h-12 mb-4 opacity-20" />
                        <p>{t('common.comingSoon')}</p>
                    </div>
                )}
            </div>
        </motion.div >
    );
};

export default ModuleContent;
