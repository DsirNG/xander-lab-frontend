import { memo } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import AgentApprovalCard from "./AgentApprovalCard";
import {
    AgentConversationMessage,
    AgentThoughtCard,
} from "./AgentConversationMessage";
import ImageToolResult from "./ImageToolResult";
import {
    ArtifactMessage,
    ImageToolProgressPanel,
    PlanCard,
    QuizMessage,
    ThinkingIndicator,
} from "./AgentMessageParts";
import { AgentTraceCard, SelfCheckCard } from "./AgentTraceCard";
import { parseToolPayload } from "../services/agentConversationService";
import {
    containsResultUrl,
    imageToolResult,
    liveImageStepResult,
} from "./imageResult";
import { parseQuizPayload } from "./quizPayload";

const AgentConversationTimeline = memo(
    ({
        chatScrollRef,
        stickToBottomRef,
        chatEndRef,
        loading,
        creating,
        running,
        steps,
        messages,
        timeline,
        approvals,
        decidingApprovalId,
        handleApprovalDecision,
        handleQuizSubmit,
        historicalImageUrls,
        liveImageUrls,
        activeImageGeneration,
        isActive,
        streamingAnswer,
        reconnecting,
        errorMessage,
        statusLine,
        t,
        messageComponent: MessageComponent = AgentConversationMessage,
        thoughtComponent: ThoughtComponent = AgentThoughtCard,
        loadingContent = null,
        scrollClassName = "min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-20 sm:px-6",
    }) => (
        <div
            ref={chatScrollRef}
            onScroll={(event) => {
                const element = event.currentTarget;
                stickToBottomRef.current =
                    element.scrollHeight -
                        element.scrollTop -
                        element.clientHeight <
                    96;
            }}
            className={scrollClassName}
        >
            {loading &&
            !creating &&
            !running &&
            steps.length === 0 &&
            messages.length === 0 ? (
                loadingContent || (
                    <div className="flex h-full min-h-48 items-center justify-center">
                        <LoadingSpinner
                            fullScreen={false}
                            text={t("blog.agentChat.restoring")}
                        />
                    </div>
                )
            ) : (
                <div className="mx-auto flex max-w-3xl flex-col gap-5">
                    {timeline.map((message) => {
                        if (message.kind === "trace") {
                            return (
                                <AgentTraceCard
                                    key={message.id}
                                    trace={message}
                                />
                            );
                        }
                        if (
                            message.kind === "quiz" ||
                            parseQuizPayload(message)
                        ) {
                            return (
                                <QuizMessage
                                    key={message.id}
                                    message={message}
                                    onSubmit={handleQuizSubmit}
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
                                <MessageComponent
                                    key={message.id}
                                    role="user"
                                    content={message.content}
                                    attachments={message.attachments}
                                />
                            );
                        }
                        if (message.kind === "thought") {
                            return (
                                <ThoughtComponent
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
                        if (message.kind === "plan")
                            return (
                                <PlanCard
                                    key={message.id}
                                    items={parseToolPayload(message.content)}
                                />
                            );
                        if (
                            message.kind === "answer" ||
                            message.kind === "message"
                        ) {
                            if (
                                containsResultUrl(
                                    message.content,
                                    historicalImageUrls,
                                )
                            )
                                return null;
                            return (
                                <MessageComponent
                                    key={message.id}
                                    role="assistant"
                                    content={message.content}
                                    imageUrls={historicalImageUrls}
                                />
                            );
                        }
                        return null;
                    })}
                    {approvals.map((approval) => (
                        <AgentApprovalCard
                            key={`approval-${approval.id}`}
                            approval={approval}
                            deciding={decidingApprovalId === approval.id}
                            onDecision={handleApprovalDecision}
                        />
                    ))}
                    {steps.map((step, index) => {
                        if (step.type === "user")
                            return (
                                <MessageComponent
                                    key={`live-${index}`}
                                    role="user"
                                    content={step.content}
                                    attachments={step.attachments}
                                />
                            );
                        if (step.type === "thought")
                            return (
                                <ThoughtComponent
                                    key={`live-${index}`}
                                    content={step.content}
                                />
                            );
                        if (step.type === "plan")
                            return (
                                <PlanCard
                                    key={`live-${index}`}
                                    items={step.items}
                                />
                            );
                        if (step.type === "reflection")
                            return (
                                <SelfCheckCard
                                    key={`live-${index}`}
                                    content={step.content}
                                    round={step.round}
                                />
                            );
                        if (step.type === "trace") {
                            return (
                                <AgentTraceCard
                                    key={`live-${index}`}
                                    trace={step}
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
                        if (step.type === "quiz") {
                            return (
                                <QuizMessage
                                    key={`live-${index}`}
                                    message={step}
                                    onSubmit={handleQuizSubmit}
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
                        if (
                            step.type === "answer" ||
                            step.type === "answer_delta"
                        ) {
                            if (containsResultUrl(step.content, liveImageUrls))
                                return null;
                            return (
                                <MessageComponent
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
                                    <span className="truncate">
                                        {step.message}
                                    </span>
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
                            <ThinkingIndicator
                                label={t("blog.agentChat.thinking")}
                            />
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
                                {errorMessage || statusLine}
                            </span>
                        </div>
                    )}
                    <div ref={chatEndRef} className="h-2" />
                </div>
            )}
        </div>
    ),
);

AgentConversationTimeline.displayName = "AgentConversationTimeline";

export default AgentConversationTimeline;
