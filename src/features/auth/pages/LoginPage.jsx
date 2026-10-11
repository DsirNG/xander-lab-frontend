import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowRight,
    LockKeyhole,
    Mail,
    MessageCircle,
    RefreshCw,
} from "lucide-react";
import { authService } from "../services/authService";
import { useToast } from "@shared/hooks/useToast";
import Button from "@shared/ui/primitives/Button";
import FormField from "@shared/ui/forms/FormField";
import { formInputCls } from "@shared/ui/forms/formStyles";
import { twMerge } from "tailwind-merge";

const GoogleMark = () => (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
        <path
            fill="#4285F4"
            d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z"
        />
        <path
            fill="#34A853"
            d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.7-3.5-11.3-8.1H5.8v5.2A20 20 0 0 0 24 44Z"
        />
        <path
            fill="#FBBC05"
            d="M12.7 27.9a12 12 0 0 1 0-7.8v-5.2H5.8a20 20 0 0 0 0 18.2l6.9-5.2Z"
        />
        <path
            fill="#EA4335"
            d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.8 14.9l6.9 5.2C14.3 15.5 18.8 12 24 12Z"
        />
    </svg>
);

/** Login and registration share the existing password and email-code auth flows. */
const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { t } = useTranslation();
    const fromPath = location.state?.from?.pathname || "/";
    const fromSearch = location.state?.from?.search || "";

    const [loading, setLoading] = useState(false);
    const [authMode, setAuthMode] = useState("login");
    const [loginType, setLoginType] = useState("password");
    const [showWechatQr, setShowWechatQr] = useState(false);
    const [qrState, setQrState] = useState({
        ticket: "",
        image: "",
        status: "",
    });
    const qrTimerRef = useRef(null);
    const [formData, setFormData] = useState({
        account: "",
        password: "",
        code: "",
    });
    const [countdown, setCountdown] = useState(0);
    const [sendingCode, setSendingCode] = useState(false);
    const [codeInputFocused, setCodeInputFocused] = useState(false);
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
            setQrState({
                ticket: result.ticket,
                image: result.qrCode,
                status: "waiting",
            });
            qrTimerRef.current = window.setInterval(async () => {
                try {
                    const current = await authService.qrStatus(result.ticket);
                    if (!qrTimerRef.current) return;
                    setQrState((previous) => ({
                        ...previous,
                        status: current.status,
                        exchangeCode: current.exchangeCode,
                    }));
                    if (current.status === "EXPIRED") stopQrPolling();
                    if (
                        current.status === "CONFIRMED" &&
                        current.exchangeCode
                    ) {
                        stopQrPolling();
                        const token = await authService.qrExchange(
                            result.ticket,
                            current.exchangeCode,
                        );
                        if (token?.accessToken) {
                            toast.success(t("auth.login.authSuccess"));
                            navigate(`${fromPath}${fromSearch}`, {
                                replace: true,
                            });
                        }
                    }
                } catch {
                    // A transient poll failure is retried on the next tick.
                }
            }, 1500);
        } catch (err) {
            setQrState({ ticket: "", image: "", status: "error" });
            toast.error(err.message || t("auth.login.qrUnavailable"));
        }
    };

    useEffect(() => () => stopQrPolling(), []);
    useEffect(() => {
        if (showWechatQr && !qrState.ticket && qrState.status !== "error") {
            startQrLogin();
        }
        if (!showWechatQr) stopQrPolling();
        // QR polling follows the dialog visibility, not each polling response.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showWechatQr]);

    useEffect(() => {
        if (countdown <= 0) return undefined;
        const timer = window.setTimeout(
            () => setCountdown(countdown - 1),
            1000,
        );
        return () => window.clearTimeout(timer);
    }, [countdown]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleCodeChange = (event) => {
        const code = event.target.value.replace(/\D/g, "").slice(0, 6);
        setFormData((current) => ({ ...current, code }));
    };

    const handleSendCode = async () => {
        if (sendingCode || sendCodeLockRef.current || countdown > 0) return;
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await authService.login({
                ...formData,
                type: authMode === "register" ? "code" : loginType,
            });
            toast.success(t("auth.login.authSuccess"));
            navigate(`${fromPath}${fromSearch}`, { replace: true });
        } catch (err) {
            toast.error(err.message || t("auth.login.authFailed"));
        } finally {
            setLoading(false);
        }
    };

    const selectAuthMode = (mode) => {
        setAuthMode(mode);
        setLoginType(mode === "register" ? "code" : "password");
        setShowWechatQr(false);
    };

    const openWechatQr = () => {
        setQrState({ ticket: "", image: "", status: "" });
        setShowWechatQr(true);
    };

    const closeWechatQr = () => {
        stopQrPolling();
        setQrState({ ticket: "", image: "", status: "" });
        setShowWechatQr(false);
    };

    const isCodeFlow = authMode === "register" || loginType === "code";
    const inputClassName = twMerge(
        formInputCls,
        "h-12 rounded-lg border-border bg-white px-3.5 text-body text-ink placeholder:text-ink-faint focus:border-accent focus:ring-accent/10",
    );

    return (
        <main className="grid min-h-screen bg-white text-ink lg:grid-cols-2">
            <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-surface-muted via-white to-accent-soft lg:flex">
                <svg
                    aria-hidden="true"
                    viewBox="0 0 900 1200"
                    preserveAspectRatio="xMidYMid slice"
                    className="absolute inset-0 h-full w-full"
                >
                    <defs>
                        <linearGradient
                            id="login-flow"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="var(--color-accent-100)"
                            />
                            <stop
                                offset="52%"
                                stopColor="var(--color-accent-200)"
                            />
                            <stop
                                offset="100%"
                                stopColor="var(--color-canvas)"
                            />
                        </linearGradient>
                    </defs>
                    <path
                        d="M-110 165C150 255 145 520 380 655S640 450 1010 535"
                        fill="none"
                        stroke="url(#login-flow)"
                        strokeWidth="190"
                        strokeLinecap="round"
                        opacity="0.72"
                    />
                    <path
                        d="M-110 165C150 255 145 520 380 655S640 450 1010 535"
                        fill="none"
                        stroke="var(--color-canvas)"
                        strokeWidth="1.5"
                        opacity="0.9"
                    />
                    <path
                        d="M-90 790C150 650 270 980 490 1005S760 815 1020 870"
                        fill="none"
                        stroke="var(--color-accent-100)"
                        strokeWidth="116"
                        strokeLinecap="round"
                        opacity="0.7"
                    />
                </svg>
            </section>

            <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
                <div className="w-full max-w-[420px]">
                    <Link
                        to="/"
                        aria-label="DinQorAI"
                        className="mb-10 flex w-fit items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:mb-12"
                    >
                        <img
                            src="/assets/workspace/workspace-logo.svg"
                            alt=""
                            className="h-10 w-10"
                        />
                        <span className="text-xl font-bold tracking-tight text-ink">
                            DinQor<span className="text-accent">AI</span>
                        </span>
                    </Link>

                    <div
                        role="tablist"
                        aria-label={t("auth.login.identityGateway")}
                        className="mb-8 flex gap-8 border-b border-border"
                    >
                        {["login", "register"].map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                role="tab"
                                aria-selected={authMode === mode}
                                onClick={() => selectAuthMode(mode)}
                                className={`relative -mb-px border-b-2 px-0.5 pb-3 text-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                                    authMode === mode
                                        ? "border-accent text-accent"
                                        : "border-transparent text-ink-muted hover:text-ink"
                                }`}
                            >
                                {mode === "login"
                                    ? t("auth.login.login")
                                    : t("auth.login.register")}
                            </button>
                        ))}
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-ink">
                        {authMode === "login"
                            ? t("auth.login.welcomeBack")
                            : t("auth.login.registerTitle")}
                    </h1>
                    <p className="mt-2 text-body leading-relaxed text-ink-muted">
                        {authMode === "login"
                            ? t("auth.login.loginSubtitle")
                            : t("auth.login.registerSubtitle")}
                    </p>

                    {showWechatQr ? (
                        <div className="mt-8 flex flex-col items-center rounded-xl border border-border bg-white px-5 py-6 text-center">
                            <div className="mb-4 flex w-full items-center justify-between">
                                <button
                                    type="button"
                                    onClick={closeWechatQr}
                                    className="rounded-md text-caption text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                >
                                    {t("auth.login.qrBack")}
                                </button>
                                <span className="text-caption font-medium text-ink">
                                    {t("auth.login.wechatQrTitle")}
                                </span>
                                <span className="w-10" aria-hidden="true" />
                            </div>
                            <div className="rounded-xl border border-border bg-white p-2">
                                {qrState.image ? (
                                    <img
                                        src={qrState.image}
                                        alt={t("auth.login.qrAlt")}
                                        className="h-52 w-52 rounded-lg"
                                    />
                                ) : (
                                    <div
                                        role="status"
                                        className="h-52 w-52 animate-pulse rounded-lg bg-surface-muted"
                                    />
                                )}
                            </div>
                            <p
                                role="status"
                                className="mt-4 text-caption text-ink-muted"
                            >
                                {qrState.status === "CONFIRMED"
                                    ? t("auth.login.qrConfirmed")
                                    : qrState.status === "EXPIRED"
                                      ? t("auth.login.qrExpired")
                                      : qrState.status === "error"
                                        ? t("auth.login.qrUnavailable")
                                        : t("auth.login.qrHint")}
                            </p>
                            {(qrState.status === "EXPIRED" ||
                                qrState.status === "error") && (
                                <Button
                                    type="button"
                                    icon={RefreshCw}
                                    onClick={startQrLogin}
                                    variant="outline"
                                    className="mt-4"
                                >
                                    {t("auth.login.qrRefresh")}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="mt-7 space-y-5"
                        >
                            <div className="space-y-4">
                                <FormField
                                    label={
                                        isCodeFlow
                                            ? t("auth.login.emailLabel")
                                            : t("auth.login.accountLabel")
                                    }
                                    htmlFor="account"
                                >
                                    <div className="relative">
                                        <Mail
                                            aria-hidden="true"
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint"
                                        />
                                        <input
                                            type={isCodeFlow ? "email" : "text"}
                                            id="account"
                                            name="account"
                                            autoComplete={
                                                isCodeFlow
                                                    ? "email"
                                                    : "username"
                                            }
                                            required
                                            value={formData.account}
                                            onChange={handleChange}
                                            className={twMerge(
                                                inputClassName,
                                                isCodeFlow
                                                    ? "pl-11 pr-32"
                                                    : "pl-11",
                                            )}
                                            placeholder={
                                                isCodeFlow
                                                    ? t(
                                                          "auth.login.emailPlaceholder",
                                                      )
                                                    : t(
                                                          "auth.login.accountPlaceholder",
                                                      )
                                            }
                                        />
                                        {isCodeFlow && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                disabled={countdown > 0}
                                                loading={sendingCode}
                                                onClick={handleSendCode}
                                                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 text-accent hover:bg-accent-soft hover:text-accent-fg"
                                            >
                                                {countdown > 0
                                                    ? `${countdown}s`
                                                    : t("auth.login.sendCode")}
                                            </Button>
                                        )}
                                    </div>
                                </FormField>

                                {isCodeFlow ? (
                                    <FormField
                                        label={t("auth.login.codeLabel")}
                                        htmlFor="code"
                                    >
                                        <div className="relative rounded-lg border border-border bg-white px-2.5 py-1.5 transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10">
                                            <div
                                                aria-hidden="true"
                                                className="grid h-9 grid-cols-6 gap-1.5 sm:gap-2"
                                            >
                                                {Array.from(
                                                    { length: 6 },
                                                    (_, index) => {
                                                        const value =
                                                            formData.code[
                                                                index
                                                            ];
                                                        const isCurrent =
                                                            codeInputFocused &&
                                                            index ===
                                                                formData.code
                                                                    .length &&
                                                            formData.code
                                                                .length < 6;
                                                        const slotClassName =
                                                            value
                                                                ? "border-accent-200 bg-accent-50 text-ink"
                                                                : isCurrent
                                                                  ? "border-accent bg-white text-accent"
                                                                  : "border-border bg-surface text-ink-faint";

                                                        return (
                                                            <span
                                                                key={index}
                                                                className={`flex min-w-0 items-center justify-center rounded-md border text-title transition-colors ${slotClassName}`}
                                                            >
                                                                {value || ""}
                                                            </span>
                                                        );
                                                    },
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                id="code"
                                                name="code"
                                                inputMode="numeric"
                                                pattern="[0-9]{6}"
                                                autoComplete="one-time-code"
                                                required
                                                maxLength={6}
                                                value={formData.code}
                                                onChange={handleCodeChange}
                                                onFocus={() =>
                                                    setCodeInputFocused(true)
                                                }
                                                onBlur={() =>
                                                    setCodeInputFocused(false)
                                                }
                                                aria-label={t(
                                                    "auth.login.codeLabel",
                                                )}
                                                className="absolute inset-0 h-full w-full cursor-text rounded-lg opacity-0"
                                            />
                                        </div>
                                    </FormField>
                                ) : (
                                    <FormField
                                        label={t("auth.login.passwordLabel")}
                                        htmlFor="password"
                                    >
                                        <div className="relative">
                                            <LockKeyhole
                                                aria-hidden="true"
                                                className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint"
                                            />
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                autoComplete="current-password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={twMerge(
                                                    inputClassName,
                                                    "pl-11",
                                                )}
                                                placeholder={t(
                                                    "auth.login.passwordPlaceholder",
                                                )}
                                            />
                                        </div>
                                    </FormField>
                                )}
                            </div>

                            {authMode === "login" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setLoginType((current) =>
                                            current === "password"
                                                ? "code"
                                                : "password",
                                        )
                                    }
                                    className="text-caption font-medium text-accent hover:text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                >
                                    {loginType === "password"
                                        ? t("auth.login.switchToCode")
                                        : t("auth.login.switchToPassword")}
                                </button>
                            )}

                            <Button
                                type="submit"
                                loading={loading}
                                variant="primary"
                                size="lg"
                                block
                                icon={ArrowRight}
                                iconPosition="right"
                                className="rounded-lg"
                            >
                                {authMode === "register"
                                    ? t("auth.login.registerSubmit")
                                    : t("auth.login.login")}
                            </Button>

                            {isCodeFlow && (
                                <p className="text-center text-caption leading-relaxed text-ink-faint">
                                    {authMode === "register"
                                        ? t("auth.login.autoRegisterHint")
                                        : t("auth.login.codeLoginHint")}
                                </p>
                            )}
                        </form>
                    )}

                    {!showWechatQr && (
                        <>
                            <div className="my-7 flex items-center gap-4">
                                <span className="h-px flex-1 bg-border" />
                                <span className="text-caption text-ink-faint">
                                    {t("auth.login.socialDivider")}
                                </span>
                                <span className="h-px flex-1 bg-border" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={openWechatQr}
                                    className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white text-caption font-medium text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                >
                                    <MessageCircle
                                        aria-hidden="true"
                                        className="h-5 w-5 text-[#07c160]"
                                    />
                                    {t("auth.login.wechat")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        toast.warning(
                                            t("auth.login.googleUnavailable"),
                                        )
                                    }
                                    className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white text-caption font-medium text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                    aria-label={t("auth.login.google")}
                                >
                                    <GoogleMark />
                                    {t("auth.login.google")}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
};

export default LoginPage;
