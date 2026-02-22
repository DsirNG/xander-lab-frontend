import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Share2, Zap, Box, Info, Database,
    ChevronRight, Command, Layout, Boxes,
    Terminal, Maximize2, Minimize2, Palette, FileCode, Edit2,
    Type, Languages, Trash2, ShieldCheck, ChevronUp, ChevronDown, X, HelpCircle, Compass, PartyPopper
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveDemoSandbox from './codeComponent/demo/LiveDemoSandbox';
import ComponentService from '../services/componentService';
import { useToast } from '@/hooks/useToast';
import Modal from '../../../components/common/Modal';

// ─── 超聚焦向导漫游系统 ──────────────────────────────────────────
const TourSpotlight = ({ targetConfig, onSkip }) => {
    const [rect, setRect] = useState(null);

    useEffect(() => {
        if (!targetConfig) return;
        const updateRect = () => {
            const el = document.getElementById(targetConfig.id);
            if (el) {
                const r = el.getBoundingClientRect();
                setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
            }
        };
        updateRect();
        const interval = setInterval(updateRect, 50);
        return () => clearInterval(interval);
    }, [targetConfig]);

    if (!targetConfig || !rect || rect.width === 0) return null;

    const pad = 10;
    const topHeight = Math.max(0, rect.top - pad);
    const bottomTop = rect.top + rect.height + pad;
    const isModalLevel = targetConfig.isModalLevel;

    return createPortal(
        <div className={`fixed inset-0 pointer-events-none transition-all duration-300 ${isModalLevel ? 'z-[99999]' : 'z-[9000]'}`}>
            {/* 4 方向高斯模糊物理遮罩 */}
            <div className="absolute top-0 left-0 right-0 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-300 pointer-events-auto" style={{ height: topHeight }} />
            <div className="absolute left-0 right-0 bottom-0 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-300 pointer-events-auto" style={{ top: bottomTop }} />
            <div className="absolute left-0 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-300 pointer-events-auto" style={{ top: topHeight, height: rect.height + pad * 2, width: Math.max(0, rect.left - pad) }} />
            <div className="absolute right-0 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-300 pointer-events-auto" style={{ top: topHeight, height: rect.height + pad * 2, left: rect.left + rect.width + pad }} />

            {/* 炫酷的光晕洞口引导线 */}
            <div className="absolute rounded-xl pointer-events-none border-2 border-indigo-400 animate-ping opacity-40"
                style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
            />
            <div className="absolute rounded-xl pointer-events-none border-2 border-white/60 shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-300"
                style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
            />

            {/* AI 讲解提示框 */}
            <div
                className="absolute flex flex-col pointer-events-auto transition-all duration-500"
                style={{
                    top: rect.top > window.innerHeight / 2 ? Math.max(10, rect.top - pad - 120) : bottomTop + 10,
                    left: Math.max(20, Math.min(window.innerWidth - 320, rect.left + rect.width / 2 - 160)),
                    width: 320
                }}
            >
                <div className="bg-indigo-600 text-white p-5 rounded-2xl shadow-[0_30px_60px_-15px_rgba(79,70,229,0.5)] border border-indigo-400/30">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Compass className="w-4 h-4 text-amber-300" />
                            <h4 className="font-black text-[13px] uppercase tracking-widest">{targetConfig.text}</h4>
                        </div>
                        <button onClick={onSkip} className="text-indigo-200 hover:text-white transition-colors text-[9px] uppercase font-bold tracking-widest px-2 py-1 bg-indigo-700/50 rounded-lg">Skip // 退出</button>
                    </div>
                    <p className="text-indigo-50 text-[12px] font-medium leading-relaxed opacity-90">{targetConfig.desc}</p>
                </div>
            </div>
        </div>,
        document.body
    );
};

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

const INIT_WRAPPER = '<ToastProvider>\n  <ToastContainer />\n  {children}\n</ToastProvider>';

