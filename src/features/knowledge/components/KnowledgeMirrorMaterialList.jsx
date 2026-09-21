import { useTranslation } from "react-i18next";

const KnowledgeMirrorMaterialList = ({
    view,
    materials,
    activeMaterial,
    onViewChange,
    onSelect,
    typeLabel,
    levelLabel,
}) => {
    const { t } = useTranslation();

    return (
        <div className="rounded-3xl border border-border bg-surface p-3">
            <div className="px-2 py-2 text-title text-ink">
                {t("knowledge.library")}
            </div>
            <div
                className="flex gap-1 rounded-full bg-surface-muted p-1 text-caption"
                role="tablist"
            >
                {["ACTIVE", "ARCHIVED"].map((value) => (
                    <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={view === value}
                        onClick={() => onViewChange(value)}
                        className={`flex-1 rounded-full px-3 py-1.5 transition ${view === value ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}
                    >
                        {t(`knowledge.view.${value}`)}
                    </button>
                ))}
            </div>
            {materials.length === 0 ? (
                <div className="px-2 py-8 text-center text-caption text-ink-muted">
                    {t("knowledge.archivedEmpty")}
                </div>
            ) : (
                <div className="mt-2 space-y-2">
                    {materials.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelect(item.id)}
                            className={`w-full rounded-2xl border p-3 text-left transition ${activeMaterial?.id === item.id ? "border-accent bg-accent-soft" : "border-transparent hover:border-border hover:bg-surface-muted"}`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span className="text-body font-semibold text-ink">
                                    {item.title}
                                </span>
                                <span className="rounded-full bg-canvas px-2 py-1 text-micro text-ink-muted">
                                    {item.masteryScore ?? 0}%
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-caption text-ink-muted">
                                <span>{typeLabel(item.knowledgeType)}</span>
                                <span>{levelLabel(item.masteryLevel)}</span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                                <div
                                    className="h-full rounded-full bg-accent"
                                    style={{
                                        width: `${item.masteryScore ?? 0}%`,
                                    }}
                                />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default KnowledgeMirrorMaterialList;
