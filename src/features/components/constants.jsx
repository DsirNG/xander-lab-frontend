import React from 'react';
import {
    ToggleLeft as ToggleIcon,
    ChevronsUpDown,
    MousePointerClick
} from 'lucide-react';

// Demos
import { BasicDemo, AlignmentDemo, StatusDemo } from './pages/codeComponent/demo/demo.jsx';

// 延迟导入详情页组件（避免循环依赖）
const getDetailComponents = () => ({
    CustomSelectGuide: React.lazy(() => import('./pages/CustomSelectGuide')),
});

/**
 * 获取基础组件配置
 * @param {Function} t - i18n 翻译函数
 * @returns {Array} 组件配置数组
 */
export const getComponentConfig = (t) => {
    const detailComponents = getDetailComponents();

    return [
        {
            id: 'custom-select',
            title: t('components.customSelect.title', 'Custom Select'),
            desc: t('components.customSelect.desc'),
            tag: t('components.customSelect.tag'),
            icon: <ChevronsUpDown className="w-5 h-5" />,
            // 详情页面配置（动态路由用）
            detailPages: [
                {
                    type: 'guide',  // 实现指南
                    component: detailComponents.CustomSelectGuide,
                }
            ],
            scenarios: [
                {
                    title: 'Basic Usage',
                    desc: 'Standard single selection with custom styling capabilities.',
                    demo: <BasicDemo />
                },
                {
                    title: 'Text Alignment',
                    desc: 'Support for Left, Center, and Right text alignment depending on context.',
                    demo: <AlignmentDemo />
                },
                {
                    title: 'States',
                    desc: 'Visual feedback for different interaction states including Error.',
                    demo: <StatusDemo />,
                    code: `
                      <CustomSelect
                          label="Select an option"
                          options={[
                              { value: 'option1', label: 'Option 1' },
                              { value: 'option2', label: 'Option 2' },
                              { value: 'option3', label: 'Option 3' },
                          ]}
                          error="This field is required"
                      />
                      `
                }
            ]
        },

    ];
};
