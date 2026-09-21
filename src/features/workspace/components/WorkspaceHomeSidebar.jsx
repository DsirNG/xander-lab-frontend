import {
    ArrowRight,
    BookOpen,
    Check,
    PenLine,
    RefreshCw,
    Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import WorkspaceHomeSectionHeader from "./WorkspaceHomeSectionHeader";

const TODO_ITEMS = [
    { key: "closure", meta: "workspace.home.meta.todayTime", done: false },
    { key: "notes", meta: "workspace.home.meta.tomorrowTime", done: false },
    { key: "websocket", meta: "8/15 18:00", done: false },
    { key: "dailyStudy", meta: "workspace.home.meta.completed", done: true },
    {
        key: "knowledgeUpdate",
        meta: "workspace.home.meta.completed",
        done: true,
    },
];

const SUGGESTIONS = [
    { key: "review", icon: Sparkles },
    { key: "path", icon: BookOpen },
    { key: "inspiration", icon: PenLine },
];

const resolveMeta = (value, t) =>
    value.startsWith("workspace.") ? t(value) : value;

const WorkspaceHomeSidebar = () => {
    const { t } = useTranslation();

    return (
        <aside className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:w-[20rem] xl:grid-cols-1">
            <section className="flex h-[24rem] min-w-0 flex-col rounded-2xl border border-[#e7e9f1] bg-white/70 p-5 shadow-[0_0.75rem_2rem_rgba(73,79,120,0.04)]">
                <WorkspaceHomeSectionHeader
                    title={t("workspace.home.todos.title")}
                    to="/workspace/plans"
                />
                <div className="mt-3 flex-1 divide-y divide-[#eceef4] overflow-hidden">
                    {TODO_ITEMS.map((item) => (
                        <div
                            key={item.key}
                            className="flex min-h-[3.5rem] gap-3 py-2.5"
                        >
                            <span
                                className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${item.done ? "border-[#dcdff0] bg-[#f0f1f8] text-[#8e94ac]" : "border-[#aeb4ca] bg-white"}`}
                            >
                                {item.done ? (
                                    <Check
                                        className="h-3 w-3"
                                        aria-hidden="true"
                                    />
                                ) : null}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-caption text-[#626881]">
                                    {t(`workspace.home.todos.items.${item.key}`)}
                                </span>
                                <span className="mt-1 block text-micro text-[#a1a6b9]">
                                    {resolveMeta(item.meta, t)}
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="flex h-[24rem] min-w-0 flex-col rounded-2xl border border-[#e7e9f1] bg-white/70 p-5 shadow-[0_0.75rem_2rem_rgba(73,79,120,0.04)]">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-title font-semibold text-[#17192d]">
                        {t("workspace.home.suggestions.title")}
                    </div>
                    <button
                        type="button"
                        className="flex shrink-0 items-center gap-1 text-caption font-medium text-[#7771ed]"
                    >
                        <RefreshCw
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                        />
                        {t("workspace.home.suggestions.refresh")}
                    </button>
                </div>
                <div className="mt-4 flex flex-1 flex-col gap-2.5 overflow-hidden">
                    {SUGGESTIONS.map((suggestion) => {
                        const Icon = suggestion.icon;
                        return (
                            <div
                                key={suggestion.key}
                                className="flex min-h-0 flex-1 gap-3 rounded-xl border border-[#ececf6] bg-[linear-gradient(120deg,#f6f4ff_0%,#fbfbff_100%)] p-3"
                            >
                                <Icon
                                    className="mt-0.5 h-5 w-5 shrink-0 text-[#7771ed]"
                                    aria-hidden="true"
                                />
                                <div className="min-w-0">
                                    <div className="truncate text-caption font-semibold text-[#343750]">
                                        {t(
                                            `workspace.home.suggestions.items.${suggestion.key}.title`,
                                        )}
                                    </div>
                                    <div className="mt-1 line-clamp-2 text-micro leading-relaxed text-[#8a90a8]">
                                        {t(
                                            `workspace.home.suggestions.items.${suggestion.key}.description`,
                                        )}
                                    </div>
                                    <Link
                                        to={
                                            suggestion.key === "inspiration"
                                                ? "/workspace/publish"
                                                : "/workspace/knowledge"
                                        }
                                        className="mt-1 inline-flex items-center gap-1 text-micro font-medium text-[#7771ed]"
                                    >
                                        {t(
                                            `workspace.home.suggestions.items.${suggestion.key}.action`,
                                        )}
                                        <ArrowRight
                                            className="h-3 w-3"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </aside>
    );
};

export default WorkspaceHomeSidebar;
