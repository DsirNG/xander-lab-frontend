import React from "react";
import { Layout, Tag as TagIcon, AlignLeft } from "lucide-react";
import CustomSelect from "@/components/common/CustomSelect";
import CreatableMultiSelect from "@/components/common/CreatableMultiSelect";

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
                    className="fixed inset-x-0 bottom-0 top-14 bg-black/25 z-30 backdrop-blur-[1px]"
                    onClick={onToggleSettings}
                />
            )}

            <aside
                className={`fixed top-14 right-0 bottom-0 w-[min(22rem,100vw)] border-l border-border bg-surface flex flex-col z-40 transform shadow-2xl transition-transform duration-300 ease-in-out ${isSettingsOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 sm:p-6 space-y-8 sm:space-y-10 pb-24">
                    <div>
                        <span className="text-micro font-bold uppercase text-ink-faint mb-8 flex items-center gap-3">
                            <span className="h-px bg-border flex-1"></span>
                            {t("blog.publishSettings", "Document settings")}
                            <span className="h-px bg-border flex-1"></span>
                        </span>

                        <section className="space-y-4 mb-10">
                            <div className="flex items-center gap-2 text-ink-muted group">
                                <Layout className="w-4 h-4 group-hover:text-accent transition-colors" />
                                <span className="text-micro font-black uppercase tracking-widest">
                                    {t("blog.categoryLabel")}
                                </span>
                            </div>
                            <CustomSelect
                                options={categories}
                                value={values.categoryId}
                                onChange={(val) => onChange("categoryId", val)}
                                placeholder={t("blog.categoryPlaceholder")}
                                className="w-full shadow-sm bg-canvas rounded-2xl"
                            />
                        </section>

                        <section className="space-y-4 mb-10 relative">
                            <div className="flex items-center justify-between group mb-2">
                                <div className="flex items-center gap-2 text-ink-muted">
                                    <TagIcon className="w-4 h-4 group-hover:text-accent transition-colors" />
                                    <span className="text-micro font-black uppercase tracking-widest">
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
                                    <AlignLeft className="w-4 h-4 group-hover:text-accent transition-colors" />
                                    <span className="text-micro font-black uppercase tracking-widest">
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
                                className="w-full bg-canvas border border-border/60 rounded-2xl px-5 py-4 text-sm leading-relaxed outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all resize-none h-40 shadow-sm text-ink placeholder:text-ink-faint custom-scrollbar"
                            />
                            <p className="text-micro text-ink-faint">
                                {t("blog.summaryHint")}
                            </p>
                        </section>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-surface to-transparent pointer-events-none z-10"></div>
            </aside>
        </>
    );
};

export default PublishSettings;
