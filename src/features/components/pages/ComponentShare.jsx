import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Send,
    Info,
    Tag as TagIcon,
    Code2,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    FormInput,
    ShieldCheck,
    Type
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LiveDemoSandbox from './codeComponent/demo/LiveDemoSandbox';
import ComponentService from '../services/componentService';
import { useToast } from '@/hooks/useToast';

const ComponentShare = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();

    // 表单状态
    const [formData, setFormData] = useState({
        titleZh: '',
        titleEn: '',
        version: '1.0.0',
        descriptionZh: '',
        demoCode: `const MyDemo = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl">
      <div className="text-5xl mb-6">芜湖~</div>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
        新组件预览
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mb-8 text-center max-w-xs">
        点赞并观察状态变化
      </p>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/25 active:scale-95"
      >
        喜欢数: {count}
      </button>
    </div>
  );
};
`
    });

    // 错误信息状态
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.titleZh.trim()) newErrors.titleZh = '请输入中文标题';
        if (!formData.titleEn.trim()) newErrors.titleEn = '请输入英文标题';
        if (!formData.demoCode.includes('export default')) {
            newErrors.demoCode = '代码中必须包含 export default 导出组件';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // 实时清理对应错误
        if (errors[name]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleCodeChange = useCallback((newCode) => {
        setFormData(prev => ({ ...prev, demoCode: newCode }));
        if (errors.demoCode && newCode.includes('export default')) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated.demoCode;
                return updated;
            });
        }
    }, [errors.demoCode]);

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        // 真实的后端 API 提交
        try {
            await ComponentService.shareComponent(formData);
            toast.success('组件已提交！请等待管理员审核...', { duration: 3000 });

            // 延迟跳转回列表页
            setTimeout(() => {
                navigate('/components');
            }, 1000);
        } catch (err) {
            console.error('发布失败:', err);
            toast.error(err.message || '发布失败，服务器好像开小差了');
        } finally {
            setIsSubmitting(false);
        }
    };

    const InputField = ({ label, name, icon: Icon, placeholder, error }) => (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                <Icon className="w-3 h-3" />
                {label}
            </label>
            <div className="relative">
                <input
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 dark:bg-slate-900/50 border-2 rounded-2xl px-5 py-3.5 text-sm transition-all outline-none
                        ${error ? 'border-rose-500/50 focus:border-rose-500' : 'border-transparent focus:border-indigo-500/30'}`}
                    placeholder={placeholder}
                />
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="absolute -bottom-6 left-1 text-[10px] font-bold text-rose-500 flex items-center gap-1"
                        >
                            <AlertCircle className="w-3 h-3" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Top Stats Bar / Info Bar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 py-4 px-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/components')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                            组件发布中心
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            CREATION LAB: COMPONENT SHARING SYSTEM
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase">实时沙箱校验就绪</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2.5 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">正在处理...</span>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                立即发布组件
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content: Split Layout */}
            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                {/* Left: Input Sidebar */}
                <div className="w-full lg:w-[400px] xl:w-[450px] p-6 sm:p-8 space-y-8 bg-white/50 dark:bg-slate-900/30 backdrop-blur-xl border-r border-slate-100 dark:border-white/5 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">元数据配置</h2>
                        <p className="text-xs text-slate-500">这些信息将展示在组件库详情页中</p>
                    </div>

                    <div className="space-y-6">
                        <InputField
                            label="组件中文名称"
                            name="titleZh"
                            icon={Type}
                            placeholder="如：物理悬浮卡片"
                            error={errors.titleZh}
                        />
                        <InputField
                            label="Component English Name"
                            name="titleEn"
                            icon={FormInput}
                            placeholder="e.g. Physics Float Card"
                            error={errors.titleEn}
                        />

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                                <TagIcon className="w-3 h-3" />
                                简短描述
                            </label>
                            <textarea
                                name="descriptionZh"
                                value={formData.descriptionZh}
                                onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl px-5 py-4 text-sm transition-all outline-none h-32 resize-none"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    {/* Guidelines Card */}
                    <div className="p-6 rounded-3xl bg-indigo-600/5 border border-indigo-600/10">
                        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Code2 className="w-3.5 h-3.5" />
                            代码规范提示
                        </h4>
                        <ul className="space-y-3">
                            {[
                                '使用 React.useState 替代普通 useState 如果作用域内未定义',
                                '支持直接使用项目内的 CustomSelect 组件',
                                'JSX 标签必须正确闭合',
                                '最外层必须 export default 一个 React 组件'
                            ].map((text, idx) => (
                                <li key={idx} className="flex gap-2 text-[11px] text-slate-500 leading-relaxed font-bold">
                                    <CheckCircle2 className="w-3 h-3 text-indigo-500 flex-shrink-0 mt-0.5" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right: Full-Screen Sandbox */}
                <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
                    <div className="flex-grow flex flex-col">
                        <LiveDemoSandbox
                            initialCode={formData.demoCode}
                            onChange={handleCodeChange}
                        />
                        <AnimatePresence>
                            {errors.demoCode && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-4 bg-rose-500 text-white rounded-2xl flex items-center gap-3 font-bold text-sm"
                                >
                                    <AlertCircle className="w-5 h-5" />
                                    {errors.demoCode}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentShare;
