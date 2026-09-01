import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowRight, Box, Sparkles } from "lucide-react";
import { GlowingRing3D } from "./LandingIllustrations";

const LandingCtaBanner = ({ t }) => {
    return (
        <section className="mx-auto mt-24 w-full max-w-5xl px-3 sm:px-0">
            <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-r from-[#f0effe] via-[#f7f6ff] to-[#eff4fe] p-8 sm:p-12 shadow-[0_12px_40px_rgba(99,102,241,0.08)] backdrop-blur-xl">
                {/* 3D Floating Torus Ring in Background */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-6 -bottom-8 hidden md:block"
                >
                    <GlowingRing3D className="h-56 w-56 opacity-90" />
                </div>
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute right-1/4 -top-12 h-44 w-44 rounded-full bg-gradient-to-br from-indigo-300/30 to-purple-200/20 blur-2xl"
                />

                <div className="relative z-10 max-w-xl">
                    {/* Brand Tag */}
                    <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6366f1] text-white">
                            <Sparkles className="h-3 w-3" />
                        </span>
                        <span className="text-xs font-bold tracking-wider text-[#6366f1] uppercase">
                            DinQor AI
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h2 className="mt-3 text-2xl font-extrabold text-[#111426] sm:text-3xl sm:leading-snug">
                        {t("landing.ctaBanner.title")}
                    </h2>

                    {/* Subtitle */}
                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#686f8d]">
                        {t("landing.ctaBanner.subtitle")}
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-7 flex flex-wrap items-center gap-3.5">
                        <Link
                            to="/workspace"
                            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5a52f8] to-[#6d64fa] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(93,85,250,0.3)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(93,85,250,0.45)] hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span>{t("landing.ctaBanner.createNow")}</span>
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </Link>

                        <Link
                            to="/components"
                            className="inline-flex items-center gap-2 rounded-full border border-[#cbd5e1] bg-white/80 px-5 py-2.5 text-sm font-semibold text-[#404461] shadow-2xs backdrop-blur-sm transition-all duration-300 hover:border-[#817bf2] hover:bg-white hover:text-[#5a52f8]"
                        >
                            <Box className="h-4 w-4 text-[#818cf8]" />
                            <span>{t("landing.ctaBanner.explore3D")}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

LandingCtaBanner.propTypes = {
    t: PropTypes.func.isRequired,
};

export default LandingCtaBanner;
