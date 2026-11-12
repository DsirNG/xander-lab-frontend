import React from "react";
import { Layout, Tag as TagIcon, AlignLeft } from "lucide-react";
import CustomSelect from "@shared/ui/forms/CustomSelect";
import { formInputCls } from "@shared/ui/forms/formStyles";
import CreatableMultiSelect from "@shared/ui/forms/CreatableMultiSelect";

/**
 * 博客发布页右侧设置面板：分类、标签、摘要
 */
const PublishSettings = ({
    t,
    isSettingsOpen,
    categories,
    availableTags,
    values,
    onChange,
    onToggleSettings,
}) => {
    return (
        <>
            {isSettingsOpen && (
                <div
                    className="absolute inset-0 bg-ink/20 z-30"
                    onClick={onToggleSettings}
                />
            )}

            <aside
                className={`absolute top-0 right-0 bottom-0 w-[min(22rem,100vw)] border-l border-border bg-surface flex flex-col z-40 transform shadow-float transition-transform duration-300 ease-in-out ${isSettingsOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 sm:p-6 space-y-6 pb-6">
                    <div>
                        <span className="text-micro font-bold uppercase text-ink-faint mb-6 flex items-center gap-3">
                            <span className="h-px bg-border flex-1"></span>
                            {t("blog.publishSettings", "Document settings")}
                            <span className="h-px bg-border flex-1"></span>
                        </span>

                        <section className="space-y-4 mb-6">
                            <div className="flex items-center gap-2 text-ink-muted group">
                                <Layout className="w-4 h-4 group-hover:text-ink-secondary transition-colors" />
                                <span className="text-micro font-semibold uppercase tracking-widest">
                                    {t("blog.categoryLabel")}
                                </span>
                            </div>
                            <CustomSelect
                                options={categories}
                                value={values.categoryId}
                                onChange={(val) => onChange("categoryId", val)}
                                placeholder={t("blog.categoryPlaceholder")}
                                className="w-full"
                            />
                        </section>

                        <section className="space-y-4 mb-6 relative">
                            <div className="flex items-center justify-between group mb-2">
                                <div className="flex items-center gap-2 text-ink-muted">
                                    <TagIcon className="w-4 h-4 group-hover:text-ink-secondary transition-colors" />
                                    <span className="text-micro font-semibold uppercase tracking-widest">
                                        {t("blog.tagLabel")}
                                    </span>
                                </div>
                                <span className="text-micro text-ink-faint font-medium">
                                    Press Enter ↵
                                </span>
                            </div>
                            <CreatableMultiSelect
                                value={values.tags}
                                onChange={(newTags) =>
                                    onChange("tags", newTags)
                                }
                                options={availableTags}
                            />
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-2 text-ink-muted">
                                    <AlignLeft className="w-4 h-4 group-hover:text-ink-secondary transition-colors" />
                                    <span className="text-micro font-semibold uppercase tracking-widest">
                                        {t("blog.summaryLabel")}
                                    </span>
                                </div>
                                <span
                                    className={`text-micro font-medium ${values.summary.length > 100 ? "text-danger" : "text-ink-faint"}`}
                                >
                                    {values.summary.length} / 100
                                </span>
                            </div>
                            <textarea
                                value={values.summary}
                                onChange={(e) =>
                                    onChange("summary", e.target.value)
                                }
                                placeholder={t("blog.summaryPlaceholder")}
                                className={`${formInputCls} h-40 resize-none leading-relaxed custom-scrollbar`}
                            />
                            <p className="text-micro text-ink-faint">
                                {t("blog.summaryHint")}
                            </p>
                        </section>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default PublishSettings;
