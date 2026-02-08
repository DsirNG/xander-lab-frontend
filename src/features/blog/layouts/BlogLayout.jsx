import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';
import BlogSidebar from '../components/BlogSidebar';

/**
 * 博客布局组件
 * 采用 App Shell 模式：固定高度容器 + 内部独立滚动
 * 与项目 SidebarLayout 保持一致的布局策略
 * 移动端右侧边栏采用抽屉式展开
 */
const BlogLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // 检测是否为移动端
    useEffect(() => {
        const checkIsMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setIsSidebarOpen(false);
        };
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    return (
        <div className="bg-white dark:bg-slate-950">
            {/* 移动端侧边栏展开按钮 - 固定在右侧 */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className={`lg:hidden fixed top-20 right-0 z-50 p-2 bg-white/10 dark:bg-slate-950/50 backdrop-blur-[2px] rounded-l-lg shadow-md border border-r-0 border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${
                    isSidebarOpen
                        ? 'translate-x-full opacity-0 pointer-events-none'
                        : 'translate-x-0 opacity-100'
                }`}
                aria-label="打开侧边栏"
            >
                <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>

            {/* 移动端遮罩层 */}
            {isSidebarOpen && isMobile && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 z-30"
                    style={{ top: '64px' }}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="max-w-full sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px] 2xl:max-w-[1400px] mx-auto flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
                {/* 左侧主内容区 - 独立滚动 */}
                <main className="flex-grow overflow-y-auto custom-scrollbar px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 lg:py-10 w-full lg:w-auto">
                    <Outlet />
                </main>

                {/* 右侧边栏 - 桌面端固定显示，移动端抽屉式展开 */}
                <aside className={`
                    fixed lg:static
                    top-[64px] right-0 bottom-0
                    w-[300px] xl:w-[320px] 2xl:w-[340px]
                    flex-shrink-0 flex flex-col
                    h-[calc(100vh-64px)]
                    border-l border-slate-100 dark:border-slate-800
                    bg-slate-50/80 dark:bg-slate-900/80 lg:bg-slate-50/50 lg:dark:bg-slate-900/20
                    backdrop-blur-sm lg:backdrop-blur-none
                    overflow-y-auto custom-scrollbar
                    p-6 xl:p-8
                    transform transition-transform duration-300 ease-in-out z-40
                    ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                `}>
                    {/* 移动端关闭按钮 */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden self-end mb-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                        aria-label="关闭侧边栏"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <BlogSidebar onNavigate={() => isMobile && setIsSidebarOpen(false)} />
                </aside>
            </div>
        </div>
    );
};

export default BlogLayout;
