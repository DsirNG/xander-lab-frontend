import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Bell,
    FileText,
    KeyRound,
    Mail,
    Monitor,
    Moon,
    Plug,
    Share2,
    Shield,
    Sun,
    SunMoon,
    SlidersHorizontal,
    UserRound,
} from "lucide-react";
import Modal from "@shared/ui/overlays/Modal";
import {
    AccountInfoPanel,
    McpAuthorizationPanel,
    PasswordSettingsPanel,
    LanguagePreferencesPanel,
} from "@features/profile";
import { PlatformConnectionsPanel } from "@features/platformIntegrations";

const TABS = [
    { id: "account", icon: UserRound },
    { id: "security", icon: Shield },
    { id: "notifications", icon: Bell },
    { id: "templates", icon: Mail },
    { id: "history", icon: FileText },
    { id: "apiKeys", icon: KeyRound },
    { id: "mcp", icon: Plug },
    { id: "platforms", icon: Share2 },
    { id: "appearance", icon: SunMoon },
    { id: "preferences", icon: SlidersHorizontal },
];

const ENABLED_TABS = [
    "account",
    "security",
    "mcp",
    "platforms",
    "appearance",
    "preferences",
];

const ProfileModal = ({
    open,
    onClose,
    initialTab = "account",
    themeMode,
    resolvedTheme,
    onThemeModeChange,
}) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("account");

    useEffect(() => {
        if (open) setActiveTab(initialTab);
    }, [initialTab, open]);

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title={t("workspace.settings")}
            width="max-w-4xl"
            height={680}
            bodyScrollable={false}
            showBackdrop={false}
            className="rounded-dialog"
        >
            <div className="flex h-full min-h-0 flex-col gap-4 lg:flex-row lg:gap-6">
                {/* 设置分类导航：移动端横向滚动，桌面端左侧竖排 */}
                <nav
                    className="flex min-h-0 min-w-0 shrink-0 gap-1 overflow-x-auto overscroll-x-contain rounded-panel border border-border bg-surface p-2 custom-scrollbar lg:h-full lg:w-48 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto"
                    aria-label={t("workspace.settings")}
                >
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const enabled = ENABLED_TABS.includes(tab.id);
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                disabled={!enabled}
                                onClick={() => enabled && setActiveTab(tab.id)}
                                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-control px-3 py-3 text-left text-caption font-semibold transition lg:w-full lg:min-h-10 lg:py-2 ${
                                    active
                                        ? "bg-surface-muted text-ink"
                                        : enabled
                                          ? "text-ink-muted hover:bg-surface-muted hover:text-ink-secondary"
                                          : "cursor-not-allowed text-ink-faint opacity-50"
                                }`}
                            >
                                <Icon
                                    className="h-3.5 w-3.5 shrink-0"
                                    aria-hidden="true"
                                />
                                <span className="whitespace-nowrap">
                                    {t(`profile.nav.${tab.id}`)}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {/* 设置内容 */}
                <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain rounded-panel border border-border bg-canvas p-4 custom-scrollbar sm:p-6">
                    {activeTab === "account" ? (
                        <AccountInfoPanel />
                    ) : activeTab === "security" ? (
                        <PasswordSettingsPanel />
                    ) : activeTab === "mcp" ? (
                        <McpAuthorizationPanel />
                    ) : activeTab === "platforms" ? (
                        <PlatformConnectionsPanel />
                    ) : activeTab === "preferences" ? (
                        <LanguagePreferencesPanel />
                    ) : activeTab === "appearance" ? (
                        <section className="space-y-6">
                            <div>
                                <div className="text-title font-semibold text-ink">
                                    {t("profile.appearance.title")}
                                </div>
                                <div className="mt-2 text-caption leading-6 text-ink-muted">
                                    {t("profile.appearance.description")}
                                </div>
                            </div>
                            <div
                                role="group"
                                aria-label={t("profile.appearance.title")}
                                className="grid gap-4 sm:grid-cols-3"
                            >
                                {[
                                    { id: "light", icon: Sun },
                                    { id: "dark", icon: Moon },
                                    { id: "system", icon: Monitor },
                                ].map(({ id, icon: Icon }) => {
                                    const selected = themeMode === id;
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() =>
                                                onThemeModeChange(id)
                                            }
                                            className={`flex min-h-28 flex-col items-start justify-between rounded-card border p-4 text-left transition-colors ${
                                                selected
                                                    ? "border-ink bg-surface-muted text-ink"
                                                    : "border-border bg-canvas text-ink hover:border-border-strong hover:bg-surface-muted"
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="text-body font-semibold">
                                                {t(`profile.appearance.${id}`)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="rounded-card bg-surface-muted px-4 py-3 text-caption leading-6 text-ink-secondary">
                                {themeMode === "system"
                                    ? t("profile.appearance.systemStatus", {
                                          mode: t(
                                              `profile.appearance.${resolvedTheme}`,
                                          ),
                                      })
                                    : t("profile.appearance.savedHint")}
                            </div>
                        </section>
                    ) : (
                        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
                            <div className="text-body font-semibold text-ink-secondary">
                                {t("profile.comingSoon")}
                            </div>
                            <div className="max-w-sm text-caption font-medium leading-5 text-ink-faint">
                                {t("profile.comingSoonHint")}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ProfileModal;
