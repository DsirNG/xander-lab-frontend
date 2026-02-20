import React from 'react';
import {
    ToggleLeft as ToggleIcon,
    ChevronsUpDown,
    MousePointerClick,
    Activity
} from 'lucide-react';

// Demos
import { BasicDemo, AlignmentDemo, StatusDemo } from './pages/codeComponent/demo/demo.jsx';
import {
    ToastBasicDemo,
    ToastHoverDemo,
    ToastManualDemo,
    ToastActionDemo,
    ToastStackDemo,
    ToastNoHoverDemo
} from './pages/codeComponent/demo/ToastDemo.jsx';

// 延迟导入详情页组件（避免循环依赖）
const getDetailComponents = () => ({
    CustomSelectGuide: React.lazy(() => import('./pages/CustomSelectGuide')),
    ToastGuide: React.lazy(() => import('./pages/ToastGuide')),
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
            id: 'toast',
            title: t('components.toast.title', 'Toast Notifications'),
            desc: t('components.toast.desc', 'Premium feedback system with physics-based interactions.'),
            tag: t('components.toast.tag', 'Interaction'),
            icon: <Activity className="w-5 h-5" />,
            detailPages: [
                {
                    type: 'guide',
                    component: detailComponents.ToastGuide,
                }
            ],
            scenarios: [
                {
                    title: t('components.toast.scenarios.basic.title', 'Basic Usage (Minimal)'),
                    desc: t('components.toast.scenarios.basic.desc', 'Pure notification state without progress bars or close buttons for a clean, non-intrusive UI.'),
                    demo: <ToastBasicDemo />,
                    code: `export const ToastBasicDemo = () => {
    const toast = useToast();

    const triggerSimple = (type, msg) => {
        toast[type](msg, {
            showProgress: false,
            showClose: false,
            duration: 3000
        });
    };

    const triggerCustomClass = () => {
        toast.info('自定义紫色幻彩样式', {
            className: 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400 !shadow-purple-500/20',
            icon: <Activity className="w-5 h-5 text-purple-500" />,
            showProgress: false,
            showClose: true
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => triggerSimple('success', '状态：核心逻辑已就绪')}
                    className="px-5 py-2.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl text-xs font-black"
                >
                    Success (Minimal)
                </button>
                <button
                    onClick={() => triggerSimple('error', '异常：请求频率超限')}
                    className="px-5 py-2.5 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-xl text-xs font-black"
                >
                    Error (Minimal)
                </button>
                <button
                    onClick={() => triggerSimple('info', '更新：版本 v2.4.0 加入')}
                    className="px-5 py-2.5 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-xl text-xs font-black"
                >
                    Info (Minimal)
                </button>
                <button
                    onClick={() => triggerSimple('warning', '警告：系统正在维护中')}
                    className="px-5 py-2.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl text-xs font-black"
                >
                    Warning (Minimal)
                </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <button
                    onClick={triggerCustomClass}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-500/20"
                >
                    <Palette className="w-4 h-4" />
                    触发自定义 Style
                </button>
            </div>
        </div>
    );
};`
                },
                {
                    title: t('components.toast.scenarios.physics.title', 'Interactive Physics (Pause on Hover)'),
                    desc: t('components.toast.scenarios.physics.desc', 'Real-time temporal locking: hovering freezes the countdown, allowing users infinite reading time.'),
                    demo: <ToastHoverDemo />,
                    code: `export const ToastHoverDemo = () => {
    const toast = useToast();
    return (
        <div className="flex flex-col gap-4">
            <p className="text-xs text-slate-500 font-bold">
                此模式下，鼠标悬停将冻结计时器，移开后恢复执行。
            </p>
        <button
            onClick={() => toast.warning(
                    "实验观测：由于设置了 pauseOnHover: true，悬停可无限延展阅读时间。",
                    {
                        duration: 6000,
                        pauseOnHover: true,
                        showProgress: true
                    }
            )}
                className="w-fit px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
        >
                <Clock className="w-4 h-4" />
                启动物理暂停实验室
        </button>
        </div>
    );
};`
                },
                {
                    title: t('components.toast.scenarios.manual.title', 'Manual Dismissal'),
                    desc: t('components.toast.scenarios.manual.desc', 'Explicit interaction model showing close buttons for alerts that require acknowledgment.'),
                    demo: <ToastManualDemo />,
                    code: `export const ToastManualDemo = () => {
    const toast = useToast();
    return (
        <div className="flex flex-col gap-4">
            <p className="text-xs text-slate-500 font-bold">
                强制展示关闭按钮，允许用户主动清理通知轨道。
            </p>
        <button
            onClick={() => toast.error(
                    "检测到非法指令注入，安全协议已强制执行清理。",
                    {
                        duration: 10000,
                        showClose: true,
                        showProgress: false
                    }
            )}
                className="w-fit px-6 py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
        >
                <XCircle className="w-4 h-4" />
                弹出带叉叉的告警
        </button>
        </div>
    );
};`
                },
                {
                    title: t('components.toast.scenarios.action.title', 'JSX & Rich Actions'),
                    desc: t('components.toast.scenarios.action.desc', 'Beyond strings: embed links, buttons, and custom layout logic directly into the feedback stream.'),
                    demo: <ToastActionDemo />,
                    code: `export const ToastActionDemo = () => {
    const toast = useToast();
    return (
        <div className="flex flex-col gap-4">
            <p className="text-xs text-slate-500 font-bold">
                支持嵌入交互式链接，点击链接时自动触发业务跳转。
            </p>
        <button
            onClick={() => toast.success(
                <div className="flex items-center gap-3">
                        <span>文档编译成功</span>
                        <a
                            href="/blog"
                            className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[9px] flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            READ <ExternalLink className="w-2 h-2" />
                        </a>
                </div>,
                { duration: 5000, showProgress: true }
            )}
                className="w-fit px-6 py-3 bg-white dark:bg-slate-800 text-emerald-600 border border-emerald-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all"
        >
                弹出交互链接
        </button>
        </div>
    );
};`
                },
                {
                    title: t('components.toast.scenarios.comparison.title', 'System Comparison (No Pause)'),
                    desc: t('components.toast.scenarios.comparison.desc', 'A benchmark demo where pauseOnHover is disabled, forcing the notification to disappear regardless of focus.'),
                    demo: <ToastNoHoverDemo />,
                    code: `export const ToastNoHoverDemo = () => {
    const toast = useToast();
    return (
        <div className="flex flex-col gap-4">
            <p className="text-xs text-slate-500 font-bold">
                对比项：即便悬停，倒计时依然会强行流逝。
            </p>
        <button
            onClick={() => toast.info(
                    "强制流逝测试：无论怎么悬停，我都会在 3s 后消失。",
                { pauseOnHover: false, showProgress: true }
            )}
                className="w-fit px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest"
        >
                触发不可暂停提示
        </button>
        </div>
    );
};`
                }
            ]
        },
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
                    title: t('components.customSelect.scenarios.basic.title', 'Basic Usage'),
                    desc: t('components.customSelect.scenarios.basic.desc', 'Standard single selection with custom styling capabilities.'),
                    demo: <BasicDemo />
                },
                {
                    title: t('components.customSelect.scenarios.alignment.title', 'Text Alignment'),
                    desc: t('components.customSelect.scenarios.alignment.desc', 'Support for Left, Center, and Right text alignment depending on context.'),
                    demo: <AlignmentDemo />
                },
                {
                    title: t('components.customSelect.scenarios.states.title', 'States'),
                    desc: t('components.customSelect.scenarios.states.desc', 'Visual feedback for different interaction states including Error.'),
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
