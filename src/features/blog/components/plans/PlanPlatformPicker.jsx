import { useTranslation } from "react-i18next";

const PLATFORMS = [
    { id: "local", key: "blogPlans.localPlatform", available: true },
    { id: "csdn", key: "blogPlans.syncCsdn", available: true },
    { id: "juejin", key: "blogPlans.syncJuejin", available: true },
    { id: "wechat_mp", key: "platformAccounts.platforms.wechat_mp" },
    { id: "weibo", key: "platformAccounts.platforms.weibo" },
    { id: "zhihu", key: "platformAccounts.platforms.zhihu" },
    { id: "baijiahao", key: "platformAccounts.platforms.baijiahao" },
    { id: "cnblogs", key: "platformAccounts.platforms.cnblogs" },
    { id: "douyin", key: "platformAccounts.platforms.douyin" },
    { id: "xiaohongshu", key: "platformAccounts.platforms.xiaohongshu" },
    { id: "toutiao", key: "platformAccounts.platforms.toutiao" },
    { id: "51cto", key: "platformAccounts.platforms.51cto" },
    { id: "jianshu", key: "platformAccounts.platforms.jianshu" },
    { id: "segmentfault", key: "platformAccounts.platforms.segmentfault" },
    { id: "oschina", key: "platformAccounts.platforms.oschina" },
    { id: "bilibili", key: "platformAccounts.platforms.bilibili" },
    { id: "tencent_dev", key: "platformAccounts.platforms.tencent_dev" },
    { id: "aliyun_dev", key: "platformAccounts.platforms.aliyun_dev" },
];

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
            {PLATFORMS.map(({ id, key, available }) => {
                const checked = selected.has(id);
                const isDisabled = disabled || !available || id === "local";
                return (
                    <label
                        key={id}
                        className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-caption ${checked ? "border-accent bg-accent-soft text-accent" : "border-border bg-canvas text-ink-secondary"} ${isDisabled && id !== "local" ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                    >
                        <input
                            type="checkbox"
                            checked={checked}
                            disabled={isDisabled}
                            onChange={() => toggle(id)}
                            className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                        />
                        <span className="min-w-0 flex-1 truncate">
                            {t(key)}
                        </span>
                        {!available && (
                            <span className="shrink-0 text-[10px] text-ink-faint">
                                {t("blogPlans.platformPlanned")}
                            </span>
                        )}
                    </label>
                );
            })}
        </div>
    );
};

export default PlanPlatformPicker;
