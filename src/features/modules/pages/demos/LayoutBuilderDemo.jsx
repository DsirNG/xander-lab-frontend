import React, { useState } from 'react';
import {
    Layout,
    BarChart3,
    PieChart,
    Type,
    Image as ImageIcon,
    GripVertical,
    X,
    Maximize2
} from 'lucide-react';
import { useDragDrop } from '@hooks/useDragDrop';
import { motion, AnimatePresence } from 'framer-motion';

const TOOL_ITEMS = [
    { id: 'tool-chart-bar', type: 'chart-bar', label: 'Bar Chart', icon: BarChart3 },
    { id: 'tool-chart-pie', type: 'chart-pie', label: 'Pie Chart', icon: PieChart },
    { id: 'tool-text', type: 'text', label: 'Text Block', icon: Type },
    { id: 'tool-image', type: 'image', label: 'Image', icon: ImageIcon },
];

const LayoutBuilderDemo = () => {
    // Grid items state
    const [gridItems, setGridItems] = useState([
        { id: 'item-1', type: 'chart-bar', w: 2, content: 'Revenue Trend' },
        { id: 'item-2', type: 'text', w: 1, content: 'Q3 Summary' },
    ]);

    const dragDrop = useDragDrop({
        onDrop: (source, target) => {
            if (!source) return;

            // Scenario C-2: Drag from Sidebar (Tool) to Grid
            // Logic: If source is a tool (has 'tool-' prefix id) and target is main area or existing item
            if (source.id.startsWith('tool-')) {
                // Instantiating new item
                const newItem = {
                    id: `item-${Date.now()}`,
                    type: source.type,
                    w: 1, // Default width
                    content: `New ${source.label}`
                };

                // If dropped on an existing item, insert before/after it? 
                // For simplicity, we'll just append to the grid if not specifically targeting a swap position, 
                // or if target is valid item, insert at that index.

                if (target && target.id && !target.id.startsWith('tool-')) {
                    const targetIndex = gridItems.findIndex(i => i.id === target.id);
                    const newGrid = [...gridItems];
                    newGrid.splice(targetIndex + 1, 0, newItem);
                    setGridItems(newGrid);
                } else {
                    // Dropped on container (handled generally if target is "container") or appended
                    setGridItems([...gridItems, newItem]);
                }
                return;
            }

            // Scenario C-1: Reorder Grid Items
            if (target && target.id && !target.id.startsWith('tool-')) {
                const sourceIndex = gridItems.findIndex(i => i.id === source.id);
                if (sourceIndex === -1) return; // Source not in grid (shouldn't happen if filtered right)

                const targetIndex = gridItems.findIndex(i => i.id === target.id);
                if (targetIndex === -1) return;

                const newGrid = [...gridItems];
                // Swap element positions or reorder
                // Standard reorder logic:
                newGrid.splice(sourceIndex, 1);
                newGrid.splice(targetIndex, 0, source);
                setGridItems(newGrid);
            }
        },
        getDragPreview: (item) => {
            const el = document.createElement('div');
            el.className = 'bg-blue-600 text-white p-3 rounded-lg shadow-xl flex items-center space-x-2 font-bold text-sm';
            el.innerHTML = `
                <span>${item.label || item.content}</span>
             `;
            return el;
        }
    });

    const removeItem = (id) => {
        setGridItems(gridItems.filter(i => i.id !== id));
    };

    return (
        <div className="flex w-full h-[500px] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/30">
            {/* Sidebar Tools */}
            <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Components</h3>
                <div className="space-y-3">
                    {TOOL_ITEMS.map((tool) => (
                        <div
                            key={tool.id}
                            draggable
                            onDragStart={(e) => dragDrop.handleDragStart(tool, e)}
                            onDragEnd={dragDrop.handleDragEnd}
                            className="flex items-center p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-grab active:cursor-grabbing hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
                        >
                            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg mr-3 shadow-sm group-hover:scale-105 transition-transform">
                                <tool.icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{tool.label}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                    <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                        Drag components from here to the canvas on the right to build your dashboard.
                    </p>
                </div>
            </div>

            {/* Canvas Area */}
            <div
                className="flex-1 p-8 overflow-y-auto"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    // This handles dropping on empty space = append
                    // We need to differentiate if it was dropped on an Item or the Container.
                    // If e.target is the container itself:
                    if (e.currentTarget === e.target) {
                        const item = dragDrop.draggedItem;
                        if (item) {
                            // Use 'container-end' as the special target ID for appending
                            dragDrop.handleDrop(item, { id: 'container-end' }, e);
                        }
                    }
                }}
            >
                <div className="grid grid-cols-3 gap-6 auto-rows-min min-h-full pb-20 relative">
                    {/* 
                       Grid visualization 
                     */}
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 gap-6 opacity-10">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="border-2 border-dashed border-slate-400 rounded-xl h-32" />
                        ))}
                    </div>

                    <AnimatePresence>
                        {gridItems.map((item) => (
                            <motion.div
                                layout
                                key={item.id}
                                draggable
                                onDragStart={(e) => dragDrop.handleDragStart(item, e)}
                                onDragOver={(e) => dragDrop.handleDragOver(item, e)}
                                onDrop={(e) => dragDrop.handleDrop(item, e)}
                                onDragEnd={dragDrop.handleDragEnd}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                                className={`
                                    relative group bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 overflow-hidden flex flex-col
                                    ${item.w === 2 ? 'col-span-2' : 'col-span-1'}
                                    ${item.w === 3 ? 'col-span-3' : ''}
                                    min-h-[160px]
                                    ${dragDrop.draggedItem?.id === item.id ? 'opacity-20 blur-sm' : ''}
                                    ${dragDrop.dragOverItem?.id === item.id ? 'border-blue-500 ring-4 ring-blue-500/10 z-10' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}
                                `}
                            >
                                {/* Header */}
                                <div className="h-10 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between px-3 cursor-move">
                                    <div className="flex items-center space-x-2 text-slate-400">
                                        <GripVertical className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">{item.type}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                const newItems = [...gridItems];
                                                const idx = newItems.findIndex(x => x.id === item.id);
                                                newItems[idx].w = newItems[idx].w === 2 ? 1 : 2;
                                                setGridItems(newItems);
                                            }}
                                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-blue-500"
                                            title="Toggle Width"
                                        >
                                            <Maximize2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-slate-400 hover:text-red-500"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content Placeholder */}
                                <div className="flex-1 p-6 flex items-center justify-center bg-white dark:bg-slate-800 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 opacity-50" />
                                    <h4 className="relative font-bold text-slate-700 dark:text-slate-300 text-lg flex items-center">
                                        {item.type === 'chart-bar' && <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />}
                                        {item.type === 'chart-pie' && <PieChart className="w-6 h-6 mr-2 text-purple-500" />}
                                        {item.type === 'image' && <ImageIcon className="w-6 h-6 mr-2 text-emerald-500" />}
                                        {item.content}
                                    </h4>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default LayoutBuilderDemo;
