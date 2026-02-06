import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Zap,
    MousePointer2,
    ScrollText
} from 'lucide-react';

const DemoSection = ({ title, desc, children }) => (
    <div className="mb-12">
        <div className="flex items-center space-x-3 mb-4">
            <div className="h-6 w-1 bg-primary rounded-full" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-2xl">{desc}</p>
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 min-h-[300px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            {children}
        </div>
    </div>
);

const InfraContent = ({ system }) => {
    const { t } = useTranslation();

    if (!system) return null;

    return (
        <motion.div
            key={system.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex justify-between items-start mb-12">
                <div className="max-w-2xl">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
                        {system.title}
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        {system.id === 'anchored' ? t('infra.anchored.desc') : 'System preview coming soon.'}
                    </p>
                </div>
                {system.detailPages && system.detailPages.length > 0 && (
                    <Link
                        to={`/infra/${system.id}/${system.detailPages[0].type}`}
                        className="flex items-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition-transform shadow-xl"
                    >
                        <ScrollText className="w-4 h-4" />
                        <span>{t('common.viewTheory')}</span>
                    </Link>
                )}
            </div>

            <div className="space-y-4 mb-10">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center">
                    <MousePointer2 className="w-3 h-3 mr-2" />
                    {t('common.liveScenarios')}
                </h4>
                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
            </div>

            <div className="grid grid-cols-1">
                {system.scenarios ? (
                    system.scenarios.map((scenario, index) => (
                        <DemoSection
                            key={index}
                            title={scenario.title}
                            desc={scenario.desc}
                        >
                            {scenario.demo}
                        </DemoSection>
                    ))
                ) : (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-400">
                        <Zap className="w-12 h-12 mb-4 opacity-20" />
                        <p>{t('common.comingSoon')}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default InfraContent;
