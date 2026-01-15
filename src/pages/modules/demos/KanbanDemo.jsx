import React, { useState } from 'react';
import { Plus, MoreHorizontal, MessageSquare, Paperclip, Calendar } from 'lucide-react';
import { useDragDrop } from '../../../hooks/useDragDrop';
import { motion, AnimatePresence } from 'framer-motion';

const KanbanDemo = () => {
    // Initial State: Columns with items
    const [columns, setColumns] = useState({
        todo: {
            title: 'To Do',
            items: [
                { id: '1', title: 'Research Competitors', tag: 'Strategy', date: 'Oct 24' },
                { id: '2', title: 'Draft Product Requirements', tag: 'Product', date: 'Oct 25' }
            ]
        },
        inProgress: {
            title: 'In Progress',
            items: [
                { id: '3', title: 'Design System Update', tag: 'Design', date: 'Oct 26' }
            ]
        },
        done: {
            title: 'Done',
            items: [
                { id: '4', title: 'Setup Repo', tag: 'Dev', date: 'Oct 20' }
            ]
        }
    });

    const dragDrop = useDragDrop({
        onDrop: (source, target) => {
            // Early exit if source or target is invalid
            if (!source || !target) return;

            const sourceColId = Object.keys(columns).find(key => columns[key].items.find(i => i.id === source.id));
            const targetColId = Object.keys(columns).find(key => columns[key].items.find(i => i.id === target.id));

            // If dragging to a column header (target is a string representing column ID)
            const isTargetColumn = typeof target === 'string' && columns[target];

            if (isTargetColumn) {
                const colId = target;
                if (sourceColId === colId) return; // No change if dropped in same column header (append logic could go here)

                const sourceItems = [...columns[sourceColId].items];

                // Remove from source
                const itemIndex = sourceItems.findIndex(i => i.id === source.id);
                if (itemIndex > -1) sourceItems.splice(itemIndex, 1);

                const targetItems = [...columns[colId].items, source];

                setColumns({
                    ...columns,
                    [sourceColId]: { ...columns[sourceColId], items: sourceItems },
                    [colId]: { ...columns[colId], items: targetItems }
                });

                return;
            }

            // Standard Item Reordering / Moving
            if (sourceColId && targetColId) {
                const sourceItems = [...columns[sourceColId].items];
                const targetItems = [...columns[targetColId].items];

                // Remove source
                const sourceIndex = sourceItems.findIndex(i => i.id === source.id);
                sourceItems.splice(sourceIndex, 1);

                // Add to target
                // If same column, we need to handle the index carefully because we just removed one
                if (sourceColId === targetColId) {
                    const targetIndex = sourceItems.findIndex(i => i.id === target.id); // Find index in the MODIFIED list
                    // If target was after source, the index naturally shifts, so this logic usually holds but check.
                    // Actually, simpler to treat as fresh lists.

                    // Let's re-fetch indices from fresh copies for safety or just use logic correctly.
                    // Re-implement for clarity:

                    const newItems = [...columns[sourceColId].items];
                    const oldIdx = newItems.findIndex(i => i.id === source.id);
                    const newIdx = newItems.findIndex(i => i.id === target.id);

                    newItems.splice(oldIdx, 1);
                    // If moving down, the target index might have shifted if we don't account for removal logic.
                    // But splice modifies in place. 
                    // To insert correctly at *target's* visual position:
                    // If dragged item was *before* target, target index effectively decreases by 1.

                    // Actually, standard splice logic:
                    newItems.splice(newIdx, 0, source);

                    setColumns({
                        ...columns,
                        [sourceColId]: { ...columns[sourceColId], items: newItems }
                    });

                } else {
                    // Moving between columns
                    const targetIndex = targetItems.findIndex(i => i.id === target.id);
                    targetItems.splice(targetIndex, 0, source);

                    setColumns({
                        ...columns,
                        [sourceColId]: { ...columns[sourceColId], items: sourceItems },
                        [targetColId]: { ...columns[targetColId], items: targetItems }
                    });
                }
            }
        },
        getDragPreview: (item, event) => {
            const el = event.currentTarget.cloneNode(true);
            const rect = event.currentTarget.getBoundingClientRect();

            // Lock dimensions to match original
            el.style.width = `${rect.width}px`;
            el.style.height = `${rect.height}px`;

            // Remove transform/layout animations if any (framer-motion might leave inline styles)
            el.style.transform = 'none';
            // Ensure background and border are opaque/clean
            el.style.opacity = '1';

            // Calculate offset to keeping position relative to cursor
            const offsetX = event.clientX - rect.left;
            const offsetY = event.clientY - rect.top;

            return { el, offsetX, offsetY };
        }
    });


    return (
        <div className="flex space-x-6 overflow-x-auto pb-4 w-full h-[400px]">
            {Object.entries(columns).map(([colId, col]) => (
                <div
                    key={colId}
                    className="flex-shrink-0 w-72 bg-slate-100 dark:bg-slate-900/50 rounded-2xl flex flex-col max-h-[500px]"
                    // Allow dropping onto empty columns headers (advanced implementation would need a wrapper)
                    onDragOver={(e) => {
                        e.preventDefault();
                        // This handles dropping on the column itself (e.g. at the bottom)
                        // Ideally we pass a special 'target' to handleDrop.
                        // For simplicity in this demo, integration with useDragDrop limits us to item-to-item or we need to bridge refs.
                        // We'll stick to item sorting for now, and maybe a "Drag here" empty state if needed.
                    }}
                >
                    {/* Column Header */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">{col.title}</h3>
                            <span className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs font-bold">
                                {col.items.length}
                            </span>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Column Items */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[100px]">
                        <AnimatePresence>
                            {col.items.map((item) => (
                                <motion.div
                                    layout
                                    layoutId={item.id}
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => dragDrop.handleDragStart(item, e)}
                                    onDragOver={(e) => dragDrop.handleDragOver(item, e)}
                                    // onDragLeave={dragDrop.handleDragLeave} // Optional, sometimes causes flicker if layouts update fast
                                    onDrop={(e) => dragDrop.handleDrop(item, e)}
                                    onDragEnd={dragDrop.handleDragEnd}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`
                                        bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing group
                                        ${dragDrop.draggedItem?.id === item.id ? 'opacity-50 border-dashed' : ''}
                                        ${dragDrop.dragOverItem?.id === item.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-900' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md mb-2 inline-block
                                            ${item.tag === 'Strategy' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' : ''}
                                            ${item.tag === 'Product' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300' : ''}
                                            ${item.tag === 'Design' ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300' : ''}
                                            ${item.tag === 'Dev' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                                         `}>
                                            {item.tag}
                                        </span>
                                        <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3 text-sm leading-snug">
                                        {item.title}
                                    </h4>
                                    <div className="flex items-center justify-between text-slate-400">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white dark:border-slate-800" />
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white dark:border-slate-800" />
                                        </div>
                                        <div className="flex items-center space-x-3 text-xs font-medium">
                                            <div className="flex items-center hover:text-blue-500 transition-colors">
                                                <Paperclip className="w-3 h-3 mr-1" />
                                                <span>2</span>
                                            </div>
                                            <div className="flex items-center hover:text-blue-500 transition-colors">
                                                <MessageSquare className="w-3 h-3 mr-1" />
                                                <span>4</span>
                                            </div>
                                            <div className="flex items-center text-slate-300 dark:text-slate-600">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                <span>{item.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Empty PlaceHolder for Dropping into empty column */}
                            {col.items.length === 0 && (
                                <div
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        // e.stopPropagation(); // Stop bubbling to prevent parent interference if any
                                        // Mocking a drop target for empty list
                                        // This requires 'dragOverItem' to be set to something representing the column or handled specially.
                                        // For now, simple visual cue.
                                    }}
                                    onDrop={(e) => dragDrop.handleDrop(colId, e)}
                                    // Hack: passing a fake item to indicate column drop. 
                                    // But canonical 'handleDrop' expects (source, target).
                                    // Target needs to be identifiable in 'onDrop' at top.
                                    className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 text-sm font-medium"
                                >
                                    Drop here
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanDemo;
