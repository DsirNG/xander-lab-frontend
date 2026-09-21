import { useEffect, useState } from "react";
import {
    BookOpen,
    CalendarDays,
    ChevronDown,
    Clock3,
    FileText,
    ListFilter,
    MessageCircle,
    Search,
    Sun,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthSession } from "@features/auth";
import WorkspaceHomeHeroSection from "@features/workspace/components/WorkspaceHomeHeroSection";
import WorkspaceHomeSkeleton from "@features/workspace/components/WorkspaceHomeSkeleton";
import WorkspaceHomeSectionHeader from "@features/workspace/components/WorkspaceHomeSectionHeader";
import WorkspaceHomeSidebar from "@features/workspace/components/WorkspaceHomeSidebar";
import { listAgentConversations } from "@features/agent";
import { listKnowledgeMaterials } from "@features/knowledge";
import { listBlogPlans, listMyBlogs, NotificationBell } from "@features/blog";

const CONTINUE_SECTIONS = [
    {
        key: "conversations",
        icon: MessageCircle,
        accent: "bg-[#f0edff] text-[#7772f8]",
        to: "/workspace/ai",
    },
    {
        key: "knowledge",
        icon: BookOpen,
        accent: "bg-[#eaf8ff] text-[#4c9df5]",
        to: "/workspace/knowledge",
    },
    {
        key: "plans",
        icon: CalendarDays,
        accent: "bg-[#f1efff] text-[#8277f5]",
        to: "/workspace/plans",
    },
];

const STATS = [
    {
        key: "knowledge",
        icon: BookOpen,
        value: null,
        trend: null,
        tone: "bg-[#edf4ff] text-[#6b74f6]",
    },
    {
        key: "reviews",
        icon: CalendarDays,
        value: null,
        trend: null,
        tone: "bg-[#f5efff] text-[#9369ef]",
    },
    {
        key: "studyTime",
        icon: Clock3,
        value: null,
        suffixKey: "workspace.home.stats.hours",
        trend: null,
        tone: "bg-[#f4efff] text-[#775ee8]",
    },
    {
        key: "articles",
        icon: FileText,
        value: null,
        suffixKey: "workspace.home.stats.articlesUnit",
        trend: null,
        tone: "bg-[#fff3ea] text-[#d88357]",
    },
];

const formatShortTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "";
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays <= 0) {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    if (diffDays === 1) {
        return date.toLocaleDateString([], {
            month: "numeric",
            day: "numeric",
        });
    }
    return date.toLocaleDateString([], {
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });
};

