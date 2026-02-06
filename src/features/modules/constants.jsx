
import React from 'react';
import {
    MessageSquare,
    List,
    HelpCircle,
    Move as MoveIcon,
    MousePointer2,
    MousePointerClick
} from 'lucide-react';
import { motion } from 'framer-motion';

// 导入Demo组件
import SingleFileTransferDemo from './pages/demos/SingleFileTransferDemo';
import MultiFileTransferDemo from './pages/demos/MultiFileTransferDemo';
import KanbanDemo from './pages/demos/KanbanDemo';
import LayoutBuilderDemo from './pages/demos/LayoutBuilderDemo';
import ShoppingDemo from './pages/demos/ShoppingDemo';
import FlowchartDemo from './pages/demos/FlowchartDemo';

// 导入代码示例
import {
    SINGLE_FILE_CODE,
    MULTI_FILE_CODE,
    KANBAN_CODE,
    LAYOUT_CODE,
    SHOPPING_CODE,
    FLOWCHART_CODE
} from './pages/demos/demo-code';

// 延迟导入详情页组件（避免循环依赖）
const getDetailComponents = () => ({
    DragDropDeepDive: React.lazy(() => import('./pages/DragDropSystem')),
});

/**
 * 获取功能模块配置
 * @param {Function} t - i18n 翻译函数
 * @returns {Array} 功能模块配置数组
 */
export const getModuleConfig = (t) => {
    const detailComponents = getDetailComponents();

    return [
        {
            id: 'popover',
            title: t('modules.popover.title'),
            desc: t('modules.popover.desc'),
            icon: <MessageSquare className="w-5 h-5" />,
            detailPages: [], // 暂无详情页
            scenarios: [
                {
                    title: 'Standard Click Trigger',
                    desc: 'A general floating container that appears when clicking an element, maintaining its position relative to the trigger.',
                    demo: (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-6 rounded-2xl flex flex-col items-center space-y-4 cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                <MousePointerClick className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold dark:text-white">Click Me</span>
                        </motion.div>
                    )
                }
            ]
        },
        {
            id: 'dropdown',
            title: t('modules.dropdown.title'),
            desc: t('modules.dropdown.desc'),
            icon: <List className="w-5 h-5" />,
            detailPages: [], // 暂无详情页
        },
        {
            id: 'tooltip',
            title: t('modules.tooltip.title'),
            desc: t('modules.tooltip.desc'),
            icon: <HelpCircle className="w-5 h-5" />,
            detailPages: [], // 暂无详情页
        },
        {
            id: 'drag-drop',
            title: t('modules.dragdrop.title'),
            desc: t('modules.dragdrop.desc'),
            icon: <MoveIcon className="w-5 h-5" />,
            // 详情页面配置（动态路由用）
            detailPages: [
                {
                    type: 'deep-dive',  // 深入探索
                    component: detailComponents.DragDropDeepDive,
                }
            ],
            // 场景演示配置
            scenarios: [
                {
                    title: 'Scenario A-1: Single File Transfer',
                    desc: 'Clean, focused dragging for individual entities with premium visual feedback.',
                    demo: <SingleFileTransferDemo />,
                    code: SINGLE_FILE_CODE
                },
                {
                    title: 'Scenario A-2: Multi-File Batch Operations',
                    desc: 'Advanced stacking mechanism for multiple items with count indicators and batch processing.',
                    demo: <MultiFileTransferDemo />,
                    code: MULTI_FILE_CODE
                },
                {
                    title: 'Scenario B: Kanban & Sorting',
                    desc: 'Full-featured Kanban board with column-to-column transfers and refined list reordering animations.',
                    demo: <KanbanDemo />,
                    code: KANBAN_CODE
                },
                {
                    title: 'Scenario C: UI Layout Builder',
                    desc: 'Interactive grid system with sidebar-to-canvas instantiation and dynamic resizing simulation.',
                    demo: <LayoutBuilderDemo />,
                    code: LAYOUT_CODE
                },
                {
                    title: 'Scenario D: Shopping & Tagging',
                    desc: 'Context-aware interactions: Drag products to cart or drag tags onto products to apply metadata.',
                    demo: <ShoppingDemo />,
                    code: SHOPPING_CODE
                },
                {
                    title: 'Scenario E: Node-based Connectors',
                    desc: 'Advanced Bezier curve connections with node dragging, demonstrating custom mouse event handling beyond standard HTML5 DnD.',
                    demo: <FlowchartDemo />,
                    code: FLOWCHART_CODE
                }
            ]
        },
        {
            id: 'context',
            title: t('modules.context.title'),
            desc: t('modules.context.desc'),
            icon: <MousePointer2 className="w-5 h-5" />,
            detailPages: [], // 暂无详情页
        }
    ];
};
