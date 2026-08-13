import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '@components/common/CustomSelect';

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

const buildPageItems = (page, totalPages) => {
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
        .filter((pageNumber) => (
            totalPages <= 5
            || pageNumber === 1
            || pageNumber === totalPages
            || Math.abs(pageNumber - page) <= 1
        ));

    return pages.reduce((acc, pageNumber, index, list) => {
        if (index > 0 && pageNumber - list[index - 1] > 1) {
            acc.push('ellipsis');
        }
        acc.push(pageNumber);
        return acc;
    }, []);
};

/**
 * 统一列表分页栏（页码 + 每页条数）
 */
const Pagination = ({
    page,
    pageSize,
    total,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    onPageChange,
    onPageSizeChange,
    disabled = false,
    className = '',
    hideWhenEmpty = true,
}) => {
    const { t } = useTranslation();

    const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);
    const pageItems = useMemo(() => buildPageItems(page, totalPages), [page, totalPages]);

    const sizeOptions = useMemo(() => (
        pageSizeOptions.map((size) => ({
            value: String(size),
            label: t('common.pagination.pageSizeOption', { size }),
        }))
    ), [pageSizeOptions, t]);

    if (hideWhenEmpty && total <= 0) return null;

    const handlePageSizeChange = (value) => {
        const nextSize = Number(value);
        const safeSize = pageSizeOptions.includes(nextSize) ? nextSize : pageSizeOptions[0];
        onPageSizeChange?.(safeSize);
    };

    return (
        <div className={`flex shrink-0 flex-col gap-2 border-t border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 ${className}`}>
            <div className="flex flex-wrap items-center gap-2">
                <div className="text-micro font-medium text-ink-faint">
                    {t('common.pagination.pageInfo', { from, to, total })}
                </div>
                <div className="w-[7.5rem]">
                    <CustomSelect
                        size="sm"
                        options={sizeOptions}
                        value={String(pageSize)}
                        onChange={handlePageSizeChange}
                    />
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange?.(Math.max(1, page - 1))}
                    disabled={disabled || page <= 1}
                    className="grid h-7 w-7 place-items-center rounded-md border border-border text-ink-muted transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={t('common.pagination.prevPage')}
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {pageItems.map((item, index) => (
                    item === 'ellipsis' ? (
                        <span key={`ellipsis-${index}`} className="px-1 text-micro text-ink-faint">…</span>
                    ) : (
                        <button
                            key={item}
                            type="button"
                            onClick={() => onPageChange?.(item)}
                            disabled={disabled}
                            className={`grid h-7 w-7 place-items-center rounded-md text-micro font-bold transition disabled:opacity-40 ${
                                page === item
                                    ? 'bg-accent text-white'
                                    : 'border border-border text-ink-muted hover:bg-surface'
                            }`}
                        >
                            {item}
                        </button>
                    )
                ))}
                <button
                    type="button"
                    onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
                    disabled={disabled || page >= totalPages}
                    className="grid h-7 w-7 place-items-center rounded-md border border-border text-ink-muted transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={t('common.pagination.nextPage')}
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
