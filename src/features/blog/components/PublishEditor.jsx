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
    { key: 'table', icon: Table2, markdown: '\n\n| 鏍囬 | 鍐呭 |\n| --- | --- |\n|  |  |\n\n' },
    { key: 'codeBlock', icon: FileCode2, markdown: `\n\n${codeFence}\n\n${codeFence}\n\n`, cursorBack: codeFence.length + 3 },
    { key: 'quoteBlock', icon: Quote, markdown: '\n\n> \n\n', cursorBack: 2 },
];

const imageAltFromName = (name) => name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'image';

/**
 * 鍗氬鍙戝竷椤靛唴瀹圭紪杈戝尯锛氭爣棰樸€丮arkdown 缂栬緫鍣紙妗岄潰宸﹀彸鍒嗘爮瀹炴椂棰勮锛夈€佺Щ鍔ㄧ棰勮鍒囨崲
 */
const PublishEditor = forwardRef(({ isPreview, onEditMode, onPreviewMode, title, onTitleChange, content, onContentChange, disabled }, forwardedRef) => {
    const { t } = useTranslation();
    const toast = useToast();
    const isMobile = useIsMobile();

    const textareaRef = useRef(null);
    const valueRef = useRef(content);
    const selectionRef = useRef({ start: 0, end: 0 });
    const librarySelectionRef = useRef({ start: 0, end: 0 });
    const libraryViewportRef = useRef({ windowY: 0, editorY: 0 });
    const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);

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
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-surface-muted/60 p-1">
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
        <div className={`prose max-w-none ${isMobile ? 'pt-2 mb-20' : 'pt-1 pr-4'}`}>
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
    );

    return (
        <>
            {isMobile && (
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
            )}

            <div className="relative group">
                <div className="absolute -left-10 top-5 text-border-strong pointer-events-none transition-colors group-focus-within:text-accent">
                    <Type className="w-6 h-6" />
                </div>
                <textarea
                    value={title}
                    onChange={e => onTitleChange(e.target.value)}
                    placeholder={t('blog.titlePlaceholder')}
                    rows={1}
                    className={`w-full text-3xl sm:text-4xl md:text-5xl font-black bg-transparent border-none outline-none text-ink resize-none break-words ${isMobile && isPreview ? 'hidden' : 'placeholder:text-border-strong'}`}
                    onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                />
            </div>

            {isMobile ? (
                isPreview ? (
                    renderPreview()
                ) : (
                    <div className="flex-1 relative group flex flex-col gap-3">
                        {renderToolbar()}
                        <div className="w-full">
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
                                placeholder={t('blog.contentPlaceholder')}
                                className="min-h-[60vh] w-full resize-none border-none bg-transparent text-lg font-medium leading-[1.8] text-ink-secondary outline-none placeholder:text-ink-faint"
                            />
                        </div>
                    </div>
                )
            ) : (
                <div className={`flex-1 relative group grid grid-cols-2 gap-10 ${isPreview ? 'hidden' : 'grid'}`}>
                    <div className="flex flex-col gap-3 min-w-0">
                        {renderToolbar()}
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
                            placeholder={t('blog.contentPlaceholder')}
                            className="min-h-[60vh] w-full resize-none border-none bg-transparent text-lg font-medium leading-[1.8] text-ink-secondary outline-none placeholder:text-ink-faint"
                        />
                    </div>
                    <div className="sticky top-0 self-start max-h-[calc(100dvh-13rem)] overflow-y-auto custom-scrollbar border-l border-border pl-6">
                        {renderPreview()}
                    </div>
                </div>
            )}

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
