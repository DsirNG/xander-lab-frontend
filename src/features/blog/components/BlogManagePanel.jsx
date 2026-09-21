import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Search } from "lucide-react";
import ConfirmModal from "@shared/ui/overlays/ConfirmModal";
import { useToast } from "@shared/hooks/useToast";
import { blogService, BLOG_STATUS } from "../services/blogService";
import {
    CsdnSyncDialog,
    JuejinSyncDialog,
} from "@features/platformIntegrations";
import ArticleOverviewCard from "./manage/ArticleOverviewCard";
import ArticlePerformanceCard from "./manage/ArticlePerformanceCard";
import BlogPreviewModal from "./manage/BlogPreviewModal";
import BlogManageTable from "./BlogManageTable";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const FILTERS = [
    { id: "all", status: undefined, label: "全部状态" },
    { id: "published", status: BLOG_STATUS.PUBLISHED, label: "已发布" },
    { id: "draft", status: BLOG_STATUS.DRAFT, label: "草稿" },
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

    const [statusFilter] = useState("all");

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
    const [csdnPost, setCsdnPost] = useState(null);
    const [juejinPost, setJuejinPost] = useState(null);
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
                setTotal(Number(result?.total) || 0);
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
        <div className="flex h-full flex-col overflow-hidden bg-surface">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 mb-6 gap-4 px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="min-w-0">
                    <h1 className="text-[24px] font-bold text-ink">
                        {t("profile.blogManage.title", "发布文章")}
                    </h1>
                    <p className="mt-1 text-sm text-ink-muted">
                        {t(
                            "profile.blogManage.description",
                            "创建、发布与管理你的多平台文章内容，让优质内容触达更多读者。",
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="relative w-64 hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder={t(
                                "blogManage.searchPlaceholder",
                                "搜索文章标题、内容或标签",
                            )}
                            className="w-full h-10 pl-9 pr-4 rounded-full bg-white border-none shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-sm outline-none focus:ring-2 focus:ring-accent/20"
                        />
                    </div>
                    <button
                        onClick={() => navigate("/workspace/publish")}
                        className="h-10 px-5 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center gap-1.5 shadow-md hover:bg-indigo-600 transition"
                    >
                        <Plus className="w-4 h-4" />{" "}
                        {t("blogManage.createNew", "新建文章")}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 min-h-0 min-w-0 gap-6 px-4 sm:px-6 pb-4 sm:pb-6">
                {/* Left Table Area */}
                <div className="flex flex-1 min-w-0 flex-col bg-white rounded-[24px] shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-border/20 overflow-hidden">
                    {/* Table */}
                    <div className="flex-1 min-h-0 p-5">
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
                                navigate(`/workspace/publish?id=${post.id}`)
                            }
                            onStatusChange={handleStatus}
                            onSyncCsdn={(post) => setCsdnPost(post)}
                            onDelete={(post) =>
                                setConfirmAction({ type: "trash", post })
                            }
                        />
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="hidden w-[320px] shrink-0 xl:flex flex-col gap-5 overflow-y-auto pb-2 pr-1">
                    <ArticleOverviewCard />
                    <ArticlePerformanceCard />
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

            {csdnPost && (
                <CsdnSyncDialog
                    post={csdnPost}
                    onClose={() => setCsdnPost(null)}
                    onSuccess={() => {
                        setPosts((current) =>
                            current.map((post) =>
                                post.id === csdnPost.id
                                    ? { ...post, csdnSynced: true }
                                    : post,
                            ),
                        );
                        toast.success(t("profile.blogManage.csdn.synced"));
                        loadPosts({ showLoading: false });
                    }}
                />
            )}
            {juejinPost && (
                <JuejinSyncDialog
                    post={juejinPost}
                    onClose={() => setJuejinPost(null)}
                    onSuccess={() => {
                        setPosts((current) =>
                            current.map((post) =>
                                post.id === juejinPost.id
                                    ? { ...post, juejinSynced: true }
                                    : post,
                            ),
                        );
                        toast.success(t("profile.blogManage.juejin.synced"));
                        loadPosts({ showLoading: false });
                    }}
                />
            )}
        </div>
    );
};

export default BlogManagePanel;
