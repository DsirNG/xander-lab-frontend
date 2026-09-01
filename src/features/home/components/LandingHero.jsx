import React from "react";
import PropTypes from "prop-types";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { GlowingRing3D } from "./LandingIllustrations";

const LandingHero = ({
    t,
    onTryNow,
    onLearnMore,
}) => {
    return (
        <section className="relative flex flex-col items-center pt-8 pb-4 text-center select-none overflow-hidden">
            {/* Background 3D Floating Elements */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-12 top-6 h-36 w-36 rounded-full bg-gradient-to-tr from-purple-300/30 via-indigo-200/40 to-blue-200/20 blur-xl md:left-4"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 top-2 hidden md:block"
            >
                <GlowingRing3D className="h-44 w-44 animate-pulse opacity-80" />
            </div>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/4 -top-8 h-56 w-96 rounded-full bg-gradient-to-b from-indigo-200/35 via-purple-100/20 to-transparent blur-3xl"
            />

            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e4f8] bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#6366f1] shadow-[0_2px_12px_rgba(99,102,241,0.08)] backdrop-blur-md transition-transform duration-300 hover:scale-105">
                <Sparkles className="h-3.5 w-3.5 text-[#6366f1]" />
                <span>{t("landing.badge")}</span>
            </div>

            {/* Hero Main Headline */}
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#111426] sm:text-5xl sm:leading-tight">
                {t("landing.heroTitlePart1")}{" "}
                <span className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#4f46e5] bg-clip-text text-transparent">
                    {t("landing.heroTitlePart2")}
                </span>
            </h1>

            {/* Hero Subtitle */}
            <p className="mt-4 max-w-2xl text-xs sm:text-sm leading-relaxed text-[#686f8d]">
                {t("landing.heroSubtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5">
                <button
                    type="button"
                    onClick={onTryNow}
                    className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-[#5a52f8] to-[#6d64fa] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(93,85,250,0.32)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(93,85,250,0.45)] hover:scale-[1.02] active:scale-[0.98]"
                >
                    <span>{t("landing.tryNow")}</span>
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:translate-x-0.5">
                        <ArrowRight className="h-3 w-3" />
                    </span>
                </button>

                <button
                    type="button"
                    onClick={onLearnMore}
                    className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e2e4f0] bg-white/80 px-5 py-2.5 text-sm font-semibold text-[#404461] shadow-[0_2px_8px_rgba(0,0,0,0.02)] backdrop-blur-sm transition-all duration-300 hover:border-[#817bf2] hover:bg-white hover:text-[#5a52f8]"
                >
                    <span>{t("landing.learnMore")}</span>
                    <Play className="h-3.5 w-3.5 text-[#888ea6] transition-colors group-hover:text-[#5a52f8]" />
                </button>
            </div>
        </section>
    );
};

LandingHero.propTypes = {
    t: PropTypes.func.isRequired,
    onTryNow: PropTypes.func.isRequired,
    onLearnMore: PropTypes.func.isRequired,
};

export default LandingHero;
