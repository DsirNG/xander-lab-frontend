import React from "react";
import {
    Image as ImageIcon,
    PanelLeftClose,
    Search,
    SquarePen,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AgentSidebarUserMenu from "./AgentSidebarUserMenu";

const AgentSessionList = ({
    sessions,
    activeId,
    loading,
    disableNew = false,
    mobile = false,
    imagesActive = false,
    newChatActive = false,
    onSelect,
    onNew,
    onCollapse,
    onSearch,
    onImages,
    onOpenSettings,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <aside
            className={`${mobile ? "flex h-full w-[260px] max-w-[calc(100vw-3rem)]" : "hidden min-h-0 w-[260px] lg:flex"} relative shrink-0 flex-col bg-[#fcfcfc]`}
        >
            {/* Top Header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
                <div
                    onClick={() => navigate("/workspace")}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-surface-muted rounded-lg cursor-pointer transition"
                >
                    <span className="font-bold text-base text-ink">
                        DinQorAI
                    </span>
                </div>
                <div className="flex items-center gap-1 text-ink-muted">
                    <button
                        onClick={onSearch}
                        className="p-1.5 hover:bg-surface-muted rounded-lg transition"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onCollapse}
                        className="p-1.5 hover:bg-surface-muted rounded-lg transition hidden lg:block"
                    >
                        <PanelLeftClose className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* New Chat Button */}
            <div className="px-3 pb-2">
                <button
                    type="button"
                    onClick={onNew}
                    disabled={disableNew}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
                        newChatActive
                            ? "bg-surface-muted text-ink"
                            : "text-ink-secondary hover:bg-surface-muted hover:text-ink"
                    }`}
                >
                    <SquarePen className="h-4 w-4 text-ink-muted" />
                    <span>{t("blog.agentChat.newChat")}</span>
                </button>
            </div>

            {/* Nav Links */}
            <div className="px-3 py-1 space-y-0.5">
                <button
                    onClick={onImages}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                        imagesActive
                            ? "bg-surface-muted text-ink"
                            : "text-ink hover:bg-surface-muted"
                    }`}
                >
                    <ImageIcon
                        className={`h-4 w-4 ${imagesActive ? "text-emerald-500" : "text-ink-muted"}`}
                    />
                    <span>{t("blog.agentImages.title")}</span>
                </button>
            </div>

            {/* Conversations List */}
            <div className="mt-4 px-3 pb-1 text-xs font-semibold text-ink-muted">
                {t("blog.agentChat.recentSessions")}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
                {loading && !sessions.length ? (
                    <div className="space-y-2 p-1">
                        {[0, 1, 2].map((item) => (
                            <div
                                key={item}
                                className="h-8 animate-pulse rounded-lg bg-surface-muted"
                            />
                        ))}
                    </div>
                ) : sessions.length ? (
                    sessions.map((session) => (
                        <button
                            key={session.id}
                            type="button"
                            onClick={() => onSelect(session.id)}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition disabled:cursor-wait disabled:opacity-50 ${
                                !imagesActive &&
                                String(activeId) === String(session.id)
                                    ? "bg-surface-muted text-ink"
                                    : "text-ink-secondary hover:bg-surface-muted/50"
                            }`}
                        >
                            <span className="truncate flex-1">
                                {session.title || t("blog.agent.untitled")}
                            </span>
                        </button>
                    ))
                ) : (
                    <div className="py-4 text-center text-xs text-ink-faint">
                        {t("blog.agent.noConversations")}
                    </div>
                )}
            </div>

            <AgentSidebarUserMenu onOpenSettings={onOpenSettings} />
        </aside>
    );
};

export default AgentSessionList;
