
import React from 'react';
import {
    Move as MoveIcon
} from 'lucide-react';

// 导入代码示例
import {
    SINGLE_FILE_CODE,
    MULTI_FILE_CODE,
    KANBAN_CODE,
    LAYOUT_CODE,
    SHOPPING_CODE,
    FLOWCHART_CODE
} from './pages/demos/demo-code';

// 导入Demo组件（延迟加载，避免首屏加载所有大型演示组件）
const SingleFileTransferDemo = React.lazy(() => import('./pages/demos/SingleFileTransferDemo'));
const MultiFileTransferDemo = React.lazy(() => import('./pages/demos/MultiFileTransferDemo'));
const KanbanDemo = React.lazy(() => import('./pages/demos/KanbanDemo'));
const LayoutBuilderDemo = React.lazy(() => import('./pages/demos/LayoutBuilderDemo'));
const ShoppingDemo = React.lazy(() => import('./pages/demos/ShoppingDemo'));
const FlowchartDemo = React.lazy(() => import('./pages/demos/FlowchartDemo'));

// 延迟导入详情页组件（避免循环依赖）
const getDetailComponents = () => ({
    DragDropDeepDive: React.lazy(() => import('./pages/DragDropSystem')),
});

/**
 * 获取功能模块配置
 * @param {Function} t - i18n 翻译函数
 * @returns {Array} 功能模块配置数组
 */
export const getModuleConfig = (t = (k) => k) => {
    const detailComponents = getDetailComponents();

    return [
        {
            id: 'drag-drop',
            title: t('modules.dragdrop.title'),
            desc: t('modules.dragdrop.desc'),
            tag: t('modules.dragdrop.tag'),
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
        }
    ];
};
