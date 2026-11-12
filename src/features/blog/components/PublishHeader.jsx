import React from "react";
import { Send, Save, ChevronLeft, Settings, X } from "lucide-react";
import Button from "@shared/ui/primitives/Button";

/**
 * 博客发布页顶栏：返回、保存草稿、设置开关、发布按钮
 */
const PublishHeader = ({
    t,
    isEditMode,
    loading,
    isSettingsOpen,
    draftStatus,
    showDraftStatus,
    onBack,
    onSaveDraft,
    onToggleSettings,
    onPublish,
}) => {
    return (
        <header className="h-14 shrink-0 border-b border-border flex items-center justify-between gap-2 px-3 sm:px-5 bg-canvas z-20 relative">
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                <Button
                    variant="ghost"
                    icon={ChevronLeft}
                    onClick={onBack}
                    aria-label={t("blog.backToManage")}
                    title={
                        t("blog.backToManage")
                    }
                />
                <div className="hidden sm:block h-4 w-px bg-border"></div>
                <span className="truncate text-sm font-semibold text-ink flex items-center gap-2">
                    {isEditMode ? t("blog.editTitle") : t("blog.publishTitle")}
                </span>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                <span
                    aria-live="polite"
                    className={`max-w-32 truncate text-micro text-ink-faint transition-opacity sm:max-w-none ${showDraftStatus ? "opacity-100" : "opacity-0"}`}
                >
                    {draftStatus === "restored"
                        ? t("blog.draftRestored")
                        : t("blog.draftAutoSaved")}
                </span>
                <Button
                    variant="ghost"
                    icon={Save}
                    onClick={onSaveDraft}
                    disabled={loading}
                    title={t("contentLibrary.saveToLibrary")}
                    aria-label={t("contentLibrary.saveToLibrary")}
                    className="max-md:w-10 max-md:px-0"
                >
                    <span className="hidden md:inline">
                        {t("contentLibrary.saveToLibrary")}
                    </span>
                </Button>
                <Button
                    variant="ghost"
                    icon={isSettingsOpen ? X : Settings}
                    onClick={onToggleSettings}
                    className={isSettingsOpen ? "bg-surface-muted text-ink" : ""}
                    aria-pressed={isSettingsOpen}
                    aria-label={t("blog.publishSettings", "Document Settings")}
                    title={t("blog.publishSettings", "Document Settings")}
                />
                <Button
                    variant="ink"
                    icon={Send}
                    loading={loading}
                    onClick={onPublish}
                >
                    {loading ? t("blog.publishing") : t("blog.publishNow")}
                </Button>
            </div>
        </header>
    );
};

export default PublishHeader;
