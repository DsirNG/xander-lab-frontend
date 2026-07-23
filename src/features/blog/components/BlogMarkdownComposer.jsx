import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Code2, FileCode2, Heading1, Heading2, ImagePlus, List, ListTodo, Loader2, Minus, Plus, Quote, Table2, Type, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { upload } from '@api/http';
import { useToast } from '@/hooks/useToast';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const codeFence = String.fromCharCode(96).repeat(3);

const textBlocks = [
    { key: 'text', icon: Type, markdown: '' },
    { key: 'h1', icon: Heading1, markdown: '# ' },
    { key: 'h2', icon: Heading2, markdown: '## ' },
    { key: 'todo', icon: ListTodo, markdown: '- [ ] ' },
    { key: 'list', icon: List, markdown: '- ' },
    { key: 'quote', icon: Quote, markdown: '> ' },
    { key: 'code', icon: Code2, markdown: `${codeFence}\n\n${codeFence}` },
];

const contentBlocks = [
    { key: 'imageGif', icon: ImagePlus },
    { key: 'video', icon: Video, disabled: true },
    { key: 'divider', icon: Minus, markdown: '---' },
    { key: 'table', icon: Table2, markdown: '| 标题 | 内容 |\n| --- | --- |\n|  |  |' },
    { key: 'codeBlock', icon: FileCode2, markdown: `${codeFence}\n\n${codeFence}` },
    { key: 'quoteBlock', icon: Quote, markdown: '> ' },
];

const imageAltFromName = (name) => name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'image';

