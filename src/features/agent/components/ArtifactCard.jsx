import React, { useMemo, useState } from "react";
import { Download, FileCode2, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import CodeBlock from "@components/common/CodeBlock";

/**
 * 代码交付卡：文件树 + 完整源码，可逐个文件复制、下载，HTML 还能直接预览。
 *
 * <p>为什么要有这张卡：模型经常只在回复里写一句“已完成 XX 示例”，用户翻遍回复
 * 找不到任何代码；多文件交付挤在一段 Markdown 里也既看不清也拿不走。</p>
 */
const PREVIEWABLE = new Set(["html", "htm", "svg"]);

const fileLabel = (path) => path.slice(path.lastIndexOf("/") + 1) || path;

/** 用文件后缀兜底高亮语言：后端认不出的扩展名会给空串。 */
const languageOf = (file) => {
    if (file.language) return file.language;
    const dot = file.path.lastIndexOf(".");
    return dot > 0 ? file.path.slice(dot + 1).toLowerCase() : "text";
};

export const ArtifactCard = ({ payload }) => {
    const { t } = useTranslation();
    const files = useMemo(
        () => (Array.isArray(payload?.files) ? payload.files : []),
        [payload],
    );
    const entry = useMemo(() => {
        const requested = files.find((file) => file.path === payload?.entry);
        return (requested || files[0])?.path;
    }, [files, payload?.entry]);
    const [selected, setSelected] = useState(entry);

    if (!files.length) return null;

    // 负载可能在同一轮里被替换（模型改了一版），选中的文件不一定还在。
    const active = files.find((file) => file.path === selected) || files[0];
    const language = languageOf(active);
    const title = payload?.name?.trim() || t("blog.agentChat.artifactTitle");

    const download = (file) => {
        try {
            const blob = new Blob([file.content], {
                type: "text/plain;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = fileLabel(file.path);
            anchor.click();
            URL.revokeObjectURL(url);
        } catch {
            // 浏览器禁用了 Blob 下载时，用户仍可用复制按钮把源码拿走。
        }
    };

    return (
        <section className="my-2 w-full max-w-2xl" aria-label={title}>
            <div className="mb-3 flex items-end justify-between gap-3 px-1">
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-title text-ink">
                        <FileCode2
                            className="h-4 w-4 shrink-0 text-ink-faint"
                            aria-hidden="true"
                        />
                        <span className="truncate">{title}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 text-caption text-ink-muted">
                        <span>
                            {t("blog.agentChat.artifactFileCount", {
                                count: files.length,
                            })}
                        </span>
                        {payload?.framework ? (
                            <span className="rounded-md bg-surface-muted px-1.5 py-0.5 font-semibold text-ink-secondary">
                                {payload.framework}
                            </span>
                        ) : null}
                        {PREVIEWABLE.has(language) ? (
                            <span className="inline-flex items-center gap-1">
                                <Play className="h-3 w-3" aria-hidden="true" />
                                {t("blog.agentChat.artifactPreviewHint")}
                            </span>
                        ) : null}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => download(active)}
                    aria-label={t("blog.agentChat.artifactDownloadFile", {
                        name: fileLabel(active.path),
                    })}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-caption font-semibold text-ink-secondary hover:border-border-strong hover:bg-surface-muted"
                >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("blog.agentChat.artifactDownload")}
                </button>
            </div>

            <div
                role="tablist"
                aria-label={t("blog.agentChat.artifactFiles")}
                aria-orientation="horizontal"
                className="flex gap-1.5 overflow-x-auto pb-2"
            >
                {files.map((file) => {
                    const current = file.path === active.path;
                    return (
                        <button
                            key={file.path}
                            type="button"
                            role="tab"
                            aria-selected={current}
                            title={file.path}
                            onClick={() => setSelected(file.path)}
                            className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-caption transition ${
                                current
                                    ? "border-accent bg-accent-soft font-semibold text-accent-fg"
                                    : "border-border bg-canvas text-ink-secondary hover:border-border-strong hover:bg-surface-muted"
                            }`}
                        >
                            <span className="max-w-[12rem] truncate">
                                {file.path}
                            </span>
                            {file.path === entry && files.length > 1 ? (
                                <span className="rounded bg-surface px-1 text-micro font-semibold text-ink-muted">
                                    {t("blog.agentChat.artifactEntry")}
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </div>

            <div role="tabpanel" aria-label={active.path}>
                <CodeBlock
                    key={active.path}
                    code={active.content}
                    language={language}
                    appearance="conversation"
                />
            </div>

            {active.truncated ? (
                <div className="mt-2 rounded-lg bg-warning-soft px-3 py-2 text-caption text-warning-fg">
                    {t("blog.agentChat.artifactTruncated")}
                </div>
            ) : null}

            {payload?.runHint ? (
                <div className="mt-2 rounded-xl border border-border bg-surface-muted px-3 py-2">
                    <div className="text-micro font-semibold uppercase tracking-wide text-ink-muted">
                        {t("blog.agentChat.artifactRunHint")}
                    </div>
                    <div className="mt-0.5 break-words font-mono text-caption text-ink-secondary">
                        {payload.runHint}
                    </div>
                </div>
            ) : null}
        </section>
    );
};

export default ArtifactCard;
