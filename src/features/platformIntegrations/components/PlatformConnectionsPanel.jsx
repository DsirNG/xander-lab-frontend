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

const PLATFORM_LOGO_FILES = {
    csdn: "csdn",
    juejin: "juejin",
    wechat_mp: "wechat",
    weibo: "sinaweibo",
    zhihu: "zhihu",
    xiaohongshu: "xiaohongshu",
    bilibili: "bilibili",
    aliyun_dev: "alibabacloud",
};

const PLATFORM_FAVICONS = {
    cnblogs: "https://www.cnblogs.com/favicon.ico",
    baijiahao: "https://baijiahao.baidu.com/favicon.ico",
    douyin: "https://www.douyin.com/favicon.ico",
    toutiao: "https://www.toutiao.com/favicon.ico",
    "51cto": "https://www.51cto.com/favicon.ico",
    jianshu: "https://www.jianshu.com/favicon.ico",
    segmentfault: "https://segmentfault.com/favicon.ico",
    oschina: "https://www.oschina.net/favicon.ico",
    tencent_dev: "https://cloud.tencent.com/favicon.ico",
};

const PLATFORM_DEFINITIONS = [
    { id: "csdn", publishing: true },
    { id: "juejin", publishing: true },
    { id: "wechat_mp" },
    { id: "weibo" },
    { id: "zhihu" },
    { id: "baijiahao" },
    { id: "cnblogs" },
    { id: "douyin", formats: ["longArticle", "imageText"] },
    { id: "xiaohongshu", formats: ["longArticle", "imageText"] },
    { id: "toutiao" },
    { id: "51cto" },
    { id: "jianshu" },
    { id: "segmentfault" },
    { id: "oschina" },
    { id: "bilibili" },
    { id: "tencent_dev" },
    { id: "aliyun_dev" },
].map((item) => ({
    ...item,
    logoSrc: PLATFORM_LOGO_FILES[item.id]
        ? `/assets/platform-logos/${PLATFORM_LOGO_FILES[item.id]}.svg`
        : PLATFORM_FAVICONS[item.id],
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
    const [profiles, setProfiles] = useState({});

    useEffect(() => {
        let active = true;
        getPlatformConnectionStatuses()
            .then((result) => {
                if (active) {
                    setStatuses(result?.connections || {});
                    setProfiles(result?.profiles || {});
                }
            })
            .catch(() => {
                if (active) setStatuses(Object.fromEntries(PLATFORM_DEFINITIONS.map(({ id }) => [id, "UNAVAILABLE"])));
            });
        return () => { active = false; };
    }, []);

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-title font-semibold text-ink">{t("profile.platformConnections.title")}</h2>
                <div className="max-w-xl text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <span className="text-caption text-ink-muted">{t("profile.platformConnections.extensionRequired")}</span>
                        <details className="group">
                            <summary className="cursor-pointer list-none text-caption font-semibold text-accent underline decoration-border-strong underline-offset-4">
                                {t("profile.platformConnections.securityDetails")}
                            </summary>
                            <div className="mt-3 space-y-2 rounded-lg border border-border bg-surface-muted p-3 text-left text-caption leading-6 text-ink-muted">
                                <p>{t("profile.platformConnections.extensionHint")}</p>
                                <p>{t("profile.platformConnections.securityNote")}</p>
                            </div>
                        </details>
                    </div>
                </div>
            </div>
            {statuses === null ? (
                <div className="flex min-h-32 items-center justify-center text-caption text-ink-muted">
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    {t("profile.platformConnections.card.checking")}
                </div>
            ) : <div className="grid gap-2 sm:grid-cols-2">
                {PLATFORM_DEFINITIONS.map((platform) => (
                    <LocalPlatformAuthorizationPanel
                        key={platform.id}
                        platform={platform.id}
                        service={platform.service}
                        displayName={t(`profile.platformConnections.platforms.${platform.id}`)}
                        logoSrc={platform.logoSrc}
                        initialStatus={statuses[platform.id] || "NOT_AUTHORIZED"}
                        initialProfile={profiles[platform.id] || null}
                        compact
                        commonCopy
                        allowProfileRefresh={platform.id === "wechat_mp"}
                        extraActions={platform.id === "csdn" ? () => <PlatformConnectionAction platform="csdn" />
                            : platform.id === "juejin" ? () => <><PlatformConnectionAction platform="juejin" /><JuejinCatalogAction /></> : undefined}
                    />
                ))}
            </div>}
        </section>
    );
};

export default PlatformConnectionsPanel;