const BlogMarkdownComposer = forwardRef(({ value, onChange, placeholder, disabled = false }, forwardedRef) => {
    const { t } = useTranslation();
    const toast = useToast();
    const textareaRef = useRef(null);
    const rootRef = useRef(null);
    const fileInputRef = useRef(null);
    const hoverOffsetRef = useRef(null);
    const hoverExitTimerRef = useRef(null);
    const valueRef = useRef(value);
    const [isFocused, setIsFocused] = useState(false);
    const [isInteractionActive, setIsInteractionActive] = useState(false);
    const [uploading, setUploading] = useState(false);

    useImperativeHandle(forwardedRef, () => textareaRef.current);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => () => window.clearTimeout(hoverExitTimerRef.current), []);

    useEffect(() => {
        if (!isInteractionActive) return undefined;
        const preventWheel = (event) => event.preventDefault();
        document.addEventListener('wheel', preventWheel, { capture: true, passive: false });
        return () => document.removeEventListener('wheel', preventWheel, { capture: true });
    }, [isInteractionActive]);

    const getLineStartAtPointer = (clientY) => {
        const textarea = textareaRef.current;
        const currentValue = valueRef.current;
        if (!textarea) return currentValue.length;
        const rect = textarea.getBoundingClientRect();
        const lineHeight = Number.parseFloat(window.getComputedStyle(textarea).lineHeight) || 32;
        const lineIndex = Math.max(0, Math.floor((clientY - rect.top + textarea.scrollTop) / lineHeight));
        let offset = 0;
        for (let index = 0; index < lineIndex; index += 1) {
            const nextLine = currentValue.indexOf('\n', offset);
            if (nextLine === -1) return currentValue.length;
            offset = nextLine + 1;
        }
        return offset;
    };

    const updateCursorAnchor = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const lineHeight = Number.parseFloat(window.getComputedStyle(textarea).lineHeight) || 32;
        const cursor = textarea.selectionStart || 0;
        const lineIndex = (valueRef.current.slice(0, cursor).match(/\n/g) || []).length;
        rootRef.current?.style.setProperty('--markdown-toolbar-top', `${Math.max(6, lineIndex * lineHeight - textarea.scrollTop + 4)}px`);
    };

    const insertMarkdown = (markdown) => {
        const textarea = textareaRef.current;
        const currentValue = valueRef.current;
        const hoveredStart = hoverOffsetRef.current;
        const start = hoveredStart ?? textarea?.selectionStart ?? currentValue.length;
        const end = hoveredStart ?? textarea?.selectionEnd ?? start;
        const before = currentValue.slice(0, start);
        const after = currentValue.slice(end);
        const prefix = before && !before.endsWith('\n\n') ? '\n\n' : '';
        const suffix = after && !after.startsWith('\n\n') ? '\n\n' : '';
        const inserted = `${prefix}${markdown}${suffix}`;
        onChange(`${before}${inserted}${after}`);
        setIsInteractionActive(false);
        requestAnimationFrame(() => {
            textarea?.focus();
            const nextCursor = start + prefix.length + markdown.length;
            textarea?.setSelectionRange(nextCursor, nextCursor);
            updateCursorAnchor();
        });
    };

    const beginInteraction = () => {
        window.clearTimeout(hoverExitTimerRef.current);
        setIsInteractionActive(true);
    };

    const scheduleInteractionClose = () => {
        window.clearTimeout(hoverExitTimerRef.current);
        hoverExitTimerRef.current = window.setTimeout(() => setIsInteractionActive(false), 120);
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

        setUploading(true);
        try {
            const uploaded = await upload('/api/upload/oss?type=photo', file);
            const alt = imageAltFromName(file.name).replaceAll('[', '').replaceAll(']', '').replace(/\r?\n/g, ' ');
            insertMarkdown(`![${alt}](${uploaded.url})`);
            toast.success(t('blog.media.imageInserted'));
        } catch (error) {
            toast.error(error.message || t('blog.media.imageUploadFailed'));
        } finally {
            setUploading(false);
        }
    };

    const handlePointerMove = (event) => {
        hoverOffsetRef.current = getLineStartAtPointer(event.clientY);
        const rootTop = rootRef.current?.getBoundingClientRect().top ?? event.clientY;
        rootRef.current?.style.setProperty('--markdown-toolbar-top', `${Math.max(6, event.clientY - rootTop - 13)}px`);
        beginInteraction();
    };

    const showPlus = isInteractionActive || isFocused;

    return (
        <div ref={rootRef} className="relative w-full">
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => { handleImageUpload(event.target.files?.[0]); event.target.value = ''; }} />
            <button
                type="button"
                aria-label={t('blog.editor.addBlock')}
                disabled={disabled}
                onPointerEnter={beginInteraction}
                onPointerLeave={scheduleInteractionClose}
                style={{ top: 'var(--markdown-toolbar-top, 8px)' }}
                className={`absolute -left-10 z-20 grid h-7 w-7 place-items-center rounded-full border border-primary/50 bg-white text-primary shadow-sm transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${showPlus ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
                <Plus className="h-4 w-4" />
            </button>

            {isInteractionActive && (
                <div onPointerEnter={beginInteraction} onPointerLeave={scheduleInteractionClose} style={{ top: 'calc(var(--markdown-toolbar-top, 8px) + 34px)' }} className="absolute -left-10 z-30 w-[318px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    <div className="grid grid-cols-7 gap-1">
                        {textBlocks.map(({ key, icon: Icon, markdown }) => (
                            <button key={key} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => insertMarkdown(markdown)} className="grid place-items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-bold text-slate-600 transition hover:bg-primary/10 hover:text-primary">
                                <Icon className="h-4 w-4" />{t(`blog.editor.${key}`)}
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 border-t border-slate-100 px-2 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('blog.editor.insertContent')}</p>
                    <div className="mt-1 space-y-0.5">
                        {contentBlocks.map(({ key, icon: Icon, markdown, disabled: actionDisabled }) => (
                            <button key={key} type="button" disabled={disabled || uploading || actionDisabled} onMouseDown={(event) => event.preventDefault()} onClick={() => key === 'imageGif' ? fileInputRef.current?.click() : insertMarkdown(markdown)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">
                                {key === 'imageGif' && uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}{t(`blog.editor.${key}`)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <textarea
                ref={textareaRef}
                disabled={disabled}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onFocus={() => { setIsFocused(true); updateCursorAnchor(); }}
                onBlur={() => window.setTimeout(() => setIsFocused(false), 0)}
                onClick={updateCursorAnchor}
                onKeyUp={updateCursorAnchor}
                onScroll={updateCursorAnchor}
                onPointerEnter={beginInteraction}
                onPointerMove={handlePointerMove}
                onPointerLeave={scheduleInteractionClose}
                placeholder={placeholder}
                className="w-full h-full min-h-[60vh] bg-transparent border-none outline-none text-lg leading-[1.8] text-slate-700 placeholder:text-slate-300 resize-none font-medium mb-20"
            />
        </div>
    );
});

BlogMarkdownComposer.displayName = 'BlogMarkdownComposer';

export default BlogMarkdownComposer;
