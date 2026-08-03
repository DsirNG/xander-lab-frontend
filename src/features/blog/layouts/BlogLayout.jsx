import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';
import BlogSidebar from '../components/BlogSidebar';
import useIsMobile from '@hooks/useIsMobile';
import { useTranslation } from 'react-i18next';
import { usePureReading } from '@/context/PureReadingContext';

/**
 * 博客布局组件
 * 采用 App Shell 模式：固定高度容器 + 内部独立滚动
 * 与项目 SidebarLayout 保持一致的布局策略
 * 移动端右侧边栏采用抽屉式展开
 * 支持纯净阅读模式：无 Top Nav、无右侧分类 Sidebar
 */
const BlogLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isMobile = useIsMobile();
    const { t } = useTranslation();
    const { isPureReading } = usePureReading();

    // 桌面端自动关闭移动菜单
    useEffect(() => {
        if (!isMobile) {
            setIsSidebarOpen(false);
        }
    }, [isMobile]);

    return (
        <div className="bg-canvas">
            {/* 移动端侧边栏展开按钮 - 固定在右侧 (纯净阅读模式下隐去) */}
            {!isPureReading && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className={`lg:hidden fixed top-20 right-0 z-50 p-2 bg-canvas/10 backdrop-blur-[2px] rounded-l-lg shadow-md border border-r-0 border-border transition-all duration-300 ease-in-out ${
                        isSidebarOpen
                            ? 'translate-x-full opacity-0 pointer-events-none'
                            : 'translate-x-0 opacity-100'
                    }`}
                    aria-label={t('common.aria.openSidebar', 'Open sidebar')}
                >
                    <ChevronLeft className="w-5 h-5 text-ink-secondary" />
                </button>
            )}

            {/* 移动端遮罩层 */}
            {!isPureReading && isSidebarOpen && isMobile && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 z-30"
                    style={{ top: '64px' }}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className={`mx-auto flex flex-col lg:flex-row overflow-hidden transition-all duration-300 ${
                isPureReading
                    ? 'w-full max-w-full h-screen min-h-screen'
                    : 'max-w-full sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px] 2xl:max-w-[1400px] h-[calc(100vh-64px)]'
            }`}>
                {/* 左侧主内容区 - 独立滚动 (纯净模式下全屏宽度，滚动条靠最右侧) */}
                <main className={`flex-grow overflow-y-auto custom-scrollbar w-full ${
                    isPureReading
                        ? 'px-4 sm:px-8 md:px-12 py-8 sm:py-12 flex justify-center'
                        : 'px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 lg:py-10 lg:w-auto'
                }`}>
                    <Outlet />
                </main>

                {/* 右侧边栏 - 桌面端固定显示，移动端抽屉式展开 (纯净阅读模式下不渲染) */}
                {!isPureReading && (
                    <aside className={`
                        fixed lg:static
                        top-[64px] right-0 bottom-0
                        w-[300px] xl:w-[320px] 2xl:w-[340px]
                        flex-shrink-0 flex flex-col
                        h-[calc(100vh-64px)]
                        border-l border-border
                        bg-surface/80 lg:bg-surface/50
                        backdrop-blur-sm lg:backdrop-blur-none
                        overflow-y-auto custom-scrollbar
                        p-6 xl:p-8
                        transform transition-transform duration-300 ease-in-out z-40
                        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                    `}>
                        {/* 移动端关闭按钮 */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden self-end mb-3 p-1.5 rounded-lg text-ink-faint hover:text-ink-secondary hover:bg-surface-muted transition-colors"
                            aria-label={t('common.aria.closeSidebar', 'Close sidebar')}
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <BlogSidebar onNavigate={() => isMobile && setIsSidebarOpen(false)} />
                    </aside>
                )}
            </div>
        </div>
    );
};

export default BlogLayout;
