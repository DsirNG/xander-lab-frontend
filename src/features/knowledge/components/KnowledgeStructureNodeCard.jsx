import React, { useState } from "react";
import PropTypes from "prop-types";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * 递归渲染知识导图节点
 */
const KnowledgeStructureNodeCard = ({ node, depth = 0, onChapterClick }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    const badgeColor =
        {
            ROOT: "bg-[#7771ed] text-white shadow-xs",
            CHAPTER: "bg-[#f2f1fd] text-[#6765f6] border border-[#e2e0fb]",
            SECTION: "bg-[#fbfbfe] text-[#555b7b] border border-[#eef0f6]",
            POINT: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        }[node.nodeType] ||
        "bg-[#fbfbfe] text-[#555b7b] border border-[#eef0f6]";

    return (
        <div
            className="relative my-1.5"
            style={{ paddingLeft: depth > 0 ? "20px" : "0px" }}
        >
            {depth > 0 ? (
                <div className="absolute -left-1 top-4 h-full w-px bg-[#eef0f6]" />
            ) : null}

            <div className="rounded-2xl border border-[#eef0f6] bg-white p-3 transition hover:border-[#6765f6]/40 hover:shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {hasChildren ? (
                            <button
                                type="button"
                                onClick={() => setExpanded((v) => !v)}
                                className="p-0.5 text-[#8e94ad] hover:text-[#111426] transition"
                            >
                                {expanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </button>
                        ) : (
                            <span className="w-4" />
                        )}

                        <span
                            className={`rounded-md px-1.5 py-0.5 text-micro font-medium ${badgeColor}`}
                        >
                            {node.nodeType}
                        </span>

                        <span className="text-body font-semibold text-[#111426]">
                            {node.title}
                        </span>
                    </div>

                    {node.chapterId ? (
                        <button
                            type="button"
                            onClick={() => onChapterClick(node.chapterId)}
                            className="text-caption text-[#6765f6] hover:underline transition"
                        >
                            定位到章节原文 →
                        </button>
                    ) : null}
                </div>

                {node.summary ? (
                    <div className="mt-2 text-caption text-[#555b7b] leading-relaxed">
                        {node.summary}
                    </div>
                ) : null}
            </div>

            {hasChildren && expanded ? (
                <div className="space-y-1">
                    {node.children.map((child) => (
                        <KnowledgeStructureNodeCard
                            key={child.id || child.title}
                            node={child}
                            depth={depth + 1}
                            onChapterClick={onChapterClick}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
};

KnowledgeStructureNodeCard.propTypes = {
    node: PropTypes.object.isRequired,
    depth: PropTypes.number,
    onChapterClick: PropTypes.func.isRequired,
};

export default KnowledgeStructureNodeCard;
