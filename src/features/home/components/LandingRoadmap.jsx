import React from "react";
import PropTypes from "prop-types";
import {
    BlendshapeFace3D,
    CodeCube3D,
    OpenWorldIsland3D,
} from "./LandingExtendedIllustrations";

/**
 * Game Engine & DCC Logos (Unity, Unreal, Blender)
 */
const EngineLogosGraphic = () => (
    <div className="flex h-28 w-full items-center justify-center gap-4">
        {/* Unity Logo */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f172a] text-white shadow-sm transition-transform hover:scale-110">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M12 2L3 8.5V17.5L12 22L21 17.5V8.5L12 2ZM12 4.5L18.5 9.2L16.2 10.7L12 7.7L7.8 10.7L5.5 9.2L12 4.5ZM5 11.2L10.5 15.2V19.2L5 15.2V11.2ZM19 15.2L13.5 19.2V15.2L19 11.2V15.2Z" />
            </svg>
        </div>

        {/* Unreal Engine Logo */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#000000] text-white shadow-sm transition-transform hover:scale-110">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M12 6C8.7 6 6 8.7 6 12C6 15.3 8.7 18 12 18C15.3 18 18 15.3 18 12C18 8.7 15.3 6 12 6ZM12 8C14.2 8 16 9.8 16 12C16 14.2 14.2 16 12 16C9.8 16 8 14.2 8 12C8 9.8 9.8 8 12 8Z" />
            </svg>
        </div>

        {/* Blender Logo */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f97316] text-white shadow-sm transition-transform hover:scale-110">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M12 3C8 3 5 6 5 10C5 13 7 15 9 16L7 20L11 18C11.3 18 11.7 18 12 18C16 18 19 15 19 11C19 7 16 3 12 3ZM12 7C14 7 15 8 15 10C15 12 14 13 12 13C10 13 9 12 9 10C9 8 10 7 12 7Z" />
            </svg>
        </div>
    </div>
);

const ROADMAP_PHASES = [
    {
        key: "phase1",
        renderGraphic: () => <CodeCube3D className="h-28 w-full" />,
        isCurrent: true,
    },
    {
        key: "phase2",
        renderGraphic: () => <EngineLogosGraphic />,
        isCurrent: false,
    },
    {
        key: "phase3",
        renderGraphic: () => <BlendshapeFace3D className="h-28 w-full" />,
        isCurrent: false,
    },
    {
        key: "phase4",
        renderGraphic: () => <OpenWorldIsland3D className="h-28 w-full" />,
        isCurrent: false,
    },
];

const LandingRoadmap = ({ t }) => {
    return (
        <section className="mx-auto mt-24 w-full max-w-5xl px-3 sm:px-0">
            {/* Header */}
            <div className="text-center">
                <span className="text-micro font-semibold text-[#6366f1]">
                    {t("landing.roadmap.tag")}
                </span>
                <h2 className="mt-1 text-2xl font-extrabold text-[#111426] sm:text-3xl">
                    {t("landing.roadmap.title")}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[#747b9a]">
                    {t("landing.roadmap.subtitle")}
                </p>
            </div>

            {/* Timeline Connecting Line */}
            <div className="relative mt-12 hidden md:block">
                <div className="absolute left-1/8 right-1/8 top-3.5 h-0.5 bg-[#e2e8f0]" />
                <div className="relative flex justify-between px-16">
                    <span className="h-7 w-7 rounded-full border-4 border-white bg-[#6366f1] shadow-xs" />
                    <span className="h-7 w-7 rounded-full border-4 border-white bg-[#cbd5e1] shadow-xs" />
                    <span className="h-7 w-7 rounded-full border-4 border-white bg-[#cbd5e1] shadow-xs" />
                    <span className="h-7 w-7 rounded-full border-4 border-white bg-[#cbd5e1] shadow-xs" />
                </div>
            </div>

            {/* 4 Phase Cards */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {ROADMAP_PHASES.map((phase) => (
                    <div
                        key={phase.key}
                        className="group flex flex-col justify-between rounded-3xl border border-[#ebeef7] bg-white/80 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(99,102,241,0.08)]"
                    >
                        <div>
                            {/* Phase Tag */}
                            <div className="text-center">
                                <span className="inline-block rounded-full bg-[#f1f5f9] px-3 py-1 text-[11px] font-bold text-[#475569]">
                                    {t(`landing.roadmap.${phase.key}.phase`)}
                                </span>
                            </div>

                            {/* Title & Description */}
                            <h3 className="mt-3 text-center text-sm font-bold text-[#111426]">
                                {t(`landing.roadmap.${phase.key}.title`)}
                            </h3>
                            <p className="mt-1.5 text-center text-xs leading-relaxed text-[#747b9a]">
                                {t(`landing.roadmap.${phase.key}.desc`)}
                            </p>

                            {/* 3D Visual Graphic */}
                            <div className="my-3 flex h-32 items-center justify-center transition-transform duration-500 group-hover:scale-105">
                                {phase.renderGraphic()}
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mt-2 text-center">
                            <span
                                className={`inline-block rounded-full px-3 py-1 text-micro font-bold ${
                                    phase.isCurrent
                                        ? "bg-[#e0e7ff] text-[#4f46e5]"
                                        : "bg-[#f8fafc] text-[#8e94aa]"
                                }`}
                            >
                                {t(`landing.roadmap.${phase.key}.status`)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

LandingRoadmap.propTypes = {
    t: PropTypes.func.isRequired,
};

export default LandingRoadmap;
