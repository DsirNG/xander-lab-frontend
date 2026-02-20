import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ChevronRight, Menu, X } from 'lucide-react';
import PropTypes from 'prop-types';

const SidebarItem = ({ item, active, onClick, subtitleKey = 'tag' }) => (
    <Link
        to={item.path || String(item.id)}
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // 检测是否为移动端
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            // 桌面端自动关闭移动菜单
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    return (
        <div className="bg-white dark:bg-slate-950">
            {/* 移动端菜单按钮 */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`lg:hidden fixed top-20 left-0 z-50 p-2 bg-white/10 dark:bg-slate-950/50 backdrop-blur-[2px] rounded-r-lg shadow-md border border-l-0 border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${isMobileMenuOpen
                    ? '-translate-x-full opacity-0 pointer-events-none'
                    : 'translate-x-0 opacity-100'
                    }`}
                aria-label="打开菜单"
            >
                <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>

            {/* 移动端遮罩层 */}
            {isMobileMenuOpen && isMobile && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 z-30"
                    style={{ top: '64px' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div className="max-w-full sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px] 2xl:max-w-[1536px] mx-auto flex h-[calc(100vh-64px)] overflow-hidden pt-0 lg:pt-0">
                {/* Left Sidebar - 响应式布局 */}
                <aside className={`
                    fixed lg:static
                    top-[64px] left-0 bottom-0
                    w-[280px] sm:w-[320px] md:w-[300px] lg:w-[280px] xl:w-[320px] 2xl:w-[350px]
                    flex-shrink-0
                    border-r border-slate-100 dark:border-slate-800
                    p-4 sm:p-6 md:p-6 lg:p-8
                    flex flex-col h-[calc(100vh-64px)]
                    bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-sm
                    transform transition-transform duration-300 ease-in-out z-40
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>

                    <header className="mb-6 md:mb-8 lg:mb-10">
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 hidden lg:block">
                            {title}
                        </h1>
                        <p className="text-xs text-slate-500 leading-relaxed hidden lg:block">
                            {description}
                        </p>
                    </header>

                    <div className="flex-grow overflow-y-auto px-1 custom-scrollbar">
                        {items.map((item) => (
                            <SidebarItem
                                key={item.id}
                                item={item}
                                active={String(activeId) === String(item.id)}
                                subtitleKey={subtitleKey}
                                onClick={(e) => {
                                    if (item.isComingSoon) {
                                        e.preventDefault();
                                    } else {
                                        // 移动端选择后自动关闭菜单
                                        if (isMobile) {
                                            setIsMobileMenuOpen(false);
                                        }
                                    }
                                }}
                            />
                        ))}
                    </div>

                    {bottomCard && (
                        <div className="mt-auto pt-4 md:pt-6 border-t border-slate-100 dark:border-slate-800">
                            {bottomCard}
                        </div>
                    )}
                </aside>

                {/* Right Content Area - 响应式布局 */}
                <main className={`
                    flex-grow overflow-y-auto custom-scrollbar
                    bg-white dark:bg-slate-950
                    px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12
                    py-6 sm:py-8 md:py-9 lg:py-10
                    relative
                    w-full lg:w-auto
                    pt-4 lg:pt-0
                `}>
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
