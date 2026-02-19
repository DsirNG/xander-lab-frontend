import React, { createContext, useState, useCallback, useMemo } from 'react';

export const ToastContext = createContext(null);

/**
 * Toast 状态提供者
 * 支持传递丰富的 options 配置（showProgress, showClose, pauseOnHover, className 等）
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    /**
     * 添加 Toast
     * @param {string|ReactNode} message 消息内容
     * @param {string} type 类型 (success, error, info, warning)
     * @param {object} options 配置对象
     */
    const addToast = useCallback((message, type = 'info', options = {}) => {
        const id = Math.random().toString(36).substring(2, 9);

        setToasts((prev) => [...prev, {
            id,
            message,
            type,
            duration: 3000,
            showProgress: true,
            showClose: true,
            pauseOnHover: true,
            ...options
        }]);
    }, []);

    const contextValue = useMemo(() => ({
        success: (msg, opts) => addToast(msg, 'success', opts),
        error: (msg, opts) => addToast(msg, 'error', opts),
        info: (msg, opts) => addToast(msg, 'info', opts),
        warning: (msg, opts) => addToast(msg, 'warning', opts),
        remove: removeToast,
        toasts
    }), [addToast, removeToast, toasts]);

    return (
        <div key="toast-provider-wrapper">
            <ToastContext.Provider value={contextValue}>
                {children}
            </ToastContext.Provider>
        </div>
    );
};
