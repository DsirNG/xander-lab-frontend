import { Bot, MessageSquareText, Search, SquarePen, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import AgentSessionList from "./AgentSessionList";

const AgentChatSidebar = ({
    collapsed,
    mobileOpen,
    sessions,
    activeId,
    loading,
    disableNew,
    imagesActive,
    newChatActive,
    displayName,
    avatarText,
    avatar,
    onSelect,
    onNew,
    onCollapse,
    onExpand,
    onSearch,
    onImages,
    onOpenSettings,
    onMobileClose,
}) => {
    const { t } = useTranslation();
    const sessionItems = sessions.map((session) => ({
        ...session,
        input: session.title,
    }));

    const renderSessionList = (mobile = false) => (
        <AgentSessionList
            mobile={mobile}
            sessions={sessionItems}
            activeId={activeId}
            loading={loading}
            disableNew={disableNew}
            imagesActive={imagesActive}
            newChatActive={newChatActive}
            onSelect={(id) => {
                if (disableNew) return;
                if (mobile) onMobileClose();
                onSelect(id);
            }}
            onNew={() => {
                if (mobile) onMobileClose();
                onNew();
            }}
            onCollapse={onCollapse}
            onSearch={onSearch}
            onImages={() => {
                if (mobile) onMobileClose();
                onImages();
            }}
            onOpenSettings={onOpenSettings}
        />
    );

    return (
        <>
            {!collapsed ? renderSessionList() : null}

            {collapsed ? (
                <div className="hidden lg:flex w-16 shrink-0 flex-col items-center border-r border-border bg-[#fcfcfc] py-4">
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={onExpand}
                            className="grid h-10 w-10 place-items-center rounded-xl text-ink hover:bg-surface-muted transition"
                            title="展开"
                        >
                            <Bot className="h-6 w-6" />
                        </button>
                        <button
                            type="button"
                            onClick={onNew}
                            className="mt-2 grid h-10 w-10 place-items-center rounded-xl text-ink-muted hover:bg-surface-muted hover:text-ink transition"
                            title="新建会话"
                        >
                            <SquarePen className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={onSearch}
                            className="grid h-10 w-10 place-items-center rounded-xl text-ink-muted hover:bg-surface-muted hover:text-ink transition"
                            title="搜索"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={onExpand}
                            className="grid h-10 w-10 place-items-center rounded-xl text-ink-muted hover:bg-surface-muted hover:text-ink transition"
                            title="展开会话列表"
                        >
                            <MessageSquareText className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="mt-auto">
                        <div
                            className="relative grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-accent text-white font-bold text-xs uppercase hover:opacity-80 transition"
                            title="用户"
                        >
                            {avatarText}
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt={displayName}
                                    className="absolute inset-0 h-full w-full rounded-full object-cover"
                                    onError={(event) => {
                                        event.currentTarget.style.display =
                                            "none";
                                    }}
                                />
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}

            {mobileOpen ? (
                <div className="absolute inset-0 z-40 flex bg-ink/40 lg:hidden">
                    {renderSessionList(true)}
                    <button
                        type="button"
                        onClick={onMobileClose}
                        className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-canvas text-ink-secondary shadow-lg"
                        aria-label={t("common.close")}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            ) : null}
        </>
    );
};

export default AgentChatSidebar;
