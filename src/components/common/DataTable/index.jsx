import React from 'react';
import { AlertCircle, Inbox } from 'lucide-react';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Pagination from '@components/common/Pagination';

const ALIGN_CLASSES = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};

/**
 * 通用数据表格：表头 + 分页插件 + 加载/错误/空态
 *
 * 适用于「定时邮箱 / 博客管理 / 定时发文」这类分页列表场景。
 * 表格列通过 columns 声明式配置，行渲染由各列 render(row) 决定，
 * 操作列同样放入 render 中。
 */
const DataTable = ({
    columns,
    rows = [],
    loading = false,
    error = '',
    errorTitle = '',
    onRetry,
    onRetryLabel,
    loadingText,
    emptyTitle,
    emptyHint,
    emptyIcon: EmptyIcon = Inbox,
    minWidth = '720px',
    className = '',
    rowKey = (row) => row.id,
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
    paginationDisabled = false,
    header,
}) => {
    const alignClass = (align) => ALIGN_CLASSES[align] || ALIGN_CLASSES.left;

    return (
        <section className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-canvas ${className}`}>
            {header ? <div className="shrink-0">{header}</div> : null}
            <div className="min-w-0 flex-1 overflow-auto">
                {loading ? (
                    <div className="flex min-h-[220px] items-center justify-center">
                        <LoadingSpinner fullScreen={false} text={loadingText} />
                    </div>
                ) : error ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                        <AlertCircle className="mb-2 h-7 w-7 text-danger" />
                        <div className="text-xs font-bold text-danger-fg">{errorTitle || error}</div>
                        {error && errorTitle ? (
                            <div className="mt-1 max-w-sm text-caption font-medium text-danger">{error}</div>
                        ) : null}
                        {onRetry ? (
                            <button
                                type="button"
                                onClick={onRetry}
                                className="mt-3 rounded-lg bg-danger px-3 py-1.5 text-caption font-bold text-white transition hover:bg-danger-fg"
                            >
                                {onRetryLabel || ''}
                            </button>
                        ) : null}
                    </div>
                ) : rows.length === 0 ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                        <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-surface text-ink-faint">
                            <EmptyIcon className="h-5 w-5" />
                        </span>
                        <div className="text-xs font-bold text-ink-secondary">{emptyTitle}</div>
                        {emptyHint ? (
                            <div className="mt-1 max-w-xs text-caption font-medium leading-5 text-ink-faint">
                                {emptyHint}
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <table className="w-full table-fixed text-left" style={{ minWidth }}>
                        <colgroup>
                            {columns.map((column) => (
                                <col key={column.key} style={column.width ? { width: column.width } : undefined} />
                            ))}
                        </colgroup>
                        <thead className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm">
                            <tr className="border-b border-border text-micro font-bold uppercase tracking-wide text-ink-faint">
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={`px-3 py-2 sm:px-4 ${alignClass(column.align)} ${column.headerClassName || ''}`}
                                    >
                                        {column.title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {rows.map((row) => (
                                <tr key={rowKey(row)} className="hover:bg-surface/70">
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={`px-3 py-2.5 sm:px-4 ${alignClass(column.align)} ${column.className || ''}`}
                                        >
                                            {column.render ? column.render(row) : (row[column.key] ?? '—')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                disabled={paginationDisabled}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
            />
        </section>
    );
};

export default DataTable;
