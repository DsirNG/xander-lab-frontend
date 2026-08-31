/**
 * 应用根组件
 * @module App
 * @author DinQorAI Team
 * @created 2026-02-05
 */

import { RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useMemo, useEffect } from "react";
import { createRouter } from "./router";
import { ToastProvider, ToastContainer } from "./components/common/Toast";
import { useToast } from "./hooks/useToast";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { AuthSessionProvider } from "./features/auth/context/AuthSessionProvider";
import { NotificationProvider } from "./features/blog/context/NotificationContext";
import AppUpdateModal from "./features/appUpdate/AppUpdateModal";
import useAppUpdate from "./features/appUpdate/useAppUpdate";
import DomainRedirectModal from "./components/common/DomainRedirectModal";

/**
 * 全局 Toast 桥接
 * 将 React Toast 上下文暴露为 window.__toast，
 * 使 http.js 等纯 JS 模块也能直接调用 toast 提示。
 */
function ToastBridge() {
    const toast = useToast();

    useEffect(() => {
        window.__toast = (type, msg) => toast[type]?.(msg);
        return () => {
            delete window.__toast;
        };
    }, [toast]);

    return null;
}

/**
 * App - 应用根组件
 * 负责初始化路由和应用级配置
 *
 * @returns {JSX.Element} 应用根组件
 */
function App() {
    // 路由实例只创建一次，翻译由页面组件内部解析
    const router = useMemo(() => createRouter(), []);
    const updateRequired = useAppUpdate();

    return (
        <HelmetProvider>
            <ErrorBoundary>
                <ToastProvider>
                    <ToastBridge />
                    {/* 认证会话状态由 Provider 持有：挂载校验 + 周期复检 + 事件同步 */}
                    <AuthSessionProvider>
                        <NotificationProvider>
                            <RouterProvider router={router} />
                        </NotificationProvider>
                    </AuthSessionProvider>
                    <ToastContainer />
                    <AppUpdateModal isOpen={updateRequired} />
                    <DomainRedirectModal />
                </ToastProvider>
            </ErrorBoundary>
        </HelmetProvider>
    );
}

export default App;
