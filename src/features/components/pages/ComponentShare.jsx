import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Send, ArrowLeft, Plus, Trash2, ChevronRight,
    Type, FormInput, Tag as TagIcon, Code2,
    ShieldCheck, AlertCircle, CheckCircle2,
    FileCode, BookOpen, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveDemoSandbox from './codeComponent/demo/LiveDemoSandbox';
import ComponentService from '../services/componentService';
import { useToast } from '@/hooks/useToast';

// ─── 默认场景代码 ─────────────────────────────────────────────────
const DEFAULT_DEMO_CODE = `const MyDemo = () => {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{ textAlign: 'center', padding: '3rem', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#6366f1', marginBottom: '1rem' }}>🎨 My Component</h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Count: <strong>{count}</strong></p>
      <button
        onClick={() => setCount(c => c + 1)}
        style={{ padding: '0.6rem 2rem', background: '#6366f1', color: 'white',
                 border: 'none', borderRadius: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Click Me +1
      </button>
    </div>
  );
};
`;

// ─── 工具函数 ─────────────────────────────────────────────────────
const createScenario = (index) => ({
    id: Date.now() + index,
    titleZh: `场景 ${index + 1}`,
    titleEn: `Scenario ${index + 1}`,
    description: '',
    demoCode: DEFAULT_DEMO_CODE,
    codeSnippet: '',
    showCodeSnippet: false,
});

