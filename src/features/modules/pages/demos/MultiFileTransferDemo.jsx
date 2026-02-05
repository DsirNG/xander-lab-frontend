import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FileText,
    Image as ImageIcon,
    GripVertical,
    Box,
    Layers,
    Files,
    CheckCircle2,
    FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDragDrop } from '@hooks/useDragDrop';


const getFileIconSVG = (type) => {
    if (type === 'pdf') return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`;
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
};

const MultiFileTransferDemo = () => {
    const [files, setFiles] = useState([
        { id: '1', name: 'UI_Kit_Final.fig', type: 'image', size: '12.4 MB' },
        { id: '2', name: 'User_Flows.pdf', type: 'pdf', size: '2.4 MB' },
        { id: '3', name: 'Logo_Mockups.zip', type: 'file', size: '45.0 MB' },
        { id: '4', name: 'Presentation_Draft.pdf', type: 'pdf', size: '1.2 MB' },
        { id: '5', name: 'Assets_Export.zip', type: 'file', size: '8.5 MB' },
    ]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [folders, setFolders] = useState([
        { id: 'f1', name: 'Shared Workspace', items: [] },
        { id: 'f2', name: 'Personal Vault', items: [] },
    ]);

    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const dragDrop = useDragDrop({
        getDragPreview: (item) => {
            const isDraggingSelected = selectedIds.has(item.id);
            const dragItems = isDraggingSelected ? files.filter(f => selectedIds.has(f.id)) : [item];
            const count = dragItems.length;

            const wrapper = document.createElement('div');
            wrapper.style.width = '300px';
            wrapper.style.pointerEvents = 'none';
            wrapper.style.zIndex = '9999';

            if (count > 1) {
                // Background stacks
                for (let i = Math.min(count, 3) - 1; i > 0; i--) {
                    const stack = document.createElement('div');
                    stack.style.position = 'absolute';
                    stack.style.top = `${-i * 6}px`;
                    stack.style.left = `${i * 4}px`;
                    stack.style.width = '100%';
                    stack.style.height = '64px';
                    stack.style.background = 'rgba(255, 255, 255, 0.4)';
                    stack.style.backdropFilter = 'blur(4px)';
                    stack.style.borderRadius = '16px';
                    stack.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                    stack.style.zIndex = -i;
                    wrapper.appendChild(stack);
                }
            }

            const card = document.createElement('div');
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            card.style.padding = '12px 16px';
            card.style.gap = '12px';
            card.style.background = 'white';
            card.style.borderRadius = '16px';
            card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
            card.style.border = '1px solid #e2e8f0';

            const iconSide = document.createElement('div');
            iconSide.style.width = '40px';
            iconSide.style.height = '40px';
            iconSide.style.borderRadius = '12px';
            iconSide.style.display = 'flex';
            iconSide.style.alignItems = 'center';
            iconSide.style.justifyContent = 'center';
            iconSide.style.background = '#f8fafc';
            iconSide.innerHTML = getFileIconSVG(item.type);

            const info = document.createElement('div');
            info.style.flex = '1';
            const name = document.createElement('div');
            name.innerText = count > 1 ? `${count} Files selected` : item.name;
            name.style.fontSize = '14px';
            name.style.fontWeight = '700';
            name.style.color = '#1e293b';

            if (count > 1) {
                const badge = document.createElement('div');
                badge.innerText = `+${count - 1} more`;
                badge.style.fontSize = '10px';
                badge.style.color = '#6366f1';
                badge.style.fontWeight = 'bold';
                info.appendChild(name);
                info.appendChild(badge);
            } else {
                const size = document.createElement('div');
                size.innerText = item.size;
                size.style.fontSize = '11px';
                size.style.color = '#64748b';
                info.appendChild(name);
                info.appendChild(size);
            }

            card.appendChild(iconSide);
            card.appendChild(info);
            wrapper.appendChild(card);

            // Dynamic Hint Element (Stacked Style)
            const hint = document.createElement('div');
            hint.style.marginTop = '12px';
            hint.style.padding = '10px 20px';
            hint.style.background = '#6366f1';
            hint.style.borderRadius = '14px';
            hint.style.color = 'white';
            hint.style.fontSize = '12px';
            hint.style.fontWeight = '900';
            hint.style.display = 'none';
            hint.style.alignItems = 'center';
            hint.style.gap = '8px';
            hint.style.boxShadow = '0 20px 25px -5px rgba(99, 102, 241, 0.4)';
            hint.style.width = 'fit-content';
            hint.style.margin = '12px auto 0';
            hint.style.letterSpacing = '0.05em';

            const hintIcon = document.createElement('div');
            hintIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>`;

            const hintText = document.createElement('span');

            hint.appendChild(hintIcon);
            hint.appendChild(hintText);
            wrapper.appendChild(hint);

            const controller = {
                showDropHint(text) {
                    hint.style.display = 'flex';
                    hintText.innerText = text.toUpperCase();
                },
                hideDropHint() {
                    hint.style.display = 'none';
                },
            };

            return { el: wrapper, offsetX: 150, offsetY: 32, controller };
        },
        getDropHintText: (source, target) => {
            const isDraggingSelected = selectedIds.has(source.id);
            const count = isDraggingSelected ? selectedIds.size : 1;
            return `Move ${count} items into ${target.name}`;
        },
        onDrop: (source, target) => {
            const isDraggingSelected = selectedIds.has(source.id);
            const sourceItems = isDraggingSelected
                ? files.filter(f => selectedIds.has(f.id))
                : [source];

            setFolders(prev => prev.map(f =>
                f.id === target.id
                    ? { ...f, items: [...f.items, ...sourceItems] }
                    : f
            ));

            const sourceIds = new Set(sourceItems.map(s => s.id));
            setFiles(prev => prev.filter(f => !sourceIds.has(f.id)));
            setSelectedIds(new Set());
        }
    });

    return (
        <div className="w-full max-w-5xl mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* File Explorer style source */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Workspace</h3>
                            <p className="text-xs text-slate-400 font-medium tracking-wide">SHIPPING_DEPT / PROJECTS</p>
                        </div>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 space-y-2 h-[400px] overflow-y-auto">
                        <AnimatePresence mode="popLayout">
                            {files.map(file => {
                                const isSelected = selectedIds.has(file.id);
                                return (
                                    <motion.div
                                        key={file.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        draggable
                                        onDragStart={(e) => dragDrop.handleDragStart(file, e)}
                                        onDragEnd={dragDrop.handleDragEnd}
                                        onClick={() => toggleSelect(file.id)}
                                        className={`group flex items-center p-3 rounded-2xl cursor-pointer transition-all duration-300 ${isSelected
                                            ? 'bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-500/20'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <div className={`mr-4 w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${isSelected ? 'bg-indigo-500 scale-110 shadow-lg shadow-indigo-500/30' : 'bg-slate-100 dark:bg-slate-800'
                                            }`}>
                                            {isSelected ? (
                                                <Layers className="w-5 h-5 text-white" />
                                            ) : (
                                                file.type === 'pdf' ? <FileText className="w-5 h-5 text-rose-400" /> : <ImageIcon className="w-5 h-5 text-sky-400" />
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <p className={`text-sm font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                                {file.name}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-semibold">{file.size}</p>
                                        </div>
                                        {isSelected && (
                                            <div className="bg-indigo-500 text-white text-[9px] font-black px-2 py-1 rounded-full animate-pulse">
                                                READY
                                            </div>
                                        )}
                                        <GripVertical className={`ml-4 w-4 h-4 transition-colors ${isSelected ? 'text-indigo-300' : 'text-slate-200 group-hover:text-slate-400'}`} />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        {files.length === 0 && (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                                <CheckCircle2 className="w-12 h-12 mb-4 opacity-20" />
                                <p className="font-bold tracking-tight">STAGING CLEAR</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center space-x-3 text-xs font-bold text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                            <span>{selectedIds.size} ITEMS READY FOR TRANSFER</span>
                        </div>
                    </div>
                </div>

                {/* Drop Zones */}
                <div className="lg:col-span-5 space-y-6">
                    {folders.map(folder => (
                        <div
                            key={folder.id}
                            onDragOver={(e) => dragDrop.handleDragOver(folder, e)}
                            onDragLeave={dragDrop.handleDragLeave}
                            onDrop={(e) => dragDrop.handleDrop(folder, e)}
                            className={`p-8 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 relative min-h-[220px] group ${dragDrop.dragOverItem?.id === folder.id
                                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02] shadow-2xl shadow-indigo-500/20'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                                }`}
                        >
                            <div className="pointer-events-none">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${dragDrop.dragOverItem?.id === folder.id ? 'bg-indigo-600 text-white rotate-12 scale-110 shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:-rotate-3'
                                        }`}>
                                        {dragDrop.dragOverItem?.id === folder.id ? <FolderOpen className="w-7 h-7" /> : <Box className="w-7 h-7" />}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-indigo-500 mb-1">TARGET NODE</p>
                                        <h4 className="font-black text-slate-800 dark:text-white">{folder.name}</h4>
                                    </div>
                                </div>

                                <div className="space-y-2 h-[100px] flex flex-col justify-end">
                                    <AnimatePresence>
                                        {folder.items.slice(-2).map((item, i) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm text-xs font-bold text-slate-500 dark:text-slate-400"
                                            >
                                                {item.name}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {folder.items.length > 2 && (
                                        <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest pt-2">
                                            + {folder.items.length - 2} more items in vault
                                        </p>
                                    )}
                                </div>
                            </div>

                            {dragDrop.dragOverItem?.id === folder.id && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 flex items-center justify-center z-10 p-4 pointer-events-none"
                                >
                                    <div className="w-full h-full rounded-[2rem] bg-indigo-600/10 backdrop-blur-sm border-2 border-indigo-500 border-dashed flex flex-col items-center justify-center">
                                        <Files className="w-10 h-10 text-indigo-500 mb-3 animate-bounce" />
                                        <p className="text-indigo-600 dark:text-indigo-400 text-sm font-black tracking-widest uppercase">Release to transfer</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MultiFileTransferDemo;
