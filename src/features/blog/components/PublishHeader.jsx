import React from 'react';
import { Send, Save, ChevronLeft, Loader2, Settings, X } from 'lucide-react';

/**
 * 博客发布页顶栏：返回、保存草稿、设置开关、发布按钮
 */
const PublishHeader = ({ t, isEditMode, loading, isSettingsOpen, onBack, onSaveDraft, onToggleSettings, onPublish }) => {
    return (
        <header className="h-16 shrink-0 border-b border-border/60 flex items-center justify-between gap-2 px-3 sm:px-6 bg-canvas z-20 shadow-sm relative">
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-ink-faint hover:bg-surface-muted rounded-xl transition-all group"
                    title={isEditMode ? t('blog.backToManage') : t('blog.backToBlog')}
                >
                    <ChevronLeft className="w-5 h-5 transition-transform" />
                </button>
                <div className="hidden sm:block h-4 w-px bg-border"></div>
                <span className="truncate text-xs font-black uppercase tracking-widest text-ink flex items-center gap-2">
                    {isEditMode ? t('blog.editTitle') : t('blog.publishTitle')}
                </span>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                <button
                    onClick={onSaveDraft}
                    disabled={loading}
                    title={t('blog.saveDraft')}
                    className="flex p-2 sm:px-5 text-xs font-bold text-ink-muted hover:text-ink transition-colors items-center gap-2 rounded-xl hover:bg-surface-muted disabled:opacity-50"
                >
                    <Save className="w-4 h-4" /> <span className="hidden md:inline">{t('blog.saveDraft')}</span>
                </button>
                <button
                    onClick={onToggleSettings}
                    className="lg:hidden p-2 text-ink-muted hover:text-accent hover:bg-surface-muted rounded-xl transition-all"
                    title={t('blog.publishSettings', 'Document Settings')}
                >
                    {isSettingsOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                </button>
                <button
                    onClick={onPublish}
                    disabled={loading}
                    className="px-3 sm:px-6 py-2 bg-ink hover:bg-accent text-white rounded-xl text-xs font-black shadow-lg shadow-accent/0 hover:shadow-accent/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
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
