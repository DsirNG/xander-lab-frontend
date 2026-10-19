import React, { useMemo } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import CustomSelect from "@shared/ui/forms/CustomSelect";
import Button from "@shared/ui/primitives/Button";

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

const buildPageItems = (page, totalPages) => {
    const pages = Array.from(
        { length: totalPages },
        (_, index) => index + 1,
    ).filter(
        (pageNumber) =>
            totalPages <= 5 ||
            pageNumber === 1 ||
            pageNumber === totalPages ||
            Math.abs(pageNumber - page) <= 1,
    );

    return pages.reduce((acc, pageNumber, index, list) => {
        if (index > 0 && pageNumber - list[index - 1] > 1) {
            acc.push("ellipsis");
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
    className = "",
    hideWhenEmpty = true,
}) => {
    const { t } = useTranslation();

    const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);
    const pageItems = useMemo(
        () => buildPageItems(page, totalPages),
        [page, totalPages],
    );

    const sizeOptions = useMemo(
        () =>
            pageSizeOptions.map((size) => ({
                value: String(size),
                label: t("common.pagination.pageSizeOption", { size }),
            })),
        [pageSizeOptions, t],
    );

    if (hideWhenEmpty && total <= 0) return null;

    const handlePageSizeChange = (value) => {
        const nextSize = Number(value);
        const safeSize = pageSizeOptions.includes(nextSize)
            ? nextSize
            : pageSizeOptions[0];
        onPageSizeChange?.(safeSize);
    };

    return (
        <div
            className={`flex shrink-0 flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 ${className}`}
        >
            <div className="flex flex-wrap items-center gap-2">
                <div className="text-caption text-ink-muted">
                    {t("common.pagination.pageInfo", { from, to, total })}
                </div>
                <div className="w-[7.5rem]">
                    <CustomSelect
                        size="md"
                        variant="outline"
                        options={sizeOptions}
                        value={String(pageSize)}
                        onChange={handlePageSizeChange}
                        triggerClassName="!border-border !bg-canvas !text-ink-secondary hover:!border-accent-600 hover:!bg-surface-muted rounded-xl"
                        dropdownClassName="!border-border !bg-canvas !shadow-xl !shadow-ink/10 rounded-xl"
                    />
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
                <Button
                    onClick={() => onPageChange?.(Math.max(1, page - 1))}
                    disabled={disabled || page <= 1}
                    variant="outline"
                    size="lg"
                    icon={ArrowLeft}
                    aria-label={t("common.pagination.prevPage")}
                    className="!border-border !bg-canvas !text-ink-secondary hover:!border-accent-600 hover:!text-accent-600 hover:!bg-surface-muted rounded-xl"
                />
                {pageItems.map((item, index) =>
                    item === "ellipsis" ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-1 text-micro text-[#8e94ad]"
                        >
                            …
                        </span>
                    ) : (
                        <Button
                            key={item}
                            onClick={() => onPageChange?.(item)}
                            disabled={disabled}
                            variant="outline"
                            size="lg"
                            className={`!h-11 !w-11 !p-0 rounded-xl transition ${
                                page === item
                                    ? "bg-accent text-white border-accent hover:bg-accent-700 hover:text-white hover:border-accent shadow-2xs"
                                    : "!border-border !bg-canvas !text-ink-secondary hover:!border-accent-600 hover:!text-accent-600 hover:!bg-surface-muted"
                            }`}
                        >
                            {item}
                        </Button>
                    ),
                )}
                <Button
                    onClick={() =>
                        onPageChange?.(Math.min(totalPages, page + 1))
                    }
                    disabled={disabled || page >= totalPages}
                    variant="outline"
                    size="lg"
                    icon={ArrowRight}
                    aria-label={t("common.pagination.nextPage")}
                    className="!border-border !bg-canvas !text-ink-secondary hover:!border-accent-600 hover:!text-accent-600 hover:!bg-surface-muted rounded-xl"
                />
            </div>
        </div>
    );
};

export default Pagination;
