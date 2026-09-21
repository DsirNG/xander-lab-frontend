import React from "react";
import PropTypes from "prop-types";
import { Search, LayoutGrid } from "lucide-react";
import CustomSelect from "@shared/ui/forms/CustomSelect";
import {
    EXTENSION_OPTIONS,
    SORT_OPTIONS,
    STATUS_OPTIONS,
} from "./KnowledgeFileFilterOptions";

/**
 * 知识库文件检索与多维筛选工具栏组件
 */
const KnowledgeFileFilterBar = ({
    keyword = "",
    onSearchChange,
    extensionFilter = "",
    onExtensionFilterChange,
    statusFilter = "",
    onStatusFilterChange,
    sortFilter = "recent",
    onSortFilterChange,
}) => {
    return (
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-[#eef0f6] pb-3 dark:border-white/5">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8e94ad]" />
                <input
                    type="text"
                    className="w-full rounded-xl border border-[#e9eaf4] bg-white py-1.5 pl-8 pr-3 text-caption text-[#555b7b] placeholder:text-[#8e94ad] focus:border-[#6765f6] focus:outline-none focus:ring-2 focus:ring-[#6765f6]/15 transition dark:border-white/10 dark:bg-canvas"
                    placeholder="搜索文件、内容或标签..."
                    value={keyword}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-2">
                <div className="w-28">
                    <CustomSelect
                        size="xs"
                        variant="outline"
                        options={EXTENSION_OPTIONS}
                        value={extensionFilter}
                        onChange={(val) => onExtensionFilterChange?.(val)}
                        triggerClassName="!border-[#e9eaf4] !bg-white !text-[#555b7b] hover:!border-[#6765f6] hover:!bg-[#fbfbfe] rounded-xl"
                        dropdownClassName="!border-[#eef0f6] !bg-white !shadow-xl !shadow-[#111426]/8 rounded-xl"
                    />
                </div>

                <div className="w-28">
                    <CustomSelect
                        size="xs"
                        variant="outline"
                        options={STATUS_OPTIONS}
                        value={statusFilter}
                        onChange={(val) => onStatusFilterChange?.(val)}
                        triggerClassName="!border-[#e9eaf4] !bg-white !text-[#555b7b] hover:!border-[#6765f6] hover:!bg-[#fbfbfe] rounded-xl"
                        dropdownClassName="!border-[#eef0f6] !bg-white !shadow-xl !shadow-[#111426]/8 rounded-xl"
                    />
                </div>

                <div className="w-28">
                    <CustomSelect
                        size="xs"
                        variant="outline"
                        options={SORT_OPTIONS}
                        value={sortFilter}
                        onChange={(val) => onSortFilterChange?.(val)}
                        triggerClassName="!border-[#e9eaf4] !bg-white !text-[#555b7b] hover:!border-[#6765f6] hover:!bg-[#fbfbfe] rounded-xl"
                        dropdownClassName="!border-[#eef0f6] !bg-white !shadow-xl !shadow-[#111426]/8 rounded-xl"
                    />
                </div>

                <button
                    type="button"
                    className="rounded-xl border border-[#e9eaf4] bg-white p-1.5 text-[#8e94ad] transition hover:bg-[#f7f6fc] hover:text-[#6765f6] hover:border-[#6765f6] dark:border-white/10 dark:bg-canvas"
                    title="视图布局"
                >
                    <LayoutGrid className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

KnowledgeFileFilterBar.propTypes = {
    keyword: PropTypes.string,
    onSearchChange: PropTypes.func.isRequired,
    extensionFilter: PropTypes.string,
    onExtensionFilterChange: PropTypes.func,
    statusFilter: PropTypes.string,
    onStatusFilterChange: PropTypes.func,
    sortFilter: PropTypes.string,
    onSortFilterChange: PropTypes.func,
};

export default KnowledgeFileFilterBar;
