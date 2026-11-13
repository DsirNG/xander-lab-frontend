import React from "react";
import { useTranslation } from "react-i18next";

const REASONS = new Set(["success", "authentication", "rate_limited", "not_found", "upstream_error", "invalid_response", "response_too_large", "timeout", "connection", "invalid_url", "audio_required", "provider_missing", "provider_disabled", "key_missing", "prompt_required", "image_required", "cancelled"]);

/** Administrator-only diagnostics rendered as text; provider HTML is never executed. */
export default function ModelProbeResult({ result }) {
    const { t } = useTranslation();
    if (!result) return null;
    return <div role={result.ok ? "status" : "alert"} className={`space-y-2 break-words rounded-control border p-3 text-caption ${result.ok ? "border-border text-ink-muted" : "border-danger/30 bg-danger-soft text-danger-fg"}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold">{t(`admin.probe.${REASONS.has(result.reason) ? result.reason : "connection"}`)}</span>
            {Number.isFinite(result.latencyMs) && <span>{t("admin.probe.latency", { ms: result.latencyMs })}</span>}
            {result.upstreamStatus && <span>{t("admin.playground.httpStatus", { status: result.upstreamStatus })}</span>}
        </div>
        {result.error?.message && <div className="whitespace-pre-wrap">{result.error.message}</div>}
        {result.error?.code && <div>{t("admin.playground.errorCode")}: {result.error.code}</div>}
        {result.error?.param && <div>{t("admin.playground.errorParam")}: {result.error.param}</div>}
        {result.error?.type && <div>{t("admin.playground.errorType")}: {result.error.type}</div>}
        {result.error?.requestId && <div>{t("admin.playground.requestId")}: {result.error.requestId}</div>}
        {result.endpoint && <div>{t("admin.playground.endpoint")}: {result.endpoint}</div>}
        {!result.ok && !result.error?.message && result.reason === "upstream_error" && <div>{t("admin.playground.noProviderMessage")}</div>}
        {result.output?.truncated && <div className="text-warning-fg">{t("admin.playground.truncated")}</div>}
        {result.rawResponse ? <details className="rounded-control border border-border bg-surface p-2 text-ink-muted">
            <summary className="cursor-pointer font-semibold">{t("admin.probe.rawResponse")}</summary>
            <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-control bg-surface-muted p-2 text-micro">{result.rawResponse}</pre>
        </details> : null}
    </div>;
}
