import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Code2, Edit3, Eye, FileCode2, Heading1, Heading2, ImagePlus, Info, List, ListTodo, Minus, Quote, Table2, Type
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import useIsMobile from '@hooks/useIsMobile';
import BlogMarkdown from './BlogMarkdown';
import BlogImageLibraryModal from './BlogImageLibraryModal';

const codeFence = String.fromCharCode(96).repeat(3);
const blockMarkerPattern = /^(?:#{1,6}\s+|>\s+|- \[[ xX]\]\s+|-\s+)/;

const formatActions = [
    { key: 'text', icon: Type, prefix: '' },
    { key: 'h1', icon: Heading1, prefix: '# ' },
    { key: 'h2', icon: Heading2, prefix: '## ' },
    { key: 'todo', icon: ListTodo, prefix: '- [ ] ' },
    { key: 'list', icon: List, prefix: '- ' },
    { key: 'quote', icon: Quote, prefix: '> ' },
    { key: 'code', icon: Code2, code: true },
];

const insertActions = [
    { key: 'imageGif', icon: ImagePlus, image: true },
    { key: 'divider', icon: Minus, markdown: '\n\n---\n\n' },
    { key: 'table', icon: Table2, markdown: '\n\n| 标题 | 内容 |\n| --- | --- |\n|  |  |\n\n' },
    { key: 'codeBlock', icon: FileCode2, markdown: `\n\n${codeFence}\n\n${codeFence}\n\n`, cursorBack: codeFence.length + 3 },
    { key: 'quoteBlock', icon: Quote, markdown: '\n\n> \n\n', cursorBack: 2 },
];

const imageAltFromName = (name) => name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'image';

/**
 * 博客发布页编辑区：桌面端 Markdown 与预览双栏，移动端模式切换。
 */
const PublishEditor = forwardRef(({ isPreview, onEditMode, onPreviewMode, title, onTitleChange, content, onContentChange, disabled }, forwardedRef) => {
    const { t } = useTranslation();
    const toast = useToast();
    const isMobile = useIsMobile();

    const textareaRef = useRef(null);
    const previewScrollRef = useRef(null);
    const syncLockRef = useRef(false);
    const valueRef = useRef(content);
    const selectionRef = useRef({ start: 0, end: 0 });
    const librarySelectionRef = useRef({ start: 0, end: 0 });
    const libraryViewportRef = useRef({ windowY: 0, editorY: 0 });
    const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);
    const lineCount = content ? content.split(/\r?\n/).length : 0;

    const syncScroll = (source, target) => {
        if (!source || !target || syncLockRef.current) return;
        const sourceMax = source.scrollHeight - source.clientHeight;
        const targetMax = target.scrollHeight - target.clientHeight;
        if (sourceMax <= 0 || targetMax <= 0) return;
        syncLockRef.current = true;
        target.scrollTop = (source.scrollTop / sourceMax) * targetMax;
        requestAnimationFrame(() => { syncLockRef.current = false; });
    };

    useImperativeHandle(forwardedRef, () => textareaRef.current, []);

    useEffect(() => {
        valueRef.current = content;
    }, [content]);

    const rememberSelection = (textarea = textareaRef.current) => {
        if (!textarea) return;
        selectionRef.current = {
            start: textarea.selectionStart ?? 0,
            end: textarea.selectionEnd ?? textarea.selectionStart ?? 0,
        };
    };

    const restoreSelection = (start, end = start) => {
        selectionRef.current = { start, end };
        requestAnimationFrame(() => {
            const textarea = textareaRef.current;
            textarea?.focus({ preventScroll: true });
            textarea?.setSelectionRange(start, end);
        });
    };

    const replaceRange = (start, end, replacement, nextSelection) => {
        const currentValue = valueRef.current;
        const nextValue = `${currentValue.slice(0, start)}${replacement}${currentValue.slice(end)}`;
        valueRef.current = nextValue;
        onContentChange(nextValue);
        restoreSelection(nextSelection.start, nextSelection.end);
    };

    const getFormattingRange = () => {
        const currentValue = valueRef.current;
        const { start, end } = selectionRef.current;
        if (start !== end) return { start, end, selected: true, cursor: start };

        const lineStart = currentValue.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
        const nextLineBreak = currentValue.indexOf('\n', start);
        return {
            start: lineStart,
            end: nextLineBreak === -1 ? currentValue.length : nextLineBreak,
            selected: false,
            cursor: start,
        };
    };

    const applyLineFormat = (prefix) => {
        const currentValue = valueRef.current;
        const range = getFormattingRange();
        const target = currentValue.slice(range.start, range.end);
        const lines = target.split('\n');
        const firstLineMarkerLength = lines[0].match(blockMarkerPattern)?.[0].length ?? 0;
        const replacement = lines
            .map((line) => `${prefix}${line.replace(blockMarkerPattern, '')}`)
            .join('\n');

        if (range.selected) {
            replaceRange(range.start, range.end, replacement, {
                start: range.start,
                end: range.start + replacement.length,
            });
            return;
        }

        const cursorInLine = range.cursor - range.start;
        const nextCursor = range.start + prefix.length + Math.max(0, cursorInLine - firstLineMarkerLength);
        replaceRange(range.start, range.end, replacement, { start: nextCursor, end: nextCursor });
    };

    const applyCodeFormat = () => {
        const currentValue = valueRef.current;
        const range = getFormattingRange();
        const target = currentValue.slice(range.start, range.end);
        const replacement = `${codeFence}\n${target}\n${codeFence}`;
        const contentStart = range.start + codeFence.length + 1;

        if (range.selected) {
            replaceRange(range.start, range.end, replacement, {
                start: contentStart,
                end: contentStart + target.length,
            });
            return;
        }

        const nextCursor = contentStart + Math.max(0, range.cursor - range.start);
        replaceRange(range.start, range.end, replacement, { start: nextCursor, end: nextCursor });
    };

    const insertAtSelection = (markdown, cursorBack = 0) => {
        const { start, end } = selectionRef.current;
        const nextCursor = start + markdown.length - cursorBack;
        replaceRange(start, end, markdown, { start: nextCursor, end: nextCursor });
    };

    const prepareToolbarAction = (event) => {
        event.preventDefault();
        rememberSelection();
    };

    const openImageLibrary = () => {
        librarySelectionRef.current = { ...selectionRef.current };
        libraryViewportRef.current = {
            windowY: window.scrollY,
            editorY: textareaRef.current?.scrollTop ?? 0,
        };
        setIsImageLibraryOpen(true);
    };

    const insertLibraryImage = (image) => {
        const viewport = libraryViewportRef.current;
        selectionRef.current = librarySelectionRef.current;
        const alt = imageAltFromName(image.originalName).replaceAll('[', '').replaceAll(']', '').replace(/\r?\n/g, ' ');
        insertAtSelection(`\n\n![${alt}](${image.url})\n\n`);
        setIsImageLibraryOpen(false);
        toast.success(t('blog.media.imageInserted'));
        requestAnimationFrame(() => {
            if (textareaRef.current) textareaRef.current.scrollTop = viewport.editorY;
            window.scrollTo({ top: viewport.windowY, behavior: 'auto' });
        });
    };

    const toolItemClass = useCallback((isActive) => (
        `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${isActive ? 'bg-accent/10 text-accent' : 'text-ink-muted hover:bg-accent/10 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40'}`
    ), []);

    const renderToolbar = () => (
        <div className="flex flex-wrap items-center gap-1">
            {formatActions.map(({ key, icon: Icon, prefix, code }) => (
                <button
                    key={key}
                    type="button"
title={t(`blog.editor.${key}`)}
                    aria-label={t(`blog.editor.${key}`)}
                    disabled={disabled}
                    onMouseDown={prepareToolbarAction}
                    onClick={() => (code ? applyCodeFormat() : applyLineFormat(prefix))}
                    className={toolItemClass(false)}
                >
                    <Icon className="h-4 w-4 shrink-0" />
                </button>
            ))}
            <span className="mx-1 h-5 w-px bg-border" />
            {insertActions.map(({ key, icon: Icon, markdown, cursorBack, image }) => (
                <button
                    key={key}
                    type="button"
title={t(`blog.editor.${key}`)}
                    aria-label={t(`blog.editor.${key}`)}
                    disabled={disabled}
                    onMouseDown={prepareToolbarAction}
                    onClick={() => (image ? openImageLibrary() : insertAtSelection(markdown, cursorBack))}
                    className={toolItemClass(false)}
                >
                    <Icon className="h-4 w-4 shrink-0" />
                </button>
            ))}
        </div>
    );

    const renderPreview = () => (
        <article className="prose mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
            {title && (
                <div className="mb-10 text-3xl font-bold leading-tight text-ink sm:text-4xl">
                    {title}
                </div>
            )}
            {content ? (
                <BlogMarkdown content={content} />
            ) : (
                <div className="flex min-h-[45vh] flex-col items-center justify-center text-ink-faint">
                    <Info className="mb-4 h-10 w-10 opacity-30" />
                    <div className="text-caption font-semibold">{t('blog.noContent', 'No content yet')}</div>
                </div>
            )}
        </article>
    );

    const renderEditor = () => (
        <section className="relative flex h-full min-h-0 flex-col bg-canvas">
            <div className="z-10 shrink-0 border-b border-border px-4 py-2">
                {renderToolbar()}
            </div>
            <textarea
                ref={textareaRef}
                disabled={disabled}
                value={content}
                onChange={(event) => {
                    valueRef.current = event.target.value;
                    onContentChange(event.target.value);
                    rememberSelection(event.target);
                }}
                onSelect={(event) => rememberSelection(event.currentTarget)}
                onClick={(event) => rememberSelection(event.currentTarget)}
                onKeyUp={(event) => rememberSelection(event.currentTarget)}
                onScroll={(event) => syncScroll(event.currentTarget, previewScrollRef.current)}
                placeholder={t('blog.contentPlaceholder')}
                className="min-h-0 flex-1 resize-none border-none bg-canvas px-5 py-6 font-mono text-sm leading-7 text-ink outline-none placeholder:text-ink-faint sm:px-8"
            />
            <div className="flex h-9 shrink-0 items-center justify-between border-t border-border bg-surface-muted/50 px-4 text-micro text-ink-faint">
                <div className="flex items-center gap-5">
                    <span>{t('blog.editor.characters', { count: content.length })}</span>
                    <span>{t('blog.editor.lines', { count: lineCount })}</span>
                </div>
                <span>{t('blog.editor.markdownFormat')}</span>
            </div>
        </section>
    );

    return (
        <>
            <div className="flex h-full min-h-0 flex-col">
                <div className="flex min-h-16 shrink-0 items-center gap-3 border-b border-border bg-canvas px-4 sm:px-6">
                    <textarea
                        value={title}
                        onChange={e => onTitleChange(e.target.value)}
                        placeholder={t('blog.titlePlaceholder')}
                        rows={1}
                        className="min-w-0 flex-1 resize-none overflow-hidden border-none bg-transparent text-xl font-semibold text-ink outline-none placeholder:text-ink-faint sm:text-2xl"
                    />
                    {isMobile && <div className="flex shrink-0 bg-surface-muted p-1 rounded-lg border border-border">
                        <button
                            onClick={onEditMode}
                            title={t('blog.edit', 'Edit')}
                            className={`flex h-11 w-11 items-center justify-center rounded-md transition-colors ${!isPreview ? 'bg-canvas text-accent shadow-sm' : 'text-ink-muted'}`}
                        >
                            <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onPreviewMode}
                            title={t('blog.preview', 'Preview')}
                            className={`flex h-11 w-11 items-center justify-center rounded-md transition-colors ${isPreview ? 'bg-canvas text-accent shadow-sm' : 'text-ink-muted'}`}
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                    </div>}
                </div>
                <div className="min-h-0 flex-1">
                    {isMobile ? (isPreview ? <section className="flex h-full min-h-0 flex-col bg-surface"><div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">{renderPreview()}</div><div className="flex h-9 shrink-0 items-center justify-end border-t border-border bg-surface-muted/50 px-4 text-micro text-ink-faint">{t('blog.editor.previewMode')}</div></section> : renderEditor()) : (
                        <div className="grid h-full min-h-0 grid-cols-2">
                            {renderEditor()}
                            <section className="flex min-h-0 flex-col border-l border-border bg-surface">
                                <div ref={previewScrollRef} onScroll={(event) => syncScroll(event.currentTarget, textareaRef.current)} className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">{renderPreview()}</div>
                                <div className="flex h-9 shrink-0 items-center justify-end border-t border-border bg-surface-muted/50 px-4 text-micro text-ink-faint">{t('blog.editor.previewMode')}</div>
                            </section>
                        </div>
                    )}
                </div>
            </div>

            <BlogImageLibraryModal
                isOpen={isImageLibraryOpen}
                onClose={() => setIsImageLibraryOpen(false)}
                onInsert={insertLibraryImage}
            />
        </>
    );
});

PublishEditor.displayName = 'PublishEditor';

export default PublishEditor;
