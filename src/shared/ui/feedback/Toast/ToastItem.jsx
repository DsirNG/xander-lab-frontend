import React, { useEffect, useState, useRef } from "react";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "@shared/ui/primitives/Button";

const defaultIcons = {
    success: <CheckCircle2 className="w-5 h-5 text-success" />,
    error: <XCircle className="w-5 h-5 text-danger" />,
    info: <Info className="w-5 h-5 text-info" />,
    warning: <AlertCircle className="w-5 h-5 text-warning" />,
};

const defaultStyles = {
    success: "bg-canvas border-success/20",
    error: "bg-canvas border-danger/20",
    info: "bg-canvas border-info/20",
    warning: "bg-canvas border-warning/20",
};

const progressStyles = {
    success: "bg-success",
    error: "bg-danger",
    warning: "bg-warning",
    info: "bg-info",
};

const ToastItem = ({ toast, onRemove }) => {
    const {
        message,
        type = "info",
        duration = 3000,
        showProgress = true,
        showClose = true,
        pauseOnHover = true,
        className = "",
        icon = null,
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
                remainingTimeRef.current = Math.max(
                    0,
                    remainingTimeRef.current - elapsed,
                );
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
        if (isExiting && e.animationName.includes("toast-out")) {
            onRemove();
        }
    };

    return (
        <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onAnimationEnd={handleAnimationEnd}
            className={`
                group relative flex items-center gap-3 w-fit min-w-0 max-w-full px-4 py-3 rounded-card border
                shadow-float pointer-events-auto transition-colors duration-150
                cursor-default scale-fix
                ${defaultStyles[type]}
                ${isExiting ? "animate-toast-out" : "animate-toast-in"}
                ${className}
            `}
        >
            <div className="flex-shrink-0">{icon || defaultIcons[type]}</div>

            <div className="flex-1 min-w-0">
                <div className="text-body font-medium text-ink leading-normal break-words">
                    {message}
                </div>
            </div>

            {showClose && (
                <Button
                    onClick={() => setIsExiting(true)}
                    variant="ghost"
                    size="xs"
                    icon={X}
                    aria-label={t(
                        "common.aria.closeNotification",
                        "Close notification",
                    )}
                    className="shrink-0 text-ink-muted hover:text-ink rounded-menu-item"
                />
            )}

            {/* C-End Style Progress Bar */}
            {duration !== Infinity && !isExiting && showProgress && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-12 bg-surface-muted rounded-full overflow-hidden opacity-40">
                    <div
                        className={`h-full animate-progress rounded-full origin-left ${progressStyles[type] || progressStyles.info}`}
                        style={{
                            animationDuration: `${duration}ms`,
                            animationPlayState:
                                isPaused && pauseOnHover ? "paused" : "running",
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ToastItem;
