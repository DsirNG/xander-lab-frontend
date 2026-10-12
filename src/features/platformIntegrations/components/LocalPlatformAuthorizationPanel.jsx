import { useCallback, useEffect, useRef, useState } from "react";
import {
    CheckCircle2,
    ExternalLink,
    Link2,
    LoaderCircle,
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
const LocalPlatformAuthorizationPanel = ({ platform, service, extraActions }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const pollRef = useRef(null);
    const expiryRef = useRef(null);
    const taskRef = useRef(null);
    const cancelRequestedRef = useRef(false);
    const [state, setState] = useState("loading");
    const [busy, setBusy] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const text = useCallback((key) => t(`profile.${platform}.${key}`), [platform, t]);
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
        } catch {
            setState("UNAVAILABLE");
        }
    }, [service]);

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
            setBusy(false);
            setIsModalOpen(false);
            toast.success(text("authorized"));
        } catch {
            // Continue checking while the short-lived extension grant is active.
        }
    }, [service, stopPolling, toast, text]);

    useEffect(() => {
        void loadStatus();
        return () => {
            stopPolling();
            void cancelTask();
        };
    }, [cancelTask, loadStatus, stopPolling]);

    const start = async () => {
        cancelRequestedRef.current = false;
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
            if (cancelRequestedRef.current) {
                await cancelTask();
                return;
            }
            setState("PENDING");
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
    const titleNode = (
        <div className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-accent" />
            <div className="text-title font-black text-ink">{text("title")}</div>
        </div>
    );

    return (
        <div className="mt-4 rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                    <Link2 className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-ink">{text("title")}</div>
                    <div className="mt-1 text-caption text-ink-muted">{text("description")}</div>
                </div>
                {loading ? <LoaderCircle className="h-5 w-5 animate-spin text-accent" />
                    : authorized ? <CheckCircle2 className="h-5 w-5 text-success" />
                        : expired ? <TriangleAlert className="h-5 w-5 text-warning" />
                            : <ShieldOff className="h-5 w-5 text-ink-faint" />}
            </div>

            {loading && <div className="mt-4 text-caption text-ink-muted">{text("checking")}</div>}
            {!loading && expired && <div className="mt-4 text-caption font-semibold text-warning">{text("sessionExpired")}</div>}
            {!loading && state === "UNAVAILABLE" && <div className="mt-4 text-caption text-warning">{text("unavailable")}</div>}

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
                    <div className="max-w-sm text-sm font-semibold text-ink-secondary">
                        {state === "PENDING" ? t("profile.connector.waiting") : t("profile.connector.opening")}
                    </div>
                    <div className="max-w-sm text-caption text-ink-muted">{t("profile.connector.hint")}</div>
                    {state === "PENDING" && <LoaderCircle className="h-5 w-5 animate-spin text-accent" />}
                </div>
            </Modal>
        </div>
    );
};

export default LocalPlatformAuthorizationPanel;
