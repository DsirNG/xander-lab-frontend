
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Zap, MousePointer2 } from 'lucide-react';
import BrowserWindow from '@components/common/BrowserWindow';

const DemoSection = ({ title, desc, children }) => (
    <div className="mb-12">
        <div className="flex items-center space-x-3 mb-4">
            <div className="h-6 w-1 bg-primary rounded-full" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-2xl">{desc}</p>
        <BrowserWindow>
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-10 min-h-[500px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="w-full relative z-10 flex justify-center">
                    {children}
                </div>
            </div>
        </BrowserWindow>
    </div>
);

const ComponentContent = ({ component }) => {
    const { t } = useTranslation();

    if (!component) return null;

    return (
        <motion.div
            key={component.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex justify-between items-start mb-12">
                <div className="max-w-2xl">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
                        {component.title}
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        {component.desc}
                    </p>
                </div>
            </div>

            <div className="space-y-4 mb-10">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center">
                    <MousePointer2 className="w-3 h-3 mr-2" />
                    {t('common.interactiveDemos', 'Interactive Demos')}
                </h4>
                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
            </div>

            <div className="grid grid-cols-1">
                {component.scenarios ? (
                    component.scenarios.map((scenario, index) => (
                        <DemoSection
                            key={index}
                            title={scenario.title}
                            desc={scenario.desc}
                        >
                            {scenario.demo}
                        </DemoSection>
                    ))
                ) : (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                        <Zap className="w-12 h-12 mb-4 opacity-20" />
                        <p>{t('common.comingSoon', 'Coming Soon')}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ComponentContent;
