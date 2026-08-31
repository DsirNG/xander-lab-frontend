import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Box } from "lucide-react";
import { Link } from "react-router-dom";
import PhaseCard from "@/components/common/PhaseCard";

const DragDropSystem = () => {
    const { t } = useTranslation();

    const phases = [
        t("modules.dragdrop.phases.theory", { returnObjects: true }),
        t("modules.dragdrop.phases.hook", { returnObjects: true }),
        t("modules.dragdrop.phases.container", { returnObjects: true }),
    ];

    return (
        <div className="bg-slate-50 ">
            <div className="max-w-4xl mx-auto pt-10 sm:pt-12 px-4 sm:px-6">
                <Link
                    to="/modules/drag-drop"
                    className="inline-flex items-center text-blue-600 hover:underline mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Modules
                </Link>

                <header className="mb-10 sm:mb-16">
                    <div className="inline-block px-3 py-1 rounded-md bg-blue-600/10 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
                        Interaction Layer
                    </div>
                    <div className="text-heading sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 sm:mb-6 break-words">
                        {t("modules.dragdrop.title")}
                    </div>
                    <div className="text-body sm:text-xl text-slate-600 leading-relaxed">
                        {t("modules.dragdrop.desc")}
                    </div>
                </header>

                <div className="space-y-4 mb-10 sm:mb-16 px-4">
                    <div className="text-sm uppercase tracking-widest text-slate-400 font-bold">
                        {t("common.technicalNarrative")}
                    </div>
                    <div className="h-1 w-20 bg-blue-600 rounded-full" />
                </div>

                <div className="ml-4 mb-16 sm:mb-24">
                    {phases.map((phase, index) => (
                        <PhaseCard
                            key={index}
                            phase={phase}
                            index={index}
                            color="blue"
                        />
                    ))}
                </div>

                <section className="mb-16 sm:mb-24">
                    <div className="space-y-4 mb-8 px-4">
                        <div className="text-sm uppercase tracking-widest text-slate-400 font-bold">
                            {t("common.codeImplementation")}
                        </div>
                        <div className="h-1 w-20 bg-blue-600 rounded-full" />
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 overflow-hidden relative group max-w-full">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <Box
                                aria-hidden="true"
                                className="w-32 h-32 text-white"
                            />
                        </div>

                        <div className="relative z-10">
                            <div className="text-xl font-bold text-white mb-6 flex items-center">
                                {t("common.involvedFiles")}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {t("modules.dragdrop.files", {
                                    returnObjects: true,
                                }).map((file, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center space-x-4 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors min-w-0"
                                    >
                                        <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                                            <Box
                                                aria-hidden="true"
                                                className="w-5 h-5 text-blue-400"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-white font-mono text-caption sm:text-sm break-all">
                                                {file.name}
                                            </div>
                                            <div className="text-slate-400 text-xs mt-0.5">
                                                {file.role}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DragDropSystem;
