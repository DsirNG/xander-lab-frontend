import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal } from "lucide-react";
import { useToast } from "@shared/hooks/useToast";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import { useAuthSession } from "@features/auth";
import { useAgentConversation } from "../hooks/useAgentConversation";
import useAgentAttachments from "../hooks/useAgentAttachments";
import useAgentQueryBootstrap from "../hooks/useAgentQueryBootstrap";
import AgentComposer from "../components/AgentComposer";
import AgentConversationTimeline from "../components/AgentConversationTimeline";
import WorkspaceAgentConversationMessage, {
    WorkspaceAgentThoughtCard,
} from "../components/WorkspaceAgentConversationMessage";
import WorkspaceAgentSidebar from "../components/WorkspaceAgentSidebar";
import WorkspaceAgentSkeleton from "../components/WorkspaceAgentSkeleton";
import WorkspaceAgentWelcome from "../components/WorkspaceAgentWelcome";
import { mergeLiveTraces, mergeToolTraces } from "../components/agentTrace";
import {
    imageUrlsFromMessages,
    imageUrlsFromSteps,
} from "../components/imageResult";
import {
    getActiveImageGeneration,
    hasStreamingAnswer,
} from "../utils/conversationState";

const WorkspaceAgentChat = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { conversationId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryParam = searchParams.get("q");
    const toast = useToast();
    const { userInfo } = useAuthSession();

    const displayName =
        userInfo?.nickname || userInfo?.username || "XanderDING";

    const [input, setInput] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);

    const {
        attachments,
        uploadingAttachments,
        handleFilesSelected,
        handleRemoveAttachment,
        clearAttachments,
    } = useAgentAttachments({ t, toast });

    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const chatEndRef = useRef(null);
    const chatScrollRef = useRef(null);
    const stickToBottomRef = useRef(true);

    const {
        sessions,
        conversation,
        messages,
        loading,
        creating,
        running,
        approvals,
        decidingApprovalId,
        reconnecting,
        errorMessage,
        liveSteps,
        deepThinking,
        setDeepThinking,
        sendMessage,
        cancelTurn,
        decideApproval,
        createConversation,
        setConversationPinned,
        reset,
    } = useAgentConversation({ conversationId });

    const isActive = running || conversation?.status === "running";
    const awaitingApproval = conversation?.status === "awaiting_approval";
    const locked = isActive || awaitingApproval || creating;

    // 同一次工具调用的 start/progress/delta/end 先合成一条轨迹，收口后仍能展开回看。
    const steps = useMemo(() => mergeLiveTraces(liveSteps), [liveSteps]);

    /** 持久化消息同样先归并 tool_call / tool_result，刷新后细节不丢。 */
    const timeline = useMemo(() => mergeToolTraces(messages), [messages]);

    const streamingAnswer = useMemo(() => hasStreamingAnswer(steps), [steps]);
    const activeImageGeneration = useMemo(
        () => getActiveImageGeneration(steps),
        [steps],
    );

    const historicalImageUrls = useMemo(
        () => imageUrlsFromMessages(messages),
        [messages],
    );

    const liveImageUrls = useMemo(() => imageUrlsFromSteps(steps), [steps]);

    useEffect(() => {
        if (stickToBottomRef.current)
            chatEndRef.current?.scrollIntoView({
                behavior: "auto",
                block: "end",
            });
    }, [approvals, messages, steps]);

    useEffect(() => {
        const element = textareaRef.current;
        if (!element) return;
        element.style.height = "auto";
        element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
    }, [input]);

    const submitText = useCallback(
        async (text, selectedAttachments = []) => {
            const trimmed =
                text.trim() || t("blog.agentChat.analyzeAttachments");
            if (!trimmed && selectedAttachments.length === 0) return;
            stickToBottomRef.current = true;
            setTimeout(() => {
                chatEndRef.current?.scrollIntoView({
                    behavior: "auto",
                    block: "end",
                });
            }, 10);

            if (!conversationId) {
                try {
                    const detail = await createConversation(
                        trimmed,
                        selectedAttachments,
                    );
                    if (!detail?.conversation?.id) return;
                    navigate(`/workspace/ai/${detail.conversation.id}`, {
                        replace: true,
                    });
                    setInput("");
                    clearAttachments();
                } catch (error) {
                    toast.error(
                        error.message || t("blog.agentChat.sendFailed"),
                    );
                }
                return;
            }
            setInput("");
            clearAttachments();
            await sendMessage(trimmed, { attachments: selectedAttachments });
        },
        [
            clearAttachments,
            conversationId,
            createConversation,
            navigate,
            sendMessage,
            t,
            toast,
        ],
    );

    const handleSubmit = async () => {
        if (!input.trim() && attachments.length === 0) {
            toast.warning(t("blog.agentChat.inputRequired"));
            return;
        }
        await submitText(input, attachments);
    };

    const handleQuizSubmit = useCallback(
        async (payload) => {
            if (!conversationId || locked) return false;
            // 答题卡提交是内部协议；服务端会持久化为可读的 quiz_answer，不能先把 JSON 当作用户消息显示。
            // 把结果原样回给卡片：返回 false 时卡片要退回可编辑，不能锁死在"已提交"。
            return sendMessage(JSON.stringify(payload), {
                displayUserMessage: false,
            });
        },
        [conversationId, locked, sendMessage],
    );

    const handleApprovalDecision = useCallback(
        async (approvalId, approved) => {
            try {
                await decideApproval(approvalId, approved);
            } catch (error) {
                toast.error(error.message || t("blog.agentChat.sendFailed"));
            }
        },
        [decideApproval, t, toast],
    );

    const handleNewConversation = () => {
        reset();
        setInput("");
        clearAttachments();
        navigate("/workspace/ai", { replace: true });
    };

    // 置顶失败时回滚由 hook 负责，这里只补一个提示。
    const handleTogglePin = useCallback(
        async (sessionId, pinned) => {
            try {
                await setConversationPinned(sessionId, pinned);
            } catch (error) {
                toast.error(error.message || t("workspace.agent.pinFailed"));
            }
        },
        [setConversationPinned, t, toast],
    );

    useAgentQueryBootstrap({
        conversationId,
        creating,
        queryParam,
        searchParams,
        setInput,
        setSearchParams,
        submitText,
        t,
        toast,
    });

    const canSend =
        Boolean(input.trim() || attachments.length) && !uploadingAttachments;

    return (
        <div className="relative flex h-full w-full min-w-0 overflow-hidden bg-[#fafafa]">
            <WorkspaceAgentSidebar
                open={drawerOpen}
                sessions={sessions}
                activeConversationId={conversationId}
                onOpenChange={setDrawerOpen}
                onNewConversation={handleNewConversation}
                onSelectConversation={(sessionId) =>
                    navigate(`/workspace/ai/${sessionId}`)
                }
                onTogglePin={handleTogglePin}
                t={t}
            />

            {/* Main Chat Content Area */}
            <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#fdfdfe]">
                {/* Top Right Header Controls */}
                <header className="flex h-12 shrink-0 items-center justify-end px-5">
                    <button
                        type="button"
                        className="grid h-8 w-8 place-items-center rounded-lg text-[#8e94aa] hover:bg-[#f5f4fb] hover:text-[#5f6286] transition-colors"
                        title="Layout"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                    </button>
                </header>

                {messages.length === 0 &&
                steps.length === 0 &&
                approvals.length === 0 &&
                !loading ? (
                    <WorkspaceAgentWelcome
                        displayName={displayName}
                        input={input}
                        attachments={attachments}
                        locked={locked}
                        uploadingAttachments={uploadingAttachments}
                        canSend={canSend}
                        isActive={isActive}
                        fileInputRef={fileInputRef}
                        textareaRef={textareaRef}
                        onInputChange={setInput}
                        onFilesSelected={handleFilesSelected}
                        onRemoveAttachment={handleRemoveAttachment}
                        onSubmit={handleSubmit}
                        onCancel={cancelTurn}
                        deepThinking={deepThinking}
                        onToggleDeepThinking={() =>
                            setDeepThinking((current) => !current)
                        }
                    />
                ) : (
                    /* Active Chat Stream State */
                    <>
                        <AgentConversationTimeline
                            chatScrollRef={chatScrollRef}
                            stickToBottomRef={stickToBottomRef}
                            chatEndRef={chatEndRef}
                            loading={loading}
                            creating={creating}
                            running={running}
                            steps={steps}
                            messages={messages}
                            timeline={timeline}
                            approvals={approvals}
                            decidingApprovalId={decidingApprovalId}
                            handleApprovalDecision={handleApprovalDecision}
                            handleQuizSubmit={handleQuizSubmit}
                            historicalImageUrls={historicalImageUrls}
                            liveImageUrls={liveImageUrls}
                            activeImageGeneration={activeImageGeneration}
                            isActive={isActive}
                            streamingAnswer={streamingAnswer}
                            reconnecting={reconnecting}
                            errorMessage={errorMessage}
                            statusLine={t("blog.agentChat.reconnecting")}
                            t={t}
                            messageComponent={WorkspaceAgentConversationMessage}
                            thoughtComponent={WorkspaceAgentThoughtCard}
                            loadingContent={<WorkspaceAgentSkeleton />}
                            scrollClassName="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4 sm:px-8"
                        />

                        {/* Bottom Input Bar for Active Chat */}
                        <div className="shrink-0 bg-gradient-to-t from-[#fdfdfe] via-[#fdfdfe]/90 to-transparent p-4">
                            <div className="mx-auto w-full max-w-3xl">
                                <AgentComposer
                                    input={input}
                                    attachments={attachments}
                                    locked={locked}
                                    uploadingAttachments={uploadingAttachments}
                                    canSend={canSend}
                                    isActive={isActive}
                                    fileInputRef={fileInputRef}
                                    textareaRef={textareaRef}
                                    onInputChange={setInput}
                                    onFilesSelected={handleFilesSelected}
                                    onRemoveAttachment={handleRemoveAttachment}
                                    onSubmit={handleSubmit}
                                    onCancel={cancelTurn}
                                    deepThinking={deepThinking}
                                    onToggleDeepThinking={() =>
                                        setDeepThinking((current) => !current)
                                    }
                                    t={t}
                                />
                                <div className="mt-1.5 text-center text-micro text-[#a0a5ba]">
                                    {t(
                                        "blog.agentChat.multiTurnHint",
                                        "DinQor 也会犯错，请注意甄别。",
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default WorkspaceAgentChat;
