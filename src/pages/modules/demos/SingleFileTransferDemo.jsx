import React, { useState } from 'react';
import {
    FileText,
    Image as ImageIcon,
    GripVertical,
    Box,
    File,
    FolderPlus,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDragDrop } from '../../../hooks/useDragDrop';

const getFileIcon = (type) => {
    switch (type) {
        case 'pdf': return <FileText className="w-5 h-5 text-rose-500" />;
        case 'image': return <ImageIcon className="w-5 h-5 text-sky-500" />;
        default: return <File className="w-5 h-5 text-slate-500" />;
    }
};

const createPremiumDragPreview = (item) => {
    const wrapper = document.createElement('div');
    wrapper.style.width = '280px';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.zIndex = '9999';

    const card = document.createElement('div');
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.padding = '12px 16px';
    card.style.gap = '12px';
    card.style.background = 'rgba(255, 255, 255, 0.9)';
    card.style.backdropFilter = 'blur(12px)';
    card.style.borderRadius = '16px';
    card.style.border = '1px solid rgba(255, 255, 255, 0.5)';
    card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)';
    card.style.transform = 'rotate(2deg)';

    // Create Icon container
    const iconSide = document.createElement('div');
    iconSide.style.width = '40px';
    iconSide.style.height = '40px';
    iconSide.style.borderRadius = '12px';
    iconSide.style.display = 'flex';
    iconSide.style.alignItems = 'center';
    iconSide.style.justifyContent = 'center';
    iconSide.style.background = item.type === 'pdf' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(14, 165, 233, 0.1)';

    // SVG for icon
    const svg = item.type === 'pdf'
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
    iconSide.innerHTML = svg;

    const info = document.createElement('div');
    info.style.flex = '1';

    const name = document.createElement('div');
    name.innerText = item.name;
    name.style.fontSize = '14px';
    name.style.fontWeight = '600';
    name.style.color = '#1e293b';
    name.style.whiteSpace = 'nowrap';
    name.style.overflow = 'hidden';
    name.style.textOverflow = 'ellipsis';

    const size = document.createElement('div');
    size.innerText = (item.size || '2.4 MB');
    size.style.fontSize = '11px';
    size.style.color = '#64748b';

    info.appendChild(name);
    info.appendChild(size);
    card.appendChild(iconSide);
    card.appendChild(info);
    wrapper.appendChild(card);

    // Dynamic Hint Element
    const hint = document.createElement('div');
    hint.style.marginTop = '8px';
    hint.style.padding = '8px 16px';
    hint.style.background = '#0ea5e9';
    hint.style.borderRadius = '12px';
    hint.style.color = 'white';
    hint.style.fontSize = '12px';
    hint.style.fontWeight = '800';
    hint.style.display = 'none';
    hint.style.alignItems = 'center';
    hint.style.gap = '8px';
    hint.style.boxShadow = '0 10px 15px -3px rgba(14, 165, 233, 0.3)';
    hint.style.width = 'fit-content';
    hint.style.margin = '8px auto 0';

    const hintIcon = document.createElement('div');
    hintIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>`;

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

    return { el: wrapper, offsetX: 140, offsetY: 32, controller };
};

const SingleFileTransferDemo = () => {
    const [files, setFiles] = useState([
        { id: '1', name: 'Brand_Guidelines_2024.pdf', type: 'pdf', size: '4.2 MB' },
        { id: '2', name: 'Product_Shot_Main.png', type: 'image', size: '1.8 MB' },
        { id: '3', name: 'Q4_Market_Report.pdf', type: 'pdf', size: '3.1 MB' },
    ]);
    const [folders, setFolders] = useState([
        { id: 'f1', name: 'Design Assets', items: [] },
        { id: 'f2', name: 'Marketing Strategy', items: [] },
    ]);

    const dragDrop = useDragDrop({
        getDragPreview: createPremiumDragPreview,
        getDropHintText: (source, target) => `Drop into ${target.name}`,
        onDrop: (source, target) => {
            setFolders(prev => prev.map(f =>
                f.id === target.id
                    ? { ...f, items: [...f.items, source] }
                    : f
            ));
            setFiles(prev => prev.filter(f => f.id !== source.id));
        }
    });

    return (
        <div className="w-full max-w-4xl mx-auto p-4 h-80">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left: Source Files */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Available Files</h4>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold">{files.length}</span>
                    </div>

                    <div className="space-y-3 h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {files.map(file => (
                                <motion.div
                                    key={file.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    draggable
                                    onDragStart={(e) => dragDrop.handleDragStart(file, e)}
                                    onDragEnd={dragDrop.handleDragEnd}
                                    className="group relative flex items-center p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl cursor-grab active:cursor-grabbing hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300"
                                >
                                    <div className="mr-4 p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        {getFileIcon(file.type)}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{file.size}</p>
                                    </div>
                                    <GripVertical className="w-4 h-4 text-slate-200 dark:text-slate-700 group-hover:text-slate-400 transition-colors" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {files.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-slate-300 dark:text-slate-700"
                            >
                                <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-xs font-medium">No files left</p>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Right: Drop Targets */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Cloud Storage</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {folders.map(folder => (
                            <div
                                key={folder.id}
                                onDragOver={(e) => dragDrop.handleDragOver(folder, e)}
                                onDragLeave={dragDrop.handleDragLeave}
                                onDrop={(e) => dragDrop.handleDrop(folder, e)}
                                className={`relative p-6 rounded-[2rem] border-2 transition-all duration-500 flex flex-col min-h-[220px] ${dragDrop.dragOverItem?.id === folder.id
                                    ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-500/5 scale-[1.02] shadow-2xl shadow-sky-500/10'
                                    : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50'
                                    }`}
                            >
                                <div className="pointer-events-none flex flex-col h-full">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 ${dragDrop.dragOverItem?.id === folder.id ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        }`}>
                                        <FolderPlus className="w-6 h-6" />
                                    </div>
                                    <h5 className={`font-bold text-sm mb-1 ${dragDrop.dragOverItem?.id === folder.id ? 'text-sky-600' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {folder.name}
                                    </h5>
                                    <p className="text-[10px] text-slate-400 mb-4">{folder.items.length} files stored</p>

                                    <div className="mt-auto flex flex-wrap gap-2 overflow-hidden">
                                        <AnimatePresence>
                                            {folder.items.map((item, i) => (
                                                <motion.div
                                                    key={`${folder.id}-${item.id}`}
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg shadow-sm flex items-center space-x-1"
                                                >
                                                    <div className="w-1 h-1 rounded-full bg-sky-500" />
                                                    <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[80px]">
                                                        {item.name}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {dragDrop.dragOverItem?.id === folder.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute inset-x-0 -bottom-8 flex justify-center pointer-events-none"
                                    >
                                        <div className="bg-sky-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center">
                                            <Box className="w-3 h-3 mr-2" />
                                            DROP TO UPLOAD
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleFileTransferDemo;
