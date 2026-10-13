import { useCallback, useEffect, useRef, useState } from "react";
import {
    CheckCircle2,
    CircleUserRound,
    ExternalLink,
    Link2,
    LoaderCircle,
    ShieldCheck,
    ShieldOff,
    TriangleAlert,
    Unplug,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Modal from "@shared/ui/overlays/Modal";
import { useToast } from "@shared/hooks/useToast";
import {
    cancelPlatformConnectorAuthorization,
    isPlatformConnectorAvailable,
    startPlatformConnectorAuthorization,
} from "../services/publishingService";

/** Lets the browser extension open the platform login page and submit its session to Workers. */
const LocalPlatformAuthorizationPanel = ({
    platform,
    service,
    extraActions,
    displayName,
    logoSrc,
    publishingEnabled = false,
    formats = [],
    compact = false,
    commonCopy = false,
    initialStatus,
    initialProfile = null,
    allowProfileRefresh = false,
}) => {
    const { t, i18n } = useTranslation();
    const toast = useToast();
    const pollRef = useRef(null);
    const expiryRef = useRef(null);
    const taskRef = useRef(null);
    const cancelRequestedRef = useRef(false);
    const [state, setState] = useState(initialStatus || "loading");
    const [profile, setProfile] = useState(initialProfile);
    const [authorizedAt, setAuthorizedAt] = useState(initialProfile?.authorizedAt || null);
    const [busy, setBusy] = useState(false);
    const [refreshingStatus, setRefreshingStatus] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [connectorProgress, setConnectorProgress] = useState("OPENING");
    const [connectorErrorCode, setConnectorErrorCode] = useState(null);
    const [connectorDiagnostic, setConnectorDiagnostic] = useState(null);

    const text = useCallback((key) => t(commonCopy
        ? `profile.platformConnections.card.${key}`
        : `profile.${platform}.${key}`), [commonCopy, platform, t]);
    const stopPolling = useCallback(() => {
        if (pollRef.current) window.clearInterval(pollRef.current);
        if (expiryRef.current) window.clearTimeout(expiryRef.current);
        pollRef.current = null;
        expiryRef.current = null;
    }, []);

    const loadStatus = useCallback(async () => {
        setState("loading");
        try {
            const result = await service.getAuthorizationStatus();
            setState(result?.status || "NOT_AUTHORIZED");
            setProfile(result?.profile ? { ...result.profile, authorizedAt: result.authorizedAt || null } : null);
            setAuthorizedAt(result?.authorizedAt || null);
        } catch {
            setState("UNAVAILABLE");
        }
    }, [service]);

    const refreshStatus = useCallback(async () => {
        setRefreshingStatus(true);
        try {
            const verification = service.testConnection ? await service.testConnection() : null;
            const result = await service.getAuthorizationStatus();
            const nextProfile = result?.profile || verification
                ? { ...result?.profile, ...verification, authorizedAt: result?.authorizedAt || null }
                : null;
            setState(result?.status || (verification ? "AUTHORIZED" : "NOT_AUTHORIZED"));
            setProfile(nextProfile);
            setAuthorizedAt(result?.authorizedAt || null);
            if (verification) toast.success(t("profile.platformConnection.success"));
        } catch (error) {
            const status = error?.response?.status;
            if (status === 409) {
                setState("EXPIRED");
                setProfile(null);
                setAuthorizedAt(null);
            }
            const key = status === 409 ? "expired" : status === 429 ? "rateLimited" : "failed";
            toast.error(t(`profile.platformConnection.${key}`, { platform: title }));
        } finally {
            setRefreshingStatus(false);
        }
    }, [service, t, toast, title]);

    const cancelTask = useCallback(async () => {
        const task = taskRef.current;
        taskRef.current = null;
        if (!task) return;
        try {
            await cancelPlatformConnectorAuthorization(task.taskId, service);
        } catch {
            // The grant also expires server-side if the browser is offline.
        }
    }, [service]);

  const pollStatus = useCallback(async () => {
      try {
          const result = await service.getAuthorizationStatus();
            if (result?.status !== "AUTHORIZED") return;
            stopPolling();
            taskRef.current = null;
            setState("AUTHORIZED");
            setProfile(result?.profile ? { ...result.profile, authorizedAt: result.authorizedAt || null } : null);
            setAuthorizedAt(result?.authorizedAt || null);
            setBusy(false);
            setIsModalOpen(false);
            toast.success(text("authorized"));
        } catch {
            // Continue checking while the short-lived extension grant is active.
      }
  }, [service, stopPolling, toast, text]);

    useEffect(() => {
        const onConnectorProgress = (event) => {
            const message = event.data;
            if (event.source !== window || event.origin !== window.location.origin
                || message?.channel !== "dinqorai-platform-connector"
                || message.type !== "AUTHORIZATION_PROGRESS"
                || message.taskId !== taskRef.current?.taskId) return;

            if (["WAITING_FOR_SESSION", "SUBMITTING", "RETRYING", "COMPLETED"].includes(message.state)) {
                setConnectorProgress(message.state);
                setConnectorErrorCode(message.errorCode || null);
                setConnectorDiagnostic(message.diagnostic || null);
                if (message.state === "COMPLETED") void pollStatus();
                return;
            }
            if (message.state !== "FAILED") return;

            setConnectorProgress("FAILED");
            setConnectorErrorCode(message.errorCode || "SUBMISSION_FAILED");
            setConnectorDiagnostic(message.diagnostic || null);
            stopPolling();
            setBusy(false);
            setState("NOT_AUTHORIZED");
            void cancelTask();
        };

        window.addEventListener("message", onConnectorProgress);
        return () => window.removeEventListener("message", onConnectorProgress);
    }, [cancelTask, pollStatus, stopPolling]);

    useEffect(() => {
        if (initialStatus) {
            setState(initialStatus);
            setProfile(initialProfile);
            setAuthorizedAt(initialProfile?.authorizedAt || null);
        }
        else void loadStatus();
        return () => {
            stopPolling();
            void cancelTask();
        };
    }, [cancelTask, initialProfile, initialStatus, loadStatus, stopPolling]);

    useEffect(() => {
        if (initialStatus !== "AUTHORIZED") return undefined;
        let active = true;
        const loadAccountDetails = async () => {
            let verification = null;
            try {
                if (service.testConnection) verification = await service.testConnection();
            } catch {
                // Keep the saved account summary visible when a live platform check fails.
            }
            try {
                const result = await service.getAuthorizationStatus();
                if (!active) return;
                if (result?.status) setState(result.status);
                const nextProfile = result?.profile || verification
                    ? { ...result?.profile, ...verification, authorizedAt: result?.authorizedAt || null }
                    : null;
                setProfile(nextProfile);
                setAuthorizedAt(result?.authorizedAt || null);
            } catch {
                // The platform list already supplied the connection state.
            }
        };
        void loadAccountDetails();
        return () => { active = false; };
    }, [initialStatus, service]);

    const start = async () => {
        cancelRequestedRef.current = false;
        setConnectorProgress("OPENING");
        setConnectorErrorCode(null);
        setConnectorDiagnostic(null);
        setBusy(true);
        setIsModalOpen(true);
        try {
            if (!await isPlatformConnectorAvailable()) {
                throw new Error(t("profile.connector.installRequired"));
            }
            const task = await service.startExtensionAuthorization();
            taskRef.current = task;
            if (cancelRequestedRef.current) {
                await cancelTask();
                return;
            }
            await startPlatformConnectorAuthorization(platform, task);
            if (cancelRequestedRef.current || taskRef.current?.taskId !== task.taskId) {
                await cancelTask();
                return;
            }
            setState("PENDING");
            setConnectorProgress((current) => current === "OPENING" ? "WAITING_FOR_SESSION" : current);
            pollRef.current = window.setInterval(pollStatus, 2000);
            expiryRef.current = window.setTimeout(() => {
                if (taskRef.current?.taskId !== task.taskId) return;
                stopPolling();
                void cancelTask();
                setState("EXPIRED");
                setBusy(false);
                setIsModalOpen(false);
                toast.warning(t("profile.connector.expired"));
            }, Math.max(1, Number(task.expiresInSeconds) || 300) * 1000);
        } catch (error) {
            await cancelTask();
            setBusy(false);
            setIsModalOpen(false);
            if (!cancelRequestedRef.current) {
                toast.error(error?.message || t("profile.connector.startFailed"));
            }
        }
    };

    const closeModal = () => {
        cancelRequestedRef.current = true;
        stopPolling();
        void cancelTask();
        setBusy(false);
        setIsModalOpen(false);
        if (state === "PENDING") setState("NOT_AUTHORIZED");
    };

    const disconnect = async () => {
        setBusy(true);
        try {
            stopPolling();
            await cancelTask();
            await service.disconnect();
            setState("NOT_AUTHORIZED");
            setProfile(null);
            setAuthorizedAt(null);
            toast.success(text("disconnected"));
        } catch (error) {
            toast.error(error?.message || text("disconnectFailed"));
        } finally {
            setBusy(false);
        }
    };

    const loading = state === "loading";
    const authorized = state === "AUTHORIZED";
    const expired = state === "EXPIRED";
    const title = displayName || text("title");
    const connectorWorking = ["OPENING", "WAITING_FOR_SESSION", "SUBMITTING", "RETRYING", "COMPLETED"].includes(connectorProgress);
    const connectorErrorKey = {
        SITE_PERMISSION_REQUIRED: "sitePermissionRequired",
        COOKIE_ACCESS_FAILED: "cookieAccessFailed",
        SESSION_NOT_RECOGNIZED: "sessionNotRecognized",
        HANDOFF_INVALID: "handoffInvalid",
        TASK_CONFLICT: "taskConflict",
        TASK_EXPIRED: "expired",
        NETWORK_ERROR: "networkRetrying",
        SERVICE_UNAVAILABLE: "serviceRetrying",
    }[connectorErrorCode] || "submissionFailed";
    const connectorMessage = connectorProgress === "FAILED"
        ? t(`profile.connector.${connectorErrorKey}`, { platform: title })
        : connectorProgress === "WAITING_FOR_SESSION"
            ? t(connectorErrorCode === "SESSION_COOKIE_MISSING"
                ? "profile.connector.sessionCookieMissing"
                : "profile.connector.waiting", { platform: title })
            : connectorProgress === "SUBMITTING"
                ? t("profile.connector.submitting", { platform: title })
                : connectorProgress === "RETRYING"
                    ? t(connectorErrorCode === "NETWORK_ERROR"
                        ? "profile.connector.networkRetrying"
                        : "profile.connector.serviceRetrying")
                    : connectorProgress === "COMPLETED"
                        ? t("profile.connector.saving")
                        : t("profile.connector.opening", { platform: title });
    const titleNode = (
        <div className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-ink" />
            <div className="text-title font-black text-ink">{title}</div>
        </div>
    );
    const diagnosticStatus = connectorDiagnostic?.httpStatus
        ? t("profile.connector.diagnosticStatus", {
            httpStatus: connectorDiagnostic.httpStatus,
            responseCode: connectorDiagnostic.responseCode ?? "-",
        })
        : null;
    const cookieScopes = connectorDiagnostic?.cookieScopes;
    const diagnosticCookieScopes = cookieScopes
        ? t("profile.connector.diagnosticCookieScopes", {
            cookieCount: connectorDiagnostic.cookieCount ?? 0,
            domain: cookieScopes.domain ?? 0,
            userToken: cookieScopes.userToken ?? 0,
            partitioned: cookieScopes.partitioned ?? 0,
            partitionedToken: cookieScopes.partitionedToken ?? 0,
        })
        : null;
    const diagnosticIdentityHints = cookieScopes
        ? t("profile.connector.diagnosticIdentityHints", {
            identityHints: cookieScopes.identityHints ?? 0,
            username: cookieScopes.username ?? 0,
            cookieStore: t(cookieScopes.cookieStoreMatched ? "profile.connector.diagnosticYes" : "profile.connector.diagnosticNo"),
            partitionKey: t(cookieScopes.partitionKeyAvailable ? "profile.connector.diagnosticYes" : "profile.connector.diagnosticNo"),
        })
        : null;

    const brandMark = (
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-white" aria-hidden="true">
            {logoSrc && <img src={logoSrc} alt="" onError={(event) => event.currentTarget.remove()} className="h-7 w-7 object-contain" />}
        </span>
    );

    if (compact) {
        const compactStatus = loading
            ? text("checking")
            : authorized
                ? text("connected")
                : expired
                    ? text("sessionExpired")
                    : state === "UNAVAILABLE"
                        ? text("unavailable")
                        : text("unboundStatus");
        const compactStatusColor = authorized ? "text-success" : expired || state === "UNAVAILABLE" ? "text-warning" : "text-ink-muted";
        const accountName = profile?.nickname || title;
        const accountId = profile?.username || "—";
        const formatTime = (value) => value ? new Date(value).toLocaleString(i18n.resolvedLanguage, { dateStyle: "short", timeStyle: "short" }) : "—";
        const accountEvents = [
            ["authorizedAt", authorizedAt],
            ["verifiedAt", profile?.verifiedAt],
        ];

        return (
            <div className="flex h-44 min-w-0 flex-col rounded-xl border border-border bg-surface p-3">
                <div className="flex min-w-0 items-center gap-3">
                    {brandMark}
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-body font-semibold text-ink" title={title}>{title}</div>
                        <div className={`mt-0.5 truncate text-caption ${compactStatusColor}`} title={compactStatus}>{compactStatus}</div>
                    </div>
                    {loading && <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-accent" />}
                    {!loading && authorized && <>
                        <button type="button" onClick={refreshStatus} disabled={refreshingStatus || busy}
                            title={t("profile.platformConnections.card.verifyStatus")}
                            aria-label={`${t("profile.platformConnections.card.verifyStatus")} ${title}`}
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-success hover:bg-success-soft disabled:opacity-50">
                            {refreshingStatus ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        </button>
                        <button type="button" onClick={disconnect} disabled={busy}
                            title={text("disconnect")} aria-label={`${text("disconnect")} ${title}`}
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-ink-muted hover:bg-canvas disabled:opacity-50">
                            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
                        </button>
                    </>}
                    {!loading && !authorized && state !== "UNAVAILABLE" && (
                        <button type="button" onClick={start} disabled={busy}
                            title={expired ? text("reauthorize") : text("connect")}
                            aria-label={`${expired ? text("reauthorize") : text("connect")} ${title}`}
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50">
                            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                        </button>
                    )}
                </div>
                <div className="mt-2 flex min-h-0 flex-1 items-center border-t border-border pt-2">
                    {authorized ? (
                        <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] items-center gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                                {profile?.avatarUrl
                                    ? <img src={profile.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                                    : <CircleUserRound className="h-9 w-9 shrink-0 text-ink-faint" />}
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-caption font-medium text-ink-secondary" title={accountName}>{accountName}</div>
                                    <div className="truncate text-micro text-ink-muted" title={accountId}>{t("profile.platformConnection.accountId", { id: accountId })}</div>
                                </div>
                            </div>
                            <div className="min-w-0 space-y-1">
                                {accountEvents.map(([key, value]) => {
                                    const label = t(`profile.platformConnection.${key}`, { time: formatTime(value) });
                                    return <div key={key} className="truncate text-micro text-ink-muted" title={label}>{label}</div>;
                                })}
                            </div>
                        </div>
                    ) : <div className={`min-w-0 flex-1 truncate text-caption ${compactStatusColor}`} title={state === "UNAVAILABLE" ? text("unavailable") : expired ? text("sessionExpired") : loading ? text("checking") : text("unboundHint")}>
                        {state === "UNAVAILABLE" ? text("unavailable") : expired ? text("sessionExpired") : loading ? text("checking") : text("unboundHint")}
                    </div>}
                </div>
                <div className="mt-2 flex h-10 shrink-0 items-center gap-2 overflow-hidden">
                    {authorized && extraActions?.()}
                    {authorized && allowProfileRefresh && !profile?.nickname && (
                        <button type="button" onClick={start} disabled={busy}
                            title={t("profile.platformConnections.card.refreshProfile")}
                            className="inline-flex min-h-7 items-center gap-1 rounded-md border border-border px-2 text-micro font-semibold text-ink-secondary hover:bg-canvas disabled:opacity-50">
                            {busy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                            {t("profile.platformConnections.card.refreshProfile")}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start gap-3">
                {brandMark}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-bold text-ink">{title}</div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${publishingEnabled ? "bg-success-soft text-success" : "bg-surface-muted text-ink-muted"}`}>
                            {publishingEnabled ? t("profile.platformConnections.publishReady") : t("profile.platformConnections.bindingOnly")}
                        </span>
                    </div>
                    <div className="mt-1 text-caption text-ink-muted">
                        {commonCopy ? t("profile.platformConnections.platformDescription", { platform: title }) : text("description")}
                    </div>
                </div>
                {loading ? <LoaderCircle className="h-5 w-5 animate-spin text-accent" />
                    : authorized ? <CheckCircle2 className="h-5 w-5 text-success" />
                        : expired ? <TriangleAlert className="h-5 w-5 text-warning" />
                            : <ShieldOff className="h-5 w-5 text-ink-faint" />}
            </div>

            {loading && <div className="mt-4 text-caption text-ink-muted">{text("checking")}</div>}
            {!loading && authorized && <div className="mt-3 text-caption font-semibold text-success">{commonCopy ? text("connected") : text("authorized")}</div>}
            {!loading && expired && <div className="mt-4 text-caption font-semibold text-warning">{text("sessionExpired")}</div>}
            {!loading && state === "UNAVAILABLE" && <div className="mt-4 text-caption text-warning">{text("unavailable")}</div>}
            {formats.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">
                {formats.map((format) => <span key={format} className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold text-ink-muted">{t(`profile.platformConnections.formats.${format}`)}</span>)}
            </div>}

            {!loading && !authorized && state !== "UNAVAILABLE" && (
                <button type="button" onClick={start} disabled={busy}
                    className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-accent/90 disabled:opacity-50">
                    {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                    {expired ? text("reauthorize") : text("connect")}
                </button>
            )}

            {!loading && (authorized || expired) && (
                <div className="mt-4 flex flex-wrap gap-3">
                    {authorized && extraActions?.()}
                    <button type="button" onClick={disconnect} disabled={busy}
                        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-bold text-ink-muted hover:bg-canvas disabled:opacity-50">
                        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
                        {text("disconnect")}
                    </button>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={titleNode} width="max-w-md" closeOnOutsideClick={false}>
                <div className="flex min-h-52 flex-col items-center justify-center gap-4 py-6 text-center">
                    <ExternalLink className="h-12 w-12 text-accent" />
                    <div aria-live="polite" className={`max-w-sm text-sm font-semibold ${connectorProgress === "FAILED" ? "text-danger" : "text-ink-secondary"}`}>
                        {connectorMessage}
                    </div>
                    {connectorErrorCode === "SESSION_COOKIE_MISSING" && connectorProgress === "WAITING_FOR_SESSION" && (
                        <div className="max-w-sm text-caption text-warning">
                            {t("profile.connector.sessionCookieMissingHint")}
                        </div>
                    )}
                    {diagnosticStatus && (
                        <div className="max-w-sm text-micro text-ink-faint">{diagnosticStatus}</div>
                    )}
                    {diagnosticCookieScopes && (
                        <div className="max-w-sm text-micro text-ink-faint">{diagnosticCookieScopes}</div>
                    )}
                    {diagnosticIdentityHints && (
                        <div className="max-w-sm text-micro text-ink-faint">{diagnosticIdentityHints}</div>
                    )}
                    <div className="max-w-sm text-caption text-ink-muted">
                        {connectorProgress === "FAILED" ? t("profile.connector.retryHint") : t("profile.connector.hint")}
                    </div>
                    {connectorProgress === "FAILED"
                        ? <TriangleAlert className="h-5 w-5 text-warning" />
                        : connectorWorking && <LoaderCircle className="h-5 w-5 animate-spin text-accent" />}
                </div>
            </Modal>
        </div>
    );
};

export default LocalPlatformAuthorizationPanel;
