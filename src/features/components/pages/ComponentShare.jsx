import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Send, ArrowLeft, Plus, Trash2,
    Type, FormInput, Tag as TagIcon, Code2,
    ShieldCheck, AlertCircle, CheckCircle2,
    FileCode, BookOpen, Layers, Settings, Boxes, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveDemoSandbox from './codeComponent/demo/LiveDemoSandbox';
import ComponentService from '../services/componentService';
import { useToast } from '@/hooks/useToast';

// ─── 初始代码模板 (以 Toast 为例) ──────────────────────────────────
const INIT_LIB = `// 1. 核心动画与逻辑
const toastVariants = {
  initial: { opacity: 0, y: 20, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } }
};

export const ToastContext = React.createContext();
export const useToast = () => React.useContext(ToastContext);

// 2. 核心 Provider 组件
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);
  const add = (msg, type) => {
    const id = Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(curr => curr.filter(t => t.id !== id)), 3000);
  };
  return (
    <ToastContext.Provider value={{
      success: (msg) => add(msg, 'success'),
      error: (msg) => add(msg, 'error'),
      toasts
    }}>
      {children}
    </ToastContext.Provider>
  );
};

// 3. 核心容器组件
export const ToastContainer = () => {
  const { toasts } = useToast();
  return (
    <div className="fixed top-20 right-8 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id} variants={toastVariants} initial="initial" animate="animate" exit="exit"
            className={\`p-4 rounded-2xl shadow-2xl border text-white font-bold text-sm min-w-[200px] \${
              t.type === 'success' ? 'bg-emerald-500 border-emerald-400' : 'bg-rose-500 border-rose-400'
            }\`}
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
`;

const INIT_WRAPPER = `<ToastProvider>
  {/* 提供运行上下文 */}
  {children}

  {/* 渲染通知容器 */}
  <ToastContainer />
</ToastProvider>`;

const DEFAULT_DEMO_CODE = `const ToastDemo = () => {
  // 直接从 Implementation 中解构导出的 Hook
  const toast = useToast();

  return (
    <div className="text-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
      <h2 className="text-2xl font-black mb-8 text-slate-800 dark:text-white">魔法通知测试</h2>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => toast.success('恭喜！环境注入成功')}
          className="px-8 py-3 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
        >
          发射成功通知
        </button>

        <button
          onClick={() => toast.error('哎呀，发现一个错误')}
          className="px-8 py-3 bg-rose-500 text-white rounded-2xl font-black shadow-xl shadow-rose-500/20 active:scale-95 transition-all"
        >
          发射失败通知
        </button>
      </div>

      <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        Inside: ToastProvider (from Lib)
      </p>
    </div>
  );
};
`;

const createScenario = (index) => ({
    id: Date.now() + index,
    titleZh: `场景 ${index + 1}`,
    titleEn: `Scenario ${index + 1}`,
    descriptionZh: '',
    descriptionEn: '',
    demoCode: DEFAULT_DEMO_CODE,
    codeSnippet: '',
});

