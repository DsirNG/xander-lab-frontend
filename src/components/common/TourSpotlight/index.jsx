import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Compass } from 'lucide-react';

/**
 * 核心聚焦向导漫游组件 (TourSpotlight)
 * 用于高光标注页面元素并提供步骤交互解释，适合全系统各类新手向导、更新公告等业务场景。
 */
const TourSpotlight = ({ targetConfig, onSkip }) => {
    const [rect, setRect] = useState(null);

    useEffect(() => {
        if (!targetConfig) return;
        const updateRect = () => {
            const el = document.getElementById(targetConfig.id);
            if (el) {
                const r = el.getBoundingClientRect();
                setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
            }
        };
        updateRect();
        const interval = setInterval(updateRect, 50);
        return () => clearInterval(interval);
    }, [targetConfig]);

    if (!targetConfig || !rect || rect.width === 0) return null;

    const pad = 10;
    const topHeight = Math.max(0, rect.top - pad);
    const bottomTop = rect.top + rect.height + pad;
    const isModalLevel = targetConfig.isModalLevel;

    return createPortal(
        <div className={`fixed inset-0 pointer-events-none transition-all duration-300 ${isModalLevel ? 'z-[99999]' : 'z-[9000]'}`}>
            {/* 4 方向高斯模糊物理遮罩 */}
            <div className="absolute top-0 left-0 right-0 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-300 pointer-events-auto" style={{ height: topHeight }} />
            <div className="absolute left-0 right-0 bottom-0 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-300 pointer-events-auto" style={{ top: bottomTop }} />
            <div className="absolute left-0 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-300 pointer-events-auto" style={{ top: topHeight, height: rect.height + pad * 2, width: Math.max(0, rect.left - pad) }} />
            <div className="absolute right-0 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-300 pointer-events-auto" style={{ top: topHeight, height: rect.height + pad * 2, left: rect.left + rect.width + pad }} />

            {/* 炫酷的光晕洞口引导线 */}
            <div className="absolute rounded-xl pointer-events-none border-2 border-primary-400 animate-ping opacity-40"
                style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
            />
            <div className="absolute rounded-xl pointer-events-none border-2 border-white/60 shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-300"
                style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
            />

            {/* AI 讲解提示框 */}
            <div
                className="absolute flex flex-col pointer-events-auto transition-all duration-500"
                style={{
                    top: rect.top > window.innerHeight / 2 ? Math.max(10, rect.top - pad - 120) : bottomTop + 10,
                    left: Math.max(20, Math.min(window.innerWidth - 320, rect.left + rect.width / 2 - 160)),
                    width: 320
                }}
            >
                <div className="bg-primary text-white p-5 rounded-2xl shadow-[0_30px_60px_-15px_rgba(79,70,229,0.5)] border border-primary-400/30">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Compass className="w-4 h-4 text-amber-300" />
                            <h4 className="font-black text-[13px] uppercase tracking-widest">{targetConfig.text}</h4>
                        </div>
                        <button onClick={onSkip} className="text-primary-200 hover:text-white transition-colors text-[9px] uppercase font-bold tracking-widest px-2 py-1 bg-primary-700/50 rounded-lg">Skip // 退出</button>
                    </div>
                    <p className="text-primary-50 text-[12px] font-medium leading-relaxed opacity-90">{targetConfig.desc}</p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default TourSpotlight;
