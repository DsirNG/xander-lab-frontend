import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Type, Eye, Edit3, Info } from 'lucide-react';
import BlogMarkdown from './BlogMarkdown';
import BlogTipTapEditor from './BlogTipTapEditor';

/**
 * 博客发布页内容编辑区：标题、TipTap 编辑器、预览切换
 */
const PublishEditor = forwardRef(({ t, isPreview, onEditMode, onPreviewMode, title, onTitleChange, content, onContentChange, disabled }, forwardedRef) => {
    const editorRef = useRef(null);

    useImperativeHandle(forwardedRef, () => ({
        focus: () => editorRef.current?.focus(),
    }), []);

    return (
        <>
            <div className="absolute top-3 right-3 sm:top-6 sm:right-8 z-20">
                <div className="flex bg-surface-muted/80 backdrop-blur-md p-1 rounded-2xl border border-border/50 shadow-sm">
                    <button
                        onClick={onEditMode}
                        className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl text-caption font-black uppercase tracking-widest transition-all ${!isPreview ? 'bg-canvas text-accent shadow-sm scale-100' : 'text-ink-muted hover:text-ink-secondary hover:bg-surface-muted/50 '}`}
                    >
                        <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">{t('blog.edit', 'Edit')}</span>
                    </button>
                    <button
                        onClick={onPreviewMode}
                        className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl text-caption font-black uppercase tracking-widest transition-all ${isPreview ? 'bg-canvas text-accent shadow-sm scale-100' : 'text-ink-muted hover:text-ink-secondary hover:bg-surface-muted/50 '}`}
                    >
                        <Eye className="w-4 h-4" /> <span className="hidden sm:inline">{t('blog.preview', 'Preview')}</span>
                    </button>
                </div>
            </div>

            <div className="relative group">
                {!isPreview && (
                    <div className="absolute -left-10 top-5 text-border-strong pointer-events-none transition-colors group-focus-within:text-accent">
                        <Type className="w-6 h-6" />
                    </div>
                )}
                <textarea
                    value={title}
                    onChange={e => onTitleChange(e.target.value)}
                    placeholder={t('blog.titlePlaceholder')}
                    rows={1}
                    className={`w-full text-3xl sm:text-4xl md:text-5xl font-black bg-transparent border-none outline-none text-ink resize-none break-words ${isPreview ? 'hidden' : 'placeholder:text-border-strong'}`}
                    onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                />
            </div>

            <div className={`flex-1 relative group ${isPreview ? 'hidden' : 'flex'}`}>
                <div className="w-full">
                    <BlogTipTapEditor
                        ref={editorRef}
                        value={content}
                        onChange={onContentChange}
                        placeholder={t('blog.contentPlaceholder')}
                        disabled={disabled}
                    />
                </div>
            </div>

            {isPreview && (
                <div className="prose max-w-none pt-2 mb-20">
                    {title && (
                        <h1 className="text-4xl md:text-5xl font-black mb-12 text-ink leading-tight">
                            {title}
                        </h1>
                    )}
                    {content ? (
                        <BlogMarkdown content={content} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-40 text-ink-faint">
                            <Info className="w-16 h-16 mb-6 opacity-30" />
                            <p className="text-sm font-bold uppercase tracking-widest italic">{t('blog.noContent', 'No content yet')}</p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
});

PublishEditor.displayName = 'PublishEditor';

export default PublishEditor;