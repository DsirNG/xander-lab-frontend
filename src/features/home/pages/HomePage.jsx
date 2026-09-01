import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import LandingHero from "../components/LandingHero";
import LandingAgentWindow from "../components/LandingAgentWindow";
import LandingDinqorAgentSection from "../components/LandingDinqorAgentSection";
import LandingTechFoundation from "../components/LandingTechFoundation";
import LandingEcosystem from "../components/LandingEcosystem";
import LandingRoadmap from "../components/LandingRoadmap";
import LandingCtaBanner from "../components/LandingCtaBanner";
import LandingFooter from "../components/LandingFooter";

export default function HomePage() {
    const { t } = useTranslation();
    const agentWindowRef = useRef(null);

    const handleTryNow = () => {
        agentWindowRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    };

    const handleLearnMore = () => {
        const el = document.getElementById("dinqor-agent");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-[#fafafc] bg-[radial-gradient(ellipse_100%_70%_at_50%_0%,rgba(165,180,252,0.18),rgba(250,250,252,0)_70%)]">
            {/* Ambient Background Glows */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-b from-[#e0e7ff]/40 via-[#ede9fe]/30 to-transparent blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 top-96 h-80 w-80 rounded-full bg-gradient-to-tr from-purple-200/25 to-blue-200/20 blur-2xl"
            />

            {/* Landing Content Stack */}
            <main className="relative z-10 flex flex-col px-4 sm:px-6 lg:px-8">
                {/* 1. Hero Section */}
                <LandingHero
                    t={t}
                    onTryNow={handleTryNow}
                    onLearnMore={handleLearnMore}
                />

                {/* 2. Centerpiece: Interactive Agent Window */}
                <div ref={agentWindowRef}>
                    <LandingAgentWindow t={t} />
                </div>

                {/* 3. 统一超级智能体工作台与四核引擎全景展厅 */}
                <div id="dinqor-agent">
                    <LandingDinqorAgentSection t={t} />
                </div>

                {/* 4. 工业级技术底座与安全背书 */}
                <LandingTechFoundation t={t} />

                {/* 8. 附属生态与创作者社区 */}
                <LandingEcosystem t={t} />

                {/* 9. Roadmap / 与技术，共同进化 */}
                <LandingRoadmap t={t} />

                {/* 10. CTA Banner */}
                <LandingCtaBanner t={t} />
            </main>

            {/* 11. 官方网站 Footer */}
            <LandingFooter t={t} />
        </div>
    );
}
