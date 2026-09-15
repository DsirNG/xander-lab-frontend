import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import Modal from "@components/common/Modal";
import FormField from "@components/common/FormField";
import { formInputCls } from "@components/common/formStyles";
import { useToast } from "@/hooks/useToast";
import { parseHeaderLines } from "../services/agentMcpService";

/** 与后端 AgentMcpServerRequest 的校验规则保持一致，避免明知会被拒还发一次请求。 */
const SERVER_KEY_PATTERN = /^[a-z][a-z0-9-]{1,19}$/;
const NAME_MAX = 120;
const URL_MAX = 500;
const MAX_HEADERS = 20;

const EMPTY_FORM = {
    serverKey: "",
    displayName: "",
    endpointUrl: "",
    headersText: "",
    clearHeaders: false,
    enabled: false,
};

/**
 * 新增 / 编辑一台远端 MCP 服务器。
 *
 * <p>请求头是三态的：显式清空、填新值、编辑时留空表示保留原值。没有这个区分，
 * "只想改个名字"会顺手把凭据抹掉——而后端不回传明文，抹掉就找不回来了。</p>
 */
const McpServerFormModal = ({ isOpen, service, prefill, onClose, onSaved }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const editing = Boolean(prefill?.id);
    const keepsExistingHeaders =
        editing && Boolean(prefill?.headersConfigured);

    useEffect(() => {
        if (!isOpen) return;
        setForm(
            prefill
                ? {
                      serverKey: prefill.serverKey || "",
                      displayName: prefill.displayName || "",
                      endpointUrl: prefill.endpointUrl || "",
                      headersText: "",
                      clearHeaders: false,
                      enabled: Boolean(prefill.enabled),
                  }
                : EMPTY_FORM,
        );
        setFormError("");
    }, [isOpen, prefill]);

    const patch = (key, value) =>
        setForm((current) => ({ ...current, [key]: value }));

    const validate = () => {
        if (!SERVER_KEY_PATTERN.test(form.serverKey.trim()))
            return t("blog.agentMcp.formKeyInvalid");
        if (!form.displayName.trim())
            return t("blog.agentMcp.formNameRequired");
        if (form.displayName.trim().length > NAME_MAX)
            return t("blog.agentMcp.formNameTooLong", { max: NAME_MAX });
        const url = form.endpointUrl.trim();
        if (!url) return t("blog.agentMcp.formEndpointRequired");
        if (url.length > URL_MAX)
            return t("blog.agentMcp.formEndpointTooLong", { max: URL_MAX });
        // 明文 HTTP 会让远端凭据与工具参数在链路上裸奔，后端也会拒，这里先拦。
        if (!/^https:\/\//i.test(url))
            return t("blog.agentMcp.formEndpointNotHttps");
        if (form.clearHeaders) return "";
        const { headers, invalid } = parseHeaderLines(form.headersText);
        if (invalid.length > 0)
            return t("blog.agentMcp.formHeadersInvalid", {
                lines: invalid.join("、"),
            });
        if (Object.keys(headers).length > MAX_HEADERS)
            return t("blog.agentMcp.formHeadersTooMany", { max: MAX_HEADERS });
        return "";
    };

    const handleSubmit = async () => {
        const invalid = validate();
        if (invalid) {
            setFormError(invalid);
            return;
        }
        const { headers } = parseHeaderLines(form.headersText);
        const hasHeaders = Object.keys(headers).length > 0;
        const payload = {
            serverKey: form.serverKey.trim(),
            displayName: form.displayName.trim(),
            endpointUrl: form.endpointUrl.trim(),
            enabled: form.enabled,
        };
        // 三态：清空 → {}；填了新值 → 新值；编辑时留空 → null（保留原凭据）。
        if (form.clearHeaders) payload.headers = {};
        else if (hasHeaders) payload.headers = headers;
        else payload.headers = editing ? null : {};

        try {
            setSaving(true);
            if (editing) await service.update(prefill.id, payload);
            else await service.create(payload);
            toast.success(
                t(
                    editing
                        ? "blog.agentMcp.updated"
                        : "blog.agentMcp.created",
                ),
            );
            onClose();
            onSaved?.();
        } catch (err) {
            setFormError(
                err?.response?.data?.message ||
                    err.message ||
                    t("blog.agentMcp.saveFailed"),
            );
        } finally {
            setSaving(false);
        }
    };

    const footer = (
        <>
            <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-xl px-5 py-2.5 text-caption font-bold text-ink-muted transition hover:bg-surface-muted disabled:opacity-50"
            >
                {t("common.cancel")}
            </button>
            <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-caption font-bold text-white transition hover:bg-accent active:scale-95 disabled:opacity-60"
            >
                {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                {t("common.save")}
            </button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                editing
                    ? t("blog.agentMcp.editTitle")
                    : t("blog.agentMcp.createTitle")
            }
            width="max-w-2xl"
            footer={footer}
        >
            <div className="space-y-4">
                <div className="rounded-xl bg-surface-muted px-3 py-2.5 text-micro leading-relaxed text-ink-muted">
                    {t("blog.agentMcp.executableHint")}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        label={t("blog.agentMcp.fieldKey")}
                        htmlFor="agent-mcp-key"
                        hint={t("blog.agentMcp.fieldKeyHint")}
                    >
                        <input
                            id="agent-mcp-key"
                            value={form.serverKey}
                            onChange={(e) =>
                                patch("serverKey", e.target.value)
                            }
                            placeholder="github"
                            disabled={editing}
                            className={`${formInputCls} disabled:bg-surface-muted disabled:text-ink-muted`}
                        />
                    </FormField>
                    <FormField
                        label={t("blog.agentMcp.fieldName")}
                        htmlFor="agent-mcp-name"
                    >
                        <input
                            id="agent-mcp-name"
                            value={form.displayName}
                            onChange={(e) =>
                                patch("displayName", e.target.value)
                            }
                            maxLength={NAME_MAX}
                            placeholder={t(
                                "blog.agentMcp.fieldNamePlaceholder",
                            )}
                            className={formInputCls}
                        />
                    </FormField>
                </div>

                <FormField
                    label={t("blog.agentMcp.fieldEndpoint")}
                    htmlFor="agent-mcp-endpoint"
                    hint={t("blog.agentMcp.fieldEndpointHint")}
                >
                    <input
                        id="agent-mcp-endpoint"
                        value={form.endpointUrl}
                        onChange={(e) =>
                            patch("endpointUrl", e.target.value)
                        }
                        maxLength={URL_MAX}
                        placeholder="https://mcp.example.com/mcp"
                        className={`${formInputCls} font-mono`}
                    />
                </FormField>

                <FormField
                    label={t("blog.agentMcp.fieldHeaders")}
                    htmlFor="agent-mcp-headers"
                    hint={t("blog.agentMcp.fieldHeadersHint")}
                >
                    <textarea
                        id="agent-mcp-headers"
                        value={form.headersText}
                        onChange={(e) =>
                            patch("headersText", e.target.value)
                        }
                        rows={3}
                        placeholder={"Authorization: Bearer xxx"}
                        disabled={form.clearHeaders}
                        className={`${formInputCls} resize-y font-mono disabled:bg-surface-muted disabled:text-ink-muted`}
                    />
                </FormField>

                {keepsExistingHeaders ? (
                    <label className="flex cursor-pointer items-center gap-2.5 text-caption text-ink-secondary">
                        <input
                            type="checkbox"
                            checked={form.clearHeaders}
                            onChange={(e) =>
                                patch("clearHeaders", e.target.checked)
                            }
                            className="h-4 w-4 shrink-0 rounded border-border text-accent focus:ring-accent-200"
                        />
                        {t("blog.agentMcp.formClearHeaders")}
                    </label>
                ) : null}

                <label className="flex cursor-pointer items-start gap-2.5">
                    <input
                        type="checkbox"
                        checked={form.enabled}
                        onChange={(e) => patch("enabled", e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-accent focus:ring-accent-200"
                    />
                    <span>
                        <span className="block text-caption font-semibold text-ink">
                            {t("blog.agentMcp.formEnabled")}
                        </span>
                        <span className="mt-0.5 block text-micro leading-relaxed text-ink-muted">
                            {t("blog.agentMcp.formEnabledHint")}
                        </span>
                    </span>
                </label>

                {formError ? (
                    <div className="text-caption font-medium text-danger">
                        {formError}
                    </div>
                ) : null}
            </div>
        </Modal>
    );
};

export default McpServerFormModal;
