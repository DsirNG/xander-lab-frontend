import { useState } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@shared/hooks/useToast";
import LocalPlatformAuthorizationPanel from "./LocalPlatformAuthorizationPanel";
import { juejinService } from "../services/publishingService";

const JuejinAuthorizationPanel = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const [syncing, setSyncing] = useState(false);

    const syncCatalog = async () => {
        setSyncing(true);
        try {
            await juejinService.syncCatalog();
            toast.success(t("profile.juejin.catalogSynced"));
        } catch (error) {
            toast.error(error?.message || t("profile.juejin.catalogSyncFailed"));
        } finally {
            setSyncing(false);
        }
    };

    return (
        <LocalPlatformAuthorizationPanel
            platform="juejin"
            service={juejinService}
            extraActions={() => (
                <button type="button" onClick={syncCatalog} disabled={syncing}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-bold text-ink-muted hover:bg-canvas disabled:opacity-50">
                    {syncing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    {t("profile.juejin.syncCatalog")}
                </button>
            )}
        />
    );
};

export default JuejinAuthorizationPanel;
