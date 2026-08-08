// ─── 预设数据 (完全对齐项目内 Toast 组件逻辑) ──────────────────────────────────────────
export const INIT_FILES = [
    {
        name: 'ToastContext.jsx',
        content: `import React, { createContext, useState, useCallback, useMemo } from 'react';

export const ToastContext = createContext(null);
export const useToast = () => React.useContext(ToastContext);

/**
 * Toast 状态提供者
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

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
        <ToastContext.Provider value={contextValue}>
            {children}
        </ToastContext.Provider>
    );
};`
    },
    {
        name: 'ToastItem.jsx',
        content: `import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

const defaultIcons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
};

const defaultStyles = {
    success: 'bg-white/95 /95 border-emerald-100/50 d shadow-emerald-500/10',
    error: 'bg-white/95 /95 border-rose-100/50  shadow-rose-500/10',
    info: 'bg-white/95 /95 border-blue-100/50  shadow-blue-500/10',
    warning: 'bg-white/95 /95 border-amber-100/50  shadow-amber-500/10',
};

const ToastItem = ({ toast, onRemove }) => {
    const {
        message,
        type = 'info',
        duration = 3000,
        showProgress = true,
        showClose = true,
        pauseOnHover = true,
        className = '',
        icon = null
    } = toast;

    const [isExiting, setIsExiting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const remainingTimeRef = useRef(duration);
    const lastStartTimeRef = useRef(Date.now());
    const timerRef = useRef(null);

    useEffect(() => {
        if (duration === Infinity || isExiting) return;
        const startTimer = () => {
            lastStartTimeRef.current = Date.now();
            timerRef.current = setTimeout(() => setIsExiting(true), remainingTimeRef.current);
        };
        const stopTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                const elapsed = Date.now() - lastStartTimeRef.current;
                remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
                timerRef.current = null;
            }
        };

        if (isPaused && pauseOnHover) stopTimer();
        else startTimer();
        return () => stopTimer();
    }, [isPaused, duration, isExiting, pauseOnHover]);

    const handleAnimationEnd = (e) => {
        if (isExiting && e.animationName.includes('toast-out')) onRemove();
    };

    return (
        <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onAnimationEnd={handleAnimationEnd}
            className={\`
                group relative flex items-center gap-3 w-fit min-w-[280px] max-w-[480px] px-5 py-3.5 rounded-[2rem] border backdrop-blur-2xl
                shadow-[0_20px_40px_rgba(0,0,0,0.08)] pointer-events-auto transition-all duration-500
                active:scale-95 cursor-default
                \${defaultStyles[type]}
                \${isExiting ? 'animate-toast-out' : 'animate-toast-in'}
                \${className}
            \`}
        >
            <div className="flex-shrink-0">{icon || defaultIcons[type]}</div>
            <div className="flex-1 min-w-0">
                <div className="text-[13px] font-black text-slate-800  px-1 leading-normal break-words">
                    {message}
                </div>
            </div>
            {showClose && (
                <button onClick={() => setIsExiting(true)} className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 rounded-full hover:bg-slate-100 text-slate-400 transition-all">
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
};

export default ToastItem;`
    },
    {
        name: 'ToastContainer.jsx',
        content: `import React, { useContext } from 'react';
import { createPortal } from 'react-dom';
import { ToastContext } from './ToastContext';
import ToastItem from './ToastItem';

const ToastContainer = () => {
    const { toasts, remove } = useContext(ToastContext);
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none w-full max-w-md px-6">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onRemove={() => remove(toast.id)}
                />
            ))}
        </div>,
        document.body
    );
};

export default ToastContainer;`
    }
];

export const INIT_CSS = `@keyframes toast-in {
  from { opacity: 0; transform: translateY(30px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes toast-out {
  from { opacity: 1; }
  to { opacity: 0; transform: scale(0.8) translateY(-20px); }
}
.animate-toast-in { animation: toast-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-toast-out { animation: toast-out 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`;

export const INIT_WRAPPER = '<ToastProvider>\n  <ToastContainer />\n  {children}\n</ToastProvider>';

export const INIT_SCENARIOS = [
    {
        id: '1',
        titleZh: '交互测试',
        titleEn: 'Interaction Study',
        code: 'function Demo() {\n  const toast = useToast();\n  \n  return (\n    <div className="flex flex-col items-center gap-8 p-12">\n       <div className="flex flex-col items-center gap-2 mb-4 text-center">\n         <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] italic">Toast Architecture</h3>\n         <div className="w-16 h-1 bg-primary rounded-full" />\n       </div>\n\n       <div className="flex flex-wrap justify-center gap-6">\n         <button \n           onClick={() => toast.success("验证成功 // Verification Success")}\n           className="px-12 py-5 bg-primary text-white font-black italic rounded-[2.5rem] shadow-xl shadow-primary/20 active:scale-95 transition-all text-[11px] uppercase tracking-widest hover:rotate-1 hover:scale-105"\n         >\n           Run Success\n         </button>\n\n         <button \n           onClick={() => toast.error("系统拦截 // Kernel Violation")}\n           className="px-12 py-5 bg-slate-900 text-white font-black italic rounded-[2.5rem] shadow-xl shadow-black/20 active:scale-95 transition-all text-[11px] uppercase tracking-widest hover:-rotate-1 hover:scale-105"\n         >\n           Run Error\n         </button>\n       </div>\n\n       <div className="mt-8 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl">\n         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">\n           点击按钮触发全局物理通知容器\n         </p>\n       </div>\n    </div>\n  );\n}'
    }
];

export const INIT_META = {
    titleZh: '全局物理通知系统 (Toast)',
    titleEn: 'Global Kinetic Toast',
    version: '1.2.0',
    descriptionZh: '高性能、带物理挤压感和自动进度管理的全局通知组件。',
    descriptionEn: 'High-performance notification system with kinetic interactions and progress management.'
};
