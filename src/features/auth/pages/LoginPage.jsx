import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Mail, Lock, ShieldCheck, ArrowRight, Loader2,
    ChevronLeft, Github, Globe, Sparkles,
    Fingerprint, Shield, Zap, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/authService';
import { useToast } from '../../../hooks/useToast';

/**
 * 登录/注册页面
 * 支持两种模式：
 * - 密码登录：已有账号的用户使用用户名/邮箱 + 密码登录
 * - 验证码登录/注册：输入邮箱验证码，未注册自动创建账号
 */
const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { t } = useTranslation();
    const from = location.state?.from?.pathname || '/';

    const [loading, setLoading] = useState(false);
    const [loginType, setLoginType] = useState('code');
    const [formData, setFormData] = useState({
        account: '',
        password: '',
        code: ''
    });
    const [countdown, setCountdown] = useState(0);
    const [sendingCode, setSendingCode] = useState(false);
    const sendCodeLockRef = useRef(false);

    /** 验证码倒计时 */
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    /** 更新表单字段 */
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /** 发送验证码到邮箱 */
    const handleSendCode = async () => {
        if (sendingCode || sendCodeLockRef.current || countdown > 0) {
            return;
        }

        if (!formData.account || !formData.account.includes('@')) {
            toast.warning(t('auth.login.invalidEmail'));
            return;
        }
        sendCodeLockRef.current = true;
        setSendingCode(true);
        try {
            await authService.sendCode(formData.account);
            setCountdown(60);
            toast.success(t('auth.login.codeSent'));
        } catch (err) {
            toast.error(err.message || t('auth.login.codeSendFailed'));
        } finally {
            sendCodeLockRef.current = false;
            setSendingCode(false);
        }
    };

    /** 提交登录 */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authService.login({ ...formData, type: loginType });
            toast.success(t('auth.login.authSuccess'));
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.message || t('auth.login.authFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-surface overflow-hidden selection:bg-accent/30">
            {/* 高级艺术背景 */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/*<DigitalOrbit />*/}
                <FloatingParticles />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-canvas/80" />
            </div>

            {/* 品牌悬浮顶栏 */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-50 max-w-7xl mx-auto w-full"
            >
                <Link to="/" className="group flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-accent blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative p-2.5 rounded-2xl bg-canvas border border-border shadow-xl group-hover:scale-110 transition-transform duration-500">
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black tracking-tighter text-2xl text-ink leading-none">XANDER LAB</span>
                        <span className="text-micro font-bold text-ink-faint leading-none mt-1 tracking-[0.2em]">UNIFIED AUTH</span>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-ink-muted hover:text-accent hover:bg-canvas shadow-sm transition-all border border-transparent hover:border-border">
                        <Globe className="w-4 h-4" />
                        System Status: <span className="text-success animate-pulse font-black uppercase">Secure</span>
                    </button>
                    <div className="w-px h-4 bg-border mx-2 hidden sm:block" />
                    <a href="https://github.com" className="p-3 text-ink-faint hover:text-accent transition-colors">
                        <Github className="w-6 h-6" />
                    </a>
                </div>
            </motion.header>

            {/* 主交互卡片 */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[480px]"
            >
                {/* 装饰发光背景 */}
                {/*<div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/10 rounded-full blur-[100px] animate-pulse" />*/}
                {/*<div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-[100px] animate-pulse delay-700" />*/}

                <div className="relative bg-canvas/70 backdrop-blur-xl border border-canvas/40 rounded-[3.5rem] overflow-hidden">

                    <div className="p-6 sm:p-10 md:p-14 relative z-10">
                        {/* 装饰图标 */}
                        {/*<div className="absolute top-0 right-0 p-8 opacity-10">*/}
                        {/*    <Cpu className="w-16 h-16 text-accent" />*/}
                        {/*</div>*/}

                        {/* 引导标题 */}
                        <div className="mb-12">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4 text-accent animate-bounce" />
                                <span className="text-micro font-black text-accent uppercase tracking-[0.3em]">Identity Gateway</span>
                            </div>
                            <h1 className="text-4xl font-black text-ink tracking-tight mb-4">
                                {t('auth.login.loginAccess')}<span className="text-accent text-5xl">.</span>
                            </h1>
                            <p className="text-ink-muted text-sm font-medium leading-relaxed">
                                {t('auth.login.loginDesc')}
                            </p>
                        </div>

                        {/* 模式选择 Tab */}
                        <div className="grid grid-cols-2 p-1.5 bg-surface-muted/50 rounded-2xl mb-10 border border-border/50">
                            {[
                                { id: 'code', label: t('auth.login.codeAuth'), icon: Shield },
                                { id: 'password', label: t('auth.login.passwordAuth'), icon: Fingerprint }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setLoginType(tab.id)}
                                    className={`relative flex items-center justify-center gap-2 py-3.5 text-xs font-black rounded-xl transition-all duration-500 overflow-hidden ${
                                        loginType === tab.id
                                            ? 'text-white'
                                            : 'text-ink-muted hover:text-ink-secondary'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4 relative z-10" />
                                    <span className="relative z-10">{tab.label}</span>
                                    {loginType === tab.id && (
                                        <motion.div
                                            layoutId="active-pill-immersive"
                                            className="absolute inset-0 bg-accent shadow-lg shadow-accent/20 pointer-events-none"
                                            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
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
                                        {/* 账号/邮箱输入 */}
                                        <div className="group">
                                            <label htmlFor="account" className="text-caption font-black text-ink-faint uppercase tracking-widest mb-2 px-1 block">
                                                {loginType === 'password' ? t('auth.login.accountLabel') : t('auth.login.emailLabel')}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                    <Mail className="w-4 h-4 text-ink-faint group-focus-within:text-accent transition-colors" />
                                                </div>
                                                <input
                                                    type={loginType === 'code' ? 'email' : 'text'}
                                                    id="account"
                                                    name="account"
                                                    required
                                                    value={formData.account}
                                                    onChange={handleChange}
                                                    className="block w-full pl-12 pr-6 py-4.5 bg-canvas/50 border border-border rounded-3xl text-body font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all shadow-inner"
                                                    placeholder={loginType === 'password' ? t('auth.login.accountPlaceholder') : t('auth.login.emailPlaceholder')}
                                                />
                                            </div>
                                        </div>

                                        {/* 密码输入（仅密码模式） */}
                                        {loginType === 'password' && (
                                            <div className="group">
                                                <label htmlFor="password" className="text-caption font-black text-ink-faint uppercase tracking-widest mb-2 px-1 block">
                                                    {t('auth.login.passwordLabel')}
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                        <Lock className="w-4 h-4 text-ink-faint group-focus-within:text-accent transition-colors" />
                                                    </div>
                                                    <input
                                                        type="password"
                                                        id="password"
                                                        name="password"
                                                        required
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        className="block w-full pl-12 pr-6 py-4.5 bg-canvas/50 border border-border rounded-3xl text-body font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all shadow-inner"
                                                        placeholder={t('auth.login.passwordPlaceholder')}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* 验证码输入（仅验证码模式） */}
                                        {loginType === 'code' && (
                                            <div className="group">
                                                <label htmlFor="code" className="text-caption font-black text-ink-faint uppercase tracking-widest mb-2 px-1 block">
                                                    {t('auth.login.codeLabel')}
                                                </label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                            <ShieldCheck className="w-4 h-4 text-ink-faint group-focus-within:text-accent transition-colors" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            id="code"
                                                            name="code"
                                                            required
                                                            maxLength={6}
                                                            value={formData.code}
                                                            onChange={handleChange}
                                                            className="block w-full pl-12 pr-6 py-4.5 bg-canvas/50 border border-border rounded-3xl text-body font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all shadow-inner"
                                                            placeholder={t('auth.login.codePlaceholder')}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={countdown > 0 || sendingCode}
                                                        onClick={handleSendCode}
                                                        className="px-6 rounded-3xl bg-ink text-white text-xs font-black hover:scale-105 active:scale-95 disabled:opacity-30 transition-all shadow-xl shadow-ink/10 whitespace-nowrap"
                                                    >
                                                        {sendingCode ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" aria-label={t('auth.login.sendCode')} />
                                                        ) : countdown > 0 ? `${countdown}s` : t('auth.login.sendCode')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* 登录按钮 */}
                            <div className="relative pb-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex items-center justify-center py-5 bg-accent text-white rounded-[1.75rem] font-black text-sm  shadow-accent/30 hover:bg-accent-700 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 scale-fix"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {loginType === 'code' ? t('auth.login.submit') : t('auth.login.login')}
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            </button>
                            {/* 验证码模式的自动注册提示 - 绝对定位不占空间 */}
                            {loginType === 'code' && (
                                <p className="absolute top-full left-0 right-0 mt-2 text-caption text-ink-faint text-center font-medium px-2">
                                    {t('auth.login.autoRegisterHint')}
                                </p>
                            )}
                            </div>
                        </form>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                </div>

                {/* 底部导航 */}
                <div className="mt-12 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-8 text-xs font-black text-ink-faint">
                        <Link to="/" className="group flex items-center gap-2 hover:text-accent transition-all">
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            {t('auth.login.backToLobby')}
                        </Link>
                        <div className="w-1 h-1 rounded-full bg-border-strong" />
                        <Link to="/blog" className="hover:text-accent transition-all">
                            {t('auth.login.techBlog')}
                        </Link>
                    </div>
                </div>
            </motion.div>

            <footer className="fixed bottom-0 left-0 right-0 p-10 text-center pointer-events-none">
                <p className="text-micro font-black text-ink-faint uppercase tracking-[0.5em]">
                    Xander Lab // System Protocol
                </p>
            </footer>
        </div>
    );
};

/**
 * 极简数字轨道背景
 */
const DigitalOrbit = () => {
    return (
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                className="absolute w-[500px] sm:w-[700px] md:w-[1000px] h-[500px] sm:h-[700px] md:h-[1000px] border border-border rounded-full [will-change:transform]"
            />
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                className="absolute w-[350px] sm:w-[500px] md:w-[700px] h-[350px] sm:h-[500px] md:h-[700px] border border-dashed border-border/30 rounded-full [will-change:transform]"
            />
            <div className="absolute w-[200px] sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] border border-surface rounded-full" />
        </div>
    );
};

/**
 * 漂浮粒子集
 */
const FloatingParticles = () => {
    const icons = [Cpu, Zap, Shield, Sparkles];
    const particles = useMemo(() =>
        Array.from({ length: 8 }, (_, i) => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: 15 + Math.random() * 10,
            size: 80 + Math.random() * 100,
            Icon: icons[i % icons.length]
        })),
    []);

    return (
        <div className="absolute inset-0 pointer-events-none">
            {particles.map((p, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: p.x + "%",
                        y: p.y + "%",
                        opacity: 0
                    }}
                    animate={{
                        y: [null, "-20%", "20%"],
                        opacity: [0, 0.15, 0],
                        rotate: [0, 360],
                        scale: [0.8, 1, 0.8]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute text-accent"
                >
                    <p.Icon size={p.size} strokeWidth={0.5} />
                </motion.div>
            ))}
        </div>
    );
};

export default LoginPage;
