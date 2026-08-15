import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    CheckCircle2,
    CloudUpload,
    Eye,
    FilePenLine,
    FileText,
    Plus,
    RotateCcw,
    Search,
    Send,
    Trash2,
    Undo,
} from 'lucide-react';
import ConfirmModal from '@components/common/ConfirmModal';
import CustomSelect from '@components/common/CustomSelect';
import DataTable from '@components/common/DataTable';
import RowActionsMenu from '@components/common/RowActionsMenu';
import { useToast } from '@hooks/useToast';
import { blogService, BLOG_STATUS } from '@features/blog/services/blogService';
import CsdnSyncDialog from './CsdnSyncDialog';
import JuejinSyncDialog from './JuejinSyncDialog';

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const FILTERS = [
    { id: 'all', status: undefined },
    { id: 'published', status: BLOG_STATUS.PUBLISHED },
    { id: 'draft', status: BLOG_STATUS.DRAFT },
];

const STATUS_STYLES = {
    [BLOG_STATUS.DRAFT]: 'bg-warning-soft text-warning-fg',
    [BLOG_STATUS.PUBLISHED]: 'bg-success-soft text-success-fg',
    [BLOG_STATUS.TRASH]: 'bg-surface text-ink-muted',
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
    const [trashMode, setTrashMode] = useState(false);
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
    const [juejinPost, setJuejinPost] = useState(null);

    const abortRef = useRef(null);
    const requestSeq = useRef(0);

    const activeFilter = FILTERS.find((item) => item.id === tab) || FILTERS[0];
    const effectiveStatus = trashMode ? BLOG_STATUS.TRASH : activeFilter.status;

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
                    status: effectiveStatus,
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
    }, [effectiveStatus, page, pageSize, search]);

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
            <div className="flex shrink-0 flex-col gap-1 px-4 py-4 px-ultra-tight sm:px-6">
                <div className="min-w-0">
                    <div className="text-base font-bold text-ink">{t('profile.blogManage.title')}</div>
                    <div className="mt-0.5 text-caption font-medium text-ink-faint">
                        {t('profile.blogManage.description')}
                    </div>
                </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 px-4 py-3 px-ultra-tight sm:flex-row sm:items-center sm:justify-end sm:px-6">
                <div className={`w-full sm:w-32 ${trashMode ? 'pointer-events-none opacity-50' : ''}`}>
                    <CustomSelect
                        size="sm"
                        value={tab}
                        options={FILTERS.map((item) => ({
                            value: item.id,
                            label: t(`profile.blogManage.tabs.${item.id}`),
                        }))}
                        onChange={(value) => {
                            setTrashMode(false);
                            setTab(value);
                            setPage(1);
                        }}
                    />
                </div>
                <div className="relative min-w-0 flex-1 sm:flex-none">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder={t('profile.blogManage.searchPlaceholder')}
                        className="h-9 w-full rounded-xl bg-surface pl-9 pr-3 text-sm font-medium text-ink outline-none transition placeholder:text-ink-faint focus:bg-canvas focus:ring-4 focus:ring-accent/15 sm:w-56"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setTrashMode((current) => !current);
                        setPage(1);
                    }}
                    className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition ${
                        trashMode
                            ? 'bg-accent-soft text-ink'
                            : 'bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink-secondary'
                    }`}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t('profile.blogManage.tabs.trash')}
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/workspace/publish')}
                    className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-ink px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-accent"
                >
                    <Plus className="h-3.5 w-3.5" />
                    {t('profile.blogManage.createNew')}
                </button>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 py-3 px-ultra-tight sm:px-6">
                <DataTable
                    columns={[
                        {
                            key: 'article',
                            title: t('profile.blogManage.articleColumn'),
                            width: '38%',
                            render: (post) => {
                                const isCsdnSynced = post.csdnSynced === true;
                                const isJuejinSynced = post.juejinSynced === true;
                                return (
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="truncate text-sm font-semibold text-ink">
                                                {post.title || t('profile.blogManage.untitled')}
                                            </div>
                                            {isCsdnSynced ? (
                                                <span
                                                    title={t('profile.blogManage.csdn.synced')}
                                                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success-fg"
                                                >
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    CSDN
                                                </span>
                                            ) : null}
                                            {isJuejinSynced ? (
                                                <span
                                                    title={t('profile.blogManage.juejin.synced')}
                                                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success-fg"
                                                >
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    {t('profile.blogManage.juejin.badge')}
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="mt-1 line-clamp-1 text-caption font-medium text-ink-faint">
                                            {post.summary || post.categoryName || '—'}
                                        </div>
                                    </div>
                                );
                            },
                        },
                        {
                            key: 'category',
                            title: t('profile.blogManage.category'),
                            width: '18%',
                            render: (post) => (
                                <span className="block truncate text-sm font-medium text-ink-muted" title={post.categoryName}>
                                    {post.categoryName || '—'}
                                </span>
                            ),
                        },
                        {
                            key: 'status',
                            title: t('profile.blogManage.statusLabel'),
                            width: '14%',
                            render: (post) => {
                                const status = Number(post.status);
                                const statusKey = status === BLOG_STATUS.PUBLISHED
                                    ? 'published'
                                    : status === BLOG_STATUS.TRASH
                                        ? 'trash'
                                        : 'draft';
                                return (
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] || STATUS_STYLES[BLOG_STATUS.DRAFT]}`}>
                                        {t(`profile.blogManage.status.${statusKey}`)}
                                    </span>
                                );
                            },
                        },
                        {
                            key: 'actions',
                            title: t('profile.blogManage.actionsColumn'),
                            width: '10%',

                            render: (post) => {
                                const status = Number(post.status);
                                const isBusy = Boolean(actionKey) && actionKey.includes(String(post.id));
                                const items = [];
                                if (status === BLOG_STATUS.PUBLISHED) {
                                    items.push({
                                        key: 'view',
                                        label: t('profile.blogManage.actions.view'),
                                        icon: Eye,
                                        onClick: () => navigate(`/blog/${post.id}`),
                                    });
                                }
                                if (status !== BLOG_STATUS.TRASH) {
                                    items.push({
                                        key: 'edit',
                                        label: t('profile.blogManage.actions.edit'),
                                        icon: FilePenLine,
                                        disabled: Boolean(actionKey),
                                        onClick: () => navigate(`/workspace/publish?id=${post.id}`),
                                    });
                                }
                                if (status === BLOG_STATUS.DRAFT) {
                                    items.push({
                                        key: 'publish',
                                        label: t('profile.blogManage.actions.publish'),
                                        icon: Send,
                                        disabled: Boolean(actionKey),
                                        loading: isBusy && actionKey.includes(`status-${post.id}-${BLOG_STATUS.PUBLISHED}`),
                                        onClick: () => handleStatus(post, BLOG_STATUS.PUBLISHED, 'profile.blogManage.published'),
                                    });
                                }
                                if (status === BLOG_STATUS.PUBLISHED) {
                                    items.push({
                                        key: 'unpublish',
                                        label: t('profile.blogManage.actions.unpublish'),
                                        icon: Undo,
                                        disabled: Boolean(actionKey),
                                        loading: isBusy && actionKey.includes(`status-${post.id}-${BLOG_STATUS.DRAFT}`),
                                        onClick: () => handleStatus(post, BLOG_STATUS.DRAFT, 'profile.blogManage.unpublished'),
                                    });
                                }
                                if (status !== BLOG_STATUS.TRASH) {
                                    items.push({
                                        key: 'syncCsdn',
                                        label: t('profile.blogManage.actions.syncCsdn'),
                                        icon: CloudUpload,
                                        disabled: Boolean(actionKey),
                                        onClick: () => setCsdnPost(post),
                                    });
                                    items.push({
                                        key: 'syncJuejin',
                                        label: t('profile.blogManage.actions.syncJuejin'),
                                        icon: CloudUpload,
                                        disabled: Boolean(actionKey),
                                        onClick: () => setJuejinPost(post),
                                    });
                                    items.push({
                                        key: 'trash',
                                        label: t('profile.blogManage.actions.trash'),
                                        icon: Trash2,
                                        danger: true,
                                        disabled: Boolean(actionKey),
                                        onClick: () => setConfirmAction({ type: 'trash', post }),
                                    });
                                } else {
                                    items.push({
                                        key: 'restore',
                                        label: t('profile.blogManage.actions.restore'),
                                        icon: RotateCcw,
                                        disabled: Boolean(actionKey),
                                        loading: isBusy && actionKey.includes(`status-${post.id}-${BLOG_STATUS.DRAFT}`),
                                        onClick: () => handleStatus(post, BLOG_STATUS.DRAFT, 'profile.blogManage.restored'),
                                    });
                                    items.push({
                                        key: 'permanentDelete',
                                        label: t('profile.blogManage.actions.permanentDelete'),
                                        icon: Trash2,
                                        danger: true,
                                        disabled: Boolean(actionKey),
                                        onClick: () => setConfirmAction({ type: 'permanent', post }),
                                    });
                                }
                                return <RowActionsMenu actions={items} size="sm" />;
                            },
                        },
                    ]}
                    rows={posts}
                    loading={loading}
                    loadingText={t('profile.blogManage.loading')}
                    error={loadError ? t('profile.blogManage.loadError') : ''}
                    onRetry={loadPosts}
                    onRetryLabel={t('profile.blogManage.retry')}
                    emptyTitle={trashMode
                        ? t('profile.blogManage.emptyTrash')
                        : t('profile.blogManage.emptyTitle')}
                    emptyHint={trashMode
                        ? t('profile.blogManage.emptyTrashHint')
                        : t('profile.blogManage.emptyHint')}
                    emptyIcon={FileText}
                    minWidth="840px"
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPage(1);
                    }}
                    paginationDisabled={loading}
                />
            </div>

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
                        toast.success(t('profile.blogManage.csdn.synced'));
                        loadPosts({ showLoading: false });
                    }}
                />
            )}
            {juejinPost && (
                <JuejinSyncDialog
                    post={juejinPost}
                    onClose={() => setJuejinPost(null)}
                    onSuccess={() => {
                        setPosts((current) => current.map((post) => (
                            post.id === juejinPost.id ? { ...post, juejinSynced: true } : post
                        )));
                        toast.success(t('profile.blogManage.juejin.synced'));
                        loadPosts({ showLoading: false });
                    }}
                />
            )}
        </div>
    );
};

export default BlogManagePanel;
