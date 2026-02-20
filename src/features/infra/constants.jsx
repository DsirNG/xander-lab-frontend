
import React from 'react';
import {
    Box as BoxIcon,
    Layout as LayoutIcon,
    Move as MoveIcon
} from 'lucide-react';

// 延迟导入详情页组件（避免循环依赖）
const getDetailComponents = () => ({
    AnchoredTheory: React.lazy(() => import('./pages/AnchoredOverlay')),
});

/**
 * 获取基础设施系统配置
 * @param {Function} t - i18n 翻译函数
 * @returns {Array} 基础设施系统配置数组
 */
export const getInfraConfig = (t) => {
    const detailComponents = getDetailComponents();

    return [
        /*
        {
            id: 'anchored',
            title: t('infra.anchored.title'),
            tag: t('infra.anchored.tag'),
            icon: <BoxIcon className="w-5 h-5" />,
            // 详情页面配置（动态路由用）
            detailPages: [
                {
                    type: 'theory',  // 理论原理
                    component: detailComponents.AnchoredTheory,
                }
            ],
            scenarios: [
                {
                    title: 'Scenario A: Smart Positioning',
                    desc: 'Automatically calculates the best axis coordinates relative to the anchor point with dual-RAF synchronization.',
                    demo: (
                        <div className="flex flex-col items-center space-y-8">
                            <div className="w-24 h-12 bg-blue-600/20 border-2 border-dashed border-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600 font-mono">
                                ANCHOR
                            </div>
                            <div className="bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                    <span className="text-xs font-bold">POS</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold dark:text-white">Floating Content</p>
                                    <p className="text-[10px] text-slate-400">Aligned to Main Axis</p>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]
        },
        {
            id: 'focus',
            title: 'Focus Trap',
            tag: 'Accessibility',
            icon: <LayoutIcon className="w-5 h-5" />,
            detailPages: [], // 暂无详情页
        },
        {
            id: 'scroll',
            title: 'Scroll Management',
            tag: 'Interaction Physics',
            icon: <MoveIcon className="w-5 h-5" />,
            detailPages: [], // 暂无详情页
        }
        */
    ];
};
