import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowRight, Box, Layers, MessageSquare } from "lucide-react";

/**
 * 3D Isometric Floating Gallery Island
 */
const IsometricGalleryGraphic = () => (
    <svg viewBox="0 0 160 120" fill="none" className="h-28 w-full">
        <defs>
            <linearGradient id="baseIsland" x1="20" y1="60" x2="140" y2="110" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
        </defs>
        <path d="M80 30 L136 60 L80 90 L24 60 Z" fill="#e0e7ff" stroke="#c7d2fe" />
        <path d="M24 60 L80 90 L80 110 L24 80 Z" fill="#6366f1" />
        <path d="M136 60 L80 90 L80 110 L136 80 Z" fill="#4338ca" />
        {/* Isometric mini building on top */}
        <path d="M70 42 L90 32 L110 42 L90 52 Z" fill="#fbbf24" />
        <rect x="74" y="46" width="32" height="24" fill="#ffffff" stroke="#cbd5e1" />
        <circle cx="90" cy="58" r="4" fill="#3b82f6" />
    </svg>
);

/**
 * FlowCraft Node Graph Visual
 */
const FlowCraftGraphGraphic = () => (
    <svg viewBox="0 0 160 120" fill="none" className="h-28 w-full">
        {/* Connection curves */}
        <path d="M40 40 C70 40 70 80 100 80" stroke="#818cf8" strokeWidth="2.5" strokeDasharray="4 3" />
        <path d="M40 80 C70 80 70 40 100 40" stroke="#c084fc" strokeWidth="2.5" />
        <path d="M100 60 L136 60" stroke="#38bdf8" strokeWidth="2.5" />

        {/* Nodes */}
        <circle cx="40" cy="40" r="12" fill="#ffffff" stroke="#818cf8" strokeWidth="2.5" />
        <circle cx="40" cy="80" r="12" fill="#ffffff" stroke="#c084fc" strokeWidth="2.5" />
        <circle cx="100" cy="40" r="12" fill="#ffffff" stroke="#60a5fa" strokeWidth="2.5" />
        <circle cx="100" cy="80" r="12" fill="#ffffff" stroke="#34d399" strokeWidth="2.5" />
        <circle cx="136" cy="60" r="10" fill="#6366f1" />
    </svg>
);

/**
 * Community Feed Preview Mockup
 */
const CommunityFeedGraphic = () => (
    <div className="h-28 w-full overflow-hidden rounded-xl border border-[#ebeef7] bg-white p-2.5 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-[#f1f3f9] pb-1.5">
            <span className="h-4 w-4 rounded-full bg-[#818cf8]" />
            <span className="h-2 w-16 rounded-full bg-[#e2e8f0]" />
            <span className="ml-auto h-2 w-8 rounded-full bg-[#f1f5f9]" />
        </div>
        <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#34d399]" />
                <span className="h-2 w-24 rounded-full bg-[#e2e8f0]" />
            </div>
            <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#f472b6]" />
                <span className="h-2 w-20 rounded-full bg-[#e2e8f0]" />
            </div>
        </div>
    </div>
);

const LandingEcosystem = ({ t }) => {
    return (
        <section className="mx-auto mt-20 w-full max-w-5xl px-3 sm:px-0">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#818cf8]" />
                    <span className="h-2 w-2 rounded-full bg-[#c084fc]" />
                    <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
                </div>
                <h2 className="mt-2 text-2xl font-extrabold text-[#111426] sm:text-3xl">
                    {t("landing.ecosystem.title")}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[#747b9a]">
                    {t("landing.ecosystem.subtitle")}
                </p>
            </div>

            {/* 3 Cards Grid */}
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
                {/* 1. 3D 资产互动展厅 */}
                <div className="group flex flex-col justify-between rounded-3xl border border-[#ebeef7] bg-white/80 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(99,102,241,0.08)]">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#6366f1]">
                            <Box className="h-4 w-4" />
                            <h3 className="text-sm font-bold text-[#111426]">
                                {t("landing.ecosystem.gallery.title")}
                            </h3>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-[#747b9a]">
                            {t("landing.ecosystem.gallery.desc")}
                        </p>
                        <div className="my-4">
                            <IsometricGalleryGraphic />
                        </div>
                    </div>
                    <Link
                        to="/components"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#ebeef7] bg-[#fbfbfe] py-2 text-xs font-semibold text-[#404461] transition-colors group-hover:border-[#818cf8] group-hover:bg-[#6366f1] group-hover:text-white"
                    >
                        <span>{t("landing.ecosystem.gallery.action")}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {/* 2. FlowCraft 组件实验工坊 */}
                <div className="group flex flex-col justify-between rounded-3xl border border-[#ebeef7] bg-white/80 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(168,85,247,0.08)]">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#a855f7]">
                            <Layers className="h-4 w-4" />
                            <h3 className="text-sm font-bold text-[#111426]">
                                {t("landing.ecosystem.flowcraft.title")}
                            </h3>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-[#747b9a]">
                            {t("landing.ecosystem.flowcraft.desc")}
                        </p>
                        <div className="my-4">
                            <FlowCraftGraphGraphic />
                        </div>
                    </div>
                    <Link
                        to="/workspace/studio"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#ebeef7] bg-[#fbfbfe] py-2 text-xs font-semibold text-[#404461] transition-colors group-hover:border-[#a855f7] group-hover:bg-[#a855f7] group-hover:text-white"
                    >
                        <span>{t("landing.ecosystem.flowcraft.action")}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {/* 3. 创作者大厅与技术动态 */}
                <div className="group flex flex-col justify-between rounded-3xl border border-[#ebeef7] bg-white/80 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(59,130,246,0.08)]">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#3b82f6]">
                            <MessageSquare className="h-4 w-4" />
                            <h3 className="text-sm font-bold text-[#111426]">
                                {t("landing.ecosystem.community.title")}
                            </h3>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-[#747b9a]">
                            {t("landing.ecosystem.community.desc")}
                        </p>
                        <div className="my-4">
                            <CommunityFeedGraphic />
                        </div>
                    </div>
                    <Link
                        to="/blog"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#ebeef7] bg-[#fbfbfe] py-2 text-xs font-semibold text-[#404461] transition-colors group-hover:border-[#3b82f6] group-hover:bg-[#3b82f6] group-hover:text-white"
                    >
                        <span>{t("landing.ecosystem.community.action")}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

LandingEcosystem.propTypes = {
    t: PropTypes.func.isRequired,
};

export default LandingEcosystem;
