import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Globe, MessageSquare, PenLine } from "lucide-react";

const FEATURE_CARDS = [
    {
        key: "chat",
        icon: MessageSquare,
        to: "/workspace/ai",
        iconBg: "bg-[#f4f2ff]",
        iconColor: "text-[#6366f1]",
        borderColor: "hover:border-[#c7d2fe]",
    },
    {
        key: "search",
        icon: Globe,
        to: "/workspace/ai",
        iconBg: "bg-[#fff7ed]",
        iconColor: "text-[#f97316]",
        borderColor: "hover:border-[#fed7aa]",
    },
    {
        key: "creation",
        icon: PenLine,
        to: "/workspace/publish",
        iconBg: "bg-[#eff6ff]",
        iconColor: "text-[#3b82f6]",
        borderColor: "hover:border-[#bfdbfe]",
    },
    {
        key: "knowledge",
        icon: BookOpen,
        to: "/workspace/knowledge",
        iconBg: "bg-[#faf5ff]",
        iconColor: "text-[#a855f7]",
        borderColor: "hover:border-[#e9d5ff]",
    },
];

const LandingFeatureCards = ({ t }) => {
    return (
        <section className="mx-auto mt-10 w-full max-w-5xl px-3 sm:px-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {FEATURE_CARDS.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Link
                            key={card.key}
                            to={card.to}
                            className={`group relative flex flex-col justify-between rounded-2xl border border-[#ebeef7] bg-white/75 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_28px_rgba(99,102,241,0.09)] ${card.borderColor}`}
                        >
                            <div>
                                {/* Card Icon */}
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className={`grid h-9 w-9 place-items-center rounded-xl ${card.iconBg} ${card.iconColor} transition-transform duration-300 group-hover:scale-110`}
                                    >
                                        <Icon className="h-4.5 w-4.5" />
                                    </div>
                                    <h3 className="text-sm font-bold text-[#111426]">
                                        {t(`landing.features.${card.key}.title`)}
                                    </h3>
                                </div>

                                {/* Card Description */}
                                <p className="mt-3 text-xs leading-relaxed text-[#747b9a]">
                                    {t(`landing.features.${card.key}.desc`)}
                                </p>
                            </div>

                            {/* Bottom Arrow Action */}
                            <div className="mt-4 flex items-center text-xs font-semibold text-[#8b91a9] transition-colors group-hover:text-[#6366f1]">
                                <span className="mr-1">
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

LandingFeatureCards.propTypes = {
    t: PropTypes.func.isRequired,
};

export default LandingFeatureCards;
