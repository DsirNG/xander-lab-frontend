import React from 'react';
import { Send, Save, ChevronLeft, Loader2, Settings, X } from 'lucide-react';
import Button from '@/components/common/Button';

/**
 * 博客发布页顶栏：返回、保存草稿、设置开关、发布按钮
 */
const PublishHeader = ({ t, isEditMode, loading, isSettingsOpen, draftStatus, showDraftStatus, onBack, onSaveDraft, onToggleSettings, onPublish }) => {
    return (
        <header className="h-14 shrink-0 border-b border-border flex items-center justify-between gap-2 px-3 sm:px-5 bg-canvas z-20 relative">
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                <Button
                    onClick={onBack}
                    variant="ghost"
                    size="md"
                    className="flex w-10 px-0 items-center justify-center rounded-lg transition-colors"
                    title={isEditMode ? t('blog.backToManage') : t('blog.backToBlog')}
                >
                    <ChevronLeft className="w-5 h-5 transition-transform" />
                </Button>
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
                <Button
                    onClick={onSaveDraft}
                    disabled={loading}
                    title={t('blog.saveDraft')}
                    variant="ghost"
                    size="md"
                    className="flex w-10 px-0 sm:w-auto sm:px-3 text-caption font-semibold hover:text-ink transition-colors items-center justify-center gap-2 rounded-lg disabled:opacity-50"
                >
                    <Save className="w-4 h-4" /> <span className="hidden md:inline">{t('blog.saveDraft')}</span>
                </Button>
                <Button
                    onClick={onToggleSettings}
                    variant="ghost"
                    size="md"
                    className={`flex w-10 px-0 items-center justify-center rounded-lg transition-colors ${isSettingsOpen ? 'bg-accent-soft text-accent' : 'hover:text-ink'}`}
                    title={t('blog.publishSettings', 'Document Settings')}
                >
                    {isSettingsOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                </Button>
                <Button
                    onClick={onPublish}
                    disabled={loading}
                    variant="ink"
                    size="md"
                    className="flex items-center gap-2 rounded-lg px-2.5 sm:px-4 text-caption font-semibold transition-colors hover:bg-accent disabled:opacity-50"
                >
                    {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {t('blog.publishing')}</>
                    ) : (
                        <><Send className="w-4 h-4" /> {t('blog.publishNow')}</>
                    )}
                </Button>
            </div>
        </header>
    );
};

export default PublishHeader;
