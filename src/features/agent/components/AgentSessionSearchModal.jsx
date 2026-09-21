import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquareText, Search, X } from "lucide-react";
import useClickOutside from "@shared/hooks/useClickOutside";

const AgentSessionSearchModal = ({
    open,
    sessions,
    onClose,
    onSelect,
}) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState("");
    const modalRef = useRef(null);

    const filteredSessions = useMemo(() => {
        if (!query.trim()) return sessions;
        const normalizedQuery = query.toLowerCase();
        return sessions.filter((session) =>
            (session.title || "").toLowerCase().includes(normalizedQuery),
        );
    }, [query, sessions]);

    const closeModal = () => {
        setQuery("");
        onClose();
    };

    useClickOutside(modalRef, closeModal, open);

    if (!open) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-start justify-center bg-ink/40 pt-[15vh]">
            <div
                ref={modalRef}
                className="w-full max-w-lg rounded-2xl border border-border bg-canvas shadow-2xl"
            >
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                    <Search className="h-5 w-5 shrink-0 text-ink-muted" />
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="搜索会话..."
                        autoFocus
                        className="min-h-[40px] min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-faint"
                    />
                    <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-muted transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="max-h-[50vh] overflow-y-auto p-2">
                    <div className="px-2 py-1.5 text-xs font-semibold text-ink-muted">
                        最近聊天
                    </div>
                    {filteredSessions.length > 0 ? (
                        filteredSessions.map((session) => (
                            <button
                                key={session.id}
                                type="button"
                                onClick={() => {
                                    closeModal();
                                    onSelect(session.id);
                                }}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-surface-muted"
                            >
                                <MessageSquareText className="h-4 w-4 shrink-0 text-ink-muted" />
                                <span className="truncate">
                                    {session.title || t("blog.agent.untitled")}
                                </span>
                            </button>
                        ))
                    ) : (
                        <div className="py-8 text-center text-sm text-ink-muted">
                            {query ? "没有找到匹配的会话" : "暂无会话记录"}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

AgentSessionSearchModal.defaultProps = {
    open: false,
    sessions: [],
};

export default AgentSessionSearchModal;
