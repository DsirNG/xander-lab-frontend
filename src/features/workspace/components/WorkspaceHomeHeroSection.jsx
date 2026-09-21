import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const HOME_ASSET_ROOT = "/assets/workspace/home";

const QUICK_ACTIONS = [
    {
        key: "chat",
        to: "/workspace/ai",
        image: `${HOME_ASSET_ROOT}/action-chat.svg`,
        tone: "bg-[#f5f2ff]",
    },
    {
        key: "import",
        to: "/workspace/knowledge",
        image: `${HOME_ASSET_ROOT}/action-import.svg`,
        tone: "bg-[#f2f7ff]",
    },
    {
        key: "practice",
        to: "/workspace/knowledge",
        image: `${HOME_ASSET_ROOT}/action-practice.svg`,
        tone: "bg-[#f2faf4]",
    },
    {
        key: "publish",
        to: "/workspace/publish",
        image: `${HOME_ASSET_ROOT}/action-publish.svg`,
        tone: "bg-[#fff7f1]",
    },
];

const WorkspaceHomeHeroSection = ({ displayName }) => {
    const { t } = useTranslation();

    return (
        <>
            <section className="relative min-h-[12.5rem] overflow-hidden rounded-2xl bg-[linear-gradient(105deg,#f1f0ff_0%,#f8f9ff_72%)] px-10 py-7">
                <img
                    src={`${HOME_ASSET_ROOT}/hero-orb.svg`}
                    alt=""
                    className="pointer-events-none absolute right-20 top-0 hidden h-[7rem] object-contain lg:block"
                    aria-hidden="true"
                />
                <div className="relative z-10">
                    <div className="text-display text-[#111426]">
                        <span className="font-semibold">
                            {t("workspace.home.welcome")}
                        </span>{" "}
                        <span className="font-bold text-[#6864ec]">
                            {displayName}
                        </span>
                    </div>
                    <div className="mt-2 text-body text-[#8b91a9]">
                        {t("workspace.home.subtitle")}
                    </div>
                    <Link
                        to="/workspace/ai"
                        className="mt-5 flex min-h-[3.5rem] max-w-[56rem] items-center gap-3 rounded-[1.125rem] border border-white bg-white/90 px-5 shadow-[0_0.75rem_2rem_rgba(91,85,190,0.06)]"
                    >
                        <Sparkles
                            className="h-5 w-5 shrink-0 text-[#7771ed]"
                            aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1 truncate text-body text-[#9ba0b7]">
                            {t("workspace.home.prompt")}
                        </span>
                        <span className="hidden rounded-md bg-[#f3f3f8] px-2 py-1 text-micro text-[#9399af] md:block">
                            ⌘ K
                        </span>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#7771ed] text-white">
                            <ArrowRight
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        </span>
                    </Link>
                </div>
            </section>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {QUICK_ACTIONS.map((action) => (
                    <Link
                        key={action.key}
                        to={action.to}
                        className={`${action.tone} workspace-quick-action group relative isolate flex min-h-[5rem] min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-white/65 px-4 transition-[transform,box-shadow] duration-300 ease-out focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#817bf2]/45 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none`}
                    >
                        <span className="relative z-10 shrink-0 transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-110 group-focus-visible:rotate-6 group-focus-visible:scale-110 motion-reduce:transform-none motion-reduce:transition-none">
                            <img
                                src={action.image}
                                alt=""
                                className="h-11 w-11 object-contain"
                                aria-hidden="true"
                            />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-body font-semibold text-[#242741]">
                                {t(
                                    `workspace.home.actions.${action.key}.title`,
                                )}
                            </span>
                            <span className="mt-0.5 block truncate text-caption text-[#8e94aa]">
                                {t(
                                    `workspace.home.actions.${action.key}.description`,
                                )}
                            </span>
                        </span>
                        <ChevronDown
                            className="h-4 w-4 -rotate-90 text-[#858ca8] transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none"
                            aria-hidden="true"
                        />
                    </Link>
                ))}
            </div>
        </>
    );
};

export default WorkspaceHomeHeroSection;
