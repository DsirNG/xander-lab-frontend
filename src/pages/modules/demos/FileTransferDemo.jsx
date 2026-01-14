import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FileText,
    Image as ImageIcon,
    GripVertical,
    Box
} from 'lucide-react';
import { useDragDrop } from '../../../hooks/useDragDrop';

const getFileIconType = (item) => {
    if (item.type === 'image') return 'image';
    if (item.type === 'pdf') return 'pdf';
    return 'file';
};

const createFileIconSVG = (type, size = 24) => {
    if (type === 'image') return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#3366ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
    if (type === 'pdf') return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`;
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#8c8c8c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`;
};

const createHamburgerIconSVG = (size = 24, color = '#3366ff') => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`;
};

const FileTransferDemo = ({ selectedFiles }) => {
    const [files, setFiles] = useState([
        { id: '1', name: 'Design_Proposal.pdf', type: 'pdf' },
        { id: '2', name: 'Hero_Banner.png', type: 'image' },
        { id: '3', name: 'User_Research.pdf', type: 'pdf' },
    ]);
    const [folders, setFolders] = useState([
        { id: 'f1', name: 'Project Alpha', items: [] },
        { id: 'f2', name: 'Archive', items: [] },
    ]);

    const dragDrop = useDragDrop({
        getDragPreview: (item) => {
            const isMulti = (selectedFiles?.size ?? 0) > 1 && selectedFiles.has(item.id);
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.style.width = '22.5rem';
            wrapper.style.pointerEvents = 'none';
            wrapper.style.paddingTop = isMulti ? '0.25rem' : '0';

            if (isMulti) {
                const back = document.createElement('div');
                back.style.width = '18.75rem';
                back.style.height = '0.5rem';
                back.style.background = '#fff';
                back.style.borderRadius = '0.375rem 0.375rem 0 0';
                back.style.boxShadow = '0 0.25rem 1.25rem 0 rgba(0, 0, 0, 0.20)';
                back.style.border = '1px solid #E6E6E6';
                back.style.borderBottom = 'none';
                wrapper.appendChild(back);
            }

            const card = document.createElement('div');
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            card.style.height = '3rem';
            card.style.width = '22.5rem';
            card.style.padding = '0 0.75rem';
            card.style.gap = '0.5rem';
            card.style.borderRadius = '0.5rem';
            card.style.background = '#f9f9f9';
            card.style.border = '1px solid #E6E6E6';
            card.style.boxShadow = '0 0.5rem 1.5rem rgba(0, 0, 0, 0.15)';
            card.style.boxSizing = 'border-box';

            const iconContainer = document.createElement('div');
            iconContainer.style.width = '1.5rem';
            iconContainer.style.height = '1.5rem';
            iconContainer.style.display = 'flex';
            iconContainer.style.alignItems = 'center';
            const iconType = getFileIconType(item);
            iconContainer.innerHTML = createFileIconSVG(iconType, 24);

            const title = document.createElement('div');
            title.innerText = item.name;
            title.style.flex = '1';
            title.style.whiteSpace = 'nowrap';
            title.style.overflow = 'hidden';
            title.style.textOverflow = 'ellipsis';

            const actionContainer = document.createElement('div');
            actionContainer.style.width = '1.5rem';
            actionContainer.style.height = '1.5rem';
            actionContainer.innerHTML = createHamburgerIconSVG(24, '#3366ff');

            card.appendChild(iconContainer);
            card.appendChild(title);
            card.appendChild(actionContainer);
            wrapper.appendChild(card);

            const hint = document.createElement('div');
            hint.style.width = '22.375rem';
            hint.style.height = '2.75rem';
            hint.style.marginTop = '-0.475rem';
            hint.style.borderRadius = '0.5rem';
            hint.style.background = '#3366FF';
            hint.style.display = 'none';
            hint.style.alignItems = 'center';
            hint.style.justifyContent = 'center';
            hint.style.color = '#fff';
            hint.style.fontSize = '0.875rem';
            hint.style.zIndex = '-1';
            hint.style.padding = '0 1rem';

            const hintText = document.createElement('span');
            hintText.style.whiteSpace = 'nowrap';
            hintText.style.overflow = 'hidden';
            hintText.style.textOverflow = 'ellipsis';
            hint.appendChild(hintText);
            wrapper.appendChild(hint);

            const controller = {
                showDropHint(text) {
                    hint.style.display = 'flex';
                    hintText.innerText = text;
                },
                hideDropHint() {
                    hint.style.display = 'none';
                },
            };

            return { el: wrapper, offsetX: 330, offsetY: 24, controller };
        },
        getDropHintText: (source, target) => {
            const selectedCount = selectedFiles?.size ?? 0;
            const isBatch = selectedCount > 1 && selectedFiles.has(source.id);
            const prefix = isBatch ? '将选中区域移入至' : '将区域移入至';
            return `${prefix}【${target.name}】`;
        },
        onDrop: (source, target) => {
            const sourceItems = (selectedFiles?.has(source.id))
                ? files.filter(f => selectedFiles.has(f.id))
                : [source];

            setFolders(prev => prev.map(f =>
                f.id === target.id
                    ? { ...f, items: [...f.items, ...sourceItems.map(si => si.name)] }
                    : f
            ));
            setFiles(prev => prev.filter(f => !sourceItems.find(si => si.id === f.id)));
        }
    });

    return (
        <div className="w-full flex flex-col space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Source Files</h4>
                    {files.map(file => (
                        <div
                            key={file.id}
                            draggable
                            onDragStart={(e) => dragDrop.handleDragStart(file, e)}
                            onDragEnd={dragDrop.handleDragEnd}
                            className={`flex items-center space-x-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-grab active:cursor-grabbing hover:border-blue-600/50 transition-colors shadow-sm group ${selectedFiles?.has(file.id) ? 'ring-2 ring-blue-600/20 bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                        >
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                                {file.type === 'pdf' ? <FileText className="w-4 h-4 text-red-500" /> : <ImageIcon className="w-4 h-4 text-blue-500" />}
                            </div>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-grow">{file.name}</span>
                            <GripVertical className="w-4 h-4 text-slate-200" />
                        </div>
                    ))}
                    {files.length === 0 && <div className="text-center py-8 text-slate-400 text-xs italic">All files moved.</div>}
                </div>

                <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Drop Targets</h4>
                    {folders.map(folder => (
                        <div
                            key={folder.id}
                            onDragOver={(e) => dragDrop.handleDragOver(folder, e)}
                            onDragLeave={dragDrop.handleDragLeave}
                            onDrop={(e) => dragDrop.handleDrop(folder, e)}
                            className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all duration-300 ${dragDrop.dragOverItem?.id === folder.id ? 'border-blue-600 bg-blue-600/5 dark:bg-blue-600/10 scale-[1.02]' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'}`}
                        >
                            <Box className={`w-6 h-6 ${dragDrop.dragOverItem?.id === folder.id ? 'text-blue-600' : 'text-slate-300'}`} />
                            <span className={`text-xs font-bold ${dragDrop.dragOverItem?.id === folder.id ? 'text-blue-600' : 'text-slate-500'}`}>{folder.name}</span>
                            {folder.items.length > 0 && (
                                <div className="flex flex-wrap gap-1 justify-center mt-2">
                                    {folder.items.map((item, i) => <span key={i} className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-400">{item}</span>)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FileTransferDemo;
