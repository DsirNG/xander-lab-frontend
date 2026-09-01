import React from "react";
import PropTypes from "prop-types";
import { Clock, Heart, ShieldCheck, Sparkles } from "lucide-react";

const HIGHLIGHTS = [
    {
        key: "smart",
        icon: Sparkles,
        iconBg: "bg-[#f3f0ff]",
        iconColor: "text-[#7c3aed]",
    },
    {
        key: "efficient",
        icon: Clock,
        iconBg: "bg-[#eff6ff]",
        iconColor: "text-[#3b82f6]",
    },
    {
        key: "secure",
        icon: ShieldCheck,
        iconBg: "bg-[#ecfdf5]",
        iconColor: "text-[#059669]",
    },
    {
        key: "personalized",
        icon: Heart,
        iconBg: "bg-[#fdf2f8]",
        iconColor: "text-[#db2777]",
    },
];

const LandingHighlightsBar = ({ t }) => {
    return (
        <section className="mx-auto mt-14 mb-16 w-full max-w-5xl px-3 sm:px-0">
            <div className="rounded-2xl border border-[#ebeef7] bg-white/80 p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-md">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {HIGHLIGHTS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.key}
                                className="flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]"
                            >
                                <div
                                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.iconBg} ${item.iconColor}`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-bold text-[#111426]">
                                        {t(`landing.highlights.${item.key}.title`)}
                                    </h4>
                                    <p className="mt-0.5 truncate text-xs text-[#8087a3]">
                                        {t(`landing.highlights.${item.key}.desc`)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

LandingHighlightsBar.propTypes = {
    t: PropTypes.func.isRequired,
};

export default LandingHighlightsBar;
