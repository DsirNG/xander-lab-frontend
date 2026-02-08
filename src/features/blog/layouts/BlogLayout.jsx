import React from 'react';
import { Outlet } from 'react-router-dom';
import BlogSidebar from '../components/BlogSidebar';

/**
 * 博客布局组件
 * 采用 App Shell 模式：固定高度容器 + 内部独立滚动
 * 与项目 SidebarLayout 保持一致的布局策略
 */
const BlogLayout = () => {
    return (
        <div className="bg-white dark:bg-slate-950">
            <div className="max-w-full sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px] 2xl:max-w-[1400px] mx-auto flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
                {/* 左侧主内容区 - 独立滚动 */}
                <main className="flex-grow overflow-y-auto custom-scrollbar px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 lg:py-10 w-full lg:w-auto">
                    <Outlet />
                </main>

                {/* 右侧边栏 - 独立滚动，桌面端固定 */}
                <aside className="
                    hidden lg:flex flex-col flex-shrink-0
                    w-[300px] xl:w-[320px] 2xl:w-[340px]
                    h-[calc(100vh-64px)]
                    border-l border-slate-100 dark:border-slate-800
                    bg-slate-50/50 dark:bg-slate-900/20
                    overflow-y-auto custom-scrollbar
                    p-6 xl:p-8
                ">
                    <BlogSidebar />
                </aside>
            </div>
        </div>
    );
};

export default BlogLayout;
