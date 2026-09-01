import React from "react";
import PropTypes from "prop-types";
import {
    AuditLedger3D,
    ConnectedDevices3D,
    SecurityShield3D,
    ServerGateway3D,
} from "./LandingExtendedIllustrations";

const FOUNDATION_CARDS = [
    {
        key: "sandbox",
        Illustration: SecurityShield3D,
        badge: "01",
    },
    {
        key: "gateway",
        Illustration: ServerGateway3D,
        badge: "02",
    },
    {
        key: "ledger",
        Illustration: AuditLedger3D,
        badge: "03",
    },
    {
        key: "collaboration",
        Illustration: ConnectedDevices3D,
        badge: "04",
    },
];

const LandingTechFoundation = ({ t }) => {
    return (
        <section className="mx-auto mt-24 w-full max-w-5xl px-3 sm:px-0">
            {/* Header */}
            <div className="text-center">
                <span className="text-micro font-semibold text-[#6366f1]">
                    {t("landing.techFoundation.tag")}
                </span>
                <h2 className="mt-1 text-2xl font-extrabold text-[#111426] sm:text-3xl">
                    {t("landing.techFoundation.title")}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[#747b9a]">
                    {t("landing.techFoundation.subtitle")}
                </p>
            </div>

            {/* 4 Cards Grid */}
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {FOUNDATION_CARDS.map((card) => {
                    const IllustrationComponent = card.Illustration;
                    return (
                        <div
                            key={card.key}
                            className="group flex flex-col justify-between rounded-3xl border border-[#ebeef7] bg-white/85 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(99,102,241,0.09)]"
                        >
                            <div>
                                {/* Number Badge */}
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex h-6 w-7 items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[11px] font-bold text-[#64748b]">
                                        {card.badge}
                                    </span>
                                </div>

                                {/* 3D Illustration Graphic */}
                                <div className="my-2 flex h-32 items-center justify-center transition-transform duration-500 group-hover:scale-105">
                                    <IllustrationComponent className="h-28 w-full object-contain" />
                                </div>

                                {/* Title & Description */}
                                <h3 className="mt-1 text-sm font-bold text-[#111426]">
                                    {t(`landing.techFoundation.${card.key}.title`)}
                                </h3>
                                <p className="mt-1.5 text-xs leading-relaxed text-[#747b9a]">
                                    {t(`landing.techFoundation.${card.key}.desc`)}
                                </p>
                            </div>

                            {/* 3 Pills at bottom */}
                            <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-[#f1f3f9]">
                                <span className="rounded-md bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-medium text-[#475569]">
                                    {t(`landing.techFoundation.${card.key}.pill1`)}
                                </span>
                                <span className="rounded-md bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-medium text-[#475569]">
                                    {t(`landing.techFoundation.${card.key}.pill2`)}
                                </span>
                                <span className="rounded-md bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-medium text-[#475569]">
                                    {t(`landing.techFoundation.${card.key}.pill3`)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

LandingTechFoundation.propTypes = {
    t: PropTypes.func.isRequired,
};

export default LandingTechFoundation;
