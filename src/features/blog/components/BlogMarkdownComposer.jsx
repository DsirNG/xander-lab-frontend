import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Code2, FileCode2, Heading1, Heading2, ImagePlus, List, ListTodo, Loader2, Minus, PanelLeftClose, PanelLeftOpen, Quote, Table2, Type, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { upload } from '@api/http';
import { useToast } from '@/hooks/useToast';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
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
    { key: 'imageGif', icon: ImagePlus },
    { key: 'video', icon: Video, disabled: true },
    { key: 'divider', icon: Minus, markdown: '\n\n---\n\n' },
    { key: 'table', icon: Table2, markdown: '\n\n| 标题 | 内容 |\n| --- | --- |\n|  |  |\n\n' },
    { key: 'codeBlock', icon: FileCode2, markdown: `\n\n${codeFence}\n\n${codeFence}\n\n`, cursorBack: codeFence.length + 3 },
    { key: 'quoteBlock', icon: Quote, markdown: '\n\n> \n\n', cursorBack: 2 },
];

const imageAltFromName = (name) => name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'image';

const BlogMarkdownComposer = forwardRef(({ value, onChange, placeholder, disabled = false }, forwardedRef) => {
    const { t } = useTranslation();
    const toast = useToast();
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const valueRef = useRef(value);
    const selectionRef = useRef({ start: 0, end: 0 });
    const [uploading, setUploading] = useState(false);
    const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);

    useImperativeHandle(forwardedRef, () => textareaRef.current);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

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
            textarea?.focus();
            textarea?.setSelectionRange(start, end);
        });
    };

    const replaceRange = (start, end, replacement, nextSelection) => {
        const currentValue = valueRef.current;
        const nextValue = `${currentValue.slice(0, start)}${replacement}${currentValue.slice(end)}`;
        valueRef.current = nextValue;
        onChange(nextValue);
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

    const handleImageUpload = async (file) => {
        if (!file || !SUPPORTED_IMAGE_TYPES.has(file.type)) {
            toast.warning(t('blog.media.invalidImage'));
            return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            toast.warning(t('blog.media.imageTooLarge'));
            return;
        }

        const insertionSelection = { ...selectionRef.current };
        setUploading(true);
        try {
            const uploaded = await upload('/api/upload/oss?type=photo', file);
            selectionRef.current = insertionSelection;
            const alt = imageAltFromName(file.name).replaceAll('[', '').replaceAll(']', '').replace(/\r?\n/g, ' ');
            insertAtSelection(`\n\n![${alt}](${uploaded.url})\n\n`);
            toast.success(t('blog.media.imageInserted'));
        } catch (error) {
            toast.error(error.message || t('blog.media.imageUploadFailed'));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <aside className={`fixed left-3 top-1/2 z-50 flex max-h-[calc(100dvh-6rem)] -translate-y-1/2 flex-col gap-1 overflow-y-auto rounded-xl border border-slate-200 bg-white/95 p-1 shadow-xl backdrop-blur transition-[width] duration-200 ${isToolbarExpanded ? 'w-44' : 'w-10'}`}>
                <button
                    type="button"
                    title={t('blog.editor.toolbar')}
                    aria-label={t('blog.editor.toolbar')}
                    aria-expanded={isToolbarExpanded}
                    onMouseDown={prepareToolbarAction}
                    onClick={() => setIsToolbarExpanded((current) => !current)}
                    className={`flex h-8 w-full shrink-0 items-center gap-2 rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 ${isToolbarExpanded ? 'justify-start px-2' : 'justify-center'}`}
                >
                    {isToolbarExpanded ? <PanelLeftClose className="h-4 w-4 shrink-0" /> : <PanelLeftOpen className="h-4 w-4 shrink-0" />}
                    {isToolbarExpanded && <span className="truncate text-xs font-black">{t('blog.editor.toolbar')}</span>}
                </button>

                <span className="mx-1 my-0.5 h-px shrink-0 bg-slate-200" />

                {formatActions.map(({ key, icon: Icon, prefix, code }) => (
                    <button
                        key={key}
                        type="button"
                        title={t(`blog.editor.${key}`)}
                        aria-label={t(`blog.editor.${key}`)}
                        disabled={disabled}
                        onMouseDown={prepareToolbarAction}
                        onClick={() => code ? applyCodeFormat() : applyLineFormat(prefix)}
                        className={`flex h-8 w-full shrink-0 items-center gap-2 rounded-lg text-slate-500 transition hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 ${isToolbarExpanded ? 'justify-start px-2' : 'justify-center'}`}
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                        {isToolbarExpanded && <span className="truncate text-xs font-semibold">{t(`blog.editor.${key}`)}</span>}
                    </button>
                ))}

                <span className="mx-1 my-0.5 h-px bg-slate-200" />

                {insertActions.map(({ key, icon: Icon, markdown, cursorBack, disabled: actionDisabled }) => (
                    <button
                        key={key}
                        type="button"
                        title={t(`blog.editor.${key}`)}
                        aria-label={t(`blog.editor.${key}`)}
                        disabled={disabled || uploading || actionDisabled}
                        onMouseDown={prepareToolbarAction}
                        onClick={() => key === 'imageGif' ? fileInputRef.current?.click() : insertAtSelection(markdown, cursorBack)}
                        className={`flex h-8 w-full shrink-0 items-center gap-2 rounded-lg text-slate-500 transition hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 ${isToolbarExpanded ? 'justify-start px-2' : 'justify-center'}`}
                    >
                        {key === 'imageGif' && uploading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Icon className="h-4 w-4 shrink-0" />}
                        {isToolbarExpanded && <span className="truncate text-xs font-semibold">{t(`blog.editor.${key}`)}</span>}
                    </button>
                ))}
            </aside>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(event) => {
                    handleImageUpload(event.target.files?.[0]);
                    event.target.value = '';
                }}
            />

            <textarea
                ref={textareaRef}
                disabled={disabled}
                readOnly={uploading}
                value={value}
                onChange={(event) => {
                    valueRef.current = event.target.value;
                    onChange(event.target.value);
                    rememberSelection(event.target);
                }}
                onSelect={(event) => rememberSelection(event.currentTarget)}
                onClick={(event) => rememberSelection(event.currentTarget)}
                onKeyUp={(event) => rememberSelection(event.currentTarget)}
                placeholder={placeholder}
                className="mb-20 h-full min-h-[60vh] w-full resize-none border-none bg-transparent text-lg font-medium leading-[1.8] text-slate-700 outline-none placeholder:text-slate-300"
            />
        </div>
    );
});

BlogMarkdownComposer.displayName = 'BlogMarkdownComposer';

export default BlogMarkdownComposer;