const INIT_SCENARIOS = [
    {
        id: '1',
        titleZh: '交互测试',
        titleEn: 'Interaction Study',
        code: 'function Demo() {\n  const toast = useToast();\n  \n  return (\n    <div className="flex flex-col items-center gap-8 p-12">\n       <div className="flex flex-col items-center gap-2 mb-4 text-center">\n         <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] italic">Toast Architecture</h3>\n         <div className="w-16 h-1 bg-indigo-500 rounded-full" />\n       </div>\n\n       <div className="flex flex-wrap justify-center gap-6">\n         <button \n           onClick={() => toast.success("验证成功 // Verification Success")}\n           className="px-12 py-5 bg-indigo-600 text-white font-black italic rounded-[2.5rem] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all text-[11px] uppercase tracking-widest hover:rotate-1 hover:scale-105"\n         >\n           Run Success\n         </button>\n\n         <button \n           onClick={() => toast.error("系统拦截 // Kernel Violation")}\n           className="px-12 py-5 bg-slate-900 text-white font-black italic rounded-[2.5rem] shadow-xl shadow-black/20 active:scale-95 transition-all text-[11px] uppercase tracking-widest hover:-rotate-1 hover:scale-105"\n         >\n           Run Error\n         </button>\n       </div>\n\n       <div className="mt-8 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl">\n         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">\n           点击按钮触发全局物理通知容器\n         </p>\n       </div>\n    </div>\n  );\n}'
    }
];

const INIT_META = {
    titleZh: '全局物理通知系统 (Toast)',
    titleEn: 'Global Kinetic Toast',
    version: '1.2.0',
    descriptionZh: '高性能、带物理挤压感和自动进度管理的全局通知组件。',
    descriptionEn: 'High-performance notification system with kinetic interactions and progress management.'
};

