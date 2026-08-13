import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Code2, Eraser, FileCode2, Heading1, Heading2, Heading3, ImagePlus, Italic, Link2, List,
    ListOrdered, ListTodo, Minus, PanelLeftClose, PanelLeftOpen, Quote, Redo2, Strikethrough, Table2, Undo2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/useToast';
import BlogImageLibraryModal from './BlogImageLibraryModal';
import './BlogTipTapEditor.css';

const imageAltFromName = (name) => name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'image';

const BlogTipTapEditor = forwardRef(({ value, onChange, placeholder, disabled = false }, forwardedRef) => {
    const { t } = useTranslation();
    const toast = useToast();
    const editorRef = useRef(null);
    const onChangeRef = useRef(onChange);
    const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);
    const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
    const [isToolbarReady, setIsToolbarReady] = useState(false);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const extensions = useMemo(() => [
        StarterKit.configure({
            underline: false,
            link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' } },
        }),
        Markdown,
        Image.configure({ allowBase64: false }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
        Placeholder.configure({ placeholder }),
    ], [placeholder]);

    const handleUpdate = useCallback(({ editor: activeEditor }) => {
        const markdown = activeEditor.getMarkdown();
        onChangeRef.current?.(markdown);
    }, []);

    const editor = useEditor({
        immediatelyRender: true,
        editable: !disabled,
        content: value || '',
        contentType: 'markdown',
        extensions,
        editorProps: {
            attributes: { class: 'blog-tiptap-content', 'aria-label': placeholder },
        },
        onCreate: ({ editor: activeEditor }) => {
            editorRef.current = activeEditor;
            setIsToolbarReady(true);
        },
        onUpdate: handleUpdate,
    });

    useEffect(() => {
        editor?.setEditable(!disabled);
    }, [editor, disabled]);

    useEffect(() => {
        if (!editor) return;
        if (value === editorRef.current?.getMarkdown()) return;
        const nextValue = value || '';
        try {
            editor.commands.setContent(nextValue, { contentType: 'markdown', emitUpdate: false });
        } catch (err) {
            console.error('Failed to load markdown into editor:', err);
        }
    }, [editor, value]);

    useImperativeHandle(forwardedRef, () => ({
        focus: () => {
            if (isToolbarReady && editorRef.current?.isDestroyed === false) {
                editorRef.current?.commands.focus();
            }
        },
    }), [isToolbarReady]);

    const toolbarState = useEditorState({
        editor,
        selector: ({ editor: activeEditor }) => activeEditor ? ({
            bold: activeEditor.isActive('bold'),
            italic: activeEditor.isActive('italic'),
            strike: activeEditor.isActive('strike'),
            h1: activeEditor.isActive('heading', { level: 1 }),
            h2: activeEditor.isActive('heading', { level: 2 }),
            h3: activeEditor.isActive('heading', { level: 3 }),
            bulletList: activeEditor.isActive('bulletList'),
            orderedList: activeEditor.isActive('orderedList'),
            taskList: activeEditor.isActive('taskList'),
            blockquote: activeEditor.isActive('blockquote'),
            code: activeEditor.isActive('code'),
            codeBlock: activeEditor.isActive('codeBlock'),
            link: activeEditor.isActive('link'),
            canUndo: activeEditor.can().undo(),
            canRedo: activeEditor.can().redo(),
        }) : null,
    });

    const runCommand = (command) => {
        if (disabled || !editor) return;
        editor.chain().focus();
        command(editor);
    };

    const setLink = () => {
        if (!editor) return;
        const previous = String(editor.getAttributes('link').href ?? '');
        const url = window.prompt(t('blog.editor.linkPrompt'), previous || 'https://');
        if (url === null) return;
        const trimmed = url.trim();
        if (!trimmed) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
    };

    const insertLibraryImage = (image) => {
        if (!editor) return;
        const alt = imageAltFromName(image.originalName).replaceAll('[', '').replaceAll(']', '').replace(/\r?\n/g, ' ');
        editor.chain().focus().setImage({ src: image.url, alt }).run();
        setIsImageLibraryOpen(false);
        toast.success(t('blog.media.imageInserted'));
    };

    const toolbarGroups = [
        [
            { key: 'undo', icon: Undo2, disabled: !toolbarState?.canUndo, run: () => runCommand(() => editor?.chain().undo().run()) },
            { key: 'redo', icon: Redo2, disabled: !toolbarState?.canRedo, run: () => runCommand(() => editor?.chain().redo().run()) },
        ],
        [
            { key: 'h1', icon: Heading1, active: toolbarState?.h1, run: () => runCommand(() => editor?.chain().toggleHeading({ level: 1 }).run()) },
            { key: 'h2', icon: Heading2, active: toolbarState?.h2, run: () => runCommand(() => editor?.chain().toggleHeading({ level: 2 }).run()) },
            { key: 'h3', icon: Heading3, active: toolbarState?.h3, run: () => runCommand(() => editor?.chain().toggleHeading({ level: 3 }).run()) },
        ],
        [
            { key: 'bold', icon: Bold, active: toolbarState?.bold, run: () => runCommand(() => editor?.chain().toggleBold().run()) },
            { key: 'italic', icon: Italic, active: toolbarState?.italic, run: () => runCommand(() => editor?.chain().toggleItalic().run()) },
            { key: 'strike', icon: Strikethrough, active: toolbarState?.strike, run: () => runCommand(() => editor?.chain().toggleStrike().run()) },
        ],
        [
            { key: 'list', icon: List, active: toolbarState?.bulletList, run: () => runCommand(() => editor?.chain().toggleBulletList().run()) },
            { key: 'orderedList', icon: ListOrdered, active: toolbarState?.orderedList, run: () => runCommand(() => editor?.chain().toggleOrderedList().run()) },
            { key: 'todo', icon: ListTodo, active: toolbarState?.taskList, run: () => runCommand(() => editor?.chain().toggleTaskList().run()) },
        ],
        [
            { key: 'quote', icon: Quote, active: toolbarState?.blockquote, run: () => runCommand(() => editor?.chain().toggleBlockquote().run()) },
            { key: 'code', icon: Code2, active: toolbarState?.code, run: () => runCommand(() => editor?.chain().toggleCode().run()) },
            { key: 'codeBlock', icon: FileCode2, active: toolbarState?.codeBlock, run: () => runCommand(() => editor?.chain().toggleCodeBlock().run()) },
        ],
        [
            { key: 'addLink', icon: Link2, active: toolbarState?.link, run: setLink },
            { key: 'imageGif', icon: ImagePlus, run: () => !disabled && setIsImageLibraryOpen(true) },
            { key: 'divider', icon: Minus, run: () => runCommand(() => editor?.chain().setHorizontalRule().run()) },
            { key: 'insertTable', icon: Table2, run: () => runCommand(() => editor?.chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()) },
            { key: 'clearFormatting', icon: Eraser, run: () => runCommand(() => editor?.chain().unsetAllMarks().clearNodes().run()) },
        ],
    ];

    return (
        <div className="w-full">
            <aside className={`fixed left-3 top-1/2 z-50 flex max-h-[calc(100dvh-6rem)] -translate-y-1/2 flex-col gap-1 overflow-y-auto rounded-xl border border-border bg-canvas/95 p-1 shadow-xl backdrop-blur transition-[width] duration-200 ${isToolbarExpanded ? 'w-44' : 'w-10'}`}>
                <button
                    type="button"
                    title={t('blog.editor.toolbar')}
                    aria-label={t('blog.editor.toolbar')}
                    aria-expanded={isToolbarExpanded}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setIsToolbarExpanded((current) => !current)}
                    className={`flex h-8 w-full shrink-0 items-center gap-2 rounded-lg bg-surface-muted text-ink-secondary transition hover:bg-border hover:text-ink ${isToolbarExpanded ? 'justify-start px-2' : 'justify-center'}`}
                >
                    {isToolbarExpanded ? <PanelLeftClose className="h-4 w-4 shrink-0" /> : <PanelLeftOpen className="h-4 w-4 shrink-0" />}
                    {isToolbarExpanded && <span className="truncate text-xs font-black">{t('blog.editor.toolbar')}</span>}
                </button>

                {toolbarGroups.map((group, groupIndex) => (
                    <React.Fragment key={groupIndex}>
                        {groupIndex > 0 && <span className="mx-1 my-0.5 h-px shrink-0 bg-border" />}
                        {group.map(({ key, icon: Icon, active, disabled: actionDisabled, run }) => (
                            <button
                                key={key}
                                type="button"
                                title={t(`blog.editor.${key}`)}
                                aria-label={t(`blog.editor.${key}`)}
                                aria-pressed={Boolean(active)}
                                disabled={disabled || actionDisabled}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={run}
                                className={`flex h-8 w-full shrink-0 items-center gap-2 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'bg-accent/10 text-accent' : 'text-ink-muted hover:bg-accent/10 hover:text-accent'} ${isToolbarExpanded ? 'justify-start px-2' : 'justify-center'}`}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {isToolbarExpanded && <span className="truncate text-xs font-semibold">{t(`blog.editor.${key}`)}</span>}
                            </button>
                        ))}
                    </React.Fragment>
                ))}
            </aside>

            <EditorContent editor={editor} className="blog-tiptap" />

            <BlogImageLibraryModal
                isOpen={isImageLibraryOpen}
                onClose={() => setIsImageLibraryOpen(false)}
                onInsert={insertLibraryImage}
            />
        </div>
    );
});

BlogTipTapEditor.displayName = 'BlogTipTapEditor';

export default BlogTipTapEditor;