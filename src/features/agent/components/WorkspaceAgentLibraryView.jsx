import {
    ArrowUpRight,
    BookOpen,
    Brain,
    FilePlus2,
    FileText,
    PenLine,
    Sparkles,
    Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const WorkspaceAgentLibraryView = ({
    view,
    files,
    memories,
    locked,
    fileInputRef,
    onChoosePrompt,
    onOpenFile,
    onAskFile,
    onCorrectMemory,
    onDeleteMemory,
    onRecallMemory,
}) => {
    const { t } = useTranslation();

    if (view === "writing") {
        const starters = [
            {
                key: "writeArticle",
                icon: PenLine,
                title: t("workspace.agent.actions.writeArticle"),
                prompt: t("workspace.agent.actions.writeArticle"),
            },
            {
                key: "analyzeDocument",
                icon: FileText,
                title: t("workspace.agent.actions.analyzeDocument"),
                prompt: t("workspace.agent.actions.analyzeDocument"),
            },
            {
                key: "organizeKnowledge",
                icon: BookOpen,
                title: t("workspace.agent.actions.organizeKnowledge"),
                prompt: t("workspace.agent.actions.organizeKnowledge"),
            },
        ];

        return (
            <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-10 sm:px-10">
                <div className="mb-3 flex items-center gap-2 text-caption text-ink-muted">
                    <Sparkles className="h-4 w-4" />
                    {t("workspace.agent.nav.writingEyebrow")}
                </div>
                <div className="max-w-2xl text-display font-semibold tracking-tight text-ink sm:text-[32px]">
                    {t("workspace.agent.nav.writingTitle")}
                </div>
                <div className="mt-3 max-w-xl text-body leading-6 text-ink-muted">
                    {t("workspace.agent.nav.writingHint")}
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {starters.map(({ key, icon: Icon, title, prompt }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onChoosePrompt(prompt)}
                            className="group flex min-h-28 flex-col items-start justify-between rounded-2xl border border-border bg-canvas p-4 text-left transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
                        >
                            <Icon className="h-5 w-5 text-ink-muted transition-colors group-hover:text-ink" />
                            <span className="flex w-full items-center justify-between gap-2 text-body font-medium text-ink">
                                {title}
                                <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-faint transition-colors group-hover:text-ink" />
                            </span>
                        </button>
                    ))}
                </div>
            </section>
        );
    }

    if (view === "documents") {
        return (
            <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-y-auto px-6 py-8 sm:px-10">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <div className="mb-2 text-caption text-ink-muted">
                            {t("workspace.agent.nav.documentsEyebrow")}
                        </div>
                        <div className="text-heading text-ink">
                            {t("workspace.agent.nav.documentsTitle")}
                        </div>
                        <div className="mt-2 max-w-xl text-caption leading-6 text-ink-muted">
                            {t("workspace.agent.nav.documentsHint")}
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled={locked}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-caption font-semibold text-white transition-colors hover:bg-ink-secondary disabled:opacity-50"
                    >
                        <FilePlus2 className="h-4 w-4" />
                        {t("workspace.agent.nav.addDocument")}
                    </button>
                </div>
                {files.length ? (
                    <div className="mt-7 grid gap-3 sm:grid-cols-2">
                        {files.map((file) => (
                            <article
                                key={file.url}
                                className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-canvas p-4"
                            >
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-muted text-ink-secondary">
                                    <FileText className="h-5 w-5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-caption font-semibold text-ink">
                                        {file.name}
                                    </span>
                                    <span className="mt-1 block truncate text-micro text-ink-muted">
                                        {file.contentType ||
                                            t("workspace.agent.nav.conversationFile")}
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onOpenFile(file)}
                                    aria-label={`${t("workspace.agent.openFile")}: ${file.name}`}
                                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink"
                                >
                                    <ArrowUpRight className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    disabled={locked}
                                    onClick={() => onAskFile(file)}
                                    className="shrink-0 rounded-lg border border-border px-3 py-2 text-micro font-medium text-ink hover:bg-surface-muted disabled:opacity-50"
                                >
                                    {t("workspace.agent.askFile")}
                                </button>
                            </article>
                        ))}
                    </div>
                ) : (
                    <button
                        type="button"
                        disabled={locked}
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-7 flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-muted/40 px-6 text-center transition-colors hover:bg-surface-muted"
                    >
                        <FilePlus2 className="h-6 w-6 text-ink-muted" />
                        <span className="mt-3 text-body font-medium text-ink">
                            {t("workspace.agent.nav.emptyDocuments")}
                        </span>
                        <span className="mt-1 max-w-sm text-caption leading-5 text-ink-muted">
                            {t("workspace.agent.nav.documentsHint")}
                        </span>
                    </button>
                )}
            </section>
        );
    }

    return (
        <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-y-auto px-6 py-8 sm:px-10">
            <div className="mb-2 flex items-center gap-2 text-caption text-ink-muted">
                <Brain className="h-4 w-4" />
                {t("workspace.agent.nav.memoryEyebrow")}
            </div>
            <div className="text-heading text-ink">
                {t("workspace.agent.nav.memoryTitle")}
            </div>
            <div className="mt-2 max-w-xl text-caption leading-6 text-ink-muted">
                {t("workspace.agent.memorySourceHint")}
            </div>
            {memories.length ? (
                <div className="mt-7 space-y-3">
                    {memories.map((memory) => (
                        <article
                            key={memory.memoryKey}
                            className="rounded-2xl border border-border bg-canvas p-5"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="text-caption font-semibold text-ink">
                                        {memory.memoryKey}
                                    </div>
                                    <div className="mt-2 whitespace-pre-wrap text-body leading-6 text-ink-secondary">
                                        {memory.content}
                                    </div>
                                    {memory.updatedAt ? (
                                        <div className="mt-3 text-micro text-ink-muted">
                                            {memory.updatedAt}
                                        </div>
                                    ) : null}
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        type="button"
                                        disabled={locked}
                                        onClick={() => onCorrectMemory(memory)}
                                        className="rounded-lg px-3 py-2 text-caption text-ink hover:bg-surface-muted disabled:opacity-50"
                                    >
                                        {t("blog.edit")}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={locked}
                                        onClick={() => onDeleteMemory(memory)}
                                        aria-label={`${t("common.delete")}: ${memory.memoryKey}`}
                                        className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink disabled:opacity-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="mt-7 flex min-h-52 flex-col items-start justify-center rounded-2xl border border-dashed border-border-strong bg-surface-muted/40 px-6">
                    <Brain className="h-6 w-6 text-ink-muted" />
                    <div className="mt-3 text-body font-medium text-ink">
                        {t("workspace.agent.nav.emptyMemory")}
                    </div>
                    <div className="mt-1 max-w-md text-caption leading-5 text-ink-muted">
                        {t("workspace.agent.nav.memoryHint")}
                    </div>
                    <button
                        type="button"
                        disabled={locked}
                        onClick={onRecallMemory}
                        className="mt-4 rounded-xl bg-ink px-4 py-2.5 text-caption font-semibold text-white hover:bg-ink-secondary disabled:opacity-50"
                    >
                        {t("workspace.agent.nav.recallMemory")}
                    </button>
                </div>
            )}
        </section>
    );
};

export default WorkspaceAgentLibraryView;
