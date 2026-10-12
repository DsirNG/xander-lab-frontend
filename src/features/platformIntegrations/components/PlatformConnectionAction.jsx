import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { csdnService, juejinService } from "../services/publishingService";

/** Verifies the saved backend session using the platform's current-account API. */
export default function PlatformConnectionAction({ platform = "csdn" }) {
    const { t, i18n } = useTranslation();
    const [checking, setChecking] = useState(false);
    const [profile, setProfile] = useState(null);
    const [errorKey, setErrorKey] = useState(null);
    const checkingRef = useRef(false);
    const mountedRef = useRef(false);
    const service = platform === "juejin" ? juejinService : csdnService;

    const testConnection = useCallback(async () => {
        if (checkingRef.current) return;
        checkingRef.current = true;
        setChecking(true);
        setErrorKey(null);
        try {
            const result = await service.testConnection();
            if (mountedRef.current) setProfile(result);
        } catch (error) {
            const status = error?.response?.status;
            if (mountedRef.current) {
                setErrorKey(status === 409 ? "expired" : status === 429 ? "rateLimited" : "failed");
                if (status === 409) setProfile(null);
            }
        } finally {
            checkingRef.current = false;
            if (mountedRef.current) setChecking(false);
        }
    }, [service]);

    useEffect(() => {
        let active = true;
        mountedRef.current = true;
        setChecking(true);
        service.getAuthorizationStatus().then((status) => {
            if (!active) return;
            if (status?.profile) {
                setProfile({ ...status.profile, authorizedAt: status.authorizedAt });
                setChecking(false);
            } else {
                // Populate verified account details once after a fresh authorization or upgrade.
                void testConnection();
            }
        }).catch(() => {
            if (active) { setErrorKey("failed"); setChecking(false); }
        });
        return () => { active = false; mountedRef.current = false; };
    }, [service, testConnection]);

    return (
        <div className="w-full space-y-2">
            <button type="button" onClick={testConnection} disabled={checking}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 py-2 text-caption font-semibold text-ink-secondary hover:bg-canvas disabled:opacity-50">
                {checking ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {t(`profile.platformConnection.${checking ? "checking" : "test"}`)}
            </button>
            <div role="status" aria-live="polite" className="text-caption">
                {errorKey ? <div className="text-warning">{t(`profile.platformConnection.${errorKey}`, {
                    platform: t(`profile.platformConnections.platforms.${platform}`),
                })}</div> : null}
                {profile ? (
                    <div className="space-y-1 rounded-lg bg-surface-muted p-3">
                        {!errorKey ? <div className="font-semibold text-success">{t("profile.platformConnection.success")}</div> : null}
                        <div className="flex items-center gap-2 text-ink-secondary">
                            {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full" /> : null}
                            <span className="font-semibold">{profile.nickname || profile.username}</span>
                        </div>
                        <div className="text-ink-secondary">{t("profile.platformConnection.accountId", { id: profile.username })}</div>
                        {profile.authorizedAt ? <div className="text-ink-muted">{t("profile.platformConnection.authorizedAt", {
                            time: new Date(profile.authorizedAt).toLocaleString(i18n.resolvedLanguage),
                        })}</div> : null}
                        {profile.verifiedAt ? <div className="text-ink-muted">{t("profile.platformConnection.verifiedAt", {
                            time: new Date(profile.verifiedAt).toLocaleString(i18n.resolvedLanguage),
                        })}</div> : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
