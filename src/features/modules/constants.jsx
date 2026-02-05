
import React from 'react';
import {
    MessageSquare,
    List,
    HelpCircle,
    Move as MoveIcon,
    MousePointer2
} from 'lucide-react';

/**
 * 获取功能模块配置
 * @param {Function} t - i18n 翻译函数
 * @returns {Array} 功能模块配置数组
 */
export const getModuleConfig = (t) => [
    {
        id: 'popover',
        title: t('modules.popover.title'),
        desc: t('modules.popover.desc'),
        icon: <MessageSquare className="w-5 h-5" />
    },
    {
        id: 'dropdown',
        title: t('modules.dropdown.title'),
        desc: t('modules.dropdown.desc'),
        icon: <List className="w-5 h-5" />
    },
    {
        id: 'tooltip',
        title: t('modules.tooltip.title'),
        desc: t('modules.tooltip.desc'),
        icon: <HelpCircle className="w-5 h-5" />
    },
    {
        id: 'drag-drop',
        title: t('modules.dragdrop.title'),
        desc: t('modules.dragdrop.desc'),
        icon: <MoveIcon className="w-5 h-5" />,
        path: 'drag-drop',
        hasCustomRouting: true
    },
    {
        id: 'context',
        title: t('modules.context.title'),
        desc: t('modules.context.desc'),
        icon: <MousePointer2 className="w-5 h-5" />
    }
];
