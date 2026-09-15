import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import Modal from "@components/common/Modal";
import FormField from "@components/common/FormField";
import { formInputCls } from "@components/common/formStyles";
import { useToast } from "@/hooks/useToast";
import {
    agentSkillService,
    parseSkillToolNames,
} from "../services/agentSkillService";

/** 与后端 AgentSkillRequest 的校验规则保持一致，避免明知会被拒还发一次请求。 */
const SKILL_KEY_PATTERN = /^[a-z][a-z0-9-]{1,79}$/;
const NAME_MAX = 120;
const DESCRIPTION_MAX = 500;
const INSTRUCTIONS_MAX = 12000;

const EMPTY_FORM = {
    skillKey: "",
    name: "",
    description: "",
    instructions: "",
    toolNames: [],
};

const SkillFormModal = ({ isOpen, tools, prefill, onClose, onSaved }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        setForm(
            prefill
                ? {
                      skillKey: prefill.skillKey || "",
                      name: prefill.name || "",
                      description: prefill.description || "",
                      instructions: prefill.instructions || "",
                      toolNames: parseSkillToolNames(prefill.toolNamesJson),
                  }
                : EMPTY_FORM,
        );
        setFormError("");
    }, [isOpen, prefill]);

    const isNewVersion = Boolean(prefill?.skillKey);
    const selected = useMemo(
        () => new Set(form.toolNames),
        [form.toolNames],
    );

    const patch = (key, value) =>
        setForm((current) => ({ ...current, [key]: value }));

    const toggleTool = (name) =>
        setForm((current) => ({
            ...current,
            toolNames: current.toolNames.includes(name)
                ? current.toolNames.filter((item) => item !== name)
                : [...current.toolNames, name],
        }));

    const validate = () => {
        if (!SKILL_KEY_PATTERN.test(form.skillKey.trim()))
            return t("blog.agentSkills.formKeyInvalid");
        if (!form.name.trim()) return t("blog.agentSkills.formNameRequired");
        if (form.name.trim().length > NAME_MAX)
            return t("blog.agentSkills.formNameTooLong", { max: NAME_MAX });
        if (!form.description.trim())
            return t("blog.agentSkills.formDescriptionRequired");
        if (form.description.trim().length > DESCRIPTION_MAX)
            return t("blog.agentSkills.formDescriptionTooLong", {
                max: DESCRIPTION_MAX,
            });
        if (!form.instructions.trim())
            return t("blog.agentSkills.formInstructionsRequired");
        if (form.instructions.trim().length > INSTRUCTIONS_MAX)
            return t("blog.agentSkills.formInstructionsTooLong", {
                max: INSTRUCTIONS_MAX,
            });
        return "";
    };

    const handleSubmit = async () => {
        const invalid = validate();
        if (invalid) {
            setFormError(invalid);
            return;
        }
        try {
            setSaving(true);
            await agentSkillService.create({
                skillKey: form.skillKey.trim(),
                name: form.name.trim(),
                description: form.description.trim(),
                instructions: form.instructions.trim(),
                toolNames: form.toolNames,
            });
            toast.success(
                t(
                    isNewVersion
                        ? "blog.agentSkills.versionCreated"
                        : "blog.agentSkills.created",
                ),
            );
            onClose();
            onSaved?.();
        } catch (err) {
            setFormError(
                err?.response?.data?.message ||
                    err.message ||
                    t("blog.agentSkills.saveFailed"),
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
                isNewVersion
                    ? t("blog.agentSkills.newVersionTitle", {
                          key: prefill?.skillKey,
                      })
                    : t("blog.agentSkills.createTitle")
            }
            width="max-w-2xl"
            footer={footer}
        >
            <div className="space-y-4">
                <div className="rounded-xl bg-surface-muted px-3 py-2.5 text-micro leading-relaxed text-ink-muted">
                    {t("blog.agentSkills.nonExecutableHint")}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        label={t("blog.agentSkills.fieldKey")}
                        htmlFor="agent-skill-key"
                        hint={t("blog.agentSkills.fieldKeyHint")}
                    >
                        <input
                            id="agent-skill-key"
                            value={form.skillKey}
                            onChange={(e) => patch("skillKey", e.target.value)}
                            placeholder="release-notes"
                            disabled={isNewVersion}
                            className={`${formInputCls} disabled:bg-surface-muted disabled:text-ink-muted`}
                        />
                    </FormField>
                    <FormField
                        label={t("blog.agentSkills.fieldName")}
                        htmlFor="agent-skill-name"
                    >
                        <input
                            id="agent-skill-name"
                            value={form.name}
                            onChange={(e) => patch("name", e.target.value)}
                            maxLength={NAME_MAX}
                            placeholder={t("blog.agentSkills.fieldNamePlaceholder")}
                            className={formInputCls}
                        />
                    </FormField>
                </div>

                <FormField
                    label={t("blog.agentSkills.fieldDescription")}
                    htmlFor="agent-skill-description"
                    hint={t("blog.agentSkills.fieldDescriptionHint")}
                >
                    <textarea
                        id="agent-skill-description"
                        value={form.description}
                        onChange={(e) => patch("description", e.target.value)}
                        maxLength={DESCRIPTION_MAX}
                        rows={2}
                        className={`${formInputCls} resize-y`}
                    />
                </FormField>

                <FormField
                    label={t("blog.agentSkills.fieldInstructions")}
                    htmlFor="agent-skill-instructions"
                    hint={t("blog.agentSkills.fieldInstructionsHint")}
                >
                    <textarea
                        id="agent-skill-instructions"
                        value={form.instructions}
                        onChange={(e) => patch("instructions", e.target.value)}
                        maxLength={INSTRUCTIONS_MAX}
                        rows={7}
                        className={`${formInputCls} resize-y font-mono`}
                    />
                </FormField>

                <div>
                    <div className="mb-1 text-xs font-medium text-ink-secondary">
                        {t("blog.agentSkills.fieldTools")}
                    </div>
                    <div className="mb-1.5 text-micro text-ink-faint">
                        {t("blog.agentSkills.fieldToolsHint")}
                    </div>
                    {tools.length === 0 ? (
                        <div className="rounded-xl border border-border bg-canvas px-3 py-2.5 text-micro text-ink-faint">
                            {t("blog.agentSkills.fieldToolsEmpty")}
                        </div>
                    ) : (
                        <div className="max-h-56 overflow-y-auto rounded-xl border border-border bg-canvas p-1.5">
                            {tools.map((tool) => (
                                <label
                                    key={tool.name}
                                    className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-muted"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.has(tool.name)}
                                        onChange={() => toggleTool(tool.name)}
                                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-accent focus:ring-accent-200"
                                    />
                                    <span className="min-w-0">
                                        <span className="block truncate font-mono text-caption font-semibold text-ink">
                                            {tool.name}
                                        </span>
                                        <span className="mt-0.5 block text-micro leading-relaxed text-ink-muted">
                                            {tool.description}
                                        </span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                    {form.toolNames.length > 0 ? (
                        <div className="mt-1.5 text-micro text-ink-muted">
                            {t("blog.agentSkills.fieldToolsSelected", {
                                count: form.toolNames.length,
                            })}
                        </div>
                    ) : null}
                </div>

                {formError ? (
                    <div className="text-caption font-medium text-danger">
                        {formError}
                    </div>
                ) : null}
            </div>
        </Modal>
    );
};

export default SkillFormModal;
