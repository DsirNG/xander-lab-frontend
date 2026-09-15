import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Plus, Tag as TagIcon, X } from "lucide-react";
import Modal from "@components/common/Modal";
import Button from "@components/common/Button";
import FormField from "@components/common/FormField";
import { formInputCls } from "@components/common/formStyles";

const DEFAULT_TAG_COLORS = [
    "#6765f6", // accent
    "#10b981", // emerald
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#ec4899", // pink
    "#8b5cf6", // purple
    "#06b6d4", // cyan
];

const KnowledgeTagFilter = ({
    tags = [],
    selectedTagIds = [],
    onToggleTag,
    onClearTags,
    onCreateTag,
}) => {
    const { t } = useTranslation();
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [tagName, setTagName] = useState("");
    const [tagColor, setTagColor] = useState(DEFAULT_TAG_COLORS[0]);
    const [tagDesc, setTagDesc] = useState("");
    const [saving, setSaving] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        const trimmed = tagName.trim();
        if (!trimmed) return;
        setSaving(true);
        try {
            await onCreateTag({
                name: trimmed,
                color: tagColor,
                description: tagDesc.trim() || null,
            });
            setCreateModalOpen(false);
            setTagName("");
            setTagDesc("");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2 py-2">
            <div className="flex items-center gap-1.5 text-caption font-semibold text-[#8e94ad]">
                <TagIcon className="h-3.5 w-3.5" />
                <span>{t("knowledgeBase.tags.title", "标签")}：</span>
            </div>

            {selectedTagIds.length > 0 ? (
                <button
                    type="button"
                    onClick={onClearTags}
                    className="flex items-center gap-1 rounded-full border border-[#e9eaf4] bg-white px-2.5 py-1 text-micro text-[#8e94ad] transition hover:bg-[#f7f6fc] hover:text-[#111426] dark:border-white/10 dark:bg-white/5"
                >
                    <span>{t("common.clear", "清空")}</span>
                    <X className="h-3 w-3" />
                </button>
            ) : null}

            {tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                    <button
                        key={tag.id}
                        type="button"
                        onClick={() => onToggleTag(tag.id)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-caption transition ${
                            isSelected
                                ? "bg-[#f2f1fd] text-[#6765f6] font-semibold border border-[#e2e0fb] shadow-2xs"
                                : "border border-[#e9eaf4] bg-white text-[#555b7b] hover:bg-[#f7f6fc] hover:text-[#111426] dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                        }`}
                    >
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: tag.color || "#7771ed" }}
                        />
                        <span>{tag.name}</span>
                        {tag.usageCount != null ? (
                            <span
                                className={`text-micro ${
                                    isSelected ? "text-[#6765f6]" : "text-[#8e94ad]"
                                }`}
                            >
                                ({tag.usageCount})
                            </span>
                        ) : null}
                    </button>
                );
            })}

            <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-1 rounded-full border border-dashed border-[#e9eaf4] bg-white/50 px-2.5 py-1 text-caption text-[#8e94ad] transition hover:border-[#7771ed] hover:text-[#6765f6] dark:border-white/10 dark:bg-white/5"
                title={t("knowledgeBase.tags.create", "新建标签")}
            >
                <Plus className="h-3 w-3" />
                <span>{t("knowledgeBase.tags.addBtn", "新建标签")}</span>
            </button>

            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title={t("knowledgeBase.tags.createTitle", "新建标签词条")}
                width="max-w-md"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => setCreateModalOpen(false)}
                            disabled={saving}
                        >
                            {t("common.cancel", "取消")}
                        </Button>
                        <Button
                            type="submit"
                            form="create-tag-form"
                            loading={saving}
                            disabled={!tagName.trim()}
                        >
                            {t("common.confirm", "确定")}
                        </Button>
                    </>
                }
            >
                <form id="create-tag-form" onSubmit={handleCreate} className="space-y-4">
                    <FormField
                        label={t("knowledgeBase.tags.nameLabel", "标签名")}
                        required
                    >
                        <input
                            type="text"
                            className={formInputCls}
                            placeholder={t("knowledgeBase.tags.namePlaceholder", "例如：技术架构、产品设计")}
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                            maxLength={60}
                            autoFocus
                        />
                    </FormField>

                    <FormField label={t("knowledgeBase.tags.colorLabel", "标签颜色")}>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            {DEFAULT_TAG_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setTagColor(c)}
                                    className={`h-6 w-6 rounded-full transition ${
                                        tagColor === c
                                            ? "ring-2 ring-[#6765f6] ring-offset-2 scale-110"
                                            : "hover:scale-105"
                                    }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </FormField>

                    <FormField label={t("knowledgeBase.tags.descLabel", "说明（可选）")}>
                        <input
                            type="text"
                            className={formInputCls}
                            placeholder={t("knowledgeBase.tags.descPlaceholder", "便于回忆标签用途")}
                            value={tagDesc}
                            onChange={(e) => setTagDesc(e.target.value)}
                            maxLength={200}
                        />
                    </FormField>
                </form>
            </Modal>
        </div>
    );
};

KnowledgeTagFilter.propTypes = {
    tags: PropTypes.array,
    selectedTagIds: PropTypes.array,
    onToggleTag: PropTypes.func.isRequired,
    onClearTags: PropTypes.func.isRequired,
    onCreateTag: PropTypes.func.isRequired,
};

export default KnowledgeTagFilter;
