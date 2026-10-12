import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import { formInputCls } from "@shared/ui/forms/formStyles";
import CustomSelect from "@shared/ui/forms/CustomSelect";
import FormField from "@shared/ui/forms/FormField";
import { listArticleCategories } from "@features/blog";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import { AgentPreviewPanel } from "@features/blog";

const AgentArtifactPanel = ({
    loading,
    error,
    taskData,
    selectedVersionId,
    isPublishing,
    isSavingDraft,
    onPublish,
    onCreateDraft,
    onViewPublished,
    onSelectVersion,
    onClose,
    editable = false,
    onEditingChange,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [draft, setDraft] = useState(null);
    const [categories, setCategories] = useState([]);
    const [categoryError, setCategoryError] = useState(false);
    const task = taskData?.task;
    const version = taskData?.versions?.find(
        (item) => String(item.id) === String(selectedVersionId),
    );
    const article = version || task;
    const editing = Boolean(draft);
    useEffect(() => {
        if (!editable || !editing) return undefined;
        const controller = new AbortController();
        listArticleCategories({ _silent: true, signal: controller.signal })
            .then((items) => {
                if (!controller.signal.aborted)
                    setCategories(Array.isArray(items) ? items : []);
            })
            .catch(() => {
                if (!controller.signal.aborted) setCategoryError(true);
            });
        return () => controller.abort();
    }, [editable, editing]);

    const startEditing = () => {
        onEditingChange?.(true);
        setDraft({
            title: article?.title || task.title || "",
            content: article?.content || "",
            summary: article?.summary || "",
            categoryId: task.categoryId || "",
            tags: (taskData.tags || [])
                .map((tag) => (typeof tag === "string" ? tag : tag.name))
                .filter(Boolean),
        });
    };

    const statusText =
        task?.status === "failed"
            ? task.errorMessage || t("blog.agent.failed")
            : task?.status === "ready"
              ? t("blog.agent.ready")
              : t("blog.agent.running");

    if (loading) {
        return (
            <div className="flex h-full min-h-48 items-center justify-center bg-canvas">
                <LoadingSpinner
                    fullScreen={false}
                    text={t("blog.agent.restoring")}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
                <AlertCircle className="h-8 w-8 text-danger" />
                <div className="text-sm font-semibold text-danger">{error}</div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-ink-secondary"
                >
                    {t("common.close")}
                </button>
            </div>
        );
    }

    if (editable && task && draft) {
        return (
            <div className="flex h-full min-h-0 flex-col bg-canvas">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
                    <span className="text-title text-ink">
                        {t("blog.agent.article")}
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setDraft(null);
                                onEditingChange?.(false);
                            }}
                            className="rounded-lg px-3 py-2 text-caption text-ink-secondary"
                        >
                            {t("common.cancel")}
                        </button>
                        <button
                            type="button"
                            disabled={isSavingDraft}
                            onClick={async () => {
                                const saved = await onCreateDraft(draft);
                                if (saved) {
                                    setDraft(null);
                                    onEditingChange?.(false);
                                }
                            }}
                            className="rounded-lg bg-ink px-3 py-2 text-caption text-white disabled:opacity-50"
                        >
                            {t("contentLibrary.saveToLibrary")}
                        </button>
                    </div>
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
                    <input
                        aria-label={t("blog.titlePlaceholder")}
                        className={formInputCls}
                        value={draft.title}
                        onChange={(event) =>
                            setDraft((current) => ({
                                ...current,
                                title: event.target.value,
                            }))
                        }
                    />
                    <FormField
                        label={t("blog.summaryLabel")}
                        htmlFor="workspace-article-summary"
                    >
                        <input
                            id="workspace-article-summary"
                            className={formInputCls}
                            value={draft.summary}
                            onChange={(event) =>
                                setDraft((current) => ({
                                    ...current,
                                    summary: event.target.value,
                                }))
                            }
                        />
                    </FormField>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <FormField label={t("blog.categoryLabel")}>
                            <CustomSelect
                                value={String(draft.categoryId)}
                                options={categories.map((category) => ({
                                    value: String(category.id),
                                    label: category.name,
                                }))}
                                placeholder={t("blog.categoryPlaceholder")}
                                onChange={(categoryId) =>
                                    setDraft((current) => ({
                                        ...current,
                                        categoryId,
                                    }))
                                }
                            />
                            {categoryError ? (
                                <div className="mt-1 text-caption text-ink-muted">
                                    {t("workspace.agent.categoryUnavailable")}
                                </div>
                            ) : null}
                        </FormField>
                        <FormField
                            label={t("workspace.agent.articleTags")}
                            htmlFor="workspace-article-tags"
                        >
                            <input
                                id="workspace-article-tags"
                                className={formInputCls}
                                value={draft.tags.join(", ")}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        tags: event.target.value
                                            .split(/[,，]/)
                                            .map((tag) => tag.trim())
                                            .filter(Boolean),
                                    }))
                                }
                            />
                        </FormField>
                    </div>
                    <textarea
                        aria-label={t("blog.contentPlaceholder")}
                        className={`${formInputCls} min-h-0 flex-1 resize-none leading-7`}
                        value={draft.content}
                        onChange={(event) =>
                            setDraft((current) => ({
                                ...current,
                                content: event.target.value,
                            }))
                        }
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            {editable && task?.status === "ready" ? (
                <div className="flex shrink-0 items-center justify-end gap-2 border-b border-border bg-canvas px-5 py-2">
                    <button type="button" onClick={() => navigate("/app?view=articles")} className="rounded-lg px-3 py-1.5 text-caption text-ink-muted hover:bg-surface-muted">{t("contentLibrary.openLibrary")}</button>
                    <button
                        type="button"
                        onClick={startEditing}
                        className="rounded-lg border border-border px-3 py-1.5 text-caption text-ink hover:bg-surface-muted"
                    >
                        {t("blog.edit")}
                    </button>
                </div>
            ) : null}
            <div className="min-h-0 flex-1">
                <AgentPreviewPanel
                    taskData={taskData}
                    selectedVersionId={selectedVersionId}
                    statusText={statusText}
                    isPublishing={isPublishing}
                    isSavingDraft={isSavingDraft}
                    onPublish={onPublish}
                    onCreateDraft={editable ? startEditing : onCreateDraft}
                    onViewPublished={onViewPublished}
                    onSelectVersion={onSelectVersion}
                    draftActionLabel={editable ? t("contentLibrary.saveToLibrary") : undefined}
                    onClose={onClose}
                />
            </div>
        </div>
    );
};

export default AgentArtifactPanel;
