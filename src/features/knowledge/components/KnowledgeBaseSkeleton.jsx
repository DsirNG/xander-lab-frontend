import React from "react";

/**
 * 工作台标准骨架块样式（与 WorkspaceHomeSkeleton 1:1 统一）
 */
const BLOCK = "animate-pulse rounded bg-[#e9eaf4]/60";

/**
 * 知识库全局加载骨架屏
 * 与工作台整体风格及 KnowledgeDocBaseView 逐区块精准对应：
 * 顶部标题栏 + 左侧目录/标签/容量卡片 + 中间文件工作台表格卡片
 */
const KnowledgeBaseSkeleton = () => {
    return (
        <div
            className="flex h-full min-h-0 flex-1 flex-col space-y-4 overflow-hidden p-5 text-body text-[#555b7b]"
            aria-busy="true"
            aria-label="知识库加载中"
        >
            {/* 1. 顶部全局标题栏骨架 */}
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className={`${BLOCK} h-7 w-28 rounded-lg`} />
                    <div className={`${BLOCK} mt-2 h-4 w-64 rounded-md`} />
                </div>

                <div className="flex items-center gap-3">
                    <div className={`${BLOCK} h-9 w-24 rounded-xl`} />
                    <div className={`${BLOCK} h-9 w-28 rounded-xl`} />
                    <div className={`${BLOCK} h-9 w-9 rounded-xl`} />
                </div>
            </div>

            {/* 2. 下方三栏区域骨架 */}
            <div className="flex min-h-0 flex-1 gap-4">
                {/* 2.1 左侧卡片骨架 (文件夹 + 标签 + 存储容量) */}
                <div className="hidden w-64 shrink-0 flex-col justify-between rounded-2xl border border-[#e9eaf3] bg-white/70 p-4 shadow-xs lg:flex">
                    <div className="space-y-4">
                        {/* 快捷视图 全部文档 */}
                        <div className={`${BLOCK} h-9 w-full rounded-xl`} />

                        {/* 目录分类树 */}
                        <div className="border-t border-[#eef0f6] pt-3">
                            <div className="flex items-center justify-between px-1 mb-3">
                                <div className={`${BLOCK} h-4 w-16`} />
                                <div className="flex gap-1.5">
                                    <div className={`${BLOCK} h-4 w-4 rounded`} />
                                    <div className={`${BLOCK} h-4 w-4 rounded`} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 px-1">
                                    <div className={`${BLOCK} h-4 w-4 rounded`} />
                                    <div className={`${BLOCK} h-4 w-28`} />
                                    <div className={`${BLOCK} ml-auto h-3 w-6`} />
                                </div>
                                <div className="flex items-center gap-2 pl-4">
                                    <div className={`${BLOCK} h-4 w-4 rounded`} />
                                    <div className={`${BLOCK} h-4 w-24`} />
                                    <div className={`${BLOCK} ml-auto h-3 w-5`} />
                                </div>
                                <div className="flex items-center gap-2 pl-4">
                                    <div className={`${BLOCK} h-4 w-4 rounded`} />
                                    <div className={`${BLOCK} h-4 w-20`} />
                                    <div className={`${BLOCK} ml-auto h-3 w-5`} />
                                </div>
                                <div className="flex items-center gap-2 px-1">
                                    <div className={`${BLOCK} h-4 w-4 rounded`} />
                                    <div className={`${BLOCK} h-4 w-32`} />
                                    <div className={`${BLOCK} ml-auto h-3 w-6`} />
                                </div>
                                <div className="flex items-center gap-2 pl-4">
                                    <div className={`${BLOCK} h-4 w-4 rounded`} />
                                    <div className={`${BLOCK} h-4 w-22`} />
                                    <div className={`${BLOCK} ml-auto h-3 w-4`} />
                                </div>
                            </div>
                        </div>

                        {/* 标签 */}
                        <div className="border-t border-[#eef0f6] pt-3">
                            <div className="flex items-center justify-between px-1 mb-3">
                                <div className={`${BLOCK} h-4 w-12`} />
                                <div className={`${BLOCK} h-4 w-4 rounded`} />
                            </div>
                            <div className="space-y-2">
                                {[
                                    { w: "w-20", count: "w-5" },
                                    { w: "w-16", count: "w-6" },
                                    { w: "w-24", count: "w-4" },
                                    { w: "w-18", count: "w-5" },
                                    { w: "w-22", count: "w-4" },
                                ].map((tag, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-1">
                                        <div className={`${BLOCK} h-2.5 w-2.5 rounded-full`} />
                                        <div className={`${BLOCK} h-3.5 ${tag.w}`} />
                                        <div className={`${BLOCK} ml-auto h-3 ${tag.count}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 底部存储容量 */}
                    <div className="border-t border-[#eef0f6] pt-3">
                        <div className="flex justify-between items-center mb-2">
                            <div className={`${BLOCK} h-3 w-16`} />
                            <div className={`${BLOCK} h-3 w-20`} />
                        </div>
                        <div className={`${BLOCK} h-1.5 w-full rounded-full`} />
                    </div>
                </div>

                {/* 2.2 中间工作台卡片骨架 */}
                <div className="flex min-w-0 flex-1 flex-col justify-between rounded-2xl border border-[#e9eaf3] bg-white/70 p-4 shadow-xs">
                    {/* 顶部工具栏骨架 */}
                    <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-[#eef0f6] pb-3">
                        <div className={`${BLOCK} h-8.5 min-w-[220px] max-w-xs flex-1 rounded-xl`} />
                        <div className="flex items-center gap-2">
                            <div className={`${BLOCK} h-8 w-28 rounded-xl`} />
                            <div className={`${BLOCK} h-8 w-28 rounded-xl`} />
                            <div className={`${BLOCK} h-8 w-28 rounded-xl`} />
                            <div className={`${BLOCK} h-8 w-8 rounded-xl`} />
                        </div>
                    </div>

                    {/* 面包屑导航骨架 */}
                    <div className="shrink-0 my-3 flex items-center gap-2">
                        <div className={`${BLOCK} h-4 w-4 rounded-full`} />
                        <div className={`${BLOCK} h-4 w-40 rounded`} />
                    </div>

                    {/* 表格骨架 */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <div className="w-full space-y-3">
                            {/* 表头骨架 */}
                            <div className="flex items-center gap-4 pb-2.5 border-b border-[#eef0f6]">
                                <div className={`${BLOCK} h-3.5 w-4 rounded`} />
                                <div className={`${BLOCK} h-3.5 w-36`} />
                                <div className={`${BLOCK} h-3.5 w-16 hidden sm:block`} />
                                <div className={`${BLOCK} h-3.5 w-16 hidden md:block`} />
                                <div className={`${BLOCK} h-3.5 w-28 hidden lg:block`} />
                                <div className={`${BLOCK} h-3.5 w-16 hidden sm:block`} />
                                <div className={`${BLOCK} h-3.5 w-6 ml-auto`} />
                            </div>

                            {/* 数据行骨架 */}
                            {[
                                { name: "w-64", type: "w-12", size: "w-14", status: "w-16" },
                                { name: "w-52", type: "w-10", size: "w-16", status: "w-16" },
                                { name: "w-72", type: "w-14", size: "w-12", status: "w-14" },
                                { name: "w-48", type: "w-12", size: "w-16", status: "w-16" },
                                { name: "w-60", type: "w-10", size: "w-14", status: "w-16" },
                                { name: "w-56", type: "w-12", size: "w-12", status: "w-14" },
                                { name: "w-68", type: "w-14", size: "w-16", status: "w-16" },
                            ].map((row, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-4 py-2.5 border-b border-[#f3f4f8]"
                                >
                                    <div className={`${BLOCK} h-3.5 w-4 rounded`} />
                                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                        <div className={`${BLOCK} h-6 w-6 rounded-md shrink-0`} />
                                        <div className={`${BLOCK} h-4 ${row.name}`} />
                                    </div>
                                    <div className={`${BLOCK} h-3.5 ${row.type} hidden sm:block`} />
                                    <div className={`${BLOCK} h-3.5 ${row.size} hidden md:block`} />
                                    <div className={`${BLOCK} h-3.5 w-28 hidden lg:block`} />
                                    <div className={`${BLOCK} h-5.5 ${row.status} rounded-full hidden sm:block`} />
                                    <div className={`${BLOCK} h-5 w-5 rounded ml-auto`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 底部通用分页骨架 */}
                    <div className="shrink-0 flex items-center justify-between border-t border-[#eef0f6] pt-3">
                        <div className={`${BLOCK} h-4 w-20`} />
                        <div className="flex items-center gap-1.5">
                            <div className={`${BLOCK} h-7 w-7 rounded-lg`} />
                            <div className={`${BLOCK} h-7 w-7 rounded-lg`} />
                            <div className={`${BLOCK} h-7 w-7 rounded-lg`} />
                            <div className={`${BLOCK} h-7 w-7 rounded-lg`} />
                            <div className={`${BLOCK} h-7 w-7 rounded-lg`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnowledgeBaseSkeleton;
