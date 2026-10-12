import { useEffect, useState } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@shared/hooks/useToast";
import LocalPlatformAuthorizationPanel from "./LocalPlatformAuthorizationPanel";
import PlatformConnectionAction from "./PlatformConnectionAction";
import {
    csdnService,
    createPlatformConnectionService,
    getPlatformConnectionStatuses,
    juejinService,
} from "../services/publishingService";

const PLATFORM_DEFINITIONS = [
    { id: "csdn", brand: "C", color: "#f4511e", publishing: true },
    { id: "juejin", brand: "掘", color: "#1e80ff", publishing: true },
    { id: "wechat_mp", brand: "微", color: "#07c160" },
    { id: "weibo", brand: "微", color: "#e6162d" },
    { id: "zhihu", brand: "知", color: "#0084ff" },
    { id: "baijiahao", brand: "百", color: "#2932e1" },
    { id: "cnblogs", brand: "园", color: "#2a8c4a" },
    { id: "douyin", brand: "音", color: "#161823", formats: ["longArticle", "imageText"] },
    { id: "xiaohongshu", brand: "红", color: "#ff2442", formats: ["longArticle", "imageText"] },
    { id: "toutiao", brand: "头", color: "#f54343" },
    { id: "51cto", brand: "51", color: "#e6002d" },
    { id: "jianshu", brand: "简", color: "#ea6f5a" },
    { id: "segmentfault", brand: "sf", color: "#00965e" },
    { id: "oschina", brand: "开", color: "#00a971" },
    { id: "bilibili", brand: "B", color: "#00a1d6" },
    { id: "tencent_dev", brand: "腾", color: "#00a4ff" },
    { id: "aliyun_dev", brand: "阿", color: "#ff6a00" },
].map((item) => ({
    ...item,
    service: item.id === "csdn" ? csdnService
        : item.id === "juejin" ? juejinService
            : createPlatformConnectionService(item.id),
}));

const JuejinCatalogAction = () => {
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
        <button type="button" onClick={syncCatalog} disabled={syncing}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-bold text-ink-muted hover:bg-canvas disabled:opacity-50">
            {syncing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {t("profile.juejin.syncCatalog")}
        </button>
    );
};

const PlatformConnectionsPanel = () => {
    const { t } = useTranslation();
    const [statuses, setStatuses] = useState(null);

    useEffect(() => {
        let active = true;
        getPlatformConnectionStatuses()
            .then((result) => {
                if (active) setStatuses(result?.connections || {});
            })
            .catch(() => {
                if (active) setStatuses(Object.fromEntries(PLATFORM_DEFINITIONS.map(({ id }) => [id, "UNAVAILABLE"])));
            });
        return () => { active = false; };
    }, []);

    return (
        <section className="space-y-5">
            <div>
                <h2 className="text-title font-semibold text-ink">{t("profile.platformConnections.title")}</h2>
                <p className="mt-2 max-w-3xl text-caption leading-6 text-ink-muted">{t("profile.platformConnections.description")}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-caption leading-6 text-ink-secondary">
                <p>{t("profile.platformConnections.extensionHint")}</p>
                <p className="mt-1 text-ink-muted">{t("profile.platformConnections.securityNote")}</p>
            </div>
            {statuses === null ? (
                <div className="flex min-h-32 items-center justify-center text-caption text-ink-muted">
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    {t("profile.platformConnections.card.checking")}
                </div>
            ) : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {PLATFORM_DEFINITIONS.map((platform) => (
                    <LocalPlatformAuthorizationPanel
                        key={platform.id}
                        platform={platform.id}
                        service={platform.service}
                        displayName={t(`profile.platformConnections.platforms.${platform.id}`)}
                        brand={platform.brand}
                        brandColor={platform.color}
                        publishingEnabled={platform.publishing === true}
                        formats={platform.formats}
                        initialStatus={statuses[platform.id] || "NOT_AUTHORIZED"}
                        compact
                        commonCopy
                        extraActions={platform.id === "csdn" ? () => <PlatformConnectionAction platform="csdn" />
                            : platform.id === "juejin" ? () => <><PlatformConnectionAction platform="juejin" /><JuejinCatalogAction /></> : undefined}
                    />
                ))}
            </div>}
        </section>
    );
};

export default PlatformConnectionsPanel;
