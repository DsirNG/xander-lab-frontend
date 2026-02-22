import React, { useState, useMemo } from 'react';
import { Play } from 'lucide-react';
import TourSpotlight from './index';

/**
 * TourSpotlight 的使用演示 Demo
 * 可以在其他页面或组件栈中引入这个向导系统
 */
export const TourSpotlightDemo = () => {
    // 1. 定义导览控制状态
    const [tourStep, setTourStep] = useState(-1);

    // 2. 根据步数，定义每一步的“目标灯光配置”
    // id 对应页面上的真实 DOM ID
    const currentTourTarget = useMemo(() => {
        switch (tourStep) {
            case 0: return {
                id: 'demo-btn-1',
                text: '第一步：关注这里',
                desc: '这是我们为您添加的第一个震撼级按钮功能区。点击它即可执行某种炫酷操作！'
            };
            case 1: return {
                id: 'demo-card-2',
                text: '第二步：底层数据面板',
                desc: '这里是您的专属信息展览区，可以实时看到所有的编译分析状态。'
            };
            case 2: return {
                id: 'demo-input-3',
                text: '第三步：终端输入',
                desc: '最后一步！您可以在这个输入框内打字，随时修改底层参数。'
            };
            default: return null;
        }
    }, [tourStep]);

    // 3. 构建点击下一步的漫游推进器
    const handleNextStep = () => {
        if (tourStep === 2) {
            setTourStep(-1); // 如果是最末尾，结束向导
            alert("教学圆满结束！");
        } else {
            setTourStep(s => s + 1); // 推进到下一步
        }
    };

    return (
        <div className="p-12 min-h-[400px] flex flex-col items-center justify-center gap-12 bg-slate-50 relative overflow-hidden">
            {/* 顶层触发器 */}
            <button
                onClick={() => setTourStep(0)}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 text-xs font-bold active:scale-95 transition-all text-center"
            >
                <Play className="w-4 h-4 inline-block mr-2" />
                在这儿测试：点击启动向导示范！
            </button>

            {/* 一些散布在页面各个边角的 DOM 元素 (被点名标记 ID) */}
            <div className="flex gap-20 w-full justify-between items-center max-w-4xl px-12">
                <button
                    id="demo-btn-1"
                    onClick={() => { if (tourStep === 0) handleNextStep(); }}
                    className={`px-8 py-4 bg-white border border-slate-200 shadow-xl rounded-2xl text-[14px] font-black tracking-widest transition-all ${tourStep === 0 ? 'ring-4 ring-indigo-500/50 relative z-10' : ''}`}
                >
                    [向导目标 1]
                </button>

                <div
                    id="demo-card-2"
                    onClick={() => { if (tourStep === 1) handleNextStep(); }}
                    className={`w-48 h-32 bg-slate-900 text-white rounded-[2rem] shadow-2xl flex items-center justify-center font-bold italic transition-all cursor-pointer ${tourStep === 1 ? 'scale-105 relative z-10' : ''}`}
                >
                    [向导目标 2]
                </div>
            </div>

            <div className="w-full max-w-lg mt-10">
                <input
                    id="demo-input-3"
                    onClick={() => { if (tourStep === 2) handleNextStep(); }}
                    placeholder="[向导目标 3] 输入框"
                    className={`w-full px-6 py-4 bg-white border-2 border-indigo-100 rounded-2xl shadow-inner focus:outline-none transition-all ${tourStep === 2 ? 'relative z-10 border-indigo-500 bg-indigo-50' : ''}`}
                />
            </div>

            {/* 4. 仅仅需要在 JSX 底部挂载 TourSpotlight /> 即可！ */}
            {/* 它会根据您传入的 currentTourTarget 自动找 DOM ID 并把聚光灯吸附上去 */}
            <TourSpotlight
                targetConfig={currentTourTarget}
                onSkip={() => setTourStep(-1)} // 允许用户随时强退
            />
        </div>
    );
};
