import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Share2, Zap, Box, Info, Database,
    ChevronRight, Command, Layout, Boxes,
    FileCode, Terminal, Maximize2, Minimize2, Palette,
    Type, Languages, Trash2, ShieldCheck, ChevronUp, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveDemoSandbox from './codeComponent/demo/LiveDemoSandbox';
import ComponentService from '../services/componentService';
import { useToast } from '@/hooks/useToast';

// ─── 预设数据 (完全对齐项目内 Toast 组件逻辑) ──────────────────────────────────────────
const INIT_FILES = [
    {
        name: 'ToastContext.jsx',
        content: `import React, { createContext, useState, useCallback, useMemo } from 'react';

export const ToastContext = createContext(null);
export const useToast = () => React.useContext(ToastContext);

/**
 * Toast 状态提供者
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'info', options = {}) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, {
            id,
            message,
            type,
            duration: 3000,
            showProgress: true,
            showClose: true,
            pauseOnHover: true,
            ...options
        }]);
    }, []);

    const contextValue = useMemo(() => ({
        success: (msg, opts) => addToast(msg, 'success', opts),
        error: (msg, opts) => addToast(msg, 'error', opts),
        info: (msg, opts) => addToast(msg, 'info', opts),
        warning: (msg, opts) => addToast(msg, 'warning', opts),
        remove: removeToast,
        toasts
    }), [addToast, removeToast, toasts]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
        </ToastContext.Provider>
    );
};`
    },
    {
        name: 'ToastItem.jsx',
        content: `import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

const defaultIcons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
};

const defaultStyles = {
    success: 'bg-white/95 dark:bg-slate-900/95 border-emerald-100/50 dark:border-emerald-500/20 shadow-emerald-500/10',
    error: 'bg-white/95 dark:bg-slate-900/95 border-rose-100/50 dark:border-rose-500/20 shadow-rose-500/10',
    info: 'bg-white/95 dark:bg-slate-900/95 border-blue-100/50 dark:border-blue-500/20 shadow-blue-500/10',
    warning: 'bg-white/95 dark:bg-slate-900/95 border-amber-100/50 dark:border-amber-500/20 shadow-amber-500/10',
};

const ToastItem = ({ toast, onRemove }) => {
    const {
        message,
        type = 'info',
        duration = 3000,
        showProgress = true,
        showClose = true,
        pauseOnHover = true,
        className = '',
        icon = null
    } = toast;

    const [isExiting, setIsExiting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const remainingTimeRef = useRef(duration);
    const lastStartTimeRef = useRef(Date.now());
    const timerRef = useRef(null);

    useEffect(() => {
        if (duration === Infinity || isExiting) return;
        const startTimer = () => {
            lastStartTimeRef.current = Date.now();
            timerRef.current = setTimeout(() => setIsExiting(true), remainingTimeRef.current);
        };
        const stopTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                const elapsed = Date.now() - lastStartTimeRef.current;
                remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
                timerRef.current = null;
            }
        };

        if (isPaused && pauseOnHover) stopTimer();
        else startTimer();
        return () => stopTimer();
    }, [isPaused, duration, isExiting, pauseOnHover]);

    const handleAnimationEnd = (e) => {
        if (isExiting && e.animationName.includes('toast-out')) onRemove();
    };

    return (
        <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onAnimationEnd={handleAnimationEnd}
            className={\`
                group relative flex items-center gap-3 w-fit min-w-[280px] max-w-[480px] px-5 py-3.5 rounded-[2rem] border backdrop-blur-2xl
                shadow-[0_20px_40px_rgba(0,0,0,0.08)] pointer-events-auto transition-all duration-500
                active:scale-95 cursor-default
                \${defaultStyles[type]}
                \${isExiting ? 'animate-toast-out' : 'animate-toast-in'}
                \${className}
            \`}
        >
            <div className="flex-shrink-0">{icon || defaultIcons[type]}</div>
            <div className="flex-1 min-w-0">
                <div className="text-[13px] font-black text-slate-800 dark:text-slate-100 px-1 leading-normal break-words">
                    {message}
                </div>
            </div>
            {showClose && (
                <button onClick={() => setIsExiting(true)} className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 rounded-full hover:bg-slate-100 text-slate-400 transition-all">
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
};

export default ToastItem;`
    },
    {
        name: 'ToastContainer.jsx',
        content: `import React, { useContext } from 'react';
import { createPortal } from 'react-dom';
import { ToastContext } from './ToastContext';
import ToastItem from './ToastItem';

const ToastContainer = () => {
    const { toasts, remove } = useContext(ToastContext);
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none w-full max-w-md px-6">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onRemove={() => remove(toast.id)}
                />
            ))}
        </div>,
        document.body
    );
};

export default ToastContainer;`
    }
];

