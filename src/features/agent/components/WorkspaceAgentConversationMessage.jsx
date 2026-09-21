import { FileText, Sparkles } from "lucide-react";
import AgentMarkdown from "./AgentMarkdown";
import { cleanImageMarkdown } from "./imageResult";

export const WorkspaceAgentThoughtCard = ({ content }) => (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-canvas px-3 py-2 text-xs leading-5 text-ink-muted">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" />
        <span className="whitespace-pre-wrap">{content}</span>
    </div>
);

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
                            className="h-20 w-20 rounded-2xl border border-border object-cover"
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
}) => (
    <div
        className={`flex w-full ${role === "user" ? "justify-end" : "justify-start"}`}
    >
        <div
            className={
                role === "user"
                    ? "max-w-[85%] rounded-3xl bg-[#f2f1fd] px-4 py-2.5 text-sm leading-6 text-black sm:max-w-[75%]"
                    : "w-full min-w-0 py-1 text-sm leading-6 text-[#242741]"
            }
        >
            {role === "user" ? (
                <>
                    <MessageAttachments attachments={attachments} />
                    <span className="whitespace-pre-wrap">{content}</span>
                </>
            ) : isStreaming ? (
                content ? (
                    <div className="flex items-start gap-0.5">
                        <div className="min-w-0 flex-1">
                            <AgentMarkdown
                                content={cleanImageMarkdown(content, imageUrls)}
                            />
                        </div>
                        <span
                            className="mt-1.5 inline-block h-4 w-[3px] shrink-0 animate-pulse rounded-sm bg-current align-middle"
                            aria-hidden="true"
                        />
                    </div>
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
        </div>
    </div>
);

export default WorkspaceAgentConversationMessage;
