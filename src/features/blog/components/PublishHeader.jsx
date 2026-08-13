import React from 'react';
import { Send, Save, ChevronLeft, Loader2, Settings, X } from 'lucide-react';

/**
 * 博客发布页顶栏：返回、保存草稿、设置开关、发布按钮
 */
const PublishHeader = ({ t, isEditMode, loading, isSettingsOpen, draftStatus, showDraftStatus, onBack, onSaveDraft, onToggleSettings, onPublish }) => {
    return (
        <header className="h-14 shrink-0 border-b border-border flex items-center justify-between gap-2 px-3 sm:px-5 bg-canvas z-20 relative">
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                <button
                    onClick={onBack}
                    className="flex h-9 w-9 items-center justify-center text-ink-muted hover:bg-surface-muted rounded-lg transition-colors"
                    title={isEditMode ? t('blog.backToManage') : t('blog.backToBlog')}
                >
                    <ChevronLeft className="w-5 h-5 transition-transform" />
                </button>
                <div className="hidden sm:block h-4 w-px bg-border"></div>
                <span className="truncate text-sm font-semibold text-ink flex items-center gap-2">
                    {isEditMode ? t('blog.editTitle') : t('blog.publishTitle')}
                </span>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                <span
                    aria-live="polite"
                    className={`max-w-32 truncate text-micro text-ink-faint transition-opacity sm:max-w-none ${showDraftStatus ? 'opacity-100' : 'opacity-0'}`}
                >
                    {draftStatus === 'restored' ? t('blog.draftRestored') : t('blog.draftAutoSaved')}
                </span>
                <button
                    onClick={onSaveDraft}
                    disabled={loading}
                    title={t('blog.saveDraft')}
                    className="flex h-9 px-2 sm:px-3 text-caption font-semibold text-ink-muted hover:text-ink transition-colors items-center gap-2 rounded-lg hover:bg-surface-muted disabled:opacity-50"
                >
                    <Save className="w-4 h-4" /> <span className="hidden md:inline">{t('blog.saveDraft')}</span>
                </button>
                <button
                    onClick={onToggleSettings}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${isSettingsOpen ? 'bg-accent-soft text-accent' : 'text-ink-muted hover:bg-surface-muted hover:text-ink'}`}
                    title={t('blog.publishSettings', 'Document Settings')}
                >
                    {isSettingsOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                </button>
                <button
                    onClick={onPublish}
                    disabled={loading}
                    className="flex h-9 items-center gap-2 rounded-lg bg-ink px-3 sm:px-4 text-caption font-semibold text-white transition-colors hover:bg-accent disabled:opacity-50"
                >
                    {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {t('blog.publishing')}</>
                    ) : (
                        <><Send className="w-4 h-4" /> {t('blog.publishNow')}</>
                    )}
                </button>
            </div>
        </header>
    );
};

export default PublishHeader;
