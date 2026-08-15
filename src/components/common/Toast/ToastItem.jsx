import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@components/common/Button';

const defaultIcons = {
    success: <CheckCircle2 className="w-5 h-5 text-success" />,
    error: <XCircle className="w-5 h-5 text-danger" />,
    info: <Info className="w-5 h-5 text-info" />,
    warning: <AlertCircle className="w-5 h-5 text-warning" />,
};

const defaultStyles = {
    success: 'bg-canvas/95 border-success/20 shadow-success/10',
    error: 'bg-canvas/95 border-danger/20 shadow-danger/10',
    info: 'bg-canvas/95 border-info/20 shadow-info/10',
    warning: 'bg-canvas/95 border-warning/20 shadow-warning/10',
};

const progressStyles = {
    success: 'bg-success',
    error: 'bg-danger',
    warning: 'bg-warning',
    info: 'bg-info',
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

    const { t } = useTranslation();
    const [isExiting, setIsExiting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // 核心物理时间管理
    const remainingTimeRef = useRef(duration);
    const lastStartTimeRef = useRef(0);
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
                <div className="text-body font-black text-ink px-1 leading-normal break-words">
                    {message}
                </div>
            </div>

            {showClose && (
                <Button
                    onClick={() => setIsExiting(true)}
                    variant="ghost"
                    size="xs"
                    icon={X}
                    aria-label={t('common.aria.closeNotification', 'Close notification')}
                    className="opacity-0 group-hover:opacity-100 rounded-full"
                />
            )}

            {/* C-End Style Progress Bar */}
            {duration !== Infinity && !isExiting && showProgress && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[3px] w-12 bg-surface-muted rounded-full overflow-hidden opacity-40">
                    <div
                        className={`h-full animate-progress rounded-full origin-left ${progressStyles[type] || progressStyles.info}`}
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
