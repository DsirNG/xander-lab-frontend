import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "@shared/ui/primitives/Button";

/**
 * 通用弹窗组件
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    width = "max-w-md",
    height = 560,
    bodyScrollable = true,
    closeOnOutsideClick = true,
    hideCloseButton = false,
    className = "",
}) => {
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);
    const { t } = useTranslation();

    // 拦截背景滚动并防止滚动条消失引发的布局抖动
    useEffect(() => {
        if (isOpen) {
            const scrollbarWidth =
                window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = "hidden";
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }
        } else {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        }
        return () => {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        };
    }, [isOpen]);

    // 焦点陷阱：打开时聚焦弹窗内第一个可聚焦元素，关闭时恢复之前的焦点
    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement;
            // 延迟聚焦，等待动画开始后再聚焦
            requestAnimationFrame(() => {
                if (modalRef.current) {
                    const focusable = modalRef.current.querySelector(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                    );
                    if (focusable) focusable.focus();
                    else modalRef.current.focus();
                }
            });
        } else if (previousFocusRef.current) {
            previousFocusRef.current.focus();
            previousFocusRef.current = null;
        }
    }, [isOpen]);

    // 绑定 ESC 键关闭 + 焦点陷阱 Tab 键循环
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === "Escape" && closeOnOutsideClick) {
                onClose();
                return;
            }
            // 焦点陷阱：Tab 键在弹窗内循环
            if (e.key === "Tab" && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                );
                if (focusableElements.length === 0) return;
                const first = focusableElements[0];
                const last = focusableElements[focusableElements.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, closeOnOutsideClick, onClose]);

    if (typeof document === "undefined") return null;

    const titleId = title ? "modal-title" : undefined;

    return createPortal(
        isOpen ? (
            <div
                className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
                onClick={closeOnOutsideClick ? onClose : undefined}
            >
                {/* 弹层保持静态渲染，避免透明度动画造成残影。 */}
                <div aria-hidden="true" className="absolute inset-0 bg-ink/60" />

                {/* 弹窗内容 */}
                <div
                    ref={modalRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    tabIndex={-1}
                    className={`relative w-full ${width} bg-canvas rounded-3xl shadow-2xl shadow-ink/30 flex flex-col overflow-hidden antialiased outline-none ${className}`}
                    style={{
                        height: `min(${height}px, calc(100dvh - 3rem))`,
                        WebkitFontSmoothing: "antialiased",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 头部标题与关闭按钮 */}
                    {(title || !hideCloseButton) && (
                        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5">
                            {typeof title === "string" ? (
                                <div
                                    id={titleId}
                                    className="text-title font-black text-ink tracking-tight"
                                >
                                    {title}
                                </div>
                            ) : (
                                <div className="flex-1">{title}</div>
                            )}

                            {!hideCloseButton && (
                                <Button
                                    onClick={onClose}
                                    aria-label={t(
                                        "common.aria.close",
                                        "Close",
                                    )}
                                    variant="ghost"
                                    size="xs"
                                    icon={X}
                                    className="-mr-2 rounded-full hover:text-danger hover:bg-danger-soft"
                                />
                            )}
                        </div>
                    )}

                    {/* 主体自适应滚动区域 */}
                    <div
                        className={`min-h-0 flex-1 ${bodyScrollable ? "overflow-y-auto" : "overflow-hidden"} overflow-x-hidden custom-scrollbar px-6 pb-6 text-ink-muted`}
                    >
                        {children}
                    </div>

                    {/* 底部按钮栏（若提供） */}
                    {footer && (
                        <div className="flex-shrink-0 px-6 py-5 bg-surface/50 flex items-center justify-end gap-3 rounded-b-3xl flex-wrap">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        ) : null,
        document.body,
    );
};

export default Modal;
