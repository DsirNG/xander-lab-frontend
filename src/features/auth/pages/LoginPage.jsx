import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Mail,
    Lock,
    ShieldCheck,
    ArrowRight,
    Github,
    Globe,
    Sparkles,
    Fingerprint,
    Shield,
    QrCode,
    RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "../services/authService";
import { useToast } from "../../../hooks/useToast";
import FloatingParticles from "../components/FloatingParticles";
import Button from "@components/common/Button";

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
    const fromPath = location.state?.from?.pathname || "/";
    const fromSearch = location.state?.from?.search || "";

    const [loading, setLoading] = useState(false);
    const [loginType, setLoginType] = useState("code");
    const [qrState, setQrState] = useState({ ticket: "", image: "", status: "" });
    const qrTimerRef = useRef(null);
    const [formData, setFormData] = useState({
        account: "",
        password: "",
        code: "",
    });
    const [countdown, setCountdown] = useState(0);
    const [sendingCode, setSendingCode] = useState(false);
    const sendCodeLockRef = useRef(false);

    const stopQrPolling = () => {
        if (qrTimerRef.current) window.clearInterval(qrTimerRef.current);
        qrTimerRef.current = null;
    };

    const startQrLogin = async () => {
        stopQrPolling();
        setQrState({ ticket: "", image: "", status: "loading" });
        try {
            const result = await authService.qrCreate();
            setQrState({ ticket: result.ticket, image: result.qrCode, status: "waiting" });
            qrTimerRef.current = window.setInterval(async () => {
                try {
                    const current = await authService.qrStatus(result.ticket);
                    setQrState((previous) => ({ ...previous, status: current.status, exchangeCode: current.exchangeCode }));
                    if (current.status === "EXPIRED") stopQrPolling();
                    if (current.status === "CONFIRMED" && current.exchangeCode) {
                        stopQrPolling();
                        const token = await authService.qrExchange(result.ticket, current.exchangeCode);
                        if (token?.accessToken) {
                            toast.success(t("auth.login.authSuccess"));
                            navigate(`${fromPath}${fromSearch}`, { replace: true });
                        }
                    }
                } catch {
                    // Keep the QR visible; transient polling failures are retried on the next tick.
                }
            }, 1500);
        } catch (err) {
            setQrState({ ticket: "", image: "", status: "error" });
            toast.error(err.message || t("auth.login.qrUnavailable"));
        }
    };

    useEffect(() => () => stopQrPolling(), []);
    // QR polling is intentionally restarted only when the selected login mode changes.
    useEffect(() => {
        if (loginType === "qr" && !qrState.ticket && qrState.status !== "error") startQrLogin();
        if (loginType !== "qr") stopQrPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginType]);

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

        if (!formData.account || !formData.account.includes("@")) {
            toast.warning(t("auth.login.invalidEmail"));
            return;
        }
        sendCodeLockRef.current = true;
        setSendingCode(true);
        try {
            await authService.sendCode(formData.account);
            setCountdown(60);
            toast.success(t("auth.login.codeSent"));
        } catch (err) {
            toast.error(err.message || t("auth.login.codeSendFailed"));
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
            toast.success(t("auth.login.authSuccess"));
            navigate(`${fromPath}${fromSearch}`, { replace: true });
        } catch (err) {
            toast.error(err.message || t("auth.login.authFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 px-ultra-tight bg-surface overflow-y-auto selection:bg-accent/30">
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
                className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 max-w-7xl mx-auto w-full"
            >
                <Link to="/" className="group flex items-center gap-3 min-w-0">
                    <div className="relative">
                        <div className="absolute inset-0 bg-accent blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative p-2.5 rounded-2xl bg-canvas border border-border shadow-xl group-hover:scale-110 transition-transform duration-500">
                            <img
                                src="/assets/workspace/workspace-logo.svg"
                                alt=""
                                className="h-8 w-8"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-black tracking-tighter text-xl text-ink leading-none truncate">
                            DINQOR AI
                        </span>
                        <span className="text-micro font-bold text-ink-faint leading-none mt-1 tracking-[0.2em] truncate">
                            {t("auth.login.unifiedAuth")}
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="lg"
                        icon={Globe}
                        className="hidden sm:flex border border-transparent hover:border-border shadow-sm"
                    >
                        <span>{t("auth.login.systemStatus")}</span>{" "}
                        <span className="text-success animate-pulse font-black uppercase">
                            {t("auth.login.systemSecure")}
                        </span>
                    </Button>
                    <div className="w-px h-4 bg-border mx-2 hidden sm:block" />
                    <a
                        href="https://github.com"
                        className="p-3 text-ink-faint hover:text-accent transition-colors"
                    >
                        <Github className="w-6 h-6" />
                    </a>
                </div>
            </motion.header>

            {/* 主交互卡片 */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[480px] my-auto"
            >
                {/* 装饰发光背景 */}
                {/*<div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/10 rounded-full blur-[100px] animate-pulse" />*/}
                {/*<div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-[100px] animate-pulse delay-700" />*/}

                <div className="relative bg-canvas/70 backdrop-blur-xl border border-canvas/40 rounded-[3.5rem] overflow-hidden">
                    <div className="p-6 sm:p-8 relative z-10">
                        {/* 装饰图标 */}
                        {/*<div className="absolute top-0 right-0 p-8 opacity-10">*/}
                        {/*    <Cpu className="w-16 h-16 text-accent" />*/}
                        {/*</div>*/}

                        {/* 引导标题 */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 flex-wrap mb-4">
                                <Sparkles className="w-4 h-4 text-accent animate-bounce" />
                                <span className="text-micro font-black text-accent uppercase tracking-[0.3em]">
                                    {t("auth.login.identityGateway")}
                                </span>
                            </div>
                            <div className="text-3xl font-black text-ink tracking-tight mb-4">
                                {t("auth.login.loginAccess")}
                                <span className="text-accent text-4xl">.</span>
                            </div>
                            <div className="text-ink-muted text-sm font-medium leading-relaxed">
                                {t("auth.login.loginDesc")}
                            </div>
                        </div>

                        {/* 模式选择 Tab */}
                        <div className="grid grid-cols-3 p-1.5 bg-surface-muted/50 rounded-2xl mb-5 border border-border/50">
                            {[
                                {
                                    id: "code",
                                    label: t("auth.login.codeAuth"),
                                    icon: Shield,
                                },
                                {
                                    id: "password",
                                    label: t("auth.login.passwordAuth"),
                                    icon: Fingerprint,
                                },
                                { id: "qr", label: t("auth.login.qrAuth"), icon: QrCode },
                            ].map((tab) => (
                                <Button
                                    key={tab.id}
                                    onClick={() => setLoginType(tab.id)}
                                    variant="ghost"
                                    size="sm"
                                    icon={tab.icon}
                                    className={`relative h-auto py-3.5 rounded-xl overflow-hidden transition-all duration-500 font-black ${
                                        loginType === tab.id
                                            ? "text-white"
                                            : "text-ink-muted hover:text-ink-secondary"
                                    }`}
                                >
                                    <span className="relative z-10">
                                        {tab.label}
                                    </span>
                                    {loginType === tab.id && (
                                        <motion.div
                                            layoutId="active-pill-immersive"
                                            className="absolute inset-0 bg-accent shadow-lg shadow-accent/20 pointer-events-none"
                                            transition={{
                                                type: "tween",
                                                duration: 0.3,
                                                ease: "easeInOut",
                                            }}
                                        />
                                    )}
                                </Button>
                            ))}
                        </div>

                        {loginType === "qr" ? (
                            <div className="flex flex-col items-center gap-4 py-4 text-center">
                                {qrState.image ? <img src={qrState.image} alt={t("auth.login.qrAlt")} className="w-56 h-56 rounded-2xl border border-border bg-white p-2" /> : <div className="w-56 h-56 rounded-2xl bg-surface-muted animate-pulse" />}
                                <div className="text-sm font-semibold text-ink-muted">
                                    {qrState.status === "CONFIRMED" ? t("auth.login.qrConfirmed") : qrState.status === "EXPIRED" ? t("auth.login.qrExpired") : t("auth.login.qrHint")}
                                </div>
                                {(qrState.status === "EXPIRED" || qrState.status === "error") && <Button type="button" icon={RefreshCw} onClick={startQrLogin}>{t("auth.login.qrRefresh")}</Button>}
                            </div>
                        ) : <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={loginType}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-4">
                                        {/* 账号/邮箱输入 */}
                                        <div className="group">
                                            <label
                                                htmlFor="account"
                                                className="text-caption font-black text-ink-faint uppercase tracking-widest mb-2 px-1 block"
                                            >
                                                {loginType === "password"
                                                    ? t(
                                                          "auth.login.accountLabel",
                                                      )
                                                    : t(
                                                          "auth.login.emailLabel",
                                                      )}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                    <Mail className="w-4 h-4 text-ink-faint group-focus-within:text-accent transition-colors" />
                                                </div>
                                                <input
                                                    type={
                                                        loginType === "code"
                                                            ? "email"
                                                            : "text"
                                                    }
                                                    id="account"
                                                    name="account"
                                                    required
                                                    value={formData.account}
                                                    onChange={handleChange}
                                                    className="block w-full pl-12 pr-6 py-4.5 bg-canvas/50 border border-border rounded-3xl text-body font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all shadow-inner"
                                                    placeholder={
                                                        loginType === "password"
                                                            ? t(
                                                                  "auth.login.accountPlaceholder",
                                                              )
                                                            : t(
                                                                  "auth.login.emailPlaceholder",
                                                              )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {/* 密码输入（仅密码模式） */}
                                        {loginType === "password" && (
                                            <div className="group">
                                                <label
                                                    htmlFor="password"
                                                    className="text-caption font-black text-ink-faint uppercase tracking-widest mb-2 px-1 block"
                                                >
                                                    {t(
                                                        "auth.login.passwordLabel",
                                                    )}
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
                                                        value={
                                                            formData.password
                                                        }
                                                        onChange={handleChange}
                                                        className="block w-full pl-12 pr-6 py-4.5 bg-canvas/50 border border-border rounded-3xl text-body font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all shadow-inner"
                                                        placeholder={t(
                                                            "auth.login.passwordPlaceholder",
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* 验证码输入（仅验证码模式） */}
                                        {loginType === "code" && (
                                            <div className="group">
                                                <label
                                                    htmlFor="code"
                                                    className="text-caption font-black text-ink-faint uppercase tracking-widest mb-2 px-1 block"
                                                >
                                                    {t("auth.login.codeLabel")}
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
                                                            value={
                                                                formData.code
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className="block w-full pl-12 pr-6 py-4.5 bg-canvas/50 border border-border rounded-3xl text-body font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all shadow-inner"
                                                            placeholder={t(
                                                                "auth.login.codePlaceholder",
                                                            )}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        disabled={
                                                            countdown > 0 ||
                                                            sendingCode
                                                        }
                                                        loading={sendingCode}
                                                        onClick={handleSendCode}
                                                        variant="ink"
                                                        size="lg"
                                                        className="rounded-3xl h-auto px-6 py-4 whitespace-nowrap hover:scale-105 shadow-xl shadow-ink/10"
                                                    >
                                                        {countdown > 0
                                                            ? `${countdown}s`
                                                            : t(
                                                                  "auth.login.sendCode",
                                                              )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* 登录按钮 */}
                            <div className="relative pb-6">
                                <Button
                                    type="submit"
                                    loading={loading}
                                    variant="primary"
                                    size="lg"
                                    block
                                    icon={ArrowRight}
                                    iconPosition="right"
                                    className="group relative h-auto py-4.5 rounded-[1.75rem] font-black text-sm shadow-accent/30 hover:scale-[1.02] overflow-hidden scale-fix"
                                >
                                    <span className="relative z-10">
                                        {loginType === "code"
                                            ? t("auth.login.submit")
                                            : t("auth.login.login")}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                </Button>
                                {/* 验证码模式的自动注册提示 - 绝对定位不占空间 */}
                                {loginType === "code" && (
                                    <div className="absolute top-full left-0 right-0 mt-2 text-caption text-ink-faint text-center font-medium px-2">
                                        {t("auth.login.autoRegisterHint")}
                                    </div>
                                )}
                            </div>
                        </form>}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
