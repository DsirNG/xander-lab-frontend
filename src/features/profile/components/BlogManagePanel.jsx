import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
    Globe,
    LayoutTemplate,
    Code,
    Calendar,
    Star,
    Lightbulb,
    Link2,
    ChevronDown,
    CheckSquare,
    Layers,
    ArrowUpDown,
} from "lucide-react";
import ConfirmModal from "@components/common/ConfirmModal";
import DataTable from "@components/common/DataTable";
import RowActionsMenu from "@components/common/RowActionsMenu";
import { useToast } from "@hooks/useToast";
import { blogService, BLOG_STATUS } from "@features/blog/services/blogService";
import CsdnSyncDialog from "./CsdnSyncDialog";
import JuejinSyncDialog from "./JuejinSyncDialog";
import ArticleOverviewCard from "./manage/ArticleOverviewCard";
import ArticlePerformanceCard from "./manage/ArticlePerformanceCard";
import BlogPreviewModal from "./manage/BlogPreviewModal";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const FILTERS = [
    { id: "all", status: undefined, label: "全部状态" },
    { id: "published", status: BLOG_STATUS.PUBLISHED, label: "已发布" },
    { id: "draft", status: BLOG_STATUS.DRAFT, label: "草稿" },
];

const getTopicStyle = (topic = "") => {
    if (topic.includes("设计") || topic.includes("API"))
        return { icon: FileText, color: "text-blue-500", bg: "bg-blue-50" };
    if (
        topic.includes("Websocket") ||
        topic.includes("网络") ||
        topic.includes("区别")
    )
        return { icon: Globe, color: "text-blue-500", bg: "bg-blue-50" };
    if (
        topic.includes("CSS") ||
        topic.includes("样式") ||
        topic.includes("盒模型")
    )
        return {
            icon: LayoutTemplate,
            color: "text-green-500",
            bg: "bg-green-50",
        };
    if (topic.includes("中级") || topic.includes("开发"))
        return { icon: Code, color: "text-orange-500", bg: "bg-orange-50" };
    if (
        topic.includes("闭包") ||
        topic.includes("JS") ||
        topic.includes("JavaScript")
    )
        return { icon: Calendar, color: "text-purple-500", bg: "bg-purple-50" };
    if (topic.includes("资讯") || topic.includes("精选"))
        return { icon: Star, color: "text-blue-500", bg: "bg-blue-50" };
    if (topic.includes("面试") || topic.includes("解析"))
        return { icon: Lightbulb, color: "text-red-500", bg: "bg-red-50" };
    return { icon: Link2, color: "text-accent", bg: "bg-accent-soft" };
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

    const [statusFilter, setStatusFilter] = useState("all");
    const [platformFilter, setPlatformFilter] = useState("all");
    const [tagFilter, setTagFilter] = useState("all");
    const [sortFilter, setSortFilter] = useState("updated_desc");

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
    const [selectedIds, setSelectedIds] = useState([]);
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
                        <DataTable
                            onRowClick={(post) => setPreviewPostId(post.id)}
                            columns={[
                                {
                                    key: "article",
                                    title: t(
                                        "profile.blogManage.articleColumn",
                                        "文章信息",
                                    ),
                                    width: "30%",
                                    render: (post) => {
                                        const style = getTopicStyle(
                                            post.title || post.categoryName,
                                        );
                                        const Icon = style.icon;
                                        return (
                                            <div className="flex items-start gap-3 min-w-0 py-1">
                                                <div
                                                    className={`mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${style.bg}`}
                                                >
                                                    <Icon
                                                        className={`w-4 h-4 ${style.color}`}
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-bold text-ink">
                                                        {post.title ||
                                                            t(
                                                                "profile.blogManage.untitled",
                                                                "未命名",
                                                            )}
                                                    </div>
                                                    <div className="mt-1 line-clamp-1 text-[11px] text-ink-faint">
                                                        {post.summary ||
                                                            post.categoryName ||
                                                            "—"}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    },
                                },
                                {
                                    key: "tags",
                                    title: t(
                                        "profile.blogManage.category",
                                        "标签",
                                    ),
                                    width: "15%",
                                    render: (post) => (
                                        <div className="flex flex-wrap gap-1.5">
                                            {(post.categoryName
                                                ? [post.categoryName]
                                                : [
                                                      t(
                                                          "profile.blogManage.tagFrontend",
                                                          "前端",
                                                      ),
                                                  ]
                                            ).map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-medium border border-indigo-100"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    ),
                                },
                                {
                                    key: "status",
                                    title: t(
                                        "profile.blogManage.statusLabel",
                                        "状态",
                                    ),
                                    width: "10%",
                                    render: (post) => {
                                        const status = Number(post.status);
                                        if (status === BLOG_STATUS.PUBLISHED) {
                                            return (
                                                <span className="inline-flex rounded bg-green-50 px-1.5 py-0.5 text-[11px] font-medium text-green-600 border border-green-100">
                                                    {t(
                                                        "profile.blogManage.status.published",
                                                        "已发布",
                                                    )}
                                                </span>
                                            );
                                        }
                                        return (
                                            <span className="inline-flex rounded bg-orange-50 px-1.5 py-0.5 text-[11px] font-medium text-orange-600 border border-orange-100">
                                                {t(
                                                    "profile.blogManage.status.draft",
                                                    "待发布",
                                                )}
                                            </span>
                                        );
                                    },
                                },
                                {
                                    key: "platform",
                                    title: t(
                                        "profile.blogManage.platform",
                                        "平台",
                                    ),
                                    width: "15%",
                                    render: (post) => (
                                        <div className="flex flex-wrap gap-1.5">
                                            {post.csdnSynced && (
                                                <span className="px-1.5 py-0.5 rounded text-[11px] font-medium text-ink-muted border border-border">
                                                    CSDN
                                                </span>
                                            )}
                                            {post.juejinSynced && (
                                                <span className="px-1.5 py-0.5 rounded text-[11px] font-medium text-ink-muted border border-border">
                                                    {t(
                                                        "profile.blogManage.platformJuejin",
                                                        "掘金",
                                                    )}
                                                </span>
                                            )}
                                            {!post.csdnSynced &&
                                                !post.juejinSynced && (
                                                    <span className="px-1.5 py-0.5 rounded text-[11px] font-medium text-ink-muted border border-border">
                                                        {t(
                                                            "profile.blogManage.platformWechat",
                                                            "公众号",
                                                        )}
                                                    </span>
                                                )}
                                        </div>
                                    ),
                                },
                                {
                                    key: "time",
                                    title: t(
                                        "profile.blogManage.updatedAt",
                                        "更新时间",
                                    ),
                                    width: "15%",
                                    render: (post) => (
                                        <span className="text-[12px] text-ink-muted font-medium">
                                            {new Date(
                                                post.updatedAt ||
                                                    post.createdAt ||
                                                    Date.now(),
                                            ).toLocaleString("zh-CN", {
                                                hour12: false,
                                                year: "numeric",
                                                month: "numeric",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    ),
                                },
                                {
                                    key: "actions",
                                    title: t(
                                        "profile.blogManage.actionsColumn",
                                        "操作",
                                    ),
                                    width: "10%",
                                    render: (post) => {
                                        const status = Number(post.status);
                                        const menuItems = [];

                                        menuItems.push({
                                            key: "view",
                                            label: t(
                                                "profile.blogManage.actions.view",
                                                "查看",
                                            ),
                                            icon: Eye,
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                setPreviewPostId(post.id);
                                            },
                                        });

                                        menuItems.push({
                                            key: "edit",
                                            label: t(
                                                "profile.blogManage.actions.edit",
                                                "编辑",
                                            ),
                                            icon: FilePenLine,
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                navigate(
                                                    `/workspace/publish?id=${post.id}`,
                                                );
                                            },
                                        });

                                        if (status === BLOG_STATUS.DRAFT) {
                                            menuItems.push({
                                                key: "publish",
                                                label: t(
                                                    "profile.blogManage.actions.publish",
                                                    "发布",
                                                ),
                                                icon: Send,
                                                onClick: (e) => {
                                                    e.stopPropagation();
                                                    handleStatus(
                                                        post,
                                                        BLOG_STATUS.PUBLISHED,
                                                        "profile.blogManage.published",
                                                    );
                                                },
                                            });
                                        }

                                        if (status === BLOG_STATUS.PUBLISHED) {
                                            menuItems.push({
                                                key: "unpublish",
                                                label: t(
                                                    "profile.blogManage.actions.unpublish",
                                                    "取消发布",
                                                ),
                                                icon: Undo,
                                                onClick: (e) => {
                                                    e.stopPropagation();
                                                    handleStatus(
                                                        post,
                                                        BLOG_STATUS.DRAFT,
                                                        "profile.blogManage.unpublished",
                                                    );
                                                },
                                            });
                                        }

                                        menuItems.push({
                                            key: "syncCsdn",
                                            label: t(
                                                "profile.blogManage.actions.syncCsdn",
                                                "同步到 CSDN",
                                            ),
                                            icon: CloudUpload,
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                setCsdnPost(post);
                                            },
                                        });

                                        menuItems.push({
                                            key: "trash",
                                            label: t(
                                                "profile.blogManage.actions.trash",
                                                "删除",
                                            ),
                                            icon: Trash2,
                                            danger: true,
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                setConfirmAction({
                                                    type: "trash",
                                                    post,
                                                });
                                            },
                                        });

                                        return (
                                            <div
                                                className="flex items-center justify-start ml-2"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <RowActionsMenu
                                                    actions={menuItems}
                                                    size="sm"
                                                />
                                            </div>
                                        );
                                    },
                                },
                            ]}
                            rows={posts}
                            loading={loading}
                            loadingText={t("profile.blogManage.loading")}
                            error={
                                loadError
                                    ? t("profile.blogManage.loadError")
                                    : ""
                            }
                            onRetry={loadPosts}
                            onRetryLabel={t("profile.blogManage.retry")}
                            minWidth="940px"
                            page={page}
                            pageSize={pageSize}
                            total={total}
                            onPageChange={setPage}
                            onPageSizeChange={(size) => {
                                setPageSize(size);
                                setPage(1);
                            }}
                            paginationDisabled={loading}
                            className="!bg-transparent [&_th]:!bg-transparent [&_th]:!border-b [&_th]:!border-border/40 [&_td]:!border-b [&_td]:!border-border/20 [&_tr:last-child_td]:!border-b-0 [&_tr]:!bg-transparent hover:[&_tr]:!bg-surface-muted/20"
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