const ComponentShare = () => {
    const navigate = useNavigate();
    const toast = useToast();

    // --- 基础信息状态 ---
    const [meta, setMeta] = useState({
        titleZh: '',
        titleEn: '',
        version: '1.0.0',
        descriptionZh: '',
        descriptionEn: ''
    });

    // --- 核心资产状态 ---
    const [libFiles, setLibFiles] = useState([{ name: 'Index.jsx', content: '' }]);
    const [activeLibIdx, setActiveLibIdx] = useState(0);
    const [wrapperCode, setWrapperCode] = useState('');
    const [cssCode, setCssCode] = useState('');

    // --- 场景状态 ---
    const [scenarios, setScenarios] = useState([
        { id: '1', titleZh: '演示', titleEn: 'Demo', code: '' }
    ]);
    const [activeSIdx, setActiveSIdx] = useState(0);

    // --- 界面控制状态 ---
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [infTab, setInfTab] = useState('logic');

    // --- 使用样例说明层 ---
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [helpType, setHelpType] = useState('meta');

    // --- Onboarding 漫游导览系统 ---
    const [tourStep, setTourStep] = useState(-1); // -1=关闭导览, -2=欢迎询问, 0~5=各阶段

    useEffect(() => {
        const isFirstTime = !localStorage.getItem('hasSeenTourXanderLab');
        if (isFirstTime) {
            setTimeout(() => setTourStep(-2), 600); // 柔和地划出欢迎提示
        }
    }, []);

    const currentTourTarget = useMemo(() => {
        if (tourStep === -1 || tourStep === -2) return null;
        if (helpModalOpen) return { id: 'tour-apply-btn', text: '点击一键装载', desc: '该操作将为您自动注入企业级通知系统 (Toast) 的基底代码，省去搬运烦恼。', isModalLevel: true };

        switch (tourStep) {
            case 0: return { id: 'tour-meta-help', text: 'Step 1: 填充元数据', desc: '由于当前数据是空的，请您先点击此处的“❓”按钮，一键调取 Toast 的项目描述与命名。', autoTab: 'logic' };
            case 1: return { id: 'tour-logic-help', text: 'Step 2: 注入底层基建', desc: '接着为该组件导入 3 份核心的 Context 以及 UI Item 面板逻辑区块。', autoTab: 'logic' };
            case 2: return { id: 'tour-env-help', text: 'Step 3: 提供运行环境', desc: '为了让 Toast 在整个 App 层飘浮，这里需要补充 Provider 的环境包裹。', autoTab: 'env' };
            case 3: return { id: 'tour-css-help', text: 'Step 4: 挂载动效底座', desc: '没有好看的动效算什么企业级？这里为您准备了柔滑的进退场 Keyframe。', autoTab: 'css' };
            case 4: return { id: 'tour-scenario-help', text: 'Step 5: 部署沙盘验证场景', desc: '底层基建全部就绪！点击录入一段预先准备好的 React 演示代码来验证一切。', autoTab: 'logic' };
            case 5: return { id: 'tour-run-btn', text: 'Final: 点燃引擎！', desc: '一切装载完毕。现在，猛击这个 RUN ANALYTICS 按钮，感受实时渲染引擎的澎湃力量吧！', autoTab: 'logic' };
            default: return null;
        }
    }, [tourStep, helpModalOpen]);

    // 根据导览步数自动切换底部的 Tab
    useEffect(() => {
        if (currentTourTarget?.autoTab) {
            setInfTab(currentTourTarget.autoTab);
            setDrawerOpen(true);
        }
    }, [currentTourTarget?.autoTab]);

    // 监听 Run 按钮点击，完成整个导览！
    useEffect(() => {
        if (tourStep === 5) {
            const handleFinish = (e) => {
                if (e.target.closest('#tour-run-btn')) {
                    setTourStep(-1);
                    localStorage.setItem('hasSeenTourXanderLab', 'true');
                    setTimeout(() => toast.success("太棒了！您已精通组件漫游沙盒，享受丝滑的编码之旅吧！"), 1000);
                }
            };
            window.addEventListener('click', handleFinish, true);
            return () => window.removeEventListener('click', handleFinish, true);
        }
    }, [tourStep]);

    const handleApplySample = () => {
        if (helpType === 'meta') {
            setMeta(INIT_META);
        } else if (helpType === 'logic') {
            setLibFiles(INIT_FILES);
            setActiveLibIdx(0);
        } else if (helpType === 'scenario') {
            setScenarios(INIT_SCENARIOS);
            setActiveSIdx(0);
        } else if (helpType === 'env') {
            setWrapperCode(INIT_WRAPPER);
        } else if (helpType === 'css') {
            setCssCode(INIT_CSS);
        }
        setHelpModalOpen(false);
        toast.success('样例代码已填充至面板！');

        // 在应用完毕后，导览步骤自动推进！
        if (tourStep !== -1) {
            setTourStep(s => s + 1);
        }
    };

    // --- 场景编辑状态 ---
    const [editScenarioModalOpen, setEditScenarioModalOpen] = useState(false);
    const [editingScenarioIndex, setEditingScenarioIndex] = useState(null);
    const [editScenTitleZh, setEditScenTitleZh] = useState('');
    const [editScenTitleEn, setEditScenTitleEn] = useState('');

    const handleEditScenarioSubmit = () => {
        if (editingScenarioIndex === null) return;
        const newScenarios = [...scenarios];
        newScenarios[editingScenarioIndex].titleZh = editScenTitleZh;
        newScenarios[editingScenarioIndex].titleEn = editScenTitleEn;
        setScenarios(newScenarios);
        setEditScenarioModalOpen(false);
    };

    // --- 文件操作 ---
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newFileName, setNewFileName] = useState('NewComponent.jsx');

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [fileToDeleteIdx, setFileToDeleteIdx] = useState(null);

    const handleAddFileSubmit = () => {
        const fileName = newFileName.trim();
        if (!fileName) {
            toast.warning('文件名不能为空');
            return;
        }
        if (!fileName.endsWith('.jsx') && !fileName.endsWith('.tsx') && !fileName.endsWith('.js') && !fileName.endsWith('.ts')) {
            toast.warning('推荐使用 .jsx或.tsx 后缀');
        }
        if (libFiles.some(f => f.name === fileName)) {
            toast.warning('文件名不能重复');
            return;
        }
        setLibFiles([...libFiles, { name: fileName, content: '// ' + fileName + '\nexport const Component = () => {\n  return <div>New Component</div>;\n};\n' }]);
        setActiveLibIdx(libFiles.length);
        setAddModalOpen(false);
    };

    const handleDeleteFile = (e, index) => {
        e.stopPropagation();
        if (libFiles.length <= 1) {
            toast.warning('至少需要保留一个文件');
            return;
        }
        setFileToDeleteIdx(index);
        setDeleteModalOpen(true);
    };

    const confirmDeleteFile = () => {
        if (fileToDeleteIdx === null) return;
        const index = fileToDeleteIdx;
        const newFiles = libFiles.filter((_, i) => i !== index);
        setLibFiles(newFiles);
        if (activeLibIdx === index) {
            setActiveLibIdx(Math.max(0, index - 1));
        } else if (activeLibIdx > index) {
            setActiveLibIdx(activeLibIdx - 1);
        }
        setDeleteModalOpen(false);
        setFileToDeleteIdx(null);
    };

    const combinedLibCode = useMemo(() => {
        return libFiles.map(f => `/* === FILE: ${f.name} === */\n${f.content}`).join('\n\n');
    }, [libFiles]);

    // --- 处理器 ---
    const handlePublish = async () => {
        try {
            await ComponentService.shareComponent({
                ...meta,
                libraryCode: combinedLibCode,
                sourceCode: combinedLibCode,
                wrapperCode,
                cssCode,
                scenarios: scenarios.map(s => ({
                    titleZh: s.titleZh,
                    titleEn: s.titleEn,
                    descriptionZh: s.titleZh,
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
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30" onClick={() => {
                      //返回组件页面
                      navigate('/components');
                    }}>
                        {/*<Command className="w-5 h-5 text-white" />*/}
                      <img src="https://xander-lab.dsircity.top/favicon.png" alt=""/>
                    </div>
                    <div>
                        <h1 className="text-[13px] font-black uppercase italic tracking-widest mb-0.5">组件工作室</h1>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                            Architecture Synchronized // <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setTourStep(0)} className="px-5 py-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black transition-all active:scale-95 flex items-center gap-2" title="重启新手向导">
                        <Compass className="w-4 h-4" /> 新手向导
                    </button>
                    <button onClick={handlePublish} className="px-10 py-3 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl text-[10px] font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2">
                        <Share2 className="w-4 h-4" /> 发布至组件库
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* 侧边栏 */}
                <aside className="w-[320px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="p-6 space-y-10">
                        <section className="space-y-6">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center justify-between">
                                <span className="flex items-center gap-2"><Database className="w-4 h-4 text-indigo-500" /> 注册元数据</span>
                                <button id="tour-meta-help" onClick={() => { setHelpType('meta'); setHelpModalOpen(true); }} className="p-1 hover:bg-slate-50 rounded text-slate-300 hover:text-indigo-600 transition-colors relative z-10"><HelpCircle className="w-4 h-4" /></button>
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
                                <div className="flex items-center gap-1 relative z-10">
                                    <button id="tour-scenario-help" onClick={() => { setHelpType('scenario'); setHelpModalOpen(true); }} className="p-1 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-indigo-600 transition-colors">
                                        <HelpCircle className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => {
                                        const id = Date.now().toString();
                                        setScenarios([...scenarios, { id, titleZh: '新测试', titleEn: 'New Study', code: 'function Demo() {\n  return <div>New</div>;\n}' }]);
                                        setActiveSIdx(scenarios.length);
                                    }} className="p-1 hover:bg-slate-50 rounded-lg text-indigo-600 transition-all active:scale-125">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {scenarios.map((s, i) => (
                                    <div key={s.id} onClick={() => setActiveSIdx(i)} className={`relative group px-5 py-4 rounded-2xl cursor-pointer border transition-all ${activeSIdx === i ? 'bg-indigo-600 border-indigo-600 shadow-xl' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                                        <div className={`text-[11px] font-black uppercase italic mb-1 ${activeSIdx === i ? 'text-white' : 'text-slate-900'}`}>{s.titleEn}</div>
                                        <div className={`text-[9px] font-bold ${activeSIdx === i ? 'text-indigo-100' : 'text-slate-400'}`}>{s.titleZh}</div>
                                        <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-all gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingScenarioIndex(i); setEditScenTitleZh(s.titleZh); setEditScenTitleEn(s.titleEn); setEditScenarioModalOpen(true); }}
                                                className={`p-1.5 transition-all outline-none ${activeSIdx === i ? 'text-white/40 hover:text-white' : 'text-slate-200 hover:text-indigo-500'}`}
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            {scenarios.length > 1 && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setScenarios(scenarios.filter(x => x.id !== s.id)); setActiveSIdx(0); }}
                                                    className={`p-1.5 transition-all outline-none ${activeSIdx === i ? 'text-white/40 hover:text-white' : 'text-slate-200 hover:text-rose-500'}`}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </aside>

                <main className="flex-1 flex flex-col bg-slate-50 relative p-8 pb-20">
                    <div className="flex-1 flex flex-col bg-white rounded-[3rem] shadow-2xl border border-slate-200/50 overflow-hidden relative">
                        <LiveDemoSandbox
                            key={activeSIdx}
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
                                        <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 p-4 flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-4 px-2">
                                                <div className="flex items-center gap-2 relative z-10">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Files</span>
                                                    <button id="tour-logic-help" onClick={() => { setHelpType('logic'); setHelpModalOpen(true); }} className="p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-indigo-600 transition-colors"><HelpCircle className="w-3.5 h-3.5" /></button>
                                                </div>
                                                <button onClick={() => { setNewFileName('NewComponent.jsx'); setAddModalOpen(true); }} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition-colors">
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1 pb-4">
                                                {libFiles.map((f, i) => (
                                                    <button key={i} onClick={() => setActiveLibIdx(i)} className={`w-full px-4 py-3 rounded-xl text-left text-[11px] font-black truncate transition-all flex items-center justify-between group ${activeLibIdx === i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-50'}`}>
                                                        <span className="flex items-center gap-2 truncate"><FileCode className="w-4 h-4 opacity-40 flex-shrink-0" /> <span className="truncate">{f.name}</span></span>
                                                        {libFiles.length > 1 && (
                                                            <div
                                                                onClick={(e) => handleDeleteFile(e, i)}
                                                                className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-all ${activeLibIdx === i ? 'hover:bg-indigo-500' : 'hover:bg-slate-200'}`}
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
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
                                        <div className="absolute top-4 right-8 z-10">
                                            <button id="tour-env-help" onClick={() => { setHelpType('env'); setHelpModalOpen(true); }} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm bg-white border border-slate-100" title="获取外层包裹样例"><HelpCircle className="w-4 h-4" /></button>
                                        </div>
                                        <textarea value={wrapperCode} onChange={e => setWrapperCode(e.target.value)} className="absolute inset-0 w-full h-full bg-white p-10 text-[14px] font-mono text-slate-700 outline-none resize-none" spellCheck={false} />
                                    </motion.div>
                                )}
                                {infTab === 'css' && (
                                    <motion.div key="css" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 h-full relative">
                                        <div className="absolute top-4 right-8 z-10">
                                            <button id="tour-css-help" onClick={() => { setHelpType('css'); setHelpModalOpen(true); }} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm bg-white border border-slate-100" title="获取CSS样式样例"><HelpCircle className="w-4 h-4" /></button>
                                        </div>
                                        <textarea value={cssCode} onChange={e => setCssCode(e.target.value)} className="absolute inset-0 w-full h-full bg-white p-10 text-[14px] font-mono text-slate-700 outline-none resize-none" spellCheck={false} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </main>
            </div>

            {/* --- Modals --- */}
            <Modal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                            <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-[14px]">新建文件</span>
                    </div>
                }
                width="max-w-[400px]"
                footer={
                    <>
                        <button onClick={() => setAddModalOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">取消</button>
                        <button onClick={handleAddFileSubmit} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">确定创建</button>
                    </>
                }
            >
                <div className="space-y-4 py-2">
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 block mb-2">File Name</label>
                        <input
                            autoFocus
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddFileSubmit(); }}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[13px] font-mono text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                            placeholder="e.g. Button.tsx"
                        />
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 p-3 flex gap-3 text-xs rounded-xl font-medium border border-amber-100 dark:border-amber-500/20">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>推荐使用标准的前端扩展名如 <code className="bg-amber-100/50 dark:bg-amber-500/20 px-1 py-0.5 rounded font-black italic">.jsx</code>, <code className="bg-amber-100/50 dark:bg-amber-500/20 px-1 py-0.5 rounded font-black italic">.ts</code>, <code className="bg-amber-100/50 dark:bg-amber-500/20 px-1 py-0.5 rounded font-black italic">.tsx</code>。</p>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="删除确认"
                width="max-w-[360px]"
                footer={
                    <>
                        <button onClick={() => setDeleteModalOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">取消</button>
                        <button onClick={confirmDeleteFile} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-2">
                            <Trash2 className="w-3.5 h-3.5" /> 确认删除
                        </button>
                    </>
                }
            >
                <div className="py-2 text-[14px] font-medium flex items-start gap-4 text-slate-600 dark:text-slate-300">
                    <div className="w-10 h-10 rounded-full bg-rose-100/50 dark:bg-rose-500/20 text-rose-500 shrink-0 flex items-center justify-center border border-rose-200/50 dark:border-rose-500/30">
                        <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                        你正在极其危险地彻底抹除代码资产：<br />
                        <span className="text-slate-900 dark:text-white font-black italic border-b border-rose-200 mt-2 inline-block">
                            {fileToDeleteIdx !== null ? libFiles[fileToDeleteIdx].name : ''}
                        </span>
                        <p className="text-[12px] text-slate-400 mt-2">一旦删除，本地将丢失该文件的源码结构，是否强行覆盖执行？</p>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={helpModalOpen}
                onClose={() => setHelpModalOpen(false)}
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-[14px]">预置样例库 - {helpType.toUpperCase()}</span>
                    </div>
                }
                width="max-w-[420px]"
                footer={
                    <>
                        <button onClick={() => setHelpModalOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">取消</button>
                        <button id="tour-apply-btn" onClick={handleApplySample} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all relative z-10">
                            一键装载
                        </button>
                    </>
                }
            >
                <div className="py-2 text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    这是一项开发向导功能。点击下方按钮后，我们将为您本环节自动填入 <strong>『全局物理通知组件 (Toast)』</strong> 的标准工程测试数据。<br /><br />
                    {helpType === 'meta' && '该操作将会为您填入 Toast 组件的完整基本信息（中英文名称、描述及版本），跳过繁杂的手动录入。'}
                    {helpType === 'scenario' && '该操作将会一键填充一份同时包含了 { 成功态 / 失败态 / 进度流 } 等交互机制的完整 React DOM 运行场景。'}
                    {helpType === 'logic' && '该操作将会为您直接写入 ToastContext、ToastItem 和 ToastContainer 三个具备相互依赖关系的核心架构文件。'}
                    {helpType === 'env' && '该操作将会为您填入 <ToastProvider /> 等全量外层上下文节点，使您的演示代码能够正常接管全局路由或顶层依赖。'}
                    {helpType === 'css' && '该操作将会为您补充 Toast 高性能进退场的 CSS Keyframes 等基底渲染数据。'}
                </div>
            </Modal>

            <Modal
                isOpen={editScenarioModalOpen}
                onClose={() => setEditScenarioModalOpen(false)}
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                            <Edit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-[14px]">修改测试场景信息</span>
                    </div>
                }
                width="max-w-[400px]"
                footer={
                    <>
                        <button onClick={() => setEditScenarioModalOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">取消</button>
                        <button onClick={handleEditScenarioSubmit} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                            保存修改
                        </button>
                    </>
                }
            >
                <div className="space-y-4 py-2">
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 block mb-2">中文名称</label>
                        <input
                            autoFocus
                            value={editScenTitleZh}
                            onChange={(e) => setEditScenTitleZh(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleEditScenarioSubmit(); }}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[13px] font-bold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                            placeholder="输入场景中文名..."
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 block mb-2">English Title</label>
                        <input
                            value={editScenTitleEn}
                            onChange={(e) => setEditScenTitleEn(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleEditScenarioSubmit(); }}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[13px] font-bold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                            placeholder="e.g. Interaction Study"
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={tourStep === -2}
                onClose={() => { setTourStep(-1); localStorage.setItem('hasSeenTourXanderLab', 'true'); }}
                title="欢迎访问系统实验室 🧬"
                footer={
                    <>
                        <button onClick={() => {
                            setTourStep(-1);
                            localStorage.setItem('hasSeenTourXanderLab', 'true');
                            toast.info("已跳过向导。如果后续需要，您随时可以点击页面右上角的「新手向导」按钮重新进入。");
                        }} className="px-5 py-2.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-all">
                            我已熟悉，残忍拒绝
                        </button>
                        <button onClick={() => setTourStep(0)} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2">
                            <Compass className="w-4 h-4" /> 启动教学向导
                        </button>
                    </>
                }
            >
                <div className="text-slate-600 dark:text-slate-300 text-[13px] leading-loose">
                    侦测到系统架构池处于初始完全清空状态，且您是第一次进入<strong> Xander-Lab Workspace</strong>。<br />
                    为了帮助您最快熟悉这个“四合一”热重载沙盒，我们为您内置了一整套全局通知系统（Toast）的骨架。<br /><br />
                    是否愿意花 <b>30 秒</b>的世界时间，跟随强光指引，一点点体验如何无脑将组件拼装、编译并最终发射运作？
                </div>
            </Modal>

            <TourSpotlight targetConfig={currentTourTarget} onSkip={() => {
                setTourStep(-1);
                localStorage.setItem('hasSeenTourXanderLab', 'true');
                toast.info("已中止向导。您可以随时点击右上角「新手向导」重新开始。");
            }} />
        </div>
    );
};

export default ComponentShare;
