import { memo, useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    FileText,
    Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import AgentMarkdown from "./AgentMarkdown";
import AgentMessageActions from "./AgentMessageActions";
import { cleanImageMarkdown } from "./imageResult";
import { formatActivityDuration } from "../utils/formatActivityDuration";

const formatMessageTime = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

export const AgentThoughtCard = ({ content, durationMs }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const Chevron = open ? ChevronDown : ChevronRight;
    const duration = Number.isFinite(durationMs)
        ? formatActivityDuration(durationMs)
        : null;

    return (
        <div className="w-full text-caption leading-5 text-ink-muted">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                className="flex min-h-8 max-w-full items-center gap-2 rounded-md px-1 text-left transition-colors hover:text-ink-secondary focus-visible:outline-none"
            >
                <Sparkles
                    className="h-3.5 w-3.5 shrink-0 text-ink-faint"
                    aria-hidden="true"
                />
                <span className="truncate">
                    {duration
                        ? t("blog.agentChat.thoughtFor", { duration })
                        : t("blog.agentChat.thoughtContent")}
                </span>
                <Chevron
                    className="h-3.5 w-3.5 shrink-0 text-ink-faint"
                    aria-hidden="true"
                />
                <span className="sr-only">
                    {open
                        ? t("blog.agentChat.traceHide")
                        : t("blog.agentChat.traceShow")}
                </span>
            </button>
            {open && content ? (
                <div className="ml-6 mt-1 whitespace-pre-wrap text-ink-muted">
                    {content}
                </div>
            ) : null}
        </div>
    );
};

const MessageAttachments = ({ attachments = [] }) =>
    attachments.length ? (
        <div className="mb-2 flex max-w-full flex-wrap gap-2">
            {attachments.map((attachment) =>
                attachment.contentType?.startsWith("image/") ? (
                    <a
                        key={`${attachment.url}-${attachment.name}`}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                    >
                        <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="h-24 w-24 rounded-control border border-border object-cover"
                        />
                    </a>
                ) : (
                    <a
                        key={`${attachment.url}-${attachment.name}`}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex max-w-64 items-center gap-2 rounded-control border border-border bg-surface px-3 py-2 text-caption text-ink hover:bg-surface-muted"
                    >
                        <FileText className="h-5 w-5 shrink-0 text-ink-muted" />
                        <span className="truncate">{attachment.name}</span>
                    </a>
                ),
            )}
        </div>
    ) : null;

/**
 * Agent conversation message presentation.
 *
 * The component is memoized because streaming updates otherwise cause every
 * historical Markdown message to be parsed again on each render.
 */
export const AgentConversationMessage = memo(
    ({ role, content, attachments, imageUrls, isStreaming, createdAt, onEdit, onRegenerate, editing = false, editValue = "", onEditChange, onEditCancel, onEditSubmit }) => (
        <div
            className={`flex w-full ${role === "user" ? "justify-end" : "justify-start"}`}
        >
            <div
                className={
                    role === "user"
                        ? "max-w-[85%] text-body leading-6 text-ink sm:max-w-[75%]"
                        : "w-full min-w-0 py-1 text-body leading-6 text-ink"
                }
            >
                {role === "user" ? editing ? (
                    <div className="rounded-panel bg-surface-muted p-4">
                        <textarea
                            autoFocus
                            value={editValue}
                            onChange={(event) => onEditChange?.(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Escape") onEditCancel?.();
                                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") onEditSubmit?.();
                            }}
                            className="min-h-24 w-full resize-none bg-transparent text-body leading-6 text-ink outline-none"
                        />
                        <div className="mt-3 flex justify-end gap-2">
                            <button type="button" onClick={onEditCancel} className="rounded-full border border-border px-4 py-2 text-caption text-ink-secondary">取消</button>
                            <button type="button" onClick={onEditSubmit} className="rounded-full bg-ink px-4 py-2 text-caption text-canvas">发送</button>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-panel bg-surface-muted px-4 py-2.5">
                        <MessageAttachments attachments={attachments} />
                        <span className="whitespace-pre-wrap">{content}</span>
                    </div>
                ) : isStreaming ? (
                    content ? (
                        <AgentMarkdown
                            content={cleanImageMarkdown(content, imageUrls)}
                            isStreaming
                        />
                    ) : (
                        <span
                            className="inline-flex items-center gap-1 px-1"
                            role="status"
                            aria-live="polite"
                        >
                            {[0, 1, 2].map((index) => (
                                <span
                                    key={index}
                                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-70"
                                    style={{
                                        animationDelay: `${index * 140}ms`,
                                    }}
                                />
                            ))}
                        </span>
                    )
                ) : (
                    <AgentMarkdown
                        content={cleanImageMarkdown(content, imageUrls)}
                    />
                )}
                <AgentMessageActions content={content} role={role} isStreaming={isStreaming} onEdit={onEdit} onRegenerate={onRegenerate} />
                {formatMessageTime(createdAt) ? (
                    <div className={`mt-1 text-micro text-ink-faint ${role === "user" ? "text-right" : "text-left"}`}>
                        {formatMessageTime(createdAt)}
                    </div>
                ) : null}
            </div>
        </div>
    ),
);

AgentConversationMessage.displayName = "AgentConversationMessage";