const INIT_CSS = `@keyframes toast-in { 
  from { opacity: 0; transform: translateY(30px) scale(0.9); } 
  to { opacity: 1; transform: translateY(0) scale(1); } 
}
@keyframes toast-out { 
  from { opacity: 1; } 
  to { opacity: 0; transform: scale(0.8) translateY(-20px); } 
}
.animate-toast-in { animation: toast-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-toast-out { animation: toast-out 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`;

const ComponentShare = () => {
    const navigate = useNavigate();
    const toast = useToast();

    // --- 基础信息状态 ---
    const [meta, setMeta] = useState({
        titleZh: '全局物理通知系统 (Toast)',
        titleEn: 'Global Kinetic Toast',
        version: '1.2.0',
        descriptionZh: '高性能、带物理挤压感和自动进度管理的全局通知组件。',
        descriptionEn: 'High-performance notification system with kinetic interactions and progress management.'
    });

    // --- 核心资产状态 ---
    const [libFiles, setLibFiles] = useState(INIT_FILES);
    const [activeLibIdx, setActiveLibIdx] = useState(0);
    const [wrapperCode, setWrapperCode] = useState('<ToastProvider>\n  <ToastContainer />\n  {children}\n</ToastProvider>');
    const [cssCode, setCssCode] = useState(INIT_CSS);

    // --- 场景状态 (直接使用正式 Demo) ---
    const [scenarios, setScenarios] = useState([
        {
            id: '1',
            titleZh: '交互测试',
            titleEn: 'Interaction Study',
            code: 'function Demo() {\n  const toast = useToast();\n  \n  return (\n    <div className="flex flex-col items-center gap-8 p-12">\n       <div className="flex flex-col items-center gap-2 mb-4 text-center">\n         <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] italic">Toast Architecture</h3>\n         <div className="w-16 h-1 bg-indigo-500 rounded-full" />\n       </div>\n\n       <div className="flex flex-wrap justify-center gap-6">\n         <button \n           onClick={() => toast.success("验证成功 // Verification Success")}\n           className="px-12 py-5 bg-indigo-600 text-white font-black italic rounded-[2.5rem] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all text-[11px] uppercase tracking-widest hover:rotate-1 hover:scale-105"\n         >\n           Run Success\n         </button>\n\n         <button \n           onClick={() => toast.error("系统拦截 // Kernel Violation")}\n           className="px-12 py-5 bg-slate-900 text-white font-black italic rounded-[2.5rem] shadow-xl shadow-black/20 active:scale-95 transition-all text-[11px] uppercase tracking-widest hover:-rotate-1 hover:scale-105"\n         >\n           Run Error\n         </button>\n       </div>\n\n       <div className="mt-8 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl">\n         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">\n           点击按钮触发全局物理通知容器\n         </p>\n       </div>\n    </div>\n  );\n}'
        }
    ]);
    const [activeSIdx, setActiveSIdx] = useState(0);

    // --- 界面控制状态 ---
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [infTab, setInfTab] = useState('logic');

    const combinedLibCode = useMemo(() => {
        return libFiles.map(f => `/* === FILE: ${f.name} === */\n${f.content}`).join('\n\n');
    }, [libFiles]);

    // --- 处理器 ---
    const handlePublish = async () => {
        try {
            await ComponentService.shareComponent({
                ...meta,
                libraryCode: combinedLibCode,
                // 将底层库代码也存入 sourceCode 字段，展示在详情页底部的参考区
                sourceCode: combinedLibCode,
                wrapperCode,
                cssCode,
                // 对齐后端 DTO: 使用 demoCode 存储运行代码，codeSnippet 存储展示代码
                scenarios: scenarios.map(s => ({
                    titleZh: s.titleZh,
                    titleEn: s.titleEn,
                    descriptionZh: s.titleZh, // 临时复用标题作为描述
                    demoCode: s.code,
                    codeSnippet: s.code
                }))
            });
            toast.success("组件架构已成功同步至 Xander-Lab 全局资产库");
            navigate('/components');
        } catch (err) { toast.error(err.message); }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
            <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                        <Command className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-[13px] font-black uppercase italic tracking-widest mb-0.5">组件工作室</h1>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                            Architecture Synchronized // <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE
                        </span>
                    </div>
                </div>
                <button onClick={handlePublish} className="px-10 py-3 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl text-[10px] font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2">
                    <Share2 className="w-4 h-4" /> 发布至组件库
                </button>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* 侧边栏 */}
                <aside className="w-[320px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="p-6 space-y-10">
                        <section className="space-y-6">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                                <Database className="w-4 h-4 text-indigo-500" /> 注册元数据
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">中文标题</label>
                                    <input value={meta.titleZh} onChange={e => setMeta({ ...meta, titleZh: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11px] font-bold focus:border-indigo-600 focus:bg-white transition-all outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">English Title</label>
                                    <input value={meta.titleEn} onChange={e => setMeta({ ...meta, titleEn: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11px] font-bold focus:border-indigo-600 focus:bg-white transition-all outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">组件详述 (CN/EN)</label>
                                    <textarea value={meta.descriptionZh} onChange={e => setMeta({ ...meta, descriptionZh: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] h-16 outline-none focus:border-indigo-500 transition-all resize-none mb-2" placeholder="中文介绍..." />
                                    <textarea value={meta.descriptionEn} onChange={e => setMeta({ ...meta, descriptionEn: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] h-16 outline-none focus:border-indigo-500 transition-all resize-none" placeholder="English Detail..." />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Version</span>
                                    <input value={meta.version} onChange={e => setMeta({ ...meta, version: e.target.value })} className="w-16 bg-transparent text-right text-indigo-600 font-black italic text-xs outline-none" />
                                </div>
                            </div>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section className="space-y-4 pb-24">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" /> 测试用例场景
                                </span>
                                <button onClick={() => {
                                    const id = Date.now().toString();
                                    setScenarios([...scenarios, { id, titleZh: '新测试', titleEn: 'New Study', code: 'function Demo() {\n  return <div>New Scenario</div>;\n}' }]);
                                    setActiveSIdx(scenarios.length);
                                }} className="p-1 hover:bg-slate-50 rounded-lg text-indigo-600 transition-all active:scale-125">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {scenarios.map((s, i) => (
                                    <div key={s.id} onClick={() => setActiveSIdx(i)} className={`relative group px-5 py-4 rounded-2xl cursor-pointer border transition-all ${activeSIdx === i ? 'bg-indigo-600 border-indigo-600 shadow-xl' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                                        <div className={`text-[11px] font-black uppercase italic mb-1 ${activeSIdx === i ? 'text-white' : 'text-slate-900'}`}>{s.titleEn}</div>
                                        <div className={`text-[9px] font-bold ${activeSIdx === i ? 'text-indigo-100' : 'text-slate-400'}`}>{s.titleZh}</div>
                                        {scenarios.length > 1 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setScenarios(scenarios.filter(x => x.id !== s.id)); setActiveSIdx(0); }}
                                                className={`absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 transition-all ${activeSIdx === i ? 'text-white/40 hover:text-white' : 'text-slate-200 hover:text-rose-500'}`}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </aside>

                <main className="flex-1 flex flex-col bg-slate-50 relative p-8 pb-20">
                    <div className="flex-1 flex flex-col bg-white rounded-[3rem] shadow-2xl border border-slate-200/50 overflow-hidden relative">
                        <LiveDemoSandbox
                            key={activeSIdx + combinedLibCode.length}
                            initialCode={scenarios[activeSIdx].code}
                            libraryCode={combinedLibCode}
                            wrapperCode={wrapperCode}
                            cssCode={cssCode}
                            onChange={newCode => {
                                const newS = [...scenarios];
                                newS[activeSIdx].code = newCode;
                                setScenarios(newS);
                            }}
                        />
                    </div>

                    <div className={`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-[70] transition-all duration-350 shadow-[0_-20px_50px_rgba(0,0,0,0.06)] flex flex-col ${drawerOpen ? 'h-[550px]' : 'h-14'}`}>
                        <div className="h-14 flex-shrink-0 flex items-center justify-between px-10 border-b border-slate-50">
                            <div className="flex items-center gap-10 h-full">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Boxes className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">核心工程架构</span>
                                </div>
                                <div className="h-4 w-px bg-slate-100" />
                                <div className="flex h-full">
                                    {[
                                        { id: 'logic', name: '底层逻辑 (Logic)', icon: FileCode },
                                        { id: 'env', name: '执行环境 (Env)', icon: Layout },
                                        { id: 'css', name: '样式底座 (Styles)', icon: Palette }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => { setInfTab(tab.id); setDrawerOpen(true); }}
                                            className={`relative h-full flex items-center gap-2.5 px-6 text-[10px] font-black uppercase tracking-widest transition-all ${infTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            <tab.icon className="w-3.5 h-3.5" /> {tab.name}
                                            {infTab === tab.id && <motion.div layoutId="itab_line" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-lg" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => setDrawerOpen(!drawerOpen)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all border border-slate-100"
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest">{drawerOpen ? '收起控制台' : '查看源码架构'}</span>
                                {drawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex-1 flex overflow-hidden bg-slate-50">
                            <AnimatePresence mode="wait">
                                {infTab === 'logic' && (
                                    <motion.div key="logic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex h-full overflow-hidden">
                                        <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 p-4 space-y-1 overflow-y-auto h-full">
                                            {libFiles.map((f, i) => (
                                                <button key={i} onClick={() => setActiveLibIdx(i)} className={`w-full px-4 py-3 rounded-xl text-left text-[11px] font-black truncate transition-all flex items-center justify-between group ${activeLibIdx === i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-50'}`}>
                                                    <span className="flex items-center gap-2"><FileCode className="w-4 h-4 opacity-40" /> {f.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex-1 h-full relative">
                                            <textarea
                                                value={libFiles[activeLibIdx].content}
                                                onChange={e => {
                                                    const nf = [...libFiles];
                                                    nf[activeLibIdx].content = e.target.value;
                                                    setLibFiles(nf);
                                                }}
                                                className="absolute inset-0 w-full h-full bg-white p-10 text-[14px] font-mono text-slate-700 outline-none resize-none custom-scrollbar leading-relaxed"
                                                spellCheck={false}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                                {infTab === 'env' && (
                                    <motion.div key="env" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 h-full relative">
                                        <textarea value={wrapperCode} onChange={e => setWrapperCode(e.target.value)} className="absolute inset-0 w-full h-full bg-white p-10 text-[14px] font-mono text-slate-700 outline-none resize-none" spellCheck={false} />
                                    </motion.div>
                                )}
                                {infTab === 'css' && (
                                    <motion.div key="css" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 h-full relative">
                                        <textarea value={cssCode} onChange={e => setCssCode(e.target.value)} className="absolute inset-0 w-full h-full bg-white p-10 text-[14px] font-mono text-slate-700 outline-none resize-none" spellCheck={false} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ComponentShare;
