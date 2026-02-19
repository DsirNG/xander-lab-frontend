import React from 'react';
import { useToast } from '@/hooks/useToast';
import {
    Activity, Clock, X, ExternalLink, Layers,
    CheckCircle2, XCircle, AlertCircle, Info, Palette
} from 'lucide-react';

/**
 * Toast 场景演示组件集 - 实时 props 控制版
 */

// 1. Basic Usage: 纯展示态 (无进度条 / 无叉叉)
export const ToastBasicDemo = () => {
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
};

// 2. Pause on Hover: 物理暂停展示
export const ToastHoverDemo = () => {
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
};

// 3. Manual Exit: 带叉叉关闭
export const ToastManualDemo = () => {
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
};

// 4. Action Links: 带有 A 标签
export const ToastActionDemo = () => {
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
};

// 5. No Hover Demo: 强制不暂停样例 (对比项)
export const ToastNoHoverDemo = () => {
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
};
// 6. Stack Dynamics: 堆栈序列演示
export const ToastStackDemo = () => {
    const toast = useToast();
    const handleStack = () => {
        ['success', 'warning', 'info'].forEach((type, i) => {
            setTimeout(() => {
                toast[type](`堆栈序列演示消息 #${i + 1}`, { duration: 3000 });
            }, i * 250);
        });
    };
    return (
        <button
            onClick={handleStack}
            className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[2rem] text-xs font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
            <Layers className="w-4 h-4" />
            触发脉冲堆叠
        </button>
    );
};
