import React from "react";
import PropTypes from "prop-types";
import {
    ChatBubbles3D,
    CreationCanvas3D,
    GlobeWithOrbit3D,
    KnowledgeFolders3D,
} from "./LandingIllustrations";

const CAPABILITIES = [
    {
        key: "chat",
        Illustration: ChatBubbles3D,
        bgGradient: "bg-gradient-to-b from-[#f8f7ff] to-white/90",
        shadowHover: "hover:shadow-[0_16px_36px_rgba(99,102,241,0.12)]",
        borderHover: "hover:border-[#c7d2fe]",
    },
    {
        key: "search",
        Illustration: GlobeWithOrbit3D,
        bgGradient: "bg-gradient-to-b from-[#f0f9ff] to-white/90",
        shadowHover: "hover:shadow-[0_16px_36px_rgba(59,130,246,0.12)]",
        borderHover: "hover:border-[#bfdbfe]",
    },
    {
        key: "creation",
        Illustration: CreationCanvas3D,
        bgGradient: "bg-gradient-to-b from-[#faf5ff] to-white/90",
        shadowHover: "hover:shadow-[0_16px_36px_rgba(168,85,247,0.12)]",
        borderHover: "hover:border-[#e9d5ff]",
    },
    {
        key: "knowledge",
        Illustration: KnowledgeFolders3D,
        bgGradient: "bg-gradient-to-b from-[#f5f3ff] to-white/90",
        shadowHover: "hover:shadow-[0_16px_36px_rgba(124,58,237,0.12)]",
        borderHover: "hover:border-[#ddd6fe]",
    },
];

const LandingCoreCapabilities = ({ t }) => {
    return (
        <section id="capabilities" className="mx-auto mt-16 w-full max-w-5xl px-3 sm:px-0">
            {/* Section Header */}
            <div className="text-center">
                <h2 className="text-2xl font-extrabold text-[#111426] sm:text-3xl">
                    {t("landing.capabilities.title")}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[#777d9c]">
                    {t("landing.capabilities.subtitle")}
                </p>
            </div>

            {/* 4 Cards with 3D Visual Illustrations */}
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {CAPABILITIES.map((item) => {
                    const IllustrationComponent = item.Illustration;
                    return (
                        <div
                            key={item.key}
                            className={`group relative flex flex-col items-center rounded-2xl border border-[#ebeef7] ${item.bgGradient} p-5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-xs transition-all duration-300 hover:-translate-y-1.5 ${item.shadowHover} ${item.borderHover}`}
                        >
                            {/* 3D Illustration */}
                            <div className="flex h-36 w-full items-center justify-center transition-transform duration-500 group-hover:scale-105">
                                <IllustrationComponent className="h-32 w-full object-contain" />
                            </div>

                            {/* Title */}
                            <h3 className="mt-3 text-base font-bold text-[#111426]">
                                {t(`landing.capabilities.${item.key}.title`)}
                            </h3>

                            {/* Description */}
                            <p className="mt-1.5 text-xs leading-relaxed text-[#747b9a]">
                                {t(`landing.capabilities.${item.key}.desc`)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

LandingCoreCapabilities.propTypes = {
    t: PropTypes.func.isRequired,
};

export default LandingCoreCapabilities;
