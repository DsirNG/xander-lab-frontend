import React, { useEffect, useRef, useState } from 'react';
import { Check, ImageIcon, Loader2, Search, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { get, upload } from '@api/http';
import Modal from '@/components/common/Modal';
import { useToast } from '@/hooks/useToast';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const scopes = ['recent', 'mine', 'gif'];

const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / (1024 ** index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const BlogImageLibraryModal = ({ isOpen, onClose, onInsert }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const fileInputRef = useRef(null);
    const [scope, setScope] = useState('recent');
    const [keyword, setKeyword] = useState('');
    const [images, setImages] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!isOpen) return undefined;

        const timer = window.setTimeout(async () => {
            setLoading(true);
            try {
                const result = await get('/api/blog/media/images', {
                    scope,
                    keyword: keyword.trim() || undefined,
                }, { _silent: true });
                setImages(result || []);
                setSelected((current) => {
                    if (current && result?.some((image) => image.id === current.id)) return current;
                    return result?.[0] || null;
                });
            } catch {
                setImages([]);
                setSelected(null);
            } finally {
                setLoading(false);
            }
        }, keyword ? 250 : 0);

        return () => window.clearTimeout(timer);
    }, [isOpen, keyword, scope]);

    const handleUpload = async (file) => {
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
            const created = await upload('/api/blog/media/images', file);
            setImages((current) => [created, ...current.filter((image) => image.id !== created.id)]);
            setSelected(created);
            setScope('recent');
            setKeyword('');
            toast.success(t('blog.media.uploadSuccess'));
        } catch {
            // The shared HTTP client displays the server error.
        } finally {
            setUploading(false);
        }
    };

    const footer = (
        <div className="flex w-full items-center justify-between gap-4">
            <span className="text-sm font-medium text-slate-500">
                {selected ? t('blog.media.selectedCount', { count: 1 }) : t('blog.media.selectedCount', { count: 0 })}
            </span>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                    {t('blog.media.cancel')}
                </button>
                <button
                    type="button"
                    disabled={!selected}
                    onClick={() => onInsert(selected)}
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {t('blog.media.insertAtCursor')}
                </button>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('blog.media.libraryTitle')}
            width="max-w-5xl"
            className="h-[min(720px,90vh)]"
            footer={footer}
        >
            <div className="flex h-full min-h-0 flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            placeholder={t('blog.media.searchPlaceholder')}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                        />
                    </label>
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-105 disabled:opacity-60"
                    >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {uploading ? t('blog.media.uploadingImage') : t('blog.media.uploadImage')}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        onChange={(event) => {
                            handleUpload(event.target.files?.[0]);
                            event.target.value = '';
                        }}
                    />
                </div>

                <div className="flex border-b border-slate-200">
                    {scopes.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setScope(item)}
                            className={`border-b-2 px-4 py-2.5 text-sm font-bold transition ${scope === item ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                        >
                            {t(`blog.media.scopes.${item}`)}
                        </button>
                    ))}
                </div>

                <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="min-h-[280px] overflow-y-auto pr-1">
                        {loading ? (
                            <div className="flex h-full min-h-[280px] items-center justify-center text-primary">
                                <Loader2 className="h-7 w-7 animate-spin" />
                            </div>
                        ) : images.length ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {images.map((image) => {
                                    const active = selected?.id === image.id;
                                    return (
                                        <button
                                            key={image.id}
                                            type="button"
                                            onClick={() => setSelected(image)}
                                            className={`group relative overflow-hidden rounded-xl border-2 bg-slate-50 text-left transition ${active ? 'border-primary ring-4 ring-primary/10' : 'border-transparent hover:border-slate-300'}`}
                                        >
                                            <img
                                                src={image.url}
                                                alt={image.originalName}
                                                loading="lazy"
                                                className="aspect-[4/3] w-full object-cover"
                                            />
                                            <span className="block truncate px-2.5 py-2 text-xs font-semibold text-slate-600">
                                                {image.originalName}
                                            </span>
                                            {active && (
                                                <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-white shadow">
                                                    <Check className="h-4 w-4" />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
                                <ImageIcon className="mb-3 h-10 w-10 text-slate-300" />
                                <p className="font-bold text-slate-600">{t('blog.media.emptyTitle')}</p>
                                <p className="mt-1 text-sm text-slate-400">{t('blog.media.emptyHint')}</p>
                            </div>
                        )}
                    </div>

                    <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        {selected ? (
                            <div className="space-y-4">
                                <img
                                    src={selected.url}
                                    alt={selected.originalName}
                                    className="aspect-[4/3] w-full rounded-xl bg-white object-contain"
                                />
                                <div>
                                    <p className="break-all text-sm font-black text-slate-800">{selected.originalName}</p>
                                    <p className="mt-2 text-xs font-medium text-slate-500">
                                        {selected.width && selected.height ? `${selected.width} × ${selected.height}` : '—'}
                                        <span className="px-2">·</span>
                                        {formatBytes(selected.size)}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">{selected.contentType}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full min-h-[220px] items-center justify-center text-center text-sm font-medium text-slate-400">
                                {t('blog.media.selectHint')}
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </Modal>
    );
};

export default BlogImageLibraryModal;
