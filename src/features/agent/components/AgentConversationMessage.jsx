import { memo, useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    FileText,
    Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import AgentMarkdown from "./AgentMarkdown";
import { cleanImageMarkdown } from "./imageResult";
import { formatActivityDuration } from "../utils/formatActivityDuration";

export const AgentThoughtCard = ({ content, durationMs }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const Chevron = open ? ChevronDown : ChevronRight;
    const duration = Number.isFinite(durationMs)
        ? formatActivityDuration(durationMs)
        : null;

    return (
        <div className="w-full text-xs leading-5 text-ink-muted">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                className="flex min-h-8 max-w-full items-center gap-2 rounded-md px-1 text-left transition-colors hover:text-ink-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
                            className="h-24 w-24 rounded-2xl border border-border object-cover"
                        />
                    </a>
                ) : (
                    <a
                        key={`${attachment.url}-${attachment.name}`}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex max-w-64 items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 text-caption text-ink hover:bg-surface-muted"
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
    ({ role, content, attachments, imageUrls, isStreaming }) => (
        <div
            className={`flex w-full ${role === "user" ? "justify-end" : "justify-start"}`}
        >
            <div
                className={
                    role === "user"
                        ? "max-w-[85%] rounded-3xl bg-surface-muted px-4 py-2.5 text-sm leading-6 text-ink sm:max-w-[75%]"
                        : "w-full min-w-0 py-1 text-sm leading-6 text-ink"
                }
            >
                {role === "user" ? (
                    <>
                        <MessageAttachments attachments={attachments} />
                        <span className="whitespace-pre-wrap">{content}</span>
                    </>
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
            </div>
        </div>
    ),
);

AgentConversationMessage.displayName = "AgentConversationMessage";
