import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    Compass,
    Cpu,
    Box,
    CheckCircle2,
    ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PhaseCard = ({ phase, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-8 pb-12 border-l-2 border-slate-200 dark:border-slate-800 last:border-0 last:pb-0"
        >
            <div className="absolute left-[-16px] top-0 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 flex items-center justify-center text-blue-600 shadow-sm">
                {index === 0 && <Compass className="w-4 h-4" />}
                {index === 1 && <Cpu className="w-4 h-4" />}
                {index === 2 && <Box className="w-4 h-4" />}
            </div>

            <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:border-blue-600/50 transition-colors shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {phase.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
                    {phase.desc}
                </p>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {phase.points.map((point, i) => (
                        <li key={i} className="flex items-center space-x-2 text-slate-500 dark:text-slate-500">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
};

const DragDropSystem = () => {
    const { t } = useTranslation();

    const phases = [
        t('modules.dragdrop.phases.theory', { returnObjects: true }),
        t('modules.dragdrop.phases.hook', { returnObjects: true }),
        t('modules.dragdrop.phases.container', { returnObjects: true }),
    ];

    return (
        <div className="bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto pt-12 px-6">
                <Link to="/modules/drag-drop" className="inline-flex items-center text-blue-600 hover:underline mb-8 group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Modules
                </Link>

                <header className="mb-16">
                    <div className="inline-block px-3 py-1 rounded-md bg-blue-600/10 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
                        Interaction Layer
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-6">
                        {t('modules.dragdrop.title')}
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                        {t('modules.dragdrop.desc')}
                    </p>
                </header>

                <div className="space-y-4 mb-16 px-4">
                    <h2 className="text-sm uppercase tracking-widest text-slate-400 font-bold">{t('common.technicalNarrative')}</h2>
                    <div className="h-1 w-20 bg-blue-600 rounded-full" />
                </div>

                <div className="ml-4 mb-24">
                    {phases.map((phase, index) => (
                        <PhaseCard key={index} phase={phase} index={index} />
                    ))}
                </div>

                <section className="mb-24">
                    <div className="space-y-4 mb-8 px-4">
                        <h2 className="text-sm uppercase tracking-widest text-slate-400 font-bold">{t('common.codeImplementation')}</h2>
                        <div className="h-1 w-20 bg-blue-600 rounded-full" />
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Box className="w-32 h-32 text-white" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                {t('common.involvedFiles')}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {t('modules.dragdrop.files', { returnObjects: true }).map((file, i) => (
                                    <div key={i} className="flex items-center space-x-4 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                            <Box className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-mono text-sm">{file.name}</p>
                                            <p className="text-slate-400 text-xs">{file.role}</p>
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
