import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * 通用弹窗组件
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    width = 'max-w-md',
    closeOnOutsideClick = true,
    hideCloseButton = false,
    className = ''
}) => {
    // 拦截背景滚动并防止滚动条消失引发的布局抖动
    useEffect(() => {
        if (isOpen) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [isOpen]);

    // 绑定 ESC 键关闭
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && closeOnOutsideClick) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeOnOutsideClick, onClose]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                // 【修复 2】外层容器必须是 motion 组件，否则 exit 动画会失效瞬间卸载
                <motion.div
                    key="modal-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
                >
                    {/* 背景遮罩 (因为父级有了透明度动画，这里改回普通 div 即可) */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 dark:bg-black/70"
                        onClick={closeOnOutsideClick ? onClose : undefined}
                    />

                    {/* 弹窗内容 */}
                    <motion.div
                        key="modal-content"
                        initial={{ transform: "translate3d(0, 30px, 0)" }}
                        animate={{ transform: "translate3d(0, 0px, 0)" }}
                        exit={{ transform: "translate3d(0, 30px, 0)" }}
                        transition={{
                            type: "tween",
                            ease: "easeInOut",
                            duration: 0.3
                        }}
                        // 【修复 1】增加 antialiased 和 transform-gpu 类名
                        className={`relative w-full ${width} bg-white dark:bg-slate-950 rounded-3xl shadow-2xl shadow-black/20 dark:shadow-black/50 border border-slate-200/60 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden antialiased transform-gpu ${className}`}
                        // 【修复 1 补充】强制保留硬件加速，防止动画结束时字体重新渲染
                        style={{
                            WebkitFontSmoothing: 'antialiased',
                            backfaceVisibility: 'hidden',
                            transform: 'translateZ(0)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* 头部标题与关闭按钮 */}
                        {(title || !hideCloseButton) && (
                            <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                                {typeof title === 'string' ? (
                                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                        {title}
                                    </h3>
                                ) : (
                                    <div className="flex-1">{title}</div>
                                )}

                                {!hideCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 -mr-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-900 rounded-full transition-all active:scale-90"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* 主体自适应滚动区域 */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 text-slate-600 dark:text-slate-300">
                            {children}
                        </div>

                        {/* 底部按钮栏（若提供） */}
                        {footer && (
                            <div className="flex-shrink-0 px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-end gap-3 rounded-b-3xl">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default Modal;
