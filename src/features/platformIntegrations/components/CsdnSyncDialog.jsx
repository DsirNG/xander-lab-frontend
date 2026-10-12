import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ExternalLink, LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import Modal from "@shared/ui/overlays/Modal";
import {
    beginPlatformConnectorAuthorization,
    cancelPlatformConnectorAuthorization,
    csdnService,
    syncBlogToCsdn,
} from "../services/publishingService";

/** Authorizes CSDN when needed, then resumes synchronization of the selected post. */
const CsdnSyncDialog = ({ post, isOpen = true, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const timerRef = useRef(null);
    const syncingRef = useRef(false);
    const authorizationRef = useRef(null);
    const [phase, setPhase] = useState("checking");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const postId = post?.id;

    const syncPost = useCallback(async () => {
        if (syncingRef.current) return;
        syncingRef.current = true;
        setPhase("syncing");
        try {
            const response = await syncBlogToCsdn(postId);
            setResult(response);
            setPhase("done");
            onSuccess?.(response);
        } catch (err) {
            setError(err?.message || t("profile.blogManage.csdn.syncFailed"));
            setPhase("error");
        }
    }, [onSuccess, postId, t]);

    useEffect(() => {
        if (!postId || !isOpen) return;
        let active = true;
        const begin = async () => {
            try {
                const status = await csdnService.getAuthorizationStatus();
                if (!active) return;
                if (status?.status === "AUTHORIZED") {
                    await syncPost();
                    return;
                }
                const authorization = await beginPlatformConnectorAuthorization("csdn", csdnService);
                authorizationRef.current = authorization;
                if (!active) {
                    void cancelPlatformConnectorAuthorization(authorization.taskId, csdnService);
                    return;
                }
                setPhase("authorize");
                timerRef.current = window.setInterval(async () => {
                    try {
                        const current =
                            await csdnService.getAuthorizationStatus();
                        if (current?.status === "AUTHORIZED") {
                            window.clearInterval(timerRef.current);
                            authorizationRef.current = null;
                            await syncPost();
                        }
                    } catch {
                        // The next poll may recover while the authorization session is still active.
                    }
                }, 2500);
            } catch (err) {
                if (!active) return;
                setError(
                        err?.message === "CONNECTOR_NOT_INSTALLED"
                            ? t("profile.connector.installRequired")
                            : err?.message ||
                        t("profile.blogManage.csdn.authorizationFailed"),
                );
                setPhase("error");
            }
        };
        begin();
        return () => {
            active = false;
            if (timerRef.current) window.clearInterval(timerRef.current);
            void cancelPlatformConnectorAuthorization(authorizationRef.current?.taskId, csdnService);
            authorizationRef.current = null;
        };
    }, [isOpen, postId, syncPost, t]);

    if (!post) return null;

    const titleNode = (
        <div>
            <div className="text-title font-black text-ink">
                {t("profile.blogManage.csdn.dialogTitle")}
            </div>
            <div className="mt-1 truncate text-caption font-medium text-ink-muted">
                {post.title}
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={titleNode}
            width="max-w-md"
        >
            {(phase === "checking" || phase === "syncing") && (
                <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center py-4">
                    <LoaderCircle className="h-7 w-7 animate-spin text-accent" />
                    <div className="text-sm font-bold text-ink-secondary">
                        {phase === "syncing"
                            ? t("profile.blogManage.csdn.syncing")
                            : t("profile.blogManage.csdn.checking")}
                    </div>
                </div>
            )}

            {phase === "authorize" && (
                <div className="flex flex-col items-center gap-3 text-center py-2">
                    <ExternalLink className="h-14 w-14 text-accent" />
                    <div className="text-caption font-semibold text-ink-secondary">{t("profile.connector.waiting")}</div>
                    <div className="text-caption text-ink-muted">{t("profile.connector.hint")}</div>
                </div>
            )}

            {phase === "done" && (
                <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center py-4">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                    <div className="text-sm font-bold text-ink">
                        {t("profile.blogManage.csdn.synced")}
                    </div>
                    {result?.url && (
                        <a
                            href={result.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-caption font-bold text-accent hover:underline"
                        >
                            {t("profile.blogManage.csdn.viewPost")}
                        </a>
                    )}
                </div>
            )}

            {phase === "error" && (
                <div className="rounded-xl bg-danger-soft p-4 text-sm font-medium text-danger-fg">
                    {error}
                </div>
            )}
        </Modal>
    );
};

export default CsdnSyncDialog;
