import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const Img2ThreeHistoryPanel = ({ loading, tasks, onSelectTask }) => {
    const { t } = useTranslation();

    return (
        <section className="mb-6 rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-body font-semibold text-ink">
                    {t("img2three.history")}
                </div>
                {loading ? (
                    <Loader2
                        className="h-4 w-4 animate-spin text-accent"
                        aria-label={t("img2three.historyLoading")}
                    />
                ) : null}
            </div>
            {!loading && tasks.length === 0 ? (
                <div className="text-caption text-ink-muted">
                    {t("img2three.historyEmpty")}
                </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tasks.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectTask(item.id)}
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-accent"
                    >
                        {item.referenceMediaUrl ? (
                            <img
                                src={item.referenceMediaUrl}
                                alt=""
                                className="h-12 w-12 shrink-0 rounded-lg object-cover"
                            />
                        ) : null}
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-ink">
                                {item.title || t("img2three.untitledTask")}
                            </span>
                            <span className="mt-1 block text-caption text-ink-muted">
                                {t(`img2three.status.${item.status}`, {
                                    defaultValue: item.status,
                                })}
                            </span>
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
};

Img2ThreeHistoryPanel.propTypes = {
    loading: PropTypes.bool.isRequired,
    tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSelectTask: PropTypes.func.isRequired,
};

export default Img2ThreeHistoryPanel;
