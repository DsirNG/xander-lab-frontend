import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    Code,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    RotateCcw
} from 'lucide-react';
import BrowserWindow from '@components/common/BrowserWindow';

/**
 * 增强演示区域组件
 * 包含代码展示、重置、复制等功能
 * 用于功能模块等复杂场景展示
 */
const EnhancedDemoSection = ({ title, desc, children, code, useBrowserWindow = true }) => {
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
            {/* 标题和操作按钮 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="h-6 w-1 bg-blue-600 rounded-full" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                    {/* 重置按钮 */}
                    <button
                        onClick={handleReset}
                        className="flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                        title="Reset Demo"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                    </button>
                    {/* 查看代码按钮 */}
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

            {/* 描述 */}
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-2xl">{desc}</p>

            {/* 演示区域 */}
            {useBrowserWindow ? (
                <BrowserWindow>
                    <div className="bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800 p-10 min-h-[300px] flex items-center justify-center relative overflow-hidden transition-all">
                        <div
                            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                        />
                        <div key={resetKey} className="w-full relative z-10">
                            {children}
                        </div>
                    </div>
                </BrowserWindow>
            ) : (

                <div key={resetKey}>
                    {children}
                </div>
            )}

            {/* 代码展示区域 */}
            <AnimatePresence>
                {showCode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4 w-full"
                    >
                        <div className="relative group rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl w-full">
                            {/* 复制按钮 */}
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

EnhancedDemoSection.propTypes = {
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    children: PropTypes.node,
    code: PropTypes.string,
    useBrowserWindow: PropTypes.bool
};

EnhancedDemoSection.SyntaxHighlighter = SyntaxHighlighter;
EnhancedDemoSection.vscDarkPlus = vscDarkPlus;

export default EnhancedDemoSection;

