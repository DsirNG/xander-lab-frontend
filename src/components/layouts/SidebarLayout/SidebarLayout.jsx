import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';
import useIsMobile from '@hooks/useIsMobile';
import { useTranslation } from 'react-i18next';

const EMPTY_ITEMS = [];

/**
 * 侧边栏单个菜单项
 * @param {Object} props.item - 菜单项数据
 * @param {boolean} props.active - 是否为当前选中项
 * @param {Function} props.onClick - 点击回调
 * @param {string} props.subtitleKey - 副标题字段名
 */
const SidebarItem = React.memo(({ item, active, onClick, subtitleKey = 'tag' }) => (
    <Link
        to={item.path || String(item.id)}
        onClick={onClick}
        className={`w-full text-left p-4 rounded-2xl flex items-center group mb-2
            ${active
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'hover:bg-slate-100 text-slate-600'}`}
    >
        <div className={`p-2 rounded-xl mr-4 ${active ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white/50'}`}>
            {item.icon}
        </div>
        <div className="flex-grow min-w-0">
            <h4 className="font-bold text-sm truncate">{item.title}</h4>
            <p className={`text-[10px] uppercase tracking-widest opacity-60 truncate ${active ? 'text-white' : 'text-slate-400'}`}>
                {item[subtitleKey] || item.id}
            </p>
        </div>
        <ChevronRight className={`w-4 h-4 flex-shrink-0 ${active ? 'rotate-90' : ''}`} />
    </Link>
));

const SidebarLayout = ({
    title,
    description,
    items = EMPTY_ITEMS,
    activeId,
    bottomCard,
    subtitleKey
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isMobile = useIsMobile();
    const { t } = useTranslation();

    // 桌面端自动关闭移动菜单
    useEffect(() => {
        if (!isMobile) {
            setIsMobileMenuOpen(false);
        }
    }, [isMobile]);

    /** 菜单项点击处理，移动端点击后自动关闭菜单 */
    const handleItemClick = useCallback((e, item) => {
        if (item.isComingSoon) {
            e.preventDefault();
            return;
        }
        if (isMobile) {
            setIsMobileMenuOpen(false);
        }
    }, [isMobile]);

    return (
        <div className="bg-white">
            {/* 移动端菜单按钮 */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`lg:hidden fixed top-20 left-0 z-40 p-2 bg-white rounded-r-lg shadow-md border border-l-0 border-slate-200 ${isMobileMenuOpen ? 'hidden' : ''}`}
                aria-label={t('common.aria.openMenu', 'Open menu')}
            >
                <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>

            {/* 移动端遮罩层 */}
            {isMobileMenuOpen && isMobile && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 z-30"
                    style={{ top: '64px' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div className="max-w-full sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px] 2xl:max-w-[1536px] mx-auto flex h-[calc(100vh-64px)] overflow-hidden">
                {/* 左侧边栏 */}
                <aside className={`
                    fixed lg:static
                    top-[64px] left-0 bottom-0
                    w-[260px] sm:w-[300px] md:w-[280px] lg:w-[260px] xl:w-[300px] 2xl:w-[320px]
                    flex-shrink-0
                    border-r border-slate-100
                    p-4 sm:p-5 lg:p-6
                    flex flex-col h-[calc(100vh-64px)]
                    bg-slate-50 z-40
                    ${isMobileMenuOpen ? '' : 'hidden lg:block'}
                `}>

                    <header className="mb-4 lg:mb-6">
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 hidden lg:block">
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
                                onClick={(e) => handleItemClick(e, item)}
                            />
                        ))}
                    </div>

                    {bottomCard && (
                        <div className="mt-auto pt-4 border-t border-slate-100">
                            {bottomCard}
                        </div>
                    )}
                </aside>

                {/* 右侧内容区 */}
                <main className="flex-grow overflow-y-auto custom-scrollbar bg-white px-4 sm:px-6 lg:px-10 py-6 lg:py-8 relative w-full lg:w-auto">
                    <Outlet />
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
