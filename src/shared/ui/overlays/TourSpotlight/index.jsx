import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Compass } from "lucide-react";
import Button from "@shared/ui/primitives/Button";

/**
 * 核心聚焦向导漫游组件 (TourSpotlight)
 * 用于高光标注页面元素并提供步骤交互解释，适合全系统各类新手向导、更新公告等业务场景。
 */
const TourSpotlight = ({ targetConfig, onSkip }) => {
    const [rect, setRect] = useState(null);

    useEffect(() => {
        if (!targetConfig) return;

        const el = document.getElementById(targetConfig.id);
        if (!el) return;

        const updateRect = () => {
            const r = el.getBoundingClientRect();
            setRect({
                top: r.top,
                left: r.left,
                width: r.width,
                height: r.height,
            });
        };

        updateRect();

        // ResizeObserver on target element for size/position changes
        const resizeObserver = new ResizeObserver(updateRect);
        resizeObserver.observe(el);

        // Find nearest scrollable ancestor for scroll tracking
        const findScrollableAncestor = (element) => {
            let parent = element.parentElement;
            while (parent) {
                const style = getComputedStyle(parent);
                const overflow =
                    style.overflow + style.overflowY + style.overflowX;
                if (/(auto|scroll|overlay)/.test(overflow)) {
                    return parent;
                }
                parent = parent.parentElement;
            }
            return document.documentElement;
        };

        const scrollableAncestor = findScrollableAncestor(el);
        scrollableAncestor.addEventListener("scroll", updateRect, {
            passive: true,
        });
        window.addEventListener("resize", updateRect, { passive: true });

        return () => {
            resizeObserver.disconnect();
            scrollableAncestor.removeEventListener("scroll", updateRect);
            window.removeEventListener("resize", updateRect);
        };
    }, [targetConfig]);

    if (!targetConfig || !rect || rect.width === 0) return null;

    const pad = 8;
    const topHeight = Math.max(0, rect.top - pad);
    const bottomTop = rect.top + rect.height + pad;
    const isModalLevel = targetConfig.isModalLevel;
    const hintWidth = Math.min(320, Math.max(200, window.innerWidth - 24));
    const hintTop =
        rect.top > window.innerHeight / 2
            ? Math.max(10, rect.top - pad - 140)
            : Math.min(bottomTop + 10, window.innerHeight - 150);
    const hintLeft = Math.max(
        12,
        Math.min(
            window.innerWidth - hintWidth - 12,
            rect.left + rect.width / 2 - hintWidth / 2,
        ),
    );

    return createPortal(
        <div
            className={`fixed inset-0 pointer-events-none transition-all duration-300 motion-reduce:transition-none ${isModalLevel ? "z-[1200]" : "z-[900]"}`}
        >
            {/* 4 方向高斯模糊物理遮罩 */}
            <div
                className="absolute top-0 left-0 right-0 bg-ink/40 backdrop-blur-[2px] transition-all duration-300 motion-reduce:transition-none pointer-events-auto"
                style={{ height: topHeight }}
            />
            <div
                className="absolute left-0 right-0 bottom-0 bg-ink/40 backdrop-blur-[2px] transition-all duration-300 motion-reduce:transition-none pointer-events-auto"
                style={{ top: bottomTop }}
            />
            <div
                className="absolute left-0 bg-ink/40 backdrop-blur-[2px] transition-all duration-300 motion-reduce:transition-none pointer-events-auto"
                style={{
                    top: topHeight,
                    height: rect.height + pad * 2,
                    width: Math.max(0, rect.left - pad),
                }}
            />
            <div
                className="absolute right-0 bg-ink/40 backdrop-blur-[2px] transition-all duration-300 motion-reduce:transition-none pointer-events-auto"
                style={{
                    top: topHeight,
                    height: rect.height + pad * 2,
                    left: rect.left + rect.width + pad,
                }}
            />

            {/* AI 讲解提示框 */}
            <div
                className="absolute flex flex-col pointer-events-auto transition-all duration-300 motion-reduce:transition-none"
                style={{
                    top: hintTop,
                    left: hintLeft,
                    width: hintWidth,
                }}
            >
                <div className="bg-canvas text-ink p-4 rounded-card shadow-float border border-border max-h-[calc(100dvh-2rem)] overflow-y-auto">
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <Compass className="w-4 h-4 text-ink-muted flex-shrink-0" />
                            <div className="font-semibold text-body uppercase tracking-widest break-words">
                                {targetConfig.text}
                            </div>
                        </div>
                        <Button
                            onClick={onSkip}
                            variant="link"
                            size="md"
                            className="shrink-0 bg-surface rounded-menu-item px-2 py-1 text-caption font-medium text-ink-muted hover:bg-surface-muted hover:text-ink hover:no-underline"
                        >
                            Skip // 退出
                        </Button>
                    </div>
                    <div className="text-ink-muted text-caption leading-relaxed break-words">
                        {targetConfig.desc}
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
};

export default TourSpotlight;
