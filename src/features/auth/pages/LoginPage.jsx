import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Mail, Lock, ShieldCheck, ArrowRight, Loader2,
    Layers, ChevronLeft, Github, Globe, Sparkles,
    Fingerprint, Shield, Zap, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/authService';

/**
 * Xander Lab // Premium Immersive Login (Stable Card Edition)
 * Keeps all the high-tech visual effects but removes 3D tilt to ensure input stability.
 */
const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const [loading, setLoading] = useState(false);
    const [loginType, setLoginType] = useState('password'); // password | code
    const [formData, setFormData] = useState({
        account: '',
        password: '',
        code: ''
    });
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSendCode = async () => {
        if (!formData.account || !formData.account.includes('@')) {
            setError('请输入有效的邮箱');
            return;
        }
        try {
            await authService.sendCode(formData.account);
            setCountdown(60);
            setError('');
        } catch (err) {
            setError(err.message || '指令链路中断');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authService.login({ ...formData, type: loginType });
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || '双重因子校验失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fcfcfd] dark:bg-[#080b14] overflow-hidden selection:bg-primary/30">
            {/* 1. 高级艺术背景：数字轨道与漂浮粒子 */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <DigitalOrbit />
                <FloatingParticles />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80 dark:to-slate-950/80" />
            </div>

            {/* 2. 品牌悬浮顶栏 */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-50 max-w-7xl mx-auto w-full"
            >
                <Link to="/" className="group flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl group-hover:scale-110 transition-transform duration-500">
                            <Layers className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black tracking-tighter text-2xl text-slate-900 dark:text-white leading-none">XANDER LAB</span>
                        <span className="text-[10px] font-bold text-slate-400 leading-none mt-1 tracking-[0.2em]">UNIFIED AUTH</span>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-900 shadow-sm transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                        <Globe className="w-4 h-4" />
                        System Status: <span className="text-emerald-500 animate-pulse font-black uppercase">Secure</span>
                    </button>
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />
                    <a href="https://github.com" className="p-3 text-slate-400 hover:text-primary transition-colors">
                        <Github className="w-6 h-6" />
                    </a>
                </div>
            </motion.header>

            {/* 3. 主交互卡片：稳态设计 */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[480px]"
            >
                {/* 背景发光背景 */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-700" />

                <div className="relative bg-white/70 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/40 dark:border-white/5 rounded-[3.5rem] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.15)] overflow-hidden">

                    <div className="p-10 md:p-14 relative z-10">
                        {/* 装饰图标 */}
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Cpu className="w-16 h-16 text-primary" />
                        </div>

                        {/* 登录头描述 */}
                        <div className="mb-12">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4 text-primary animate-bounce" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Identity Gateway</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                                登录访问<span className="text-primary text-5xl">.</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                以获取 Xander Lab 完整功能、博客管理及多维数据的访问权限。
                            </p>
                        </div>

                        {/* 模式选择切换 */}
                        <div className="grid grid-cols-2 p-1.5 bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl mb-10 border border-slate-200/50 dark:border-slate-800/50">
                            {[
                                { id: 'password', label: '密码识别', icon: Fingerprint },
                                { id: 'code', label: '验证码验证', icon: Shield }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setLoginType(tab.id)}
                                    className={`relative flex items-center justify-center gap-2 py-3.5 text-xs font-black rounded-xl transition-all duration-500 overflow-hidden ${loginType === tab.id
                                        ? 'text-white'
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4 relative z-10" />
                                    <span className="relative z-10">{tab.label}</span>
                                    {loginType === tab.id && (
                                        <motion.div
                                            layoutId="active-pill-immersive"
                                            className="absolute inset-0 bg-primary shadow-lg shadow-primary/20"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={loginType}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-5">
                                        <div className="group">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 block">
                                                Identity / 账户
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                    <Mail className="w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="account"
                                                    required
                                                    value={formData.account}
                                                    onChange={handleChange}
                                                    className="block w-full pl-12 pr-6 py-4.5 bg-white/50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-3xl text-[14px] font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                                                    placeholder="Username / Email"
                                                />
                                            </div>
                                        </div>

                                        {loginType === 'password' ? (
                                            <div className="group">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 block">
                                                    Secret Key / 密码
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                        <Lock className="w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                                    </div>
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        required
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        className="block w-full pl-12 pr-6 py-4.5 bg-white/50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-3xl text-[14px] font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                                                        placeholder="Laboratory Passkey"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="group">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 block">
                                                    Command Stream / 验证码
                                                </label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                            <ShieldCheck className="w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            name="code"
                                                            required
                                                            maxLength={6}
                                                            value={formData.code}
                                                            onChange={handleChange}
                                                            className="block w-full pl-12 pr-6 py-4.5 bg-white/50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-3xl text-[14px] font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                                                            placeholder="6 Digits"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={countdown > 0}
                                                        onClick={handleSendCode}
                                                        className="px-6 rounded-3xl bg-slate-900 dark:bg-primary text-white text-xs font-black hover:scale-105 active:scale-95 disabled:opacity-30 transition-all shadow-xl shadow-slate-900/10 dark:shadow-primary/20"
                                                    >
                                                        {countdown > 0 ? `${countdown}S` : '获取验证码'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* 错误提示 */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-black flex items-center gap-3"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 核心动作按钮 */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex items-center justify-center py-5 bg-primary text-white rounded-[1.75rem] font-black text-sm shadow-2xl shadow-primary/30 hover:bg-primary-dark transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            登录
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            </button>
                        </form>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                </div>

                {/* 底部链接 */}
                <div className="mt-12 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-8 text-xs font-black text-slate-400">
                        <Link to="/" className="group flex items-center gap-2 hover:text-primary transition-all">
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            返回访客大厅
                        </Link>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-800" />
                        <Link to="/blog" className="hover:text-primary transition-all">
                            技术博客
                        </Link>
                    </div>
                </div>
            </motion.div>

            <footer className="fixed bottom-0 left-0 right-0 p-10 text-center pointer-events-none">
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-800 uppercase tracking-[0.5em]">
                    Xander Lab // System Protocol
                </p>
            </footer>

            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

/**
 * 极简数字轨道背景背景
 */
const DigitalOrbit = () => {
    return (
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                className="absolute w-[1000px] h-[1000px] border border-slate-100 dark:border-slate-900 rounded-full"
            />
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                className="absolute w-[700px] h-[700px] border border-dashed border-slate-100/30 dark:border-slate-900/30 rounded-full"
            />
            <div className="absolute w-[400px] h-[400px] border border-slate-50 dark:border-slate-950 rounded-full" />
        </div>
    );
};

/**
 * 漂浮粒子集
 */
const FloatingParticles = () => {
    const icons = [Cpu, Zap, Shield, Sparkles, Fingerprint];
    return (
        <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => {
                const Icon = icons[i % icons.length];
                return (
                    <motion.div
                        key={i}
                        initial={{
                            x: Math.random() * 100 + "%",
                            y: Math.random() * 100 + "%",
                            opacity: 0
                        }}
                        animate={{
                            y: [null, "-20%", "20%"],
                            opacity: [0, 0.15, 0],
                            rotate: [0, 360],
                            scale: [0.8, 1, 0.8]
                        }}
                        transition={{
                            duration: 15 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute text-primary dark:text-slate-800"
                    >
                        <Icon size={80 + Math.random() * 100} strokeWidth={0.5} />
                    </motion.div>
                );
            })}
        </div>
    );
};

export default LoginPage;
