import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    AlertCircle,
    Ban,
    Check,
    ChevronDown,
    ChevronRight,
    Loader2,
    ShieldAlert,
} from "lucide-react";
import AgentActivityDuration from "./AgentActivityDuration";
import { formatTracePayload } from "./agentTrace";

const STATUS_META = {
    running: {
        Icon: Loader2,
        tone: "text-ink-faint",
        spin: true,
        label: "toolRunning",
    },
    done: { Icon: Check, tone: "text-success", label: "toolSucceeded" },
    error: { Icon: AlertCircle, tone: "text-danger", label: "toolFailed" },
    cancelled: { Icon: Ban, tone: "text-ink-faint", label: "toolCancelled" },
};

const DetailSection = ({ title, body }) =>
    body ? (
        <div className="mt-2 first:mt-1.5">
            <div className="font-semibold text-ink-secondary">{title}</div>
            <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-surface-muted px-2 py-1.5 text-[11px] leading-4 text-ink-muted">
                {body}
            </pre>
        </div>
    ) : null;

const CollapsibleCard = ({
    HeaderIcon,
    headerTone,
    summary,
    badge,
    children,
    tone = "",
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const Chevron = open ? ChevronDown : ChevronRight;
    return (
        <div
            className={`rounded-xl border bg-canvas px-3 py-2 text-xs leading-5 ${tone || "border-border"}`}
        >
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                className="flex w-full items-center gap-2 text-left text-ink-muted transition-colors hover:text-ink-secondary"
            >
                <HeaderIcon
                    className={`h-3.5 w-3.5 shrink-0 ${headerTone}`}
                    aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate">{summary}</span>
                {badge}
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
            {open ? <div className="mt-1">{children}</div> : null}
        </div>
    );
};

/**
 * 一次工具调用的活动行：默认只显示当前动作与耗时；展开后查看入参、输出和错误。
 *
 * 工具名和参数是内部细节，放在展开区而不是主时间线上，
 * 这样"做过什么"始终可回看，又不会把内部协议糊在用户脸上。
 */
export const AgentTraceCard = ({ trace }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    if (!trace) return null;
    const status = STATUS_META[trace.status] || STATUS_META.running;
    const { Icon } = status;
    const active = trace.status === "running";
    const tool = trace.tool || t("blog.agentChat.unknownTool");
    const progress = active ? trace.message : "";
    const toolLabel = active
        ? t("blog.agentChat.toolUsing", { tool })
        : trace.status === "done"
          ? t("blog.agentChat.toolUsed", { tool })
          : tool;
    const accessibleLabel = active || trace.status === "done"
        ? toolLabel
        : `${tool} · ${t(`blog.agentChat.${status.label}`)}`;
    const Chevron = open ? ChevronDown : ChevronRight;

    return (
        <div className="w-full min-w-0 text-xs leading-5 text-ink-muted">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                aria-label={accessibleLabel}
                className="flex min-h-8 w-full min-w-0 items-center gap-2 rounded-md px-1 text-left transition-colors hover:bg-surface-muted/50 hover:text-ink-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
                <Icon
                    className={`h-3.5 w-3.5 shrink-0 ${status.tone} ${status.spin ? "animate-spin" : ""}`}
                    aria-hidden="true"
                />
                <span
                    className={`min-w-0 flex-1 break-words ${progress ? "text-ink-secondary" : ""}`}
                    aria-live={active ? "polite" : undefined}
                >
                    {progress || toolLabel}
                </span>
                {progress ? (
                    <span className="max-w-[40%] shrink-0 truncate text-[11px] text-ink-faint">
                        {toolLabel}
                    </span>
                ) : null}
                {active ? (
                    <AgentActivityDuration
                        startedAt={trace.startedAt}
                        durationMs={trace.durationMs}
                        active
                    />
                ) : (
                    <span className={`shrink-0 ${status.tone}`}>
                        {t(`blog.agentChat.${status.label}`)}
                    </span>
                )}
                {!active ? (
                    <AgentActivityDuration
                        startedAt={trace.startedAt}
                        durationMs={trace.durationMs}
                    />
                ) : null}
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
            {open ? (
                <div className="ml-6 mt-1">
                    <DetailSection
                        title={t("blog.agentChat.traceArgs")}
                        body={formatTracePayload(trace.args)}
                    />
                    <DetailSection
                        title={t("blog.agentChat.traceOutput")}
                        body={formatTracePayload(trace.output || trace.result)}
                    />
                    <DetailSection
                        title={t("blog.agentChat.traceError")}
                        body={formatTracePayload(trace.error)}
                    />
                </div>
            ) : null}
        </div>
    );
};

/**
 * 自检卡：主时间线上只留一句面向用户的说明，
 * 给模型看的批评原文（含工具名、状态枚举）收进展开区。
 */
export const SelfCheckCard = ({ content, round }) => {
    const { t } = useTranslation();
    if (!content) return null;
    return (
        <CollapsibleCard
            HeaderIcon={ShieldAlert}
            headerTone="text-orange-600"
            tone="border-orange-500/25"
            summary={
                <>
                    <span className="font-semibold text-orange-600">
                        {round
                            ? t("blog.agentChat.reflectionRound", { round })
                            : t("blog.agentChat.reflectionTitle")}
                    </span>
                    <span>{` · ${t("blog.agentChat.selfCheckSummary")}`}</span>
                </>
            }
        >
            <DetailSection
                title={t("blog.agentChat.traceDetail")}
                body={content}
            />
        </CollapsibleCard>
    );
};

export default AgentTraceCard;
