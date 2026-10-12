import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Search, RefreshCw } from "lucide-react";
import ConfirmModal from "@shared/ui/overlays/ConfirmModal";
import { useToast } from "@shared/hooks/useToast";
import { blogService, BLOG_STATUS } from "../services/blogService";
import ArticleSyncModal from "./manage/ArticleSyncModal";
import Button from "@shared/ui/primitives/Button";
import BlogPreviewModal from "./manage/BlogPreviewModal";
import BlogManageTable from "./BlogManageTable";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const FILTERS = [
    { id: "all", status: undefined, key: "contentLibrary.all" },
    {
        id: "published",
        status: BLOG_STATUS.PUBLISHED,
        key: "profile.blogManage.status.published",
    },
    {
        id: "draft",
        status: BLOG_STATUS.DRAFT,
        key: "profile.blogManage.status.draft",
    },
];

const getList = (result) => {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.records)) return result.records;
    return [];
};

const BlogManagePanel = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const navigate = useNavigate();

    const [statusFilter, setStatusFilter] = useState("all");

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [posts, setPosts] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [actionKey, setActionKey] = useState("");
    const [confirmAction, setConfirmAction] = useState(null);
    const [syncPost, setSyncPost] = useState(null);
    const [previewPostId, setPreviewPostId] = useState(null);

    const abortRef = useRef(null);
    const requestSeq = useRef(0);

    const activeFilter =
        FILTERS.find((item) => item.id === statusFilter) || FILTERS[0];
    const effectiveStatus = activeFilter.status;

    const loadPosts = useCallback(
        async ({ showLoading = true } = {}) => {
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
                    { signal: controller.signal },
                );
                if (seq !== requestSeq.current) return;
                setPosts(getList(result));
                setTotal(
                    Number(result?.total) ||
                        (Array.isArray(result) ? result.length : 0),
                );
            } catch (err) {
                if (err.name === "CanceledError" || err.code === "ERR_CANCELED")
                    return;
                if (seq !== requestSeq.current) return;
                setPosts([]);
                setTotal(0);
                setLoadError(true);
            } finally {
                if (seq === requestSeq.current) setLoading(false);
            }
        },
        [effectiveStatus, page, pageSize, search],
    );

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
            return;
        } finally {
            setActionKey("");
        }
    };

    const handleStatus = (post, status, successKey) => {
        runAction(
            `status-${post.id}-${status}`,
            () => blogService.updateBlogStatus(post.id, status),
            successKey,
        );
    };

    const handleConfirm = async () => {
        if (!confirmAction) return;
        const { type, post } = confirmAction;
        if (type === "trash") {
            await runAction(
                `trash-${post.id}`,
                () => blogService.softDeleteBlog(post.id),
                "profile.blogManage.trashed",
            );
            return;
        }
    };

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-canvas">
            {/* Header */}
            <div className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-8">
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold text-ink">
                        {t("contentLibrary.articles")}
                    </h1>
                    <p className="mt-1 text-sm text-ink-muted">
                        {t("contentLibrary.articleDescription")}
                    </p>
                </div>
                <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
                    <Button
                        variant="ghost"
                        icon={RefreshCw}
                        loading={loading}
                        onClick={() => loadPosts()}
                        aria-label={t("contentLibrary.refresh")}
                    />
                    <div className="relative min-w-0 flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder={t(
                                "blogManage.searchPlaceholder",
                                "搜索文章标题、内容或标签",
                            )}
                            className="w-full h-10 pl-9 pr-4 rounded-lg bg-canvas border border-border text-sm text-ink outline-none focus:ring-2 focus:ring-border-strong"
                        />
                    </div>
                    <Button
                        variant="ink"
                        icon={Plus}
                        onClick={() => navigate("/app?view=publish")}
                    >
                        {t("blogManage.createNew")}
                    </Button>
                </div>
            </div>

            <div
                className="flex shrink-0 items-center gap-1 px-5 py-3 sm:px-8"
                role="group"
                aria-label={t("profile.blogManage.statusLabel")}
            >
                {FILTERS.map((filter) => (
                    <Button
                        key={filter.id}
                        size="sm"
                        variant={statusFilter === filter.id ? "ink" : "ghost"}
                        aria-pressed={statusFilter === filter.id}
                        onClick={() => {
                            setStatusFilter(filter.id);
                            setPage(1);
                        }}
                    >
                        {t(filter.key)}
                    </Button>
                ))}
                <span className="ml-auto text-caption text-ink-faint">
                    {t("contentLibrary.total", { count: total })}
                </span>
            </div>
            {/* Content Area */}
            <div className="flex flex-1 min-h-0 min-w-0 px-5 sm:px-8 pb-5">
                {/* Left Table Area */}
                <div className="flex flex-1 min-h-0 min-w-0 flex-col bg-canvas rounded-xl border border-border overflow-hidden">
                    {/* Table */}
                    <div className="flex-1 min-h-0">
                        <BlogManageTable
                            t={t}
                            posts={posts}
                            loading={loading}
                            loadError={loadError}
                            loadPosts={loadPosts}
                            page={page}
                            pageSize={pageSize}
                            total={total}
                            onPageChange={setPage}
                            onPageSizeChange={(size) => {
                                setPageSize(size);
                                setPage(1);
                            }}
                            onPreview={(post) => setPreviewPostId(post.id)}
                            onEdit={(post) =>
                                navigate(`/app?view=publish&id=${post.id}`)
                            }
                            onStatusChange={handleStatus}
                            onSync={setSyncPost}
                            busy={Boolean(actionKey)}
                            onDelete={(post) =>
                                setConfirmAction({ type: "trash", post })
                            }
                        />
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={Boolean(confirmAction)}
                onClose={() => !actionKey && setConfirmAction(null)}
                onConfirm={handleConfirm}
                confirming={Boolean(actionKey)}
                title={t("profile.blogManage.confirmTrashTitle")}
                message={t("profile.blogManage.confirmTrashMessage", {
                    title:
                        confirmAction?.post?.title ||
                        t("profile.blogManage.untitled"),
                })}
                confirmText={t("profile.blogManage.actions.trash")}
            />

            <BlogPreviewModal
                postId={previewPostId}
                onClose={() => setPreviewPostId(null)}
            />

            {syncPost && (
                <ArticleSyncModal
                    key={syncPost.id}
                    post={syncPost}
                    onClose={() => setSyncPost(null)}
                    onSynced={(platform) => {
                        const field = `${platform}Synced`;
                        setPosts((current) => current.map((post) => post.id === syncPost.id ? { ...post, [field]: true } : post));
                        setSyncPost((current) => ({ ...current, [field]: true }));
                    }}
                    onCompleted={() => loadPosts({ showLoading: false })}
                />
            )}
        </div>
    );
};

export default BlogManagePanel;
