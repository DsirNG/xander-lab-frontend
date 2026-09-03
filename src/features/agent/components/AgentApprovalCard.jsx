import { Check, Loader2, ShieldAlert, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const parseSummary = (approval) => {
    if (!approval?.summaryJson) return {};
    try {
        return JSON.parse(approval.summaryJson);
    } catch {
        return {};
    }
};

/** Presents a durable, owner-scoped approval request inside an agent timeline. */
const AgentApprovalCard = ({ approval, deciding, onDecision }) => {
    const { t } = useTranslation();
    const summary = parseSummary(approval);
    const tool = summary.tool || approval?.toolName || t("blog.agentChat.unknownTool");
    const reason = summary.reason;
    const busy = Boolean(deciding);

    if (!approval?.id) return null;

    return (
        <section
            className="rounded-lg border border-warning/35 bg-warning-soft px-4 py-3 text-body text-ink"
            aria-live="polite"
        >
            <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                    <div className="text-title">{t("blog.agentChat.approval.title")}</div>
                    <div className="mt-1 text-caption text-ink-secondary">
                        {reason || t("blog.agentChat.approval.description", { tool })}
                    </div>
                    <div className="mt-1 text-micro text-ink-muted">
                        {t("blog.agentChat.approval.tool", { tool })}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => onDecision(approval.id, true)}
                            disabled={busy}
                            className="inline-flex h-9 items-center gap-2 rounded-md bg-success px-3 text-caption font-semibold text-white transition-colors hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                            {t("blog.agentChat.approval.approve")}
                        </button>
                        <button
                            type="button"
                            onClick={() => onDecision(approval.id, false)}
                            disabled={busy}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-canvas px-3 text-caption font-semibold text-ink-secondary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                            {t("blog.agentChat.approval.reject")}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AgentApprovalCard;
