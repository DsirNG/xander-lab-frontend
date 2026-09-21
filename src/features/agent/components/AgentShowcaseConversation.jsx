import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
    AlertCircle,
    Loader2,
    Sparkles,
} from "lucide-react";
import {
    ImageToolProgressPanel,
    ImageToolResult,
    PlanCard,
    ThinkingIndicator,
    QuizMessage,
    ArtifactMessage,
} from "./AgentMessageParts";
import AgentMarkdown from "./AgentMarkdown";
import {
    cleanImageMarkdown,
    containsResultUrl,
    imageToolResult,
    liveImageStepResult,
} from "./imageResult";
import { SelfCheckCard } from "./AgentTraceCard";
import { parseQuizPayload } from "./quizPayload";
import { parseToolPayload } from "../services/agentConversationService";

const ThoughtCard = ({ content }) => (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-canvas px-3 py-2 text-xs leading-5 text-ink-muted">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" />
        <span className="whitespace-pre-wrap">{content}</span>
    </div>
);

ThoughtCard.propTypes = {
    content: PropTypes.string.isRequired,
};

const ConversationMessage = ({ role, content, imageUrls, isStreaming }) => (
    <div
        className={`flex w-full ${role === "user" ? "justify-end" : "justify-start"}`}
    >
        <div
            className={
                role === "user"
                    ? "max-w-[85%] rounded-3xl bg-[#f2f1fd] px-4 py-2.5 text-xs sm:text-sm leading-6 text-black sm:max-w-[75%]"
                    : "w-full min-w-0 py-1 text-xs sm:text-sm leading-6 text-[#242741]"
            }
        >
            {role === "user" ? (
                <span className="whitespace-pre-wrap">{content}</span>
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
                <AgentMarkdown content={cleanImageMarkdown(content, imageUrls)} />
            )}
        </div>
    </div>
);

ConversationMessage.propTypes = {
    role: PropTypes.string.isRequired,
    content: PropTypes.string,
    imageUrls: PropTypes.instanceOf(Set),
    isStreaming: PropTypes.bool,
};

