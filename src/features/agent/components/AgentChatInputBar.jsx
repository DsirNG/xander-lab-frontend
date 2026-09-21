import { useEffect, useRef, useState } from "react";
import {
    Brain,
    FileText,
    Loader2,
    Mic,
    Paperclip,
    Plus,
    Send,
    Square,
    X,
} from "lucide-react";
import useClickOutside from "@shared/hooks/useClickOutside";

const AgentChatInputBar = ({
    t,
    input,
    setInput,
    attachments,
    uploading,
    isActive,
    awaitingApproval,
    creating,
    hasConversation,
    deepThinking,
    onFilesSelected,
    onRemoveAttachment,
    onSubmit,
    onStop,
    onToggleDeepThinking,
}) => {
    const locked = isActive || awaitingApproval || creating;
    const [menuOpen, setMenuOpen] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const menuRef = useRef(null);
    useClickOutside(menuRef, () => setMenuOpen(false));

    useEffect(() => {
        const element = textareaRef.current;
        if (!element) return;
        element.style.height = "auto";
        element.style.height = `${Math.min(element.scrollHeight, 144)}px`;
        element.style.overflowY = element.scrollHeight > 144 ? "auto" : "hidden";
    }, [input]);

    const canSend = Boolean(input.trim() || attachments.length) && !uploading;
    return (
        <div
            className={`mx-auto w-full max-w-3xl ${hasConversation ? "px-4 py-3 pb-safe sm:px-6" : "px-4"}`}
        >
            <div className="relative rounded-3xl border border-border/80 bg-surface p-2 shadow-sm focus-within:border-border-strong">
                {attachments.length ? (
                    <div className="flex flex-wrap gap-2 px-1 pb-2">
                        {attachments.map((attachment) => (
                            <div key={attachment.url} className="group relative">
                                {attachment.contentType.startsWith("image/") ? (
                                    <img
                                        src={attachment.url}
                                        alt={attachment.name}
                                        className="h-24 w-24 rounded-2xl border border-border object-cover"
                                    />
                                ) : (
                                    <div className="flex h-14 max-w-72 items-center gap-2 rounded-2xl border border-border px-3 pr-9">
                                        <FileText className="h-5 w-5 shrink-0 text-ink-muted" />
                                        <div className="min-w-0">
                                            <div className="truncate text-caption font-semibold text-ink">
                                                {attachment.name}
                                            </div>
                                            <div className="text-micro text-ink-muted">
                                                {t("blog.agentChat.file")}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => onRemoveAttachment(attachment.url)}
                                    aria-label={t("blog.agentChat.removeAttachment")}
                                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/75 text-white"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : null}
                <div className="flex items-end gap-1">
                    <div ref={menuRef} className="relative shrink-0 self-end">
                        <button
                            type="button"
                            disabled={locked || uploading}
                            onClick={() => setMenuOpen((open) => !open)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink disabled:opacity-50"
                            aria-label={t("blog.agentChat.addAttachment")}
                        >
                            {uploading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Plus className="h-5 w-5" />
                            )}
                        </button>
                        {menuOpen ? (
                            <div className="absolute bottom-12 left-0 z-30 w-72 rounded-2xl border border-border bg-surface p-2 shadow-xl">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        fileInputRef.current?.click();
                                    }}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-muted"
                                >
                                    <Paperclip className="h-5 w-5 text-ink-muted" />
                                    <span>
                                        <span className="block text-body text-ink">
                                            {t("blog.agentChat.uploadImagesFiles")}
                                        </span>
                                        <span className="block text-caption text-ink-muted">
                                            {t("blog.agentChat.uploadFromDevice")}
                                        </span>
                                    </span>
                                </button>
                            </div>
                        ) : null}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            accept="image/png,image/jpeg,image/webp,image/gif,.pdf,.txt,.md,.json,.html,.xml,.doc,.docx,.rtf,.odt,.ppt,.pptx,.csv,.xls,.xlsx,.tsv,.java,.js,.jsx,.ts,.tsx,.py,.css"
                            onChange={(event) => {
                                onFilesSelected(Array.from(event.target.files || []));
                                event.target.value = "";
                            }}
                        />
                    </div>
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        disabled={locked}
                        placeholder={
                            locked
                                ? t("blog.agentChat.inputLockedPlaceholder")
                                : t("blog.agentChat.inputPlaceholder")
                        }
                        onKeyDown={(event) => {
                            if (
                                event.nativeEvent?.isComposing ||
                                event.keyCode === 229
                            )
                                return;
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                if (!locked && canSend) onSubmit();
                            }
                        }}
                        className="min-h-9 min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-base leading-6 outline-none placeholder:text-ink-faint disabled:opacity-60"
                    />
                    <div className="flex shrink-0 items-center gap-1 self-end">
                        {onToggleDeepThinking ? (
                            <button
                                type="button"
                                onClick={onToggleDeepThinking}
                                aria-pressed={Boolean(deepThinking)}
                                title={t("blog.agentChat.deepThinkingHint")}
                                className={`flex h-8 items-center gap-1.5 rounded-full px-2.5 text-caption font-semibold transition ${
                                    deepThinking
                                        ? "bg-ink text-white"
                                        : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                                }`}
                            >
                                <Brain className="h-4 w-4" aria-hidden="true" />
                                <span className="hidden sm:inline">
                                    {t("blog.agentChat.deepThinking")}
                                </span>
                            </button>
                        ) : null}
                        <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
                        >
                            <Mic className="h-5 w-5" />
                        </button>
                        {creating ? (
                            <button
                                type="button"
                                disabled
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white"
                            >
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </button>
                        ) : isActive ? (
                            <button
                                type="button"
                                onClick={onStop}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white transition hover:bg-ink-secondary"
                            >
                                <Square className="h-3 w-3 fill-current" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={locked || !canSend}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white transition hover:bg-ink-secondary disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-2 text-center text-xs text-ink-muted">
                {t("blog.agentChat.multiTurnHint")}
            </div>
        </div>
    );
};

export default AgentChatInputBar;
