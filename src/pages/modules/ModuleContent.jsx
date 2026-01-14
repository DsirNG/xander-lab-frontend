import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Zap,
    MousePointer2,
    ExternalLink,
    MousePointerClick
} from 'lucide-react';
import FileTransferDemo from './demos/FileTransferDemo';
import SortableListDemo from './demos/SortableListDemo';

const DemoSection = ({ title, desc, children }) => (
    <div className="mb-12">
        <div className="flex items-center space-x-3 mb-4">
            <div className="h-6 w-1 bg-blue-600 rounded-full" />
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

const ModuleContent = ({ module }) => {
    const { t } = useTranslation();
    const [selectedFiles] = useState(new Set(['1', '2']));

    // Dynamically inject demos if they match certain IDs
    const scenarios = useMemo(() => {
        if (module.id === 'popover') {
            return [
                {
                    title: 'Standard Click Trigger',
                    desc: 'A general floating container that appears when clicking an element, maintaining its position relative to the trigger.',
                    demo: (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-6 rounded-2xl flex flex-col items-center space-y-4 cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                <MousePointerClick className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold dark:text-white">Click Me</span>
                        </motion.div>
                    )
                }
            ];
        }
        if (module.id === 'drag-drop') {
            return [
                {
                    title: 'Scenario A: Advanced File Transfer',
                    desc: 'Multi-file dragging with custom stack previews and dynamic instruction hints.',
                    demo: <FileTransferDemo selectedFiles={selectedFiles} />
                },
                {
                    title: 'Scenario B: Sortable Core',
                    desc: 'Lightweight list reordering with visual gap detection and ghost states.',
                    demo: <SortableListDemo />
                }
            ];
        }
        return null;
    }, [module.id, selectedFiles]);

    if (!module) return null;

    return (
        <motion.div
            key={module.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex justify-between items-start mb-12">
                <div className="max-w-2xl">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
                        {module.title}
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        {module.desc}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="bg-slate-100 dark:bg-slate-800 px-6 py-3 rounded-2xl font-bold text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span>{t('common.implementationDetails')}</span>
                    </div>
                    {module.path && (
                        <Link
                            to={`/modules/${module.path}/deep-dive`}
                            className="flex items-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition-transform shadow-xl ml-4"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>{t('common.viewDeepDive')}</span>
                        </Link>
                    )}
                </div>
            </div>

            <div className="space-y-4 mb-10">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center">
                    <MousePointer2 className="w-3 h-3 mr-2" />
                    {t('common.liveScenarios')}
                </h4>
                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
            </div>

            <div className="grid grid-cols-1">
                {scenarios ? (
                    scenarios.map((scenario, index) => (
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

export default ModuleContent;