// ─── 子组件：InputField ───────────────────────────────────────────
const InputField = ({ label, name, value, onChange, icon: Icon, placeholder, error }) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {Icon && <Icon className="w-3 h-3" />}
            {label}
        </label>
        <div className="relative">
            <input
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full bg-slate-50 dark:bg-slate-900/60 border-2 rounded-xl px-4 py-3 text-sm transition-all outline-none ${error ? 'border-rose-500/50 focus:border-rose-500' : 'border-transparent focus:border-indigo-500/40'
                    }`}
                placeholder={placeholder}
            />
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -bottom-5 left-1 text-[10px] font-bold text-rose-500 flex items-center gap-1"
                    >
                        <AlertCircle className="w-3 h-3" />{error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
);

// ─── 主组件 ──────────────────────────────────────────────────────
const ComponentShare = () => {
    const navigate = useNavigate();
    const toast = useToast();

    // ── 元数据 ──
    const [meta, setMeta] = useState({ titleZh: '', titleEn: '', version: '1.0.0', descriptionZh: '' });
    const [showSourceCode, setShowSourceCode] = useState(false);
    const [sourceCode, setSourceCode] = useState('');
    const [metaErrors, setMetaErrors] = useState({});

    // ── 场景列表 ──
    const [scenarios, setScenarios] = useState([createScenario(0)]);
    const [activeIdx, setActiveIdx] = useState(0);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── 更新元数据字段 ──
    const handleMetaChange = (e) => {
        const { name, value } = e.target;
        setMeta(prev => ({ ...prev, [name]: value }));
        if (metaErrors[name]) setMetaErrors(prev => { const u = { ...prev }; delete u[name]; return u; });
    };

    // ── 更新当前场景字段 ──
    const updateScenario = useCallback((field, value) => {
        setScenarios(prev => prev.map((s, i) => i === activeIdx ? { ...s, [field]: value } : s));
    }, [activeIdx]);

    // ── 新增场景 ──
    const addScenario = () => {
        const next = createScenario(scenarios.length);
        setScenarios(prev => [...prev, next]);
        setActiveIdx(scenarios.length);
    };

    // ── 删除场景 ──
    const deleteScenario = (idx) => {
        if (scenarios.length <= 1) return;
        setScenarios(prev => prev.filter((_, i) => i !== idx));
        setActiveIdx(prev => Math.min(prev, scenarios.length - 2));
    };

    // ── 校验 ──
    const validate = () => {
        const errs = {};
        if (!meta.titleZh.trim()) errs.titleZh = '请输入中文名称';
        if (!meta.titleEn.trim()) errs.titleEn = 'English name required';
        setMetaErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── 提交 ──
    const handleSubmit = async () => {
        if (!validate()) {
            toast.error('请先完善组件基本信息');
            return;
        }
        setIsSubmitting(true);
        try {
            await ComponentService.shareComponent({
                ...meta,
                sourceCode,
                scenarios: scenarios.map(s => ({
                    titleZh: s.titleZh,
                    titleEn: s.titleEn,
                    description: s.description,
                    demoCode: s.demoCode,
                    codeSnippet: s.codeSnippet || s.demoCode,
                })),
            });
            toast.success('组件已提交，等待管理员审核！', { duration: 3000 });
            setTimeout(() => navigate('/components'), 1500);
        } catch (err) {
            console.error(err);
            toast.error(err.message || '提交失败，请稍后重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    const activeScenario = scenarios[activeIdx];

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">

            {/* ── 顶部导航栏 ── */}
            <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 px-6 py-3.5 flex items-center justify-between z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/components')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group">
                        <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                    </button>
                    <div>
                        <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">组件发布中心</h1>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">CREATION LAB</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase">沙箱就绪</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-[10px] font-black text-indigo-600 uppercase">{scenarios.length} 个场景</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">提交中...</span>
                        ) : (
                            <><Send className="w-3.5 h-3.5" />立即发布</>
                        )}
                    </button>
                </div>
            </div>

            {/* ── 三栏主体 ── */}
            <div className="flex-1 flex overflow-hidden">

                {/* ── 左栏：组件元数据 ── */}
                <div className="w-[280px] flex-shrink-0 border-r border-slate-100 dark:border-white/5 bg-white/60 dark:bg-slate-900/40 flex flex-col overflow-y-auto">
                    <div className="p-5 space-y-5">
                        <div>
                            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                                组件信息
                            </h2>
                            <div className="space-y-5">
                                <InputField label="中文名称 *" name="titleZh" value={meta.titleZh}
                                    onChange={handleMetaChange} icon={Type}
                                    placeholder="如：智能弹出通知" error={metaErrors.titleZh} />
                                <InputField label="English Name *" name="titleEn" value={meta.titleEn}
                                    onChange={handleMetaChange} icon={FormInput}
                                    placeholder="e.g. Smart Toast" error={metaErrors.titleEn} />
                                <InputField label="版本号" name="version" value={meta.version}
                                    onChange={handleMetaChange}
                                    placeholder="1.0.0" />
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <TagIcon className="w-3 h-3" />简短描述
                                    </label>
                                    <textarea
                                        name="descriptionZh" value={meta.descriptionZh}
                                        onChange={handleMetaChange}
                                        className="w-full bg-slate-50 dark:bg-slate-900/60 border-2 border-transparent focus:border-indigo-500/40 rounded-xl px-4 py-3 text-sm outline-none resize-none h-24 transition-all"
                                        placeholder="一句话介绍这个组件的用途..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 源码配置（可折叠） */}
                        <div className="border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => setShowSourceCode(v => !v)}
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <FileCode className="w-3.5 h-3.5 text-violet-500" />
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">源码说明</span>
                                    <span className="text-[9px] text-slate-400 font-bold">可选</span>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showSourceCode ? 'rotate-90' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {showSourceCode && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-4">
                                            <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                                                粘贴组件完整源码（纯文本，供阅读参考），可包含多个文件内容
                                            </p>
                                            <textarea
                                                value={sourceCode}
                                                onChange={e => setSourceCode(e.target.value)}
                                                className="w-full bg-slate-950 text-slate-300 font-mono text-[11px] border border-slate-700 rounded-xl px-3 py-3 outline-none resize-none h-48 leading-relaxed"
                                                placeholder={`// ToastContext.jsx\nexport const ToastContext = ...\n\n// ToastContainer.jsx\nexport default function ToastContainer...`}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 规范提示 */}
                        <div className="p-4 rounded-xl bg-indigo-600/5 border border-indigo-600/10">
                            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <Code2 className="w-3 h-3" />代码规范
                            </h4>
                            <ul className="space-y-2">
                                {[
                                    '使用 React.useState 替代 useState',
                                    '可直接使用 CustomSelect 组件',
                                    'JSX 标签必须正确闭合',
                                    'Tailwind CSS 类名可用',
                                ].map((text, i) => (
                                    <li key={i} className="flex gap-1.5 text-[10px] text-slate-500 font-medium">
                                        <CheckCircle2 className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                                        {text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ── 中栏：场景列表 ── */}
                <div className="w-[200px] flex-shrink-0 border-r border-slate-100 dark:border-white/5 bg-white/30 dark:bg-slate-900/20 flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-white/5">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">演示场景</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {scenarios.map((s, idx) => (
                            <motion.button
                                key={s.id}
                                layout
                                onClick={() => setActiveIdx(idx)}
                                className={`w-full text-left px-3 py-3 rounded-xl transition-all group relative ${idx === activeIdx
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${idx === activeIdx ? 'text-indigo-200' : 'text-slate-400'}`}>
                                            SCENE {idx + 1}
                                        </div>
                                        <div className="text-xs font-bold truncate">{s.titleZh}</div>
                                    </div>
                                    {scenarios.length > 1 && (
                                        <button
                                            onClick={e => { e.stopPropagation(); deleteScenario(idx); }}
                                            className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${idx === activeIdx ? 'hover:bg-indigo-500' : 'hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-500'
                                                }`}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                    <div className="p-3 border-t border-slate-100 dark:border-white/5">
                        <button
                            onClick={addScenario}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-500 dark:text-slate-400 text-xs font-bold transition-all group"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            新增场景
                        </button>
                    </div>
                </div>

                {/* ── 右栏：当前场景编辑器 ── */}
                <div className="flex-1 flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950">
                    {activeScenario && (
                        <>
                            {/* 场景配置区 */}
                            <div className="flex-shrink-0 bg-white/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-white/5 px-6 py-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex-1 min-w-[160px]">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">场景标题（中文）</label>
                                        <input
                                            value={activeScenario.titleZh}
                                            onChange={e => updateScenario('titleZh', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/40 rounded-xl px-3 py-2 text-sm font-bold outline-none"
                                            placeholder="如：基础用法"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[160px]">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Scenario Title (EN)</label>
                                        <input
                                            value={activeScenario.titleEn}
                                            onChange={e => updateScenario('titleEn', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/40 rounded-xl px-3 py-2 text-sm font-bold outline-none"
                                            placeholder="e.g. Basic Usage"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">场景描述</label>
                                        <input
                                            value={activeScenario.description}
                                            onChange={e => updateScenario('description', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/40 rounded-xl px-3 py-2 text-sm outline-none"
                                            placeholder="描述这个场景展示了什么..."
                                        />
                                    </div>
                                </div>
                                {/* View Code 配置（可选） */}
                                <div className="mt-3">
                                    <button
                                        onClick={() => updateScenario('showCodeSnippet', !activeScenario.showCodeSnippet)}
                                        className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                                    >
                                        <Code2 className="w-3 h-3" />
                                        {activeScenario.showCodeSnippet ? '▲ 收起' : '▼ 配置 View Code 展示代码（可选，不填则自动使用 Demo 代码）'}
                                    </button>
                                    <AnimatePresence>
                                        {activeScenario.showCodeSnippet && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden mt-2"
                                            >
                                                <textarea
                                                    value={activeScenario.codeSnippet}
                                                    onChange={e => updateScenario('codeSnippet', e.target.value)}
                                                    className="w-full bg-slate-950 text-slate-300 font-mono text-xs border border-slate-700 rounded-xl px-4 py-3 outline-none resize-none h-28 leading-relaxed"
                                                    placeholder="粘贴格式化后的代码片段，用于点击 View Code 时展示给用户..."
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* 沙箱编辑器 */}
                            <div className="flex-1 overflow-auto p-5">
                                <LiveDemoSandbox
                                    key={activeScenario.id}
                                    initialCode={activeScenario.demoCode}
                                    onChange={code => updateScenario('demoCode', code)}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComponentShare;
