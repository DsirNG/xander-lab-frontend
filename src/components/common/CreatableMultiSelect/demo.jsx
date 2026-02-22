import React, { useState } from 'react';
import CreatableMultiSelect from './index';
import { LayoutList, Check } from 'lucide-react';

export default function CreatableMultiSelectDemo() {
    const [selectedItems, setSelectedItems] = useState(['React', 'TailwindCSS']);
    const [submittedItems, setSubmittedItems] = useState([]);

    // 模拟的推荐选项数据
    const availableOptions = [
        'React',
        'Vue',
        'Angular',
        'Svelte',
        'TailwindCSS',
        'TypeScript',
        'Node.js',
        'Next.js',
        'Nuxt',
        'GraphQL'
    ];

    const handleSubmit = () => {
        setSubmittedItems(selectedItems);
    };

    return (
        <div className="p-8 max-w-2xl mx-auto bg-slate-50 /50 rounded-3xl border border-slate-200 ">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900  mb-2 font-sans tracking-tight">
                    可创建多选框 (CreatableMultiSelect)
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                    支持预设推断与自定义输入创建，适用于标签选择、话题分类、成员添加等多种表单场景。
                </p>
            </div>

            <div className="space-y-8">
                {/* 演示区域 */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-slate-500">
                            <LayoutList className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                示例：选择技能栈
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">支持按 Enter 键录入新选项</span>
                    </div>

                    {/* 调用封装的组件 */}
                    <CreatableMultiSelect
                        value={selectedItems}
                        onChange={setSelectedItems}
                        options={availableOptions}
                        placeholder="试试输入 React 或自定义新技能..."
                    />
                </section>

                {/* 提交与结果展示 */}
                <section className="pt-6 border-t border-slate-200/60  flex flex-col items-start gap-4">
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        提交数据
                    </button>

                    {submittedItems.length > 0 && (
                        <div className="w-full mt-4 p-4 bg-white  rounded-2xl border border-slate-100 ">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">多选结果</h3>
                            <pre className="text-xs font-mono text-emerald-600  bg-emerald-50  p-4 rounded-xl overflow-x-auto">
                                {JSON.stringify(submittedItems, null, 2)}
                            </pre>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
