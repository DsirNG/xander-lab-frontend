import PropTypes from "prop-types";
import {
    Calendar,
    CloudUpload,
    Code,
    Eye,
    FilePenLine,
    FileText,
    Globe,
    LayoutTemplate,
    Lightbulb,
    Link2,
    Send,
    Star,
    Trash2,
    Undo,
} from "lucide-react";
import DataTable from "@shared/ui/data-display/DataTable";
import RowActionsMenu from "@shared/ui/overlays/RowActionsMenu";
import { BLOG_STATUS } from "../services/blogService";

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
        return {
            icon: Calendar,
            color: "text-purple-500",
            bg: "bg-purple-50",
        };
    if (topic.includes("资讯") || topic.includes("精选"))
        return { icon: Star, color: "text-blue-500", bg: "bg-blue-50" };
    if (topic.includes("面试") || topic.includes("解析"))
        return { icon: Lightbulb, color: "text-red-500", bg: "bg-red-50" };
    return { icon: Link2, color: "text-accent", bg: "bg-accent-soft" };
};

const BlogManageTable = ({
    t,
    posts,
    loading,
    loadError,
    loadPosts,
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
    onPreview,
    onEdit,
    onStatusChange,
    onSyncCsdn,
    onDelete,
}) => (
    <DataTable
        onRowClick={onPreview}
        columns={[
            {
                key: "article",
                title: t("profile.blogManage.articleColumn", "文章信息"),
                width: "30%",
                render: (post) => {
                    const style = getTopicStyle(
                        post.title || post.categoryName,
                    );
                    const Icon = style.icon;
                    return (
                        <div className="flex min-w-0 items-start gap-3 py-1">
                            <div
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.bg}`}
                            >
                                <Icon className={`h-4 w-4 ${style.color}`} />
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
                                    {post.summary || post.categoryName || "—"}
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                key: "tags",
                title: t("profile.blogManage.category", "标签"),
                width: "15%",
                render: (post) => (
                    <div className="flex flex-wrap gap-1.5">
                        {(post.categoryName
                            ? [post.categoryName]
                            : [t("profile.blogManage.tagFrontend", "前端")]
                        ).map((tag, index) => (
                            <span
                                key={index}
                                className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                ),
            },
            {
                key: "status",
                title: t("profile.blogManage.statusLabel", "状态"),
                width: "10%",
                render: (post) =>
                    Number(post.status) === BLOG_STATUS.PUBLISHED ? (
                        <span className="inline-flex rounded border border-green-100 bg-green-50 px-1.5 py-0.5 text-[11px] font-medium text-green-600">
                            {t("profile.blogManage.status.published", "已发布")}
                        </span>
                    ) : (
                        <span className="inline-flex rounded border border-orange-100 bg-orange-50 px-1.5 py-0.5 text-[11px] font-medium text-orange-600">
                            {t("profile.blogManage.status.draft", "待发布")}
                        </span>
                    ),
            },
            {
                key: "platform",
                title: t("profile.blogManage.platform", "平台"),
                width: "15%",
                render: (post) => (
                    <div className="flex flex-wrap gap-1.5">
                        {post.csdnSynced ? (
                            <span className="rounded border border-border px-1.5 py-0.5 text-[11px] font-medium text-ink-muted">
                                CSDN
                            </span>
                        ) : null}
                        {post.juejinSynced ? (
                            <span className="rounded border border-border px-1.5 py-0.5 text-[11px] font-medium text-ink-muted">
                                {t("profile.blogManage.platformJuejin", "掘金")}
                            </span>
                        ) : null}
                        {!post.csdnSynced && !post.juejinSynced ? (
                            <span className="rounded border border-border px-1.5 py-0.5 text-[11px] font-medium text-ink-muted">
                                {t(
                                    "profile.blogManage.platformWechat",
                                    "公众号",
                                )}
                            </span>
                        ) : null}
                    </div>
                ),
            },
            {
                key: "time",
                title: t("profile.blogManage.updatedAt", "更新时间"),
                width: "15%",
                render: (post) => (
                    <span className="text-[12px] font-medium text-ink-muted">
                        {new Date(
                            post.updatedAt || post.createdAt || Date.now(),
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
                title: t("profile.blogManage.actionsColumn", "操作"),
                width: "10%",
                render: (post) => {
                    const status = Number(post.status);
                    const menuItems = [
                        {
                            key: "view",
                            label: t("profile.blogManage.actions.view", "查看"),
                            icon: Eye,
                            onClick: (event) => {
                                event.stopPropagation();
                                onPreview(post);
                            },
                        },
                        {
                            key: "edit",
                            label: t("profile.blogManage.actions.edit", "编辑"),
                            icon: FilePenLine,
                            onClick: (event) => {
                                event.stopPropagation();
                                onEdit(post);
                            },
                        },
                    ];
                    if (status === BLOG_STATUS.DRAFT) {
                        menuItems.push({
                            key: "publish",
                            label: t(
                                "profile.blogManage.actions.publish",
                                "发布",
                            ),
                            icon: Send,
                            onClick: (event) => {
                                event.stopPropagation();
                                onStatusChange(
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
                            onClick: (event) => {
                                event.stopPropagation();
                                onStatusChange(
                                    post,
                                    BLOG_STATUS.DRAFT,
                                    "profile.blogManage.unpublished",
                                );
                            },
                        });
                    }
                    menuItems.push(
                        {
                            key: "syncCsdn",
                            label: t(
                                "profile.blogManage.actions.syncCsdn",
                                "同步到 CSDN",
                            ),
                            icon: CloudUpload,
                            onClick: (event) => {
                                event.stopPropagation();
                                onSyncCsdn(post);
                            },
                        },
                        {
                            key: "trash",
                            label: t(
                                "profile.blogManage.actions.trash",
                                "删除",
                            ),
                            icon: Trash2,
                            danger: true,
                            onClick: (event) => {
                                event.stopPropagation();
                                onDelete(post);
                            },
                        },
                    );
                    return (
                        <div
                            className="ml-2 flex items-center justify-start"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <RowActionsMenu actions={menuItems} size="sm" />
                        </div>
                    );
                },
            },
        ]}
        rows={posts}
        loading={loading}
        loadingText={t("profile.blogManage.loading")}
        error={loadError ? t("profile.blogManage.loadError") : ""}
        onRetry={loadPosts}
        onRetryLabel={t("profile.blogManage.retry")}
        minWidth="940px"
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        paginationDisabled={loading}
        className="!bg-transparent [&_th]:!bg-transparent [&_th]:!border-b [&_th]:!border-border/40 [&_td]:!border-b [&_td]:!border-border/20 [&_tr:last-child_td]:!border-b-0 [&_tr]:!bg-transparent hover:[&_tr]:!bg-surface-muted/20"
    />
);

BlogManageTable.propTypes = {
    t: PropTypes.func.isRequired,
    posts: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    loadError: PropTypes.bool.isRequired,
    loadPosts: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onPageSizeChange: PropTypes.func.isRequired,
    onPreview: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onStatusChange: PropTypes.func.isRequired,
    onSyncCsdn: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default BlogManageTable;
