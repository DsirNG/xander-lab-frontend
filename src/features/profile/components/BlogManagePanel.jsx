import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    AlertCircle,
    CheckCircle2,
    CloudUpload,
    Eye,
    FilePenLine,
    FileText,
    Loader2,
    Plus,
    RotateCcw,
    Search,
    Send,
    Trash2,
} from 'lucide-react';
import ConfirmModal from '@components/common/ConfirmModal';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Pagination from '@components/common/Pagination';
import { useToast } from '@hooks/useToast';
import { blogService, BLOG_STATUS } from '@features/blog/services/blogService';
import CsdnSyncDialog from './CsdnSyncDialog';

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const TABS = [
    { id: 'all', status: undefined },
    { id: 'published', status: BLOG_STATUS.PUBLISHED },
    { id: 'draft', status: BLOG_STATUS.DRAFT },
    { id: 'trash', status: BLOG_STATUS.TRASH },
];

const STATUS_STYLES = {
    [BLOG_STATUS.DRAFT]: 'bg-warning-soft text-warning-fg ring-1 ring-warning/20',
    [BLOG_STATUS.PUBLISHED]: 'bg-success-soft text-success-fg ring-1 ring-success/20',
    [BLOG_STATUS.TRASH]: 'bg-surface text-ink-muted ring-1 ring-border',
};

const getList = (result) => {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.records)) return result.records;
    return [];
};

