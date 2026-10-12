import PropTypes from "prop-types";
import {
    CloudUpload,
    Eye,
    FilePenLine,
    FileText,
    Send,
    Trash2,
    Undo,
} from "lucide-react";
import DataTable from "@shared/ui/data-display/DataTable";
import RowActionsMenu from "@shared/ui/overlays/RowActionsMenu";
import { BLOG_STATUS } from "../services/blogService";

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
    onSync,
    busy = false,
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
                    return (
                        <div className="flex min-w-0 items-start gap-3 py-1">
                            <div
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted`}
                            >
                                <FileText className="h-4 w-4 text-ink-muted" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium text-ink">
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
                            : [t("contentLibrary.uncategorized")]
                        ).map((tag, index) => (
                            <span
                                key={index}
                                className="rounded-md border border-border bg-surface-muted px-2 py-0.5 text-caption text-ink-muted"
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
                                {t("contentLibrary.notSynced")}
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
                        {post.updatedAt || post.createdAt
                            ? new Date(
                                  post.updatedAt || post.createdAt,
                              ).toLocaleString(undefined, {
                                  hour12: false,
                                  year: "numeric",
                                  month: "numeric",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                              })
                            : "—"}
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
                            onClick: () => {
                                onPreview(post);
                            },
                        },
                        {
                            key: "edit",
                            label: t("profile.blogManage.actions.edit", "编辑"),
                            icon: FilePenLine,
                            onClick: () => {
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
                            onClick: () => {
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
                            onClick: () => {
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
                            key: "sync",
                            label: t("articleSync.title"),
                            icon: CloudUpload,
                            onClick: () => {
                                onSync(post);
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
                            onClick: () => {
                                onDelete(post);
                            },
                        },
                    );
                    return (
                        <div
                            className="ml-2 flex items-center justify-start"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <RowActionsMenu
                                actions={menuItems.map((item) => ({
                                    ...item,
                                    disabled: busy,
                                }))}
                                ariaLabel={t("profile.blogManage.actionsColumn")}
                                size="sm"
                            />
                        </div>
                    );
                },
            },
        ]}
        emptyTitle={t("contentLibrary.emptyArticles")}
        emptyHint={t("contentLibrary.emptyArticleHint")}
        emptyIcon={FileText}
        rows={posts}
        loading={loading}
        loadingText={t("profile.blogManage.loading")}
        error={loadError ? t("profile.blogManage.loadError") : ""}
        onRetry={loadPosts}
        onRetryLabel={t("profile.blogManage.retry")}
        minWidth="840px"
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
    onSync: PropTypes.func.isRequired,
    busy: PropTypes.bool,
    onDelete: PropTypes.func.isRequired,
};

export default BlogManageTable;
