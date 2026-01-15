import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    ChevronRight,
    Layout,
    Move,
    Zap
} from 'lucide-react';

const SidebarItem = ({ item, active, onClick }) => (
    <Link
        to={item.id}
        onClick={onClick}
        className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center group mb-2
            ${active
                ? 'bg-primary text-white shadow-xl shadow-primary/30'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
    >
        <div className={`p-2 rounded-xl mr-4 transition-colors ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-white/50'}`}>
            {item.icon}
        </div>
        <div className="flex-grow">
            <h4 className="font-bold text-sm">{item.title}</h4>
            <p className={`text-[10px] uppercase tracking-widest opacity-60 ${active ? 'text-white' : 'text-slate-400'}`}>
                {item.tag}
            </p>
        </div>
        <ChevronRight className={`w-4 h-4 transition-transform ${active ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
    </Link>
);

const InfraList = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const systems = useMemo(() => [
        {
            id: 'anchored',
            title: t('infra.anchored.title'),
            tag: t('infra.anchored.tag'),
            icon: <Box className="w-5 h-5" />,
        },
        {
            id: 'focus',
            title: 'Focus Trap',
            tag: 'Accessibility',
            icon: <Layout className="w-5 h-5" />,
            isComingSoon: true
        },
        {
            id: 'scroll',
            title: 'Scroll Management',
            tag: 'Interaction Physics',
            icon: <Move className="w-5 h-5" />,
            isComingSoon: true
        }
    ], [t]);

    const activeId = location.pathname.split('/').pop() || 'anchored';

    return (
        <div className="bg-white dark:bg-slate-950">
            <div className="max-w-[1440px] mx-auto flex h-[calc(100vh-64px)] overflow-hidden">

                {/* Left Sidebar */}
                <aside className="w-[350px] flex-shrink-0 border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20">
                    <header className="mb-10">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                            {t('common.exploreInfra')}
                        </h1>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {t('common.selectModule')}
                        </p>
                    </header>

                    <div className="flex-grow overflow-y-auto px-1 custom-scrollbar">
                        {systems.map((system) => (
                            <SidebarItem
                                key={system.id}
                                item={system}
                                active={activeId === system.id}
                            />
                        ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-4 rounded-2xl border border-primary/10">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Architecture</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Stable, headless, and accessible infrastructure for high-performance React apps.</p>
                        </div>
                    </div>
                </aside>

                {/* Right Content Area */}
                <main className="flex-grow overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950 px-12 py-10 relative">
                    <AnimatePresence mode="wait">
                        <Outlet />
                    </AnimatePresence>
                </main>

            </div>
        </div>
    );
};

export default InfraList;
