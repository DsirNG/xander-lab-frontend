import { Check, Loader2, ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const parseSummary = (approval) => {
    if (
        approval?.summary &&
        typeof approval.summary === "object" &&
        !Array.isArray(approval.summary)
    ) {
        return approval.summary;
    }
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
    const tool =
        summary.tool || approval?.toolName || t("blog.agentChat.unknownTool");
    const reason = summary.reason;
    const locationApproval = approval?.toolName === "get_user_location";
    const [requestingLocation, setRequestingLocation] = useState(false);
    const busy = Boolean(deciding || requestingLocation);

    if (!approval?.id) return null;

    const approve = async () => {
        if (!locationApproval) return onDecision(approval.id, true);
        if (!navigator.geolocation) {
            return onDecision(
                approval.id,
                false,
                t("blog.agentChat.approval.locationUnsupported"),
            );
        }
        setRequestingLocation(true);
        try {
            navigator.geolocation.getCurrentPosition(
                async ({ coords }) => {
                    try {
                        await onDecision(approval.id, true, "", {
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                        });
                    } finally {
                        setRequestingLocation(false);
                    }
                },
                async (error) => {
                    try {
                        const message =
                            error.code === error.PERMISSION_DENIED
                                ? t("blog.agentChat.approval.locationDenied")
                                : t("blog.agentChat.approval.locationUnavailable");
                        await onDecision(approval.id, false, message);
                    } finally {
                        setRequestingLocation(false);
                    }
                },
                {
                    enableHighAccuracy: false,
                    timeout: 10_000,
                    maximumAge: 300_000,
                },
            );
        } catch {
            setRequestingLocation(false);
            return onDecision(
                approval.id,
                false,
                t("blog.agentChat.approval.locationUnavailable"),
            );
        }
    };

    const reject = () =>
        onDecision(
            approval.id,
            false,
            locationApproval
                ? t("blog.agentChat.approval.locationDenied")
                : "",
        );

    return (
        <section
            className="rounded-lg border border-warning/35 bg-warning-soft px-4 py-3 text-body text-ink"
            aria-live="polite"
        >
            <div className="flex items-start gap-3">
                <ShieldAlert
                    className="mt-0.5 h-5 w-5 shrink-0 text-warning"
                    aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                    <div className="text-title">
                        {locationApproval
                            ? t("blog.agentChat.approval.locationTitle")
                            : t("blog.agentChat.approval.title")}
                    </div>
                    <div className="mt-1 text-caption text-ink-secondary">
                        {locationApproval
                            ? t("blog.agentChat.approval.locationDescription")
                            : reason ||
                              t("blog.agentChat.approval.description", { tool })}
                    </div>
                    {!locationApproval && (
                        <div className="mt-1 text-micro text-ink-muted">
                            {t("blog.agentChat.approval.tool", { tool })}
                        </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={approve}
                            disabled={busy}
                            className="inline-flex h-9 items-center gap-2 rounded-md bg-success px-3 text-caption font-semibold text-white transition-colors hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {busy ? (
                                <Loader2
                                    className="h-4 w-4 animate-spin"
                                    aria-hidden="true"
                                />
                            ) : (
                                <Check className="h-4 w-4" aria-hidden="true" />
                            )}
                            {locationApproval
                                ? t("blog.agentChat.approval.allowLocation")
                                : t("blog.agentChat.approval.approve")}
                        </button>
                        <button
                            type="button"
                            onClick={reject}
                            disabled={busy}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-canvas px-3 text-caption font-semibold text-ink-secondary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                            {locationApproval
                                ? t("blog.agentChat.approval.useCity")
                                : t("blog.agentChat.approval.reject")}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AgentApprovalCard;
