import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';

const SidebarItem = ({ item, active, onClick, subtitleKey = 'tag' }) => (
    <Link
        to={item.path || item.id}
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
                {item[subtitleKey] || item.id}
            </p>
        </div>
        <ChevronRight className={`w-4 h-4 transition-transform ${active ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
    </Link>
);

const SidebarLayout = ({
    title,
    description,
    items = [],
    activeId,
    bottomCard,
    subtitleKey
}) => {
    return (
        <div className="bg-white dark:bg-slate-950">
            <div className="max-w-[1440px] mx-auto flex h-[calc(100vh-64px)] overflow-hidden">

                {/* Left Sidebar */}
                <aside className="w-[350px] flex-shrink-0 border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20">
                    <header className="mb-10">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                            {title}
                        </h1>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {description}
                        </p>
                    </header>

                    <div className="flex-grow overflow-y-auto px-1 custom-scrollbar">
                        {items.map((item) => (
                            <SidebarItem
                                key={item.id}
                                item={item}
                                active={activeId === item.id}
                                subtitleKey={subtitleKey}
                                onClick={(e) => {
                                    if (item.isComingSoon) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        ))}
                    </div>

                    {bottomCard && (
                        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                            {bottomCard}
                        </div>
                    )}
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

SidebarLayout.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    items: PropTypes.array.isRequired,
    activeId: PropTypes.string,
    bottomCard: PropTypes.node,
    subtitleKey: PropTypes.string
};

export default SidebarLayout;
