import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
    Plus, Boxes, FileCode,
    Palette, Trash2, ChevronUp, ChevronDown, X, HelpCircle, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
    { id: 'logic', nameKey: 'components.share.drawer.logic', icon: FileCode },
    { id: 'env', nameKey: 'components.share.drawer.env', icon: Layout },
    { id: 'css', nameKey: 'components.share.drawer.css', icon: Palette },
];

const ShareDrawer = ({
    drawerOpen,
    setDrawerOpen,
    infTab,
    setInfTab,
    libFiles,
    activeLibIdx,
    setActiveLibIdx,
    wrapperCode,
    setWrapperCode,
    cssCode,
    setCssCode,
    onAddFile,
    onDeleteFile,
    tourIds,
    onLibFileContentChange,
    onHelpClick,
}) => {
    const { t } = useTranslation();
    return (
        <div className={`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-[70] transition-all duration-350 shadow-[0_-20px_50px_rgba(0,0,0,0.06)] flex flex-col ${drawerOpen ? 'h-[60vh] md:h-[50vh] lg:h-[550px]' : 'h-14'}`}>
            <div className="h-14 flex-shrink-0 flex items-center justify-between px-4 lg:px-10 border-b border-slate-50">
                <div className="flex items-center gap-3 lg:gap-10 h-full">
                    <div className="hidden lg:flex items-center gap-2 text-slate-300">
                        <Boxes className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">{t('components.share.drawer.coreArchitecture')}</span>
                    </div>
                    <div className="hidden lg:block h-4 w-px bg-slate-100" />
                    <div className="flex h-full">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setInfTab(tab.id); setDrawerOpen(true); }}
                                className={`relative h-full flex items-center gap-1.5 lg:gap-2.5 px-3 lg:px-6 text-[10px] font-black uppercase tracking-widest transition-all ${infTab === tab.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <tab.icon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t(tab.nameKey)}</span>
                                {infTab === tab.id && <motion.div layoutId="itab_line" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-t-lg" />}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    className="flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-4 py-1.5 lg:py-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-primary transition-all border border-slate-100"
                >
                    <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">{drawerOpen ? t('components.share.drawer.collapseConsole') : t('components.share.drawer.viewArchitecture')}</span>
                    {drawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden bg-slate-50">
                <AnimatePresence mode="wait">
                    {infTab === 'logic' && (
                        <motion.div key="logic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex h-full overflow-hidden">
                            <div className="w-36 md:w-48 lg:w-64 flex-shrink-0 bg-white border-r border-slate-200 p-3 lg:p-4 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <div className="flex items-center gap-2 relative z-10">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Files</span>
                                        <button id={tourIds.logicHelp} onClick={() => onHelpClick('logic')} className="p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-primary transition-colors"><HelpCircle className="w-3.5 h-3.5" /></button>
                                    </div>
                                    <button onClick={onAddFile} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-primary transition-colors">
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1 pb-4">
                                    {libFiles.map((f, i) => (
                                        <button key={i} onClick={() => setActiveLibIdx(i)} className={`w-full px-4 py-3 rounded-xl text-left text-[11px] font-black truncate transition-all flex items-center justify-between group ${activeLibIdx === i ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'}`}>
                                            <span className="flex items-center gap-2 truncate"><FileCode className="w-4 h-4 opacity-40 flex-shrink-0" /> <span className="truncate">{f.name}</span></span>
                                            {libFiles.length > 1 && (
                                                <div
                                                    onClick={(e) => onDeleteFile(e, i)}
                                                    className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-all ${activeLibIdx === i ? 'hover:bg-primary-500' : 'hover:bg-slate-200'}`}
                                                >
                                                    <X className="w-3 h-3" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 h-full relative">
                                <textarea
                                    value={libFiles[activeLibIdx]?.content || ''}
                                    onChange={e => onLibFileContentChange(e.target.value)}
                                    className="absolute inset-0 w-full h-full bg-white p-10 text-[14px] font-mono text-slate-700 outline-none resize-none custom-scrollbar leading-relaxed"
                                    spellCheck={false}
                                />
                            </div>
                        </motion.div>
                    )}
                    {infTab === 'env' && (
                        <motion.div key="env" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 h-full relative">
                            <div className="absolute top-4 right-8 z-10">
                                <button id={tourIds.envHelp} onClick={() => onHelpClick('env')} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-primary transition-colors shadow-sm bg-white border border-slate-100" title={t('components.share.drawer.wrapperHint')}><HelpCircle className="w-4 h-4" /></button>
                            </div>
                            <textarea value={wrapperCode} onChange={e => setWrapperCode(e.target.value)} className="absolute inset-0 w-full h-full bg-white p-10 text-[14px] font-mono text-slate-700 outline-none resize-none" spellCheck={false} />
                        </motion.div>
                    )}
                    {infTab === 'css' && (
                        <motion.div key="css" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 h-full relative">
                            <div className="absolute top-4 right-8 z-10">
                                <button id={tourIds.cssHelp} onClick={() => onHelpClick('css')} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-primary transition-colors shadow-sm bg-white border border-slate-100" title={t('components.share.drawer.cssHint')}><HelpCircle className="w-4 h-4" /></button>
                            </div>
                            <textarea value={cssCode} onChange={e => setCssCode(e.target.value)} className="absolute inset-0 w-full h-full bg-white p-10 text-[14px] font-mono text-slate-700 outline-none resize-none" spellCheck={false} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

ShareDrawer.propTypes = {
    drawerOpen: PropTypes.bool.isRequired,
    setDrawerOpen: PropTypes.func.isRequired,
    infTab: PropTypes.string.isRequired,
    setInfTab: PropTypes.func.isRequired,
    libFiles: PropTypes.array.isRequired,
    activeLibIdx: PropTypes.number.isRequired,
    setActiveLibIdx: PropTypes.func.isRequired,
    wrapperCode: PropTypes.string.isRequired,
    setWrapperCode: PropTypes.func.isRequired,
    cssCode: PropTypes.string.isRequired,
    setCssCode: PropTypes.func.isRequired,
    onAddFile: PropTypes.func.isRequired,
    onDeleteFile: PropTypes.func.isRequired,
    tourIds: PropTypes.shape({
        logicHelp: PropTypes.string,
        envHelp: PropTypes.string,
        cssHelp: PropTypes.string,
    }).isRequired,
    onLibFileContentChange: PropTypes.func.isRequired,
    onHelpClick: PropTypes.func.isRequired,
};

export default ShareDrawer;
