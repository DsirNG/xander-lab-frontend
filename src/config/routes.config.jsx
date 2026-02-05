/**
 * 路由配置数据
 * Routes Configuration Data
 * @module config/routes
 * @author Xander Lab Team
 * @created 2026-02-05
 */

import { 
  Box as BoxIcon, 
  Layout as LayoutIcon, 
  Move as MoveIcon, 
  MessageSquare, 
  List, 
  HelpCircle, 
  MousePointer2 
} from 'lucide-react';

/**
 * 获取基础设施系统配置
 * 注意：需要在运行时调用以支持 i18n
 * @param {Function} t - i18n 翻译函数
 * @returns {Array} 基础设施系统配置数组
 */
export const getInfraSystems = (t) => [
  {
    id: 'anchored',
    title: t('infra.anchored.title'),
    tag: t('infra.anchored.tag'),
    icon: <BoxIcon className="w-5 h-5" />,
    path: 'anchored/theory',
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
    icon: <LayoutIcon className="w-5 h-5" /> 
  },
  { 
    id: 'scroll', 
    title: 'Scroll Management', 
    tag: 'Interaction Physics', 
    icon: <MoveIcon className="w-5 h-5" /> 
  }
];

/**
 * 获取功能模块配置
 * 注意：需要在运行时调用以支持 i18n
 * @param {Function} t - i18n 翻译函数
 * @returns {Array} 功能模块配置数组
 */
export const getFeatureModules = (t) => [
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

