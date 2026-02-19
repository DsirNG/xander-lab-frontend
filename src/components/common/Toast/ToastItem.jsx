import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

const defaultIcons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
};

const defaultStyles = {
    success: 'bg-white/95 dark:bg-slate-900/95 border-emerald-100/50 dark:border-emerald-500/20 shadow-emerald-500/10',
    error: 'bg-white/95 dark:bg-slate-900/95 border-rose-100/50 dark:border-rose-500/20 shadow-rose-500/10',
    info: 'bg-white/95 dark:bg-slate-900/95 border-blue-100/50 dark:border-blue-500/20 shadow-blue-500/10',
    warning: 'bg-white/95 dark:bg-slate-900/95 border-amber-100/50 dark:border-amber-500/20 shadow-amber-500/10',
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

    // 核心物理时间管理
    const remainingTimeRef = useRef(duration);
    const lastStartTimeRef = useRef(Date.now());
    const timerRef = useRef(null);

    // 倒计时逻辑
    useEffect(() => {
        if (duration === Infinity || isExiting) return;

        const startTimer = () => {
            lastStartTimeRef.current = Date.now();
            timerRef.current = setTimeout(() => {
                setIsExiting(true);
            }, remainingTimeRef.current);
        };

        const stopTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                const elapsed = Date.now() - lastStartTimeRef.current;
                remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
                timerRef.current = null;
            }
        };

        if (isPaused && pauseOnHover) {
            stopTimer();
        } else {
            startTimer();
        }

        return () => stopTimer();
    }, [isPaused, duration, isExiting, pauseOnHover]);

    // 处理动画结束后的真正移除
    const handleAnimationEnd = (e) => {
        if (isExiting && e.animationName.includes('toast-out')) {
            onRemove();
        }
    };

    return (
        <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onAnimationEnd={handleAnimationEnd}
            className={`
                group relative flex items-center gap-3 w-fit min-w-[280px] max-w-[480px] px-5 py-3.5 rounded-[2rem] border backdrop-blur-2xl
                shadow-[0_20px_40px_rgba(0,0,0,0.08)] pointer-events-auto transition-all duration-500
                active:scale-95 cursor-default scale-fix
                ${defaultStyles[type]}
                ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}
                ${className}
            `}
        >
            <div className="flex-shrink-0">
                {icon || defaultIcons[type]}
            </div>

            <div className="flex-1 min-w-0">
                <div className="text-[13px] font-black text-slate-800 dark:text-slate-100 px-1 leading-normal break-words">
                    {message}
                </div>
            </div>

            {showClose && (
                <button
                    onClick={() => setIsExiting(true)}
                    className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-all duration-300"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}

            {/* C-End Style Progress Bar */}
            {duration !== Infinity && !isExiting && showProgress && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[3px] w-12 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden opacity-40">
                    <div
                        className={`h-full animate-progress rounded-full origin-left ${type === 'success' ? 'bg-emerald-500' :
                                type === 'error' ? 'bg-rose-500' :
                                    type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                        style={{
                            animationDuration: `${duration}ms`,
                            animationPlayState: (isPaused && pauseOnHover) ? 'paused' : 'running'
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ToastItem;