const WorkspaceHomePage = () => {
    const { t } = useTranslation();
    const { userInfo } = useAuthSession();
    const hour = new Date().getHours();
    const greetingKey =
        hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    const displayName = userInfo?.nickname || userInfo?.username || "DinQorAI";

    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [knowledge, setKnowledge] = useState([]);
    const [plans, setPlans] = useState([]);
    const [publishedCount, setPublishedCount] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        (async () => {
            try {
                const [conv, know, plan, blog] = await Promise.allSettled([
                    listAgentConversations({ signal, _silent: true }),
                    listKnowledgeMaterials(
                        { limit: 3 },
                        { signal, _silent: true },
                    ),
                    listBlogPlans(
                        { page: 1, size: 3 },
                        { signal, _silent: true },
                    ),
                    listMyBlogs(
                        { status: 1, page: 1, size: 1 },
                        { signal, _silent: true },
                    ),
                ]);
                if (signal.aborted) return;
                if (conv.status === "fulfilled")
                    setConversations(
                        Array.isArray(conv.value) ? conv.value : [],
                    );
                if (know.status === "fulfilled")
                    setKnowledge(Array.isArray(know.value) ? know.value : []);
                if (plan.status === "fulfilled")
                    setPlans(
                        Array.isArray(plan.value?.records)
                            ? plan.value.records
                            : [],
                    );
                if (blog.status === "fulfilled")
                    setPublishedCount(blog.value?.total ?? null);
            } catch {
                // allSettled 不抛错；单接口失败时该区块保持空态
            } finally {
                if (!signal.aborted) setLoading(false);
            }
        })();

        return () => controller.abort();
    }, []);

    if (loading) {
        return <WorkspaceHomeSkeleton />;
    }

    const sectionItems = {
        conversations: conversations.slice(0, 3).map((item) => ({
            id: item.id,
            title: item.title || "",
            meta: formatShortTime(item.updatedAt || item.createdAt),
        })),
        knowledge: knowledge.slice(0, 3).map((item) => ({
            id: item.id,
            title: item.title || "",
            meta: formatShortTime(item.createdAt || item.updatedAt),
        })),
        plans: plans.slice(0, 3).map((item) => ({
            id: item.id,
            title: item.topic || "",
            meta: item.status || formatShortTime(item.nextRunAt),
        })),
    };

    const statValues = {
        knowledge: null,
        reviews: null,
        studyTime: null,
        articles: publishedCount,
    };

    return (
        <div className="h-full min-h-0 overflow-y-auto text-body text-[#555b7b]">
            <div className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-5 px-5">
                <div className="flex min-h-9 items-center gap-2 rounded-xl border border-[#e9eaf4] bg-white/70 px-3 text-caption font-medium text-[#59617e]">
                    <Sun className="h-4 w-4" aria-hidden="true" />
                    {t(`workspace.home.greeting.${greetingKey}`)}
                </div>

                <div className="flex items-center gap-3">
                    <label className="hidden min-h-9 w-[15rem] items-center gap-2 rounded-full border border-[#e9eaf4] bg-white/60 px-4 text-[#8e94ad] lg:flex">
                        <Search
                            className="h-4 w-4 shrink-0"
                            aria-hidden="true"
                        />
                        <input
                            type="search"
                            className="min-w-0 flex-1 bg-transparent text-caption outline-none placeholder:text-[#9ca1b7]"
                            placeholder={t("workspace.home.search")}
                            aria-label={t("workspace.home.search")}
                        />
                    </label>
                    <NotificationBell />
                    <button
                        type="button"
                        className="hidden min-h-9 items-center gap-2 rounded-full border border-[#e9eaf4] bg-white/70 px-4 text-caption font-medium text-[#59617e] sm:flex"
                    >
                        <ListFilter className="h-4 w-4" aria-hidden="true" />
                        {t("workspace.home.quickActions")}
                        <ChevronDown
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </div>

            <div className="px-5 pb-5">
                <div className="flex flex-col items-stretch gap-5 xl:flex-row">
                    <div className="min-w-0 flex-1 space-y-5">
                        <WorkspaceHomeHeroSection displayName={displayName} />

                        <section className="space-y-3">
                            <WorkspaceHomeSectionHeader
                                title={t("workspace.home.continueTitle")}
                            />
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                {CONTINUE_SECTIONS.map((section) => {
                                    const Icon = section.icon;
                                    const items = sectionItems[section.key];
                                    return (
                                        <div
                                            key={section.key}
                                            className="min-w-0 rounded-2xl border border-[#e9eaf3] bg-white/55 p-4"
                                        >
                                            <WorkspaceHomeSectionHeader
                                                title={t(
                                                    `workspace.home.sections.${section.key}.title`,
                                                )}
                                                to={section.to}
                                            />
                                            {items.length > 0 ? (
                                                <div className="mt-3 divide-y divide-[#eef0f6]">
                                                    {items.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex min-h-11 items-center gap-2 py-2"
                                                        >
                                                            <span
                                                                className={`${section.accent} grid h-6 w-6 shrink-0 place-items-center rounded-full`}
                                                            >
                                                                <Icon
                                                                    className="h-3.5 w-3.5"
                                                                    aria-hidden="true"
                                                                />
                                                            </span>
                                                            <span className="min-w-0 flex-1 truncate text-caption font-medium text-[#434862]">
                                                                {item.title}
                                                            </span>
                                                            <span className="shrink-0 text-micro text-[#9ca2b7]">
                                                                {item.meta}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="mt-3 flex min-h-11 items-center text-caption text-[#a1a6b9]">
                                                    {t(
                                                        "workspace.home.sections.empty",
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="space-y-3">
                            <WorkspaceHomeSectionHeader
                                title={t("workspace.home.overviewTitle")}
                            />
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                {STATS.map((stat) => {
                                    const Icon = stat.icon;
                                    const value = statValues[stat.key];
                                    return (
                                        <div
                                            key={stat.key}
                                            className="min-h-[8.5rem] rounded-2xl border border-[#e9eaf3] bg-white/48 p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`${stat.tone} grid h-10 w-10 shrink-0 place-items-center rounded-xl`}
                                                >
                                                    <Icon
                                                        className="h-5 w-5"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                                <span className="text-caption text-[#737992]">
                                                    {t(
                                                        `workspace.home.stats.${stat.key}`,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="mt-2 pl-[3.25rem] text-heading font-medium text-[#16192c]">
                                                {value ?? "—"}
                                                {stat.suffixKey ? (
                                                    <span className="ml-1 text-caption font-normal text-[#747a92]">
                                                        {t(stat.suffixKey)}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="mt-2 pl-[3.25rem] text-micro text-[#949aaf]">
                                                {t(
                                                    "workspace.home.stats.compared",
                                                )}{" "}
                                                <span className="text-[#7771ed]">
                                                    —
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    <WorkspaceHomeSidebar />
                </div>
            </div>
        </div>
    );
};

export default WorkspaceHomePage;
