import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getPlatformLogoSrc } from "@features/platformIntegrations/platformLogos";

const PLATFORMS = [
    { id: "local", nameKey: "blogPlans.localPlatform", available: true },
    { id: "csdn", nameKey: "profile.platformConnections.platforms.csdn", available: true },
    { id: "juejin", nameKey: "profile.platformConnections.platforms.juejin", available: true },
    { id: "wechat_mp", nameKey: "profile.platformConnections.platforms.wechat_mp" },
    { id: "weibo", nameKey: "profile.platformConnections.platforms.weibo" },
    { id: "zhihu", nameKey: "profile.platformConnections.platforms.zhihu" },
    { id: "baijiahao", nameKey: "profile.platformConnections.platforms.baijiahao" },
    { id: "cnblogs", nameKey: "profile.platformConnections.platforms.cnblogs" },
    { id: "douyin", nameKey: "profile.platformConnections.platforms.douyin" },
    { id: "xiaohongshu", nameKey: "profile.platformConnections.platforms.xiaohongshu" },
    { id: "toutiao", nameKey: "profile.platformConnections.platforms.toutiao" },
    { id: "51cto", nameKey: "profile.platformConnections.platforms.51cto" },
    { id: "jianshu", nameKey: "profile.platformConnections.platforms.jianshu" },
    { id: "segmentfault", nameKey: "profile.platformConnections.platforms.segmentfault" },
    { id: "oschina", nameKey: "profile.platformConnections.platforms.oschina" },
    { id: "bilibili", nameKey: "profile.platformConnections.platforms.bilibili" },
    { id: "tencent_dev", nameKey: "profile.platformConnections.platforms.tencent_dev" },
    { id: "aliyun_dev", nameKey: "profile.platformConnections.platforms.aliyun_dev" },
];

const PlatformLogo = ({ platformId, name }) => {
    const [failed, setFailed] = useState(false);
    const logoSrc = getPlatformLogoSrc(platformId);

    return (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white p-1.5">
            {logoSrc && !failed ? (
                <img
                    src={logoSrc}
                    alt=""
                    className="h-full w-full object-contain"
                    loading="lazy"
                    decoding="async"
                    onError={() => setFailed(true)}
                />
            ) : (
                <span
                    aria-hidden="true"
                    className="text-sm font-bold text-ink-muted"
                >
                    {name.slice(0, 1)}
                </span>
            )}
        </span>
    );
};

const PlanPlatformPicker = ({
    value = ["local"],
    onChange,
    disabled = false,
}) => {
    const { t } = useTranslation();
    const selected = new Set(value);
    const toggle = (id) => {
        if (id === "local" || disabled) return;
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        onChange(["local", ...[...next].filter((item) => item !== "local")]);
    };

    return (
        <div
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
            aria-label={t("blogPlans.publishPlatforms")}
        >
            {PLATFORMS.map(({ id, nameKey, available }) => {
                const checked = selected.has(id);
                const isDisabled = disabled || !available || id === "local";
                const name = t(nameKey);
                return (
                    <label
                        key={id}
                        className={`flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2 text-caption ${checked ? "border-accent bg-accent-soft text-accent" : "border-border bg-canvas text-ink-secondary"} ${isDisabled && id !== "local" ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                        title={name}
                    >
                        <input
                            type="checkbox"
                            checked={checked}
                            disabled={isDisabled}
                            aria-label={name}
                            onChange={() => toggle(id)}
                            className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                        />
                        <PlatformLogo platformId={id} name={name} />
                        <span className="min-w-0 flex-1 truncate">
                            {name}
                        </span>
                    </label>
                );
            })}
        </div>
    );
};

export default PlanPlatformPicker;
