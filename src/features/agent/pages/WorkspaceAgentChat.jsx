import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    useNavigate,
    useOutletContext,
    useParams,
    useSearchParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal } from "lucide-react";
import { useToast } from "@shared/hooks/useToast";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import Modal from "@shared/ui/overlays/Modal";
import { useAuthSession } from "@features/auth";
import useAgentAttachments from "../hooks/useAgentAttachments";
import useAgentQueryBootstrap from "../hooks/useAgentQueryBootstrap";
import AgentComposer from "../components/AgentComposer";
import AgentConversationTimeline from "../components/AgentConversationTimeline";
import WorkspaceAgentConversationMessage, {
    WorkspaceAgentThoughtCard,
} from "../components/WorkspaceAgentConversationMessage";
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
    const agent = useOutletContext();
    const { plugins = [] } = agent;
    const { conversationId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryParam = searchParams.get("q");
    const toast = useToast();
    const { userInfo } = useAuthSession();

    const displayName =
        userInfo?.nickname || userInfo?.username || "XanderDING";

    const [input, setInput] = useState("");
    const [previewPlugin, setPreviewPlugin] = useState(null);

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
    } = agent;

    const isActive = running || conversation?.status === "running";
    const awaitingApproval = conversation?.status === "awaiting_approval";
    const locked = isActive || awaitingApproval || creating;

    const usePreviewPlugin = () => {
        if (!previewPlugin) return;
        setInput(
            `${input}${input && !input.endsWith(" ") ? " " : ""}@${previewPlugin.key} `,
        );
        setPreviewPlugin(null);
        requestAnimationFrame(() => textareaRef.current?.focus());
    };

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
                        plugins={plugins}
                        onPluginPreview={setPreviewPlugin}
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
                                    plugins={plugins}
                                    onPluginPreview={setPreviewPlugin}
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
            <Modal
                isOpen={Boolean(previewPlugin)}
                onClose={() => setPreviewPlugin(null)}
                title={
                    previewPlugin?.name || t("workspace.pluginsPage.preview")
                }
                width="max-w-xl"
                footer={
                    <button
                        type="button"
                        onClick={usePreviewPlugin}
                        className="rounded-lg bg-ink px-4 py-2 text-caption font-semibold text-white"
                    >
                        {t("workspace.pluginsPage.usePlugin")}
                    </button>
                }
            >
                <div className="space-y-4">
                    <div className="text-micro font-semibold uppercase tracking-[0.12em] text-accent">
                        {previewPlugin?.type === "mcp" ? "MCP" : "Skill"}
                        {previewPlugin?.key ? ` @${previewPlugin.key}` : ""}
                    </div>
                    <p className="text-body leading-6 text-ink">
                        {previewPlugin?.description ||
                            t("workspace.pluginsPage.emptyHint")}
                    </p>
                    {previewPlugin?.instructions ? (
                        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-surface-muted p-4 text-caption leading-6 text-ink-secondary">
                            {previewPlugin.instructions}
                        </pre>
                    ) : null}
                </div>
            </Modal>
        </div>
    );
};

export default WorkspaceAgentChat;
