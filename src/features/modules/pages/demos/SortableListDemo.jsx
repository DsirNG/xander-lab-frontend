import React, { useState } from 'react';
import {
    Move
} from 'lucide-react';
import { useDragDrop } from '@hooks/useDragDrop';

const SortableListDemo = () => {
    const [items, setItems] = useState(['Prototyping', 'Development', 'Testing', 'Deployment']);
    const dragDrop = useDragDrop({
        onDrop: (source, target) => {
            const oldIndex = items.indexOf(source);
            const newIndex = items.indexOf(target);
            const newItems = [...items];
            newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, source);
            setItems(newItems);
        }
    });

    return (
        <div className="w-full max-w-sm space-y-2">
            {items.map((item) => (
                <div
                    key={item}
                    draggable
                    onDragStart={(e) => dragDrop.handleDragStart(item, e)}
                    onDragOver={(e) => dragDrop.handleDragOver(item, e)}
                    onDragLeave={dragDrop.handleDragLeave}
                    onDrop={(e) => dragDrop.handleDrop(item, e)}
                    onDragEnd={dragDrop.handleDragEnd}
                    className={`flex items-center p-3 bg-white dark:bg-slate-800 border-2 rounded-xl transition-all duration-200 cursor-move group
                        ${dragDrop.draggedItem === item ? 'opacity-30 grayscale' : ''}
                        ${dragDrop.dragOverItem === item ? 'border-blue-600 ring-4 ring-blue-600/5' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 shadow-sm'}
                    `}
                >
                    <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg mr-4">
                        <Move className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{item}</span>
                </div>
            ))}
        </div>
    );
};

export default SortableListDemo;
