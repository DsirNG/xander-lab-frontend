import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "@shared/ui/primitives/Button";

// Only the topmost dialog handles keyboard input; body locking survives nested dialogs.
const openDialogs = [];
let originalBodyStyles;

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
    showBackdrop = true,
    className = "",
}) => {
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);
    const { t } = useTranslation();

    const instanceId = useId();
    useEffect(() => {
        if (!isOpen) return undefined;
        if (!openDialogs.length) {
            originalBodyStyles = {
                overflow: document.body.style.overflow,
                paddingRight: document.body.style.paddingRight,
            };
            const scrollbarWidth = Math.max(
                0,
                window.innerWidth - document.documentElement.clientWidth,
            );
            const padding =
                parseFloat(
                    window.getComputedStyle(document.body).paddingRight,
                ) || 0;
            document.body.style.overflow = "hidden";
            if (scrollbarWidth)
                document.body.style.paddingRight = `${padding + scrollbarWidth}px`;
        }
        openDialogs.push(instanceId);
        return () => {
            const index = openDialogs.indexOf(instanceId);
            if (index !== -1) openDialogs.splice(index, 1);
            if (!openDialogs.length && originalBodyStyles) {
                Object.assign(document.body.style, originalBodyStyles);
                originalBodyStyles = undefined;
            }
        };
    }, [isOpen, instanceId]);

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
            if (!isOpen || openDialogs.at(-1) !== instanceId) return;
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
    }, [isOpen, closeOnOutsideClick, onClose, instanceId]);

    if (typeof document === "undefined") return null;

    const titleId = title ? `modal-title-${instanceId}` : undefined;

    return createPortal(
        isOpen ? (
            <div
                className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
                onClick={closeOnOutsideClick ? onClose : undefined}
            >
                {/* 弹层保持静态渲染，避免透明度动画造成残影。 */}
                {showBackdrop ? (
                    <div
                        aria-hidden="true"
                        data-modal-backdrop
                        className="absolute inset-0 bg-ink/60"
                    />
                ) : null}

                {/* 弹窗内容 */}
                <div
                    ref={modalRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    tabIndex={-1}
                    className={`relative w-full ${width} rounded-3xl border border-border bg-canvas shadow-dialog flex flex-col overflow-hidden antialiased outline-none ${className}`}
                    style={{
                        height,
                        maxHeight: "calc(100dvh - 3rem)",
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
                                    className="min-w-0 flex-1 break-words text-title font-semibold text-ink tracking-tight"
                                >
                                    {title}
                                </div>
                            ) : (
                                <div id={titleId} className="min-w-0 flex-1">
                                    {title}
                                </div>
                            )}

                            {!hideCloseButton && (
                                <Button
                                    onClick={onClose}
                                    aria-label={t("common.aria.close", "Close")}
                                    variant="ghost"
                                    size="md"
                                    icon={X}
                                    className="-mr-2"
                                />
                            )}
                        </div>
                    )}

                    {/* 主体自适应滚动区域 */}
                    <div
                        className={`min-h-0 flex-1 ${bodyScrollable ? "overflow-y-auto overscroll-contain" : "overflow-hidden"} overflow-x-hidden custom-scrollbar px-6 pb-6 text-ink-muted`}
                    >
                        {children}
                    </div>

                    {/* 底部按钮栏（若提供） */}
                    {footer && (
                        <div className="flex-shrink-0 border-t border-border px-6 py-4 bg-surface flex items-center justify-end gap-2 flex-wrap">
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