export default function AgentShowcaseConversation({
    messages,
    steps,
    historicalImageUrls,
    liveImageUrls,
    activeImageGeneration,
    isActive,
    creating,
    loading,
    reconnecting,
    errorMessage,
    streamingAnswer,
    onQuizSubmit,
    chatEndRef,
    stickToBottomRef,
    t,
}) {
    const chatScrollRef = useRef(null);

    useEffect(() => {
        if (stickToBottomRef.current) {
            chatEndRef.current?.scrollIntoView({
                behavior: "auto",
                block: "end",
            });
        }
    }, [chatEndRef, messages, stickToBottomRef, steps]);

    return (
        <div
            ref={chatScrollRef}
            onScroll={(event) => {
                const element = event.currentTarget;
                stickToBottomRef.current =
                    element.scrollHeight - element.scrollTop - element.clientHeight < 96;
            }}
            className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 pb-4 pt-3 sm:px-6"
        >
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
                {messages.map((message) => {
                    if (message.kind === "quiz" || parseQuizPayload(message)) {
                        return (
                            <QuizMessage
                                key={message.id}
                                message={message}
                                onSubmit={onQuizSubmit}
                            />
                        );
                    }
                    if (message.kind === "artifact") {
                        return (
                            <ArtifactMessage
                                key={message.id}
                                message={message}
                            />
                        );
                    }
                    if (message.role === "user") {
                        return (
                            <ConversationMessage
                                key={message.id}
                                role="user"
                                content={message.content}
                            />
                        );
                    }
                    if (message.kind === "thought") {
                        return (
                            <ThoughtCard
                                key={message.id}
                                content={message.content}
                            />
                        );
                    }
                    if (message.kind === "reflection") {
                        return (
                            <SelfCheckCard
                                key={message.id}
                                content={message.content}
                            />
                        );
                    }
                    if (message.kind === "tool_result") {
                        const result = imageToolResult(message);
                        return result ? (
                            <ImageToolResult
                                key={message.id}
                                url={result.url}
                                title={result.title}
                            />
                        ) : null;
                    }
                    if (message.kind === "plan") {
                        return (
                            <PlanCard
                                key={message.id}
                                items={parseToolPayload(message.content)}
                            />
                        );
                    }
                    if (message.kind === "answer" || message.kind === "message") {
                        if (containsResultUrl(message.content, historicalImageUrls)) {
                            return null;
                        }
                        return (
                            <ConversationMessage
                                key={message.id}
                                role="assistant"
                                content={message.content}
                                imageUrls={historicalImageUrls}
                            />
                        );
                    }
                    return null;
                })}

                {steps.map((step, index) => {
                    if (step.type === "user") {
                        return (
                            <ConversationMessage
                                key={`live-${index}`}
                                role="user"
                                content={step.content}
                            />
                        );
                    }
                    if (step.type === "thought") {
                        return (
                            <ThoughtCard
                                key={`live-${index}`}
                                content={step.content}
                            />
                        );
                    }
                    if (step.type === "plan") {
                        return (
                            <PlanCard
                                key={`live-${index}`}
                                items={step.items}
                            />
                        );
                    }
                    if (step.type === "reflection") {
                        return (
                            <SelfCheckCard
                                key={`live-${index}`}
                                content={step.content}
                                round={step.round}
                            />
                        );
                    }
                    if (step.type === "artifact") {
                        return (
                            <ArtifactMessage
                                key={`live-${index}`}
                                message={step}
                            />
                        );
                    }
                    if (step.type === "tool") {
                        const result = liveImageStepResult(step);
                        return result ? (
                            <ImageToolResult
                                key={`live-${index}`}
                                url={result.url}
                                title={result.title}
                            />
                        ) : null;
                    }
                    if (step.type === "answer" || step.type === "answer_delta") {
                        if (containsResultUrl(step.content, liveImageUrls)) {
                            return null;
                        }
                        return (
                            <ConversationMessage
                                key={`live-${index}`}
                                role="assistant"
                                content={step.content}
                                imageUrls={liveImageUrls}
                                isStreaming={step.type === "answer_delta"}
                            />
                        );
                    }
                    if (step.type === "error") {
                        return (
                            <div
                                key={`live-${index}`}
                                className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-xs font-semibold text-danger"
                            >
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{step.message}</span>
                            </div>
                        );
                    }
                    return null;
                })}

                {activeImageGeneration ? (
                    <ImageToolProgressPanel
                        message={activeImageGeneration.message}
                    />
                ) : null}

                {(isActive || creating || (loading && steps.length > 0)) &&
                    !streamingAnswer &&
                    !activeImageGeneration && (
                        <ThinkingIndicator label={t("blog.agentChat.thinking")} />
                    )}

                {(reconnecting || errorMessage) && (
                    <div
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
                            errorMessage
                                ? "border-danger/20 bg-danger/5 text-danger"
                                : "border-border bg-surface-muted text-ink-secondary"
                        }`}
                    >
                        {errorMessage ? (
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                        )}
                        <span className="truncate">
                            {errorMessage ||
                                (reconnecting ? t("blog.agentChat.reconnecting") : "")}
                        </span>
                    </div>
                )}
                <div ref={chatEndRef} className="h-2" />
            </div>
        </div>
    );
}

AgentShowcaseConversation.propTypes = {
    messages: PropTypes.arrayOf(PropTypes.object).isRequired,
    steps: PropTypes.arrayOf(PropTypes.object).isRequired,
    historicalImageUrls: PropTypes.instanceOf(Set).isRequired,
    liveImageUrls: PropTypes.instanceOf(Set).isRequired,
    activeImageGeneration: PropTypes.shape({ message: PropTypes.string }),
    isActive: PropTypes.bool.isRequired,
    creating: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    reconnecting: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
    streamingAnswer: PropTypes.bool.isRequired,
    onQuizSubmit: PropTypes.func.isRequired,
    chatEndRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
    stickToBottomRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
    t: PropTypes.func.isRequired,
};
