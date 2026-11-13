import { FileText } from "lucide-react";
import AgentMarkdown from "./AgentMarkdown";
import AgentMessageActions from "./AgentMessageActions";
import { AgentThoughtCard } from "./AgentConversationMessage";
import { cleanImageMarkdown } from "./imageResult";

const formatMessageTime = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

export const WorkspaceAgentThoughtCard = AgentThoughtCard;

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
                            className="h-20 w-20 rounded-control border border-border object-cover"
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
                        <FileText className="h-4 w-4 shrink-0 text-ink-muted" />
                        <span className="truncate">{attachment.name}</span>
                    </a>
                ),
            )}
        </div>
    ) : null;

const WorkspaceAgentConversationMessage = ({
    role,
    content,
    attachments,
    imageUrls,
    isStreaming,
    createdAt,
    onEdit,
    onRegenerate,
}) => (
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
            {role === "user" ? (
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
                                style={{ animationDelay: `${index * 140}ms` }}
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
);

export default WorkspaceAgentConversationMessage;
