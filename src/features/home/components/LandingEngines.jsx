import React, { useState } from "react";
import PropTypes from "prop-types";
import {
    ArrowRight,
    Bot,
    Check,
    Clock,
    Flame,
    Layers,
    Play,
    Send,
    Shield,
    Sparkles,
    Volume2,
} from "lucide-react";
import {
    Dagger3DShowcase,
    HolographicBrain3D,
} from "./LandingExtendedIllustrations";

const DAGGER_THUMBNAILS = [
    { id: 1, label: "Cyber Dagger" },
    { id: 2, label: "Mech Sword" },
    { id: 3, label: "Energy Blade" },
    { id: 4, label: "Stealth Kunai" },
];

const LandingEngines = ({ t }) => {
    const [selectedThumb, setSelectedThumb] = useState(1);

    return (
        <section className="mx-auto mt-20 w-full max-w-5xl px-3 sm:px-0">
            {/* Section Header */}
            <div className="text-center">
                <h2 className="text-2xl font-extrabold text-[#111426] sm:text-3xl">
                    {t("landing.engines.title")}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[#747b9a]">
                    {t("landing.engines.subtitle")}
                </p>
            </div>

            {/* Core Engines Grid */}
            <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-12">
                {/* ─── Card A: img2threejs (Left 6 cols) ─── */}
                <div className="flex flex-col justify-between rounded-3xl border border-[#ebeef7] bg-gradient-to-b from-[#fbfaff] via-white to-[#fbfaff] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-md lg:col-span-6">
                    <div>
                        {/* Header Badge & Title */}
                        <div className="flex items-center gap-3">
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#7c3aed] text-xs font-bold text-white shadow-sm">
                                {t("landing.engines.img2threejs.badge")}
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-[#111426]">
                                {t("landing.engines.img2threejs.title")}
                            </h3>
                        </div>

                        {/* Bullet Points */}
                        <ul className="mt-4 space-y-2 text-xs text-[#626884]">
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
                                <span>{t("landing.engines.img2threejs.point1")}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
                                <span>{t("landing.engines.img2threejs.point2")}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
                                <span>{t("landing.engines.img2threejs.point3")}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
                                <span>{t("landing.engines.img2threejs.point4")}</span>
                            </li>
                        </ul>
                    </div>

                    {/* 3D Showcase & Turntable */}
                    <div className="my-3 flex flex-col items-center">
                        <Dagger3DShowcase className="h-44 w-full" />
                        <span className="mt-1 text-micro font-medium text-[#6366f1]">
                            {t("landing.engines.img2threejs.rotatePreview")} &gt;
                        </span>
                    </div>

                    {/* Bottom Model Thumbnails Selector */}
                    <div className="flex items-center gap-2 rounded-2xl border border-[#f0f1f8] bg-[#f8f9fe]/80 p-2">
                        {DAGGER_THUMBNAILS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setSelectedThumb(item.id)}
                                className={`flex h-12 flex-1 items-center justify-center rounded-xl border transition-all ${selectedThumb === item.id ? "border-[#7c3aed] bg-white shadow-xs" : "border-transparent bg-white/50 hover:bg-white"}`}
                            >
                                <Flame className={`h-4 w-4 ${selectedThumb === item.id ? "text-[#7c3aed]" : "text-[#94a3b8]"}`} />
                            </button>
                        ))}
                        <button
                            type="button"
                            className="flex h-12 w-10 items-center justify-center rounded-xl border border-transparent bg-white/50 text-xs font-semibold text-[#8e94aa] hover:bg-white"
                        >
                            &gt;
                        </button>
                    </div>
                </div>

                {/* ─── Right Column: Card B & Card C (Right 6 cols) ─── */}
                <div className="flex flex-col gap-5 lg:col-span-6">
                    {/* Card B: DinQor Agent */}
                    <div className="rounded-3xl border border-[#ebeef7] bg-gradient-to-b from-[#f8faff] via-white to-[#f8faff] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#3b82f6] text-xs font-bold text-white shadow-sm">
                                {t("landing.engines.agent.badge")}
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-[#111426]">
                                {t("landing.engines.agent.title")}
                            </h3>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* 4 Feature Pills Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 w-full">
                                <div className="flex items-center gap-2 rounded-xl border border-[#f0f1f8] bg-white/90 px-3 py-2 text-micro font-semibold text-[#404461] shadow-2xs">
                                    <Sparkles className="h-3.5 w-3.5 text-[#3b82f6]" />
                                    <span className="truncate">{t("landing.engines.agent.pill1")}</span>
                                </div>
                                <div className="flex items-center gap-2 rounded-xl border border-[#f0f1f8] bg-white/90 px-3 py-2 text-micro font-semibold text-[#404461] shadow-2xs">
                                    <Layers className="h-3.5 w-3.5 text-[#3b82f6]" />
                                    <span className="truncate">{t("landing.engines.agent.pill2")}</span>
                                </div>
                                <div className="flex items-center gap-2 rounded-xl border border-[#f0f1f8] bg-white/90 px-3 py-2 text-micro font-semibold text-[#404461] shadow-2xs">
                                    <Bot className="h-3.5 w-3.5 text-[#3b82f6]" />
                                    <span className="truncate">{t("landing.engines.agent.pill3")}</span>
                                </div>
                                <div className="flex items-center gap-2 rounded-xl border border-[#f0f1f8] bg-white/90 px-3 py-2 text-micro font-semibold text-[#404461] shadow-2xs">
                                    <Volume2 className="h-3.5 w-3.5 text-[#3b82f6]" />
                                    <span className="truncate">{t("landing.engines.agent.pill4")}</span>
                                </div>
                            </div>

                            {/* 3D Brain Illustration */}
                            <div className="shrink-0">
                                <HolographicBrain3D className="h-24 w-24" />
                            </div>
                        </div>
                    </div>

                    {/* Card C: Knowledge Mirror */}
                    <div className="rounded-3xl border border-[#ebeef7] bg-gradient-to-b from-[#f6fdf9] via-white to-[#f6fdf9] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#10b981] text-xs font-bold text-white shadow-sm">
                                {t("landing.engines.knowledge.badge")}
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-[#111426]">
                                {t("landing.engines.knowledge.title")}
                            </h3>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                            {/* Left Bullets */}
                            <ul className="space-y-2 text-xs text-[#626884] flex-1">
                                <li className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                                    <span>{t("landing.engines.knowledge.point1")}</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                                    <span>{t("landing.engines.knowledge.point2")}</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                                    <span>{t("landing.engines.knowledge.point3")}</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                                    <span>{t("landing.engines.knowledge.point4")}</span>
                                </li>
                            </ul>

                            {/* Right Audio Score Widget */}
                            <div className="w-full sm:w-56 rounded-2xl border border-[#e6f4ea] bg-[#f9fdfa] p-3.5 shadow-xs">
                                <div className="flex items-center justify-between text-micro text-[#808b9f]">
                                    <span>{t("landing.engines.knowledge.reciteScoreTitle")}</span>
                                    <span className="text-[#10b981] cursor-pointer hover:underline">
                                        {t("landing.engines.knowledge.viewDetails")}
                                    </span>
                                </div>
                                <p className="mt-1 line-clamp-1 text-micro text-[#4a5168]">
                                    {t("landing.engines.knowledge.quote")}
                                </p>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-2xl font-extrabold text-[#10b981]">96</span>
                                    <span className="text-xs text-[#10b981]">{t("landing.engines.knowledge.scoreUnit")}</span>
                                </div>
                                {/* Waveform graphic */}
                                <div className="mt-2 flex items-center gap-1">
                                    {[12, 24, 16, 32, 20, 28, 14, 26, 18, 30, 22, 16, 28, 14, 20].map((h, i) => (
                                        <span
                                            key={i}
                                            className="w-1 rounded-full bg-[#34d399]"
                                            style={{ height: `${h * 0.6}px` }}
                                        />
                                    ))}
                                    <span className="ml-auto text-[10px] text-[#9ca3af]">00:24 / 00:48</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Card D: Headless Automation (Full Width 12 cols) ─── */}
                <div className="rounded-3xl border border-[#ebeef7] bg-gradient-to-b from-[#fffbf8] via-white to-[#fffbf8] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-md lg:col-span-12">
                    <div className="flex items-center gap-3">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#f97316] text-xs font-bold text-white shadow-sm">
                            {t("landing.engines.automation.badge")}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#111426]">
                            {t("landing.engines.automation.title")}
                        </h3>
                    </div>

                    <div className="mt-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        {/* Left Bullets */}
                        <ul className="space-y-2 text-xs text-[#626884] shrink-0 w-full lg:w-48">
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" />
                                <span>{t("landing.engines.automation.point1")}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" />
                                <span>{t("landing.engines.automation.point2")}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" />
                                <span>{t("landing.engines.automation.point3")}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" />
                                <span>{t("landing.engines.automation.point4")}</span>
                            </li>
                        </ul>

                        {/* Right Pipeline Flow Diagram */}
                        <div className="flex-1 w-full flex flex-col items-center">
                            {/* Pipeline Steps Row */}
                            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full">
                                {/* Step 1 */}
                                <div className="flex flex-col items-center justify-center rounded-xl border border-[#ebeef7] bg-white px-3 py-2 shadow-2xs min-w-[5rem]">
                                    <span className="text-xs font-bold text-[#111426]">{t("landing.engines.automation.step1")}</span>
                                    <span className="text-[10px] text-[#8e94aa]">{t("landing.engines.automation.step1Sub")}</span>
                                    <Clock className="mt-1 h-3.5 w-3.5 text-[#f97316]" />
                                </div>
                                <ArrowRight className="h-4 w-4 text-[#cbd5e1]" />

                                {/* Step 2 */}
                                <div className="flex flex-col items-center justify-center rounded-xl border border-[#ebeef7] bg-white px-3 py-2 shadow-2xs min-w-[5rem]">
                                    <span className="text-xs font-bold text-[#111426]">{t("landing.engines.automation.step2")}</span>
                                    <span className="text-[10px] text-[#8e94aa]">{t("landing.engines.automation.step2Sub")}</span>
                                    <Bot className="mt-1 h-3.5 w-3.5 text-[#3b82f6]" />
                                </div>
                                <ArrowRight className="h-4 w-4 text-[#cbd5e1]" />

                                {/* Step 3 */}
                                <div className="flex flex-col items-center justify-center rounded-xl border border-[#ebeef7] bg-white px-3 py-2 shadow-2xs min-w-[5rem]">
                                    <span className="text-xs font-bold text-[#111426]">{t("landing.engines.automation.step3")}</span>
                                    <span className="text-[10px] text-[#8e94aa]">{t("landing.engines.automation.step3Sub")}</span>
                                    <Shield className="mt-1 h-3.5 w-3.5 text-[#10b981]" />
                                </div>
                                <ArrowRight className="h-4 w-4 text-[#cbd5e1]" />

                                {/* Step 4 */}
                                <div className="flex flex-col items-center justify-center rounded-xl border border-[#ebeef7] bg-white px-3 py-2 shadow-2xs min-w-[5rem]">
                                    <span className="text-xs font-bold text-[#111426]">{t("landing.engines.automation.step4")}</span>
                                    <span className="text-[10px] text-[#8e94aa]">{t("landing.engines.automation.step4Sub")}</span>
                                    <Send className="mt-1 h-3.5 w-3.5 text-[#8b5cf6]" />
                                </div>
                            </div>

                            {/* MCP Multi-Platform Branching Targets */}
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-xl">
                                <div className="flex items-center justify-center gap-1.5 rounded-lg border border-[#f0f1f8] bg-[#fbfbfe] px-2 py-1.5 text-[11px] font-medium text-[#4b5563]">
                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                    <span>{t("landing.engines.automation.platformCommunity")}</span>
                                </div>
                                <div className="flex items-center justify-center gap-1.5 rounded-lg border border-[#f0f1f8] bg-[#fbfbfe] px-2 py-1.5 text-[11px] font-medium text-[#4b5563]">
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                    <span>{t("landing.engines.automation.platformCsdn")}</span>
                                </div>
                                <div className="flex items-center justify-center gap-1.5 rounded-lg border border-[#f0f1f8] bg-[#fbfbfe] px-2 py-1.5 text-[11px] font-medium text-[#4b5563]">
                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                    <span>{t("landing.engines.automation.platformJuejin")}</span>
                                </div>
                                <div className="flex items-center justify-center gap-1.5 rounded-lg border border-[#f0f1f8] bg-[#fbfbfe] px-2 py-1.5 text-[11px] font-medium text-[#4b5563]">
                                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                    <span>{t("landing.engines.automation.platformMulti")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

LandingEngines.propTypes = {
    t: PropTypes.func.isRequired,
};

export default LandingEngines;
