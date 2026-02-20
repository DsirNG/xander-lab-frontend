import React from 'react';
import {
    Activity,
    ChevronsUpDown,
    ToggleLeft,
    MousePointerClick,
    Layers,
    Box
} from 'lucide-react';

/**
 * 图标注册表：将数据库中的 key 映射到 Lucide 图标。
 * keys 必须与 `component_item` 表中的 `icon_key` 一致。
 */
export const ICON_REGISTRY = {
    'Activity': <Activity className="w-5 h-5" />,
    'ChevronsUpDown': <ChevronsUpDown className="w-5 h-5" />,
    'ToggleLeft': <ToggleLeft className="w-5 h-5" />,
    'MousePointerClick': <MousePointerClick className="w-5 h-5" />,
    'Layers': <Layers className="w-5 h-5" />,
    // 默认图标
    'default': <Box className="w-5 h-5" />
};
