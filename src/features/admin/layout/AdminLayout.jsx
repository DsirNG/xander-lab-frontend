import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router-dom";
import {
    CircleDollarSign,
    KeyRound,
    PanelsTopLeft,
    Server,
    SlidersHorizontal,
    Users,
} from "lucide-react";

const ADMIN_TABS = [
    { to: "users", label: "admin.users.title", icon: Users },
    {
        to: "model-providers",
        label: "admin.providers.title",
        icon: Server,
    },
    {
        to: "model-pricing",
        label: "admin.pricing.title",
        icon: CircleDollarSign,
    },
    {
        to: "feature-model-configs",
        label: "admin.configs.title",
        icon: SlidersHorizontal,
    },
    {
        to: "wechat-credential",
        label: "admin.wechatCredential.title",
        icon: KeyRound,
    },
    {
        to: "mcp-servers",
        label: "admin.mcpServers.title",
        icon: PanelsTopLeft,
    },
];

const AdminLayout = () => {
    const { t } = useTranslation();

    return (
        <div className="flex h-dvh min-h-0 min-w-0 flex-col overflow-hidden bg-surface md:flex-row">
            <aside className="flex w-full shrink-0 flex-col border-b border-border bg-canvas md:h-full md:w-60 md:border-b-0 md:border-r">
                <div className="flex items-center justify-between px-5 py-4 lg:block lg:px-6 lg:py-6">
                    <div>
                        <div className="text-title font-bold text-ink">
                            {t("admin.menuLabel")}
                        </div>
                        <div className="mt-1 hidden text-caption text-ink-muted md:block">
                            ADMIN WORKSPACE
                        </div>
                    </div>
                    <span className="rounded-full bg-accent-soft px-2.5 py-1 text-micro font-semibold tracking-wide text-accent-fg">
                        ADMIN
                    </span>
                </div>

                <nav
                    aria-label={t("admin.menuLabel")}
                    className="flex gap-1 overflow-x-auto px-3 pb-3 md:min-h-0 md:flex-1 md:flex-col md:overflow-x-hidden md:overflow-y-auto md:px-3 md:pb-4"
                >
                    {ADMIN_TABS.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-body transition-colors md:w-full ${
                                    isActive
                                        ? "bg-accent-soft font-semibold text-accent-fg"
                                        : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                                }`
                            }
                        >
                            <Icon
                                className="h-4 w-4 shrink-0"
                                aria-hidden="true"
                            />
                            <span className="whitespace-nowrap">{t(label)}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden border-t border-border px-6 py-4 text-micro text-ink-faint md:block">
                    DinQorAI · Admin
                </div>
            </aside>

            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