const BlogManagePanel = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const navigate = useNavigate();

    const [tab, setTab] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [posts, setPosts] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [actionKey, setActionKey] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);
    const [csdnPost, setCsdnPost] = useState(null);

    const abortRef = useRef(null);
    const requestSeq = useRef(0);

    const activeTab = TABS.find((item) => item.id === tab) || TABS[0];

    const loadPosts = useCallback(async ({ showLoading = true } = {}) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const seq = ++requestSeq.current;

        if (showLoading) setLoading(true);
        setLoadError(false);

        try {
            const result = await blogService.getMyBlogs(
                {
                    status: activeTab.status,
                    search,
                    page,
                    size: pageSize,
                },
                { signal: controller.signal }
            );
            if (seq !== requestSeq.current) return;
            setPosts(getList(result));
            setTotal(Number(result?.total) || 0);
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
            if (seq !== requestSeq.current) return;
            setPosts([]);
            setTotal(0);
            setLoadError(true);
        } finally {
            if (seq === requestSeq.current) setLoading(false);
        }
    }, [activeTab.status, page, pageSize, search]);

    useEffect(() => {
        loadPosts();
        return () => abortRef.current?.abort();
    }, [loadPosts]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            setSearch(searchInput.trim());
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const runAction = async (key, action, successKey) => {
        setActionKey(key);
        try {
            await action();
            toast.success(t(successKey));
            setConfirmAction(null);
            await loadPosts({ showLoading: false });
        } catch {
            // Shared HTTP handling presents the server error.
        } finally {
            setActionKey('');
        }
    };

    const handleStatus = (post, status, successKey) => {
        runAction(
            `status-${post.id}-${status}`,
            () => blogService.updateBlogStatus(post.id, status),
            successKey
        );
    };

    const handleConfirm = async () => {
        if (!confirmAction) return;
        const { type, post } = confirmAction;
        if (type === 'trash') {
            await runAction(
                `trash-${post.id}`,
                () => blogService.softDeleteBlog(post.id),
                'profile.blogManage.trashed'
            );
            return;
        }
        if (type === 'permanent') {
            await runAction(
                `permanent-${post.id}`,
                () => blogService.permanentlyDeleteBlog(post.id),
                'profile.blogManage.permanentlyDeleted'
            );
        }
    };

    const confirming = Boolean(actionKey) && Boolean(confirmAction);

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex shrink-0 flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                    <h2 className="text-base font-bold text-ink">{t('profile.blogManage.title')}</h2>
                    <p className="mt-0.5 text-caption font-medium text-ink-faint">
                        {t('profile.blogManage.description')}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/blog/publish')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-bold text-white transition hover:bg-accent"
                >
                    <Plus className="h-3.5 w-3.5" />
                    {t('profile.blogManage.createNew')}
                </button>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-b border-border px-4 py-3 sm:px-6">
                <div className="flex gap-1 overflow-x-auto">
                    {TABS.map((item) => {
                        const active = tab === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                    setTab(item.id);
                                    setPage(1);
                                }}
                                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                    active
                                        ? 'bg-accent-soft text-ink'
                                        : 'text-ink-muted hover:bg-surface hover:text-ink-secondary'
                                }`}
                            >
                                {t(`profile.blogManage.tabs.${item.id}`)}
                            </button>
                        );
                    })}
                </div>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder={t('profile.blogManage.searchPlaceholder')}
                        className="h-9 w-full rounded-xl border border-border bg-canvas pl-9 pr-3 text-xs font-medium text-ink outline-none transition placeholder:text-ink-faint focus:border-accent focus:ring-4 focus:ring-accent/10"
                    />
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6">
                {loading ? (
                    <div className="flex min-h-[240px] items-center justify-center">
                        <LoadingSpinner text={t('profile.blogManage.loading')} />
                    </div>
                ) : loadError ? (
                    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-center">
                        <AlertCircle className="h-8 w-8 text-danger" />
                        <p className="text-sm font-bold text-ink-secondary">{t('profile.blogManage.loadError')}</p>
                        <button
                            type="button"
                            onClick={() => loadPosts()}
                            className="rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-accent"
                        >
                            {t('profile.blogManage.retry')}
                        </button>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 text-center">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface text-ink-faint">
                            <FileText className="h-6 w-6" />
                        </span>
                        <p className="text-sm font-bold text-ink-secondary">
                            {tab === 'trash'
                                ? t('profile.blogManage.emptyTrash')
                                : t('profile.blogManage.emptyTitle')}
                        </p>
                        <p className="max-w-sm text-xs font-medium text-ink-faint">
                            {tab === 'trash'
                                ? t('profile.blogManage.emptyTrashHint')
                                : t('profile.blogManage.emptyHint')}
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                        {posts.map((post) => {
                            const status = Number(post.status);
                            const statusKey = status === BLOG_STATUS.PUBLISHED
                                ? 'published'
                                : status === BLOG_STATUS.TRASH
                                    ? 'trash'
                                    : 'draft';
                            const isBusy = Boolean(actionKey) && actionKey.includes(String(post.id));
                            const isCsdnSynced = post.csdnSynced === true;

                            return (
                                <li key={post.id} className="flex flex-col gap-3 bg-canvas px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="truncate text-sm font-bold text-ink">{post.title || t('profile.blogManage.untitled')}</h3>
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-micro font-bold ${STATUS_STYLES[status] || STATUS_STYLES[BLOG_STATUS.DRAFT]}`}>
                                                {t(`profile.blogManage.status.${statusKey}`)}
                                            </span>
                                            {isCsdnSynced ? (
                                                <span
                                                    title={t('profile.blogManage.csdn.synced', 'Synced to CSDN')}
                                                    className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-micro font-bold text-success-fg ring-1 ring-success/20"
                                                >
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    CSDN
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="mt-1 line-clamp-1 text-caption font-medium text-ink-faint">
                                            {post.summary || post.categoryName || '—'}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1">
                                        {status === BLOG_STATUS.PUBLISHED ? (
                                            <button
                                                type="button"
                                                title={t('profile.blogManage.actions.view')}
                                                onClick={() => navigate(`/blog/${post.id}`)}
                                                className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition hover:bg-surface-muted hover:text-ink"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </button>
                                        ) : null}

                                        {status !== BLOG_STATUS.TRASH ? (
                                            <button
                                                type="button"
                                                title={t('profile.blogManage.actions.syncCsdn', 'Sync to CSDN')}
                                                disabled={Boolean(actionKey)}
                                                onClick={() => setCsdnPost(post)}
                                                className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50"
                                            >
                                                <CloudUpload className="h-3.5 w-3.5" />
                                            </button>
                                        ) : null}

                                        {status !== BLOG_STATUS.TRASH ? (
                                            <button
                                                type="button"
                                                title={t('profile.blogManage.actions.edit')}
                                                onClick={() => navigate(`/blog/publish?id=${post.id}`)}
                                                className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition hover:bg-accent-soft hover:text-accent"
                                            >
                                                <FilePenLine className="h-3.5 w-3.5" />
                                            </button>
                                        ) : null}

                                        {status === BLOG_STATUS.DRAFT ? (
                                            <button
                                                type="button"
                                                title={t('profile.blogManage.actions.publish')}
                                                disabled={Boolean(actionKey)}
                                                onClick={() => handleStatus(post, BLOG_STATUS.PUBLISHED, 'profile.blogManage.published')}
                                                className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition hover:bg-success-soft hover:text-success disabled:opacity-50"
                                            >
                                                {isBusy && actionKey.includes(`status-${post.id}-${BLOG_STATUS.PUBLISHED}`)
                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    : <Send className="h-3.5 w-3.5" />}
                                            </button>
                                        ) : null}

                                        {status === BLOG_STATUS.PUBLISHED ? (
                                            <button
                                                type="button"
                                                title={t('profile.blogManage.actions.unpublish')}
                                                disabled={Boolean(actionKey)}
                                                onClick={() => handleStatus(post, BLOG_STATUS.DRAFT, 'profile.blogManage.unpublished')}
                                                className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition hover:bg-warning-soft hover:text-warning disabled:opacity-50"
                                            >
                                                {isBusy && actionKey.includes(`status-${post.id}-${BLOG_STATUS.DRAFT}`)
                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    : <FileText className="h-3.5 w-3.5" />}
                                            </button>
                                        ) : null}

                                        {status === BLOG_STATUS.TRASH ? (
                                            <button
                                                type="button"
                                                title={t('profile.blogManage.actions.restore')}
                                                disabled={Boolean(actionKey)}
                                                onClick={() => handleStatus(post, BLOG_STATUS.DRAFT, 'profile.blogManage.restored')}
                                                className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition hover:bg-accent-soft hover:text-accent disabled:opacity-50"
                                            >
                                                {isBusy && actionKey.includes(`status-${post.id}-${BLOG_STATUS.DRAFT}`)
                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    : <RotateCcw className="h-3.5 w-3.5" />}
                                            </button>
                                        ) : null}

                                        {status !== BLOG_STATUS.TRASH ? (
                                            <button
                                                type="button"
                                                title={t('profile.blogManage.actions.trash')}
                                                disabled={Boolean(actionKey)}
                                                onClick={() => setConfirmAction({ type: 'trash', post })}
                                                className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                title={t('profile.blogManage.actions.permanentDelete')}
                                                disabled={Boolean(actionKey)}
                                                onClick={() => setConfirmAction({ type: 'permanent', post })}
                                                className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                disabled={loading}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                }}
            />

            <ConfirmModal
                isOpen={Boolean(confirmAction)}
                onClose={() => !confirming && setConfirmAction(null)}
                onConfirm={handleConfirm}
                confirming={confirming}
                title={confirmAction?.type === 'permanent'
                    ? t('profile.blogManage.confirmPermanentTitle')
                    : t('profile.blogManage.confirmTrashTitle')}
                message={t(
                    confirmAction?.type === 'permanent'
                        ? 'profile.blogManage.confirmPermanentMessage'
                        : 'profile.blogManage.confirmTrashMessage',
                    { title: confirmAction?.post?.title || t('profile.blogManage.untitled') }
                )}
                confirmText={confirmAction?.type === 'permanent'
                    ? t('profile.blogManage.actions.permanentDelete')
                    : t('profile.blogManage.actions.trash')}
            />
            {csdnPost && (
                <CsdnSyncDialog
                    post={csdnPost}
                    onClose={() => setCsdnPost(null)}
                    onSuccess={() => {
                        setPosts((current) => current.map((post) => (
                            post.id === csdnPost.id ? { ...post, csdnSynced: true } : post
                        )));
                        toast.success(t('profile.blogManage.csdn.synced', 'Synced to CSDN'));
                        loadPosts({ showLoading: false });
                    }}
                />
            )}
        </div>
    );
};

export default BlogManagePanel;