// ─── 子组件 ─────────────────────────────────────────────────────
const TabButton = ({ active, icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${active
            ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
            : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
    >
        <Icon className="w-3.5 h-3.5" />
        {label}
    </button>
);

const ComponentShare = () => {
    const navigate = useNavigate();
    const toast = useToast();

    // ── 状态管理 ──
    const [meta, setMeta] = useState({ titleZh: '', titleEn: '', version: '1.0.0', descriptionZh: '', descriptionEn: '' });
    const [libCode, setLibCode] = useState(INIT_LIB);
    const [wrapperCode, setWrapperCode] = useState(INIT_WRAPPER);
    const [cssCode, setCssCode] = useState('');
    const [activeConfigTab, setActiveConfigTab] = useState('meta'); // meta | impl | env | css
    const [scenarios, setScenarios] = useState([createScenario(0)]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── 行为 ──
    const updateScenario = (field, value) => {
        setScenarios(prev => prev.map((s, i) => i === activeIdx ? { ...s, [field]: value } : s));
    };

    const removeScenario = (idx, e) => {
        e.stopPropagation(); // 防止触发父级的 onClick
        if (scenarios.length <= 1) {
            toast.error('请至少保留一个演示场景');
            return;
        }

        const newScenarios = scenarios.filter((_, i) => i !== idx);
        setScenarios(newScenarios);

        // 如果删除的是当前处于激活状态的场景，或者删除的是索引在当前的场景之前的，需要调整 activeIdx
        if (activeIdx === idx) {
            setActiveIdx(Math.max(0, idx - 1));
        } else if (activeIdx > idx) {
            setActiveIdx(activeIdx - 1);
        }
    };

    const handleSubmit = async () => {
        if (!meta.titleZh || !meta.titleEn) {
            toast.error('请填写组件基本名称');
            return;
        }
        setIsSubmitting(true);
        try {
            await ComponentService.shareComponent({
                ...meta,
                libraryCode: libCode,
                wrapperCode,
                cssCode,
                scenarios: scenarios.map(s => ({
                    ...s,
                    codeSnippet: s.codeSnippet || s.demoCode
                }))
            });
            toast.success('组件分享成功，等待管理员审核！');
            setTimeout(() => navigate('/components'), 1500);
        } catch (err) {
            toast.error(err.message || '发布失败');
        } finally {
            setIsSubmitting(false);
        }
    };

    const activeScenario = scenarios[activeIdx];

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Header */}
            <header className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 px-6 py-4 flex items-center justify-between z-30">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/components')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">重构：组件配置中心</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="px-1.5 py-0.5 bg-indigo-500 text-white text-[8px] font-black rounded uppercase">Advanced</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Supports Multi-File Logic & Provider Wrappers</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2.5 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? '提交中...' : '提交完整组件包'}
                </button>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left: Global Config (Meta / Impl / Env) */}
                <aside className="w-[350px] flex-shrink-0 border-r border-slate-100 dark:border-white/5 bg-white/50 dark:bg-slate-900/40 flex flex-col z-20 overflow-hidden">
                    <nav className="flex bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-white/5">
                        <TabButton active={activeConfigTab === 'meta'} icon={Settings} label="基本信息" onClick={() => setActiveConfigTab('meta')} />
                        <TabButton active={activeConfigTab === 'impl'} icon={Boxes} label="核心实现" onClick={() => setActiveConfigTab('impl')} />
                        <TabButton active={activeConfigTab === 'env'} icon={Layout} label="环境包裹" onClick={() => setActiveConfigTab('env')} />
                        <TabButton active={activeConfigTab === 'css'} icon={FileCode} label="样式定义" onClick={() => setActiveConfigTab('css')} />
                    </nav>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
                        <AnimatePresence mode="wait">
                            {activeConfigTab === 'meta' && (
                                <motion.div key="meta" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-5">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">中文名称 *</label>
                                            <input value={meta.titleZh} onChange={e => setMeta({ ...meta, titleZh: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900/60 border-2 border-transparent focus:border-indigo-500/40 rounded-xl px-4 py-3 text-sm font-bold outline-none" placeholder="如：高级通知组件" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">English Name *</label>
                                            <input value={meta.titleEn} onChange={e => setMeta({ ...meta, titleEn: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900/60 border-2 border-transparent focus:border-indigo-500/40 rounded-xl px-4 py-3 text-sm font-bold outline-none" placeholder="e.g. Advanced Toast" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">描述 (中文)</label>
                                            <textarea value={meta.descriptionZh} onChange={e => setMeta({ ...meta, descriptionZh: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900/60 border-2 border-transparent focus:border-indigo-500/40 rounded-xl px-4 py-3 text-sm outline-none h-24 resize-none" placeholder="介绍组件的设计初衷..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description (English)</label>
                                            <textarea value={meta.descriptionEn} onChange={e => setMeta({ ...meta, descriptionEn: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900/60 border-2 border-transparent focus:border-indigo-500/40 rounded-xl px-4 py-3 text-sm outline-none h-24 resize-none" placeholder="Describe the component in English..." />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {activeConfigTab === 'impl' && (
                                <motion.div key="impl" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <Boxes className="w-4 h-4 text-indigo-500" />
                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">Implementation (Lib)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                                        在这里编写底层库代码（Provider, Hooks 等）。这些内容将注入沙箱环境，供所有场景直接调用。
                                    </p>
                                    <textarea
                                        value={libCode}
                                        onChange={e => setLibCode(e.target.value)}
                                        className="flex-1 w-full bg-slate-950 text-indigo-300 font-mono text-[11px] border border-slate-700/50 rounded-2xl p-4 outline-none resize-none leading-relaxed"
                                        placeholder="// export const useToast = () => ..."
                                    />
                                </motion.div>
                            )}
                            {activeConfigTab === 'env' && (
                                <motion.div key="env" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <Layout className="w-4 h-4 text-violet-500" />
                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">App Environment Wrapper</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                                        定义演示场景的外部包裹器。必须包含 <code className="text-indigo-400">{"{children}"}</code> 占位符。
                                    </p>
                                    <textarea
                                        value={wrapperCode}
                                        onChange={e => setWrapperCode(e.target.value)}
                                        className="flex-1 w-full bg-slate-950 text-violet-300 font-mono text-[11px] border border-slate-700/50 rounded-2xl p-4 outline-none resize-none leading-relaxed"
                                        placeholder={`<Provider>\n  {children}\n</Provider>`}
                                    />
                                </motion.div>
                            )}
                            {activeConfigTab === 'css' && (
                                <motion.div key="css" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <FileCode className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">Global Styles (CSS)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                                        定义组件所需的 CSS 样式。样式将被动态注入到演示页面的头部。
                                    </p>
                                    <textarea
                                        value={cssCode}
                                        onChange={e => setCssCode(e.target.value)}
                                        className="flex-1 w-full bg-slate-950 text-emerald-300 font-mono text-[11px] border border-slate-700/50 rounded-2xl p-4 outline-none resize-none leading-relaxed"
                                        placeholder=".my-component { ... }"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </aside>

                {/* Middle: Scenario List */}
                <nav className="w-[200px] flex-shrink-0 border-r border-slate-100 dark:border-white/5 bg-white/20 dark:bg-slate-900/20 flex flex-col z-10">
                    <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">演示列表</h2>
                        <button onClick={() => setScenarios([...scenarios, createScenario(scenarios.length)])} className="p-1 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {scenarios.map((s, idx) => (
                            <div key={s.id} className="relative group/item">
                                <button
                                    onClick={() => setActiveIdx(idx)}
                                    className={`w-full text-left px-3 py-3 rounded-xl transition-all ${idx === activeIdx ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <div className="text-[9px] font-black opacity-50 mb-0.5 tracking-tighter uppercase">Scene {idx + 1}</div>
                                    <div className="text-xs font-bold truncate pr-6">{s.titleZh || `未命名场景 ${idx + 1}`}</div>
                                </button>
                                {scenarios.length > 1 && (
                                    <button
                                        onClick={(e) => removeScenario(idx, e)}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all opacity-0 group-hover/item:opacity-100 hover:bg-rose-500 hover:text-white ${idx === activeIdx ? 'text-white/60' : 'text-slate-400'}`}
                                        title="删除场景"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Right: Active Scenario Editor & Sandbox */}
                <main className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden">
                    {activeScenario && (
                        <>
                            <div className="flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5 p-6">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">场景标题 (中文)</label>
                                        <input value={activeScenario.titleZh} onChange={e => updateScenario('titleZh', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none" placeholder="描述该场景的中文名称" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Scenario Title (English)</label>
                                        <input value={activeScenario.titleEn} onChange={e => updateScenario('titleEn', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none" placeholder="Default: same as Chinese" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">场景描述 (中文)</label>
                                        <input value={activeScenario.descriptionZh} onChange={e => updateScenario('descriptionZh', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-indigo-500/20 outline-none" placeholder="简述应用场景" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Scenario Description (English)</label>
                                        <input value={activeScenario.descriptionEn} onChange={e => updateScenario('descriptionEn', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-indigo-500/20 outline-none" placeholder="Default: same as Chinese" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto p-6 flex flex-col xl:flex-row gap-6">
                                <div className="flex-1 flex flex-col min-h-0">
                                    <LiveDemoSandbox
                                        key={activeScenario.id}
                                        initialCode={activeScenario.demoCode}
                                        libraryCode={libCode}
                                        wrapperCode={wrapperCode}
                                        cssCode={cssCode}
                                        onChange={code => updateScenario('demoCode', code)}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ComponentShare;
