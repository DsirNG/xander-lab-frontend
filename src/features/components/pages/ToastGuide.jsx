import React from "react";
import { useTranslation } from "react-i18next";
import { Layers, ArrowLeft, Cpu, Zap, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import CodeBlock from "@/components/common/CodeBlock";

// Import raw code using Vite's ?raw suffix for source display
import ToastItemCode from "@/components/common/Toast/ToastItem.jsx?raw";
import ToastContextCode from "@/components/common/Toast/ToastContext.jsx?raw";
import ToastContainerCode from "@/components/common/Toast/ToastContainer.jsx?raw";
import ToastIndexCode from "@/components/common/Toast/index.js?raw";

const DependencyCard = ({ title, items, icon: Icon }) => (
    <div className="p-6 rounded-[2rem] bg-white  border border-slate-200  shadow-sm">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-4 flex items-center gap-2">
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {title}
        </div>
        <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
                <span
                    key={i}
                    className="px-3 py-1 rounded-lg bg-slate-50  text-slate-600  text-[10px] font-bold border border-slate-100 "
                >
                    {item}
                </span>
            ))}
        </div>
    </div>
);

const ToastGuide = ({ componentId }) => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-slate-50  pb-20">
            <div className="max-w-6xl mx-auto pt-10 px-4 sm:px-6">
                {/* Navigation */}
                <Link
                    to={`/components/${componentId}`}
                    className="inline-flex items-center text-micro font-black uppercase tracking-widest text-ink-faint hover:text-accent mb-8 transition-all group"
                >
                    <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center mr-3 group-hover:border-accent/30 group-hover:bg-accent/5">
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                    </div>
                    {t("common.backToComponents")}
                </Link>

                {/* Header */}
                <div className="mb-16 border-b border-slate-200  pb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                            <Zap className="w-7 h-7 text-primary" />
                        </div>
                        <div className="text-2xl sm:text-4xl font-black italic tracking-tighter text-slate-900  uppercase break-words">
                            {t("components.toast.guide.title").split(" // ")[0]}{" "}
                            {" // "}{" "}
                            <span className="text-primary">
                                {
                                    t("components.toast.guide.title").split(
                                        " // ",
                                    )[1]
                                }
                            </span>
                        </div>
                    </div>
                    <div className="text-body sm:text-lg text-slate-500  max-w-3xl font-medium leading-relaxed italic break-words">
                        {t("components.toast.guide.subtitle")}
                    </div>
                </div>

                {/* Architecture Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <DependencyCard
                        title={t("components.toast.guide.architecture.engine")}
                        icon={Cpu}
                        items={[
                            "React hooks",
                            "useRef Timing",
                            "Context API",
                            "Portal",
                        ]}
                    />
                    <DependencyCard
                        title={t("components.toast.guide.architecture.physics")}
                        icon={Activity}
                        items={[
                            "CSS Keyframes",
                            "GPU Compositing",
                            "Bouncy Physics",
                        ]}
                    />
                    <div className="p-8 rounded-[2rem] bg-primary text-white shadow-2xl shadow-primary/20 flex flex-col justify-between">
                        <div className="text-[10px] uppercase tracking-[0.2em] font-black mb-4 flex items-center gap-2 opacity-80">
                            <Layers className="w-3.5 h-3.5" />
                            {t("components.toast.guide.architecture.logic")}
                        </div>
                        <div className="text-xs font-bold leading-relaxed">
                            {t("components.toast.guide.architecture.logicDesc")}
                        </div>
                    </div>
                </div>

                {/* Source Code Section */}
                <div className="space-y-16">
                    {/* 1. Item Logic */}
                    <section>
                        <div className="mb-6 px-2">
                            <div className="text-xl sm:text-2xl font-black text-slate-900  mb-2 italic uppercase tracking-tighter break-words">
                                {t(
                                    "components.toast.guide.sections.physics.title",
                                )}
                            </div>
                            <div className="text-slate-500  text-sm font-medium">
                                {t(
                                    "components.toast.guide.sections.physics.desc",
                                )}
                            </div>
                        </div>
                        <CodeBlock code={ToastItemCode} language="jsx" />
                    </section>

                    {/* 2. Context Management */}
                    <section>
                        <div className="mb-6 px-2">
                            <div className="text-xl sm:text-2xl font-black text-slate-900  mb-2 italic uppercase tracking-tighter break-words">
                                {t(
                                    "components.toast.guide.sections.orchestration.title",
                                )}
                            </div>
                            <div className="text-slate-500  text-sm font-medium">
                                {t(
                                    "components.toast.guide.sections.orchestration.desc",
                                )}
                            </div>
                        </div>
                        <CodeBlock code={ToastContextCode} language="jsx" />
                    </section>

                    {/* 3. Container & Portal */}
                    <section>
                        <div className="mb-6 px-2">
                            <div className="text-xl sm:text-2xl font-black text-slate-900  mb-2 italic uppercase tracking-tighter break-words">
                                {t(
                                    "components.toast.guide.sections.portal.title",
                                )}
                            </div>
                            <div className="text-slate-500  text-sm font-medium">
                                {t(
                                    "components.toast.guide.sections.portal.desc",
                                )}
                            </div>
                        </div>
                        <CodeBlock code={ToastContainerCode} language="jsx" />
                    </section>

                    {/* 4. Entry Point */}
                    <section>
                        <div className="mb-6 px-2">
                            <div className="text-xl sm:text-2xl font-black text-slate-900  mb-2 italic uppercase tracking-tighter break-words">
                                {t(
                                    "components.toast.guide.sections.entry.title",
                                )}
                            </div>
                            <div className="text-slate-500  text-sm font-medium">
                                {t(
                                    "components.toast.guide.sections.entry.desc",
                                )}
                            </div>
                        </div>
                        <CodeBlock
                            code={ToastIndexCode}
                            language="javascript"
                        />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ToastGuide;
