import { PanelLeftOpen, Search } from "lucide-react";
import AgentConversationShareMenu from "./AgentConversationShareMenu";

const AgentChatHeader = ({
    sidebarCollapsed,
    avatarText,
    avatar,
    displayName,
    shareOpen,
    conversationId,
    shareLoading,
    shareCopied,
    onOpenMobileSessions,
    onExpandSidebar,
    onOpenSearch,
    onToggleShare,
    onCloseShare,
    onCopyShare,
}) => (
    <header className="absolute top-0 left-0 right-0 z-10 flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
            {sidebarCollapsed ? (
                <>
                    <button
                        type="button"
                        onClick={onExpandSidebar}
                        className="rounded-lg p-2 text-ink-muted hover:bg-surface-muted transition lg:hidden"
                    >
                        <PanelLeftOpen className="h-5 w-5" />
                    </button>
                    <span className="font-bold text-base text-ink lg:hidden">
                        DinQorAI
                    </span>
                </>
            ) : (
                <button
                    type="button"
                    onClick={onOpenMobileSessions}
                    className="rounded-lg p-2 text-ink-muted hover:bg-surface-muted lg:hidden"
                >
                    <PanelLeftOpen className="h-5 w-5" />
                </button>
            )}
        </div>

        <div className="flex items-center gap-3">
            {sidebarCollapsed ? (
                <>
                    <button
                        type="button"
                        onClick={onOpenSearch}
                        className="rounded-lg p-2 text-ink-muted hover:bg-surface-muted transition lg:hidden"
                    >
                        <Search className="h-5 w-5" />
                    </button>
                    <div className="relative grid h-8 w-8 place-items-center rounded-full bg-accent text-white font-bold text-xs uppercase lg:hidden">
                        {avatarText}
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={displayName}
                                className="absolute inset-0 h-full w-full rounded-full object-cover"
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                }}
                            />
                        ) : null}
                    </div>
                </>
            ) : (
                <AgentConversationShareMenu
                    open={shareOpen}
                    conversationId={conversationId}
                    loading={shareLoading}
                    copied={shareCopied}
                    onToggle={onToggleShare}
                    onClose={onCloseShare}
                    onCopy={onCopyShare}
                />
            )}
        </div>
    </header>
);

export default AgentChatHeader;
