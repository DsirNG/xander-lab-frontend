import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import PhaseCard from '@/components/common/PhaseCard';

const AnchoredOverlay = () => {
    const { t } = useTranslation();

    const phases = [
        t('infra.anchored.phases.theory', { returnObjects: true }),
        t('infra.anchored.phases.hook', { returnObjects: true }),
        t('infra.anchored.phases.container', { returnObjects: true }),
    ];

    return (
        <div className="min-h-screen bg-slate-50 ">
            <div className="max-w-4xl mx-auto pt-12 px-6">
                <Link to="/infra" className="inline-flex items-center text-primary hover:underline mb-8 group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {t('common.backToInfra')}
                </Link>

                <header className="mb-16">
                    <div className="inline-block px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                        {t('infra.anchored.tag')}
                    </div>
                    <h1 className="text-5xl font-black text-slate-900  mb-6">
                        {t('infra.anchored.title')}
                    </h1>
                    <p className="text-xl text-slate-600  leading-relaxed">
                        {t('infra.anchored.desc')}
                    </p>
                </header>

                <div className="space-y-4 mb-16 px-4">
                    <h2 className="text-sm uppercase tracking-widest text-slate-400 font-bold">{t('common.technicalNarrative')}</h2>
                    <div className="h-1 w-20 bg-primary rounded-full" />
                </div>

                <div className="ml-4 mb-24">
                    {phases.map((phase, index) => (
                        <PhaseCard key={index} phase={phase} index={index} />
                    ))}
                </div>

                <section className="mb-24">
                    <div className="space-y-4 mb-8 px-4">
                        <h2 className="text-sm uppercase tracking-widest text-slate-400 font-bold">{t('common.codeImplementation')}</h2>
                        <div className="h-1 w-20 bg-blue-500 rounded-full" />
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Box aria-hidden="true" className="w-32 h-32 text-white" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                {t('common.involvedFiles')}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {t('infra.anchored.files', { returnObjects: true }).map((file, i) => (
                                    <div key={i} className="flex items-center space-x-4 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                                        <div className="p-2 bg-primary/20 rounded-lg">
                                            <Box aria-hidden="true" className="w-5 h-5 text-primary" />
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

export default AnchoredOverlay;
