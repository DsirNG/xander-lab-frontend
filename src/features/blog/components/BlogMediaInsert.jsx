import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, UploadCloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { upload } from '@api/http';
import { useToast } from '@/hooks/useToast';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const imageAltFromName = (name) => name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'image';

const BlogMediaInsert = ({ onInsert, disabled = false }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const inputRef = useRef(null);
    const [uploadState, setUploadState] = useState(null);

    const uploadImage = async (file) => {
        if (!file || !SUPPORTED_IMAGE_TYPES.has(file.type)) {
            toast.warning(t('blog.media.invalidImage'));
            return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            toast.warning(t('blog.media.imageTooLarge'));
            return;
        }

        setUploadState({ name: file.name, progress: 0, status: 'uploading' });
        try {
            const uploaded = await upload('/api/upload/oss?type=photo', file, {
                onProgress: (percent) => setUploadState((current) => current ? { ...current, progress: percent } : current),
            });
            setUploadState({ name: file.name, url: uploaded.url, alt: imageAltFromName(file.name), status: 'ready' });
        } catch (error) {
            setUploadState(null);
            toast.error(error.message || t('blog.media.imageUploadFailed'));
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        if (!disabled) uploadImage(event.dataTransfer.files?.[0]);
    };

    const insertImage = () => {
        if (!uploadState?.url) return;
        const alt = uploadState.alt.trim().replace(/[\[\]\r\n]+/g, ' ') || 'image';
        onInsert(`\n\n![${alt}](${uploadState.url})\n\n`);
        setUploadState((current) => current ? { ...current, status: 'complete' } : current);
        toast.success(t('blog.media.imageInserted'));
    };

    return (
        <section onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} className="mb-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-3 sm:p-4">
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => { uploadImage(event.target.files?.[0]); event.target.value = ''; }} />
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><ImagePlus className="h-4 w-4" /></span>
                    <p className="text-xs leading-5 text-slate-500">{t('blog.media.dropImage')}</p>
                </div>
                <button type="button" disabled={disabled || uploadState?.status === 'uploading'} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-primary disabled:cursor-wait disabled:opacity-60">
                    <UploadCloud className="h-4 w-4" />{t('blog.media.insertImage')}
                </button>
            </div>
            {uploadState && <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-2.5 ring-1 ring-slate-200">
                {uploadState.status === 'uploading' ? <span className="grid h-12 w-16 place-items-center rounded-lg bg-slate-100 text-primary"><Loader2 className="h-5 w-5 animate-spin" /></span> : <img src={uploadState.url} alt="" className="h-12 w-16 rounded-lg object-cover" />}
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-700">{uploadState.name}</p>{uploadState.status === 'uploading' ? <p className="mt-0.5 text-xs text-slate-500">{t('blog.media.uploadingImage')} {uploadState.progress}%</p> : uploadState.status === 'ready' ? <input value={uploadState.alt} onChange={(event) => setUploadState((current) => current ? { ...current, alt: event.target.value } : current)} aria-label={t('blog.media.altText')} placeholder={t('blog.media.altText')} className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-primary" /> : <p className="mt-0.5 text-xs text-slate-500">{t('blog.media.imageInserted')}</p>}</div>
                {uploadState.status === 'ready' && <button type="button" onClick={insertImage} className="shrink-0 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-primary">{t('blog.media.addToArticle')}</button>}
            </div>}
        </section>
    );
};

export default BlogMediaInsert;
