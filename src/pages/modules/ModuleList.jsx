import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    MousePointer2,
    MessageSquare,
    List,
    HelpCircle,
    Move
} from 'lucide-react';

const SidebarItem = ({ item, active, onClick }) => (
    <Link
        to={item.id}
        onClick={onClick}
        className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center group mb-2
            ${active
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
    >
        <div className={`p-2 rounded-xl mr-4 transition-colors ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-white/50'}`}>
            {item.icon}
        </div>
        <div className="flex-grow">
            <h4 className="font-bold text-sm">{item.title}</h4>
            <p className={`text-[10px] uppercase tracking-widest opacity-60 ${active ? 'text-white' : 'text-slate-400'}`}>
                {item.id}
            </p>
        </div>
        <ChevronRight className={`w-4 h-4 transition-transform ${active ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
    </Link>
);

const ModuleList = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const modules = useMemo(() => [
        {
            id: 'popover',
            title: t('modules.popover.title'),
            icon: <MessageSquare className="w-5 h-5" />,
        },
        // {
        //     id: 'dropdown',
        //     title: t('modules.dropdown.title'),
        //     icon: <List className="w-5 h-5" />,
        //     isComingSoon: true
        // },
        // {
        //     id: 'tooltip',
        //     title: t('modules.tooltip.title'),
        //     icon: <HelpCircle className="w-5 h-5" />,
        //     isComingSoon: true
        // },
        {
            id: 'drag-drop',
            title: t('modules.dragdrop.title'),
            icon: <Move className="w-5 h-5" />,
        },
        // {
        //     id: 'context',
        //     title: t('modules.context.title'),
        //     icon: <MousePointer2 className="w-5 h-5" />,
        //     isComingSoon: true
        // }
    ], [t]);

    const activeId = location.pathname.split('/').pop() || 'drag-drop';

    return (
        <div className="bg-white dark:bg-slate-950">
            <div className="max-w-[1440px] mx-auto flex h-[calc(100vh-64px)] overflow-hidden">

                {/* Left Sidebar */}
                <aside className="w-[350px] flex-shrink-0 border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20">
                    <header className="mb-10">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                            {t('common.exploreModules')}
                        </h1>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {t('common.selectModuleToExplore')}
                        </p>
                    </header>

                    <div className="flex-grow overflow-y-auto px-1 custom-scrollbar">
                        {modules.map((module) => (
                            <SidebarItem
                                key={module.id}
                                item={module}
                                active={activeId === module.id}
                                onClick={(e) => {
                                    if (module.isComingSoon) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 p-4 rounded-2xl border border-blue-600/10">
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Patterns</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Reusable UI patterns built on top of robust infrastructure.</p>
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

export default ModuleList;
