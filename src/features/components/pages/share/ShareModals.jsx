import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
    Info, FileCode, Edit2,
    Trash2, HelpCircle, Compass
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import TourSpotlight from '@/components/common/TourSpotlight';

const ShareModals = ({
    // Modal visibility
    addModalOpen,
    deleteModalOpen,
    helpModalOpen,
    editScenarioModalOpen,
    tourWelcomeOpen,
    // Modal handlers
    onCloseAddModal,
    onAddFileSubmit,
    onCloseDeleteModal,
    onConfirmDeleteFile,
    onCloseHelpModal,
    onApplySample,
    onCloseEditScenarioModal,
    onEditScenarioSubmit,
    onTourWelcomeSkip,
    onTourWelcomeStart,
    onTourSpotlightSkip,
    // Form state
    newFileName,
    setNewFileName,
    fileToDeleteIdx,
    helpType,
    editScenTitleZh,
    setEditScenTitleZh,
    editScenTitleEn,
    setEditScenTitleEn,
    // Data
    libFiles,
    // Tour
    currentTourTarget,
}) => {
    const { t } = useTranslation();
    return (
        <>
            {/* --- Add File Modal --- */}
            <Modal
                isOpen={addModalOpen}
                onClose={onCloseAddModal}
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
                            <FileCode className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-[14px]">{t('components.share.modals.newFile')}</span>
                    </div>
                }
                width="max-w-[400px]"
                footer={
                    <>
                        <button onClick={onCloseAddModal} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100  transition-all">{t('components.share.modals.cancel')}</button>
                        <button onClick={onAddFileSubmit} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-700 shadow-lg shadow-primary/20 active:scale-95 transition-all">{t('components.share.modals.confirmCreate')}</button>
                    </>
                }
            >
                <div className="space-y-4 py-2">
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 block mb-2">File Name</label>
                        <input
                            autoFocus
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') onAddFileSubmit(); }}
                            className="w-full px-4 py-3 bg-slate-50  border border-slate-200  rounded-2xl text-[13px] font-mono text-slate-900  focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300 "
                            placeholder="e.g. Button.tsx"
                        />
                    </div>
                    <div className="bg-amber-50 text-amber-600 p-3 flex gap-3 text-xs rounded-xl font-medium border border-amber-100 ">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>{t('components.share.modals.fileExtensionHint')} <code className="bg-amber-100/50 px-1 py-0.5 rounded font-black italic">.jsx</code>, <code className="bg-amber-100/50 px-1 py-0.5 rounded font-black italic">.ts</code>, <code className="bg-amber-100/50 px-1 py-0.5 rounded font-black italic">.tsx</code>。</p>
                    </div>
                </div>
            </Modal>

            {/* --- Delete File Modal --- */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={onCloseDeleteModal}
                title={t('components.share.modals.deleteConfirm')}
                width="max-w-[360px]"
                footer={
                    <>
                        <button onClick={onCloseDeleteModal} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100  transition-all">{t('components.share.modals.cancel')}</button>
                        <button onClick={onConfirmDeleteFile} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-2">
                            <Trash2 className="w-3.5 h-3.5" /> {t('components.share.modals.confirmDelete')}
                        </button>
                    </>
                }
            >
                <div className="py-2 text-[14px] font-medium flex items-start gap-4 text-slate-600 ">
                    <div className="w-10 h-10 rounded-full bg-rose-100/50 text-rose-500 shrink-0 flex items-center justify-center border border-rose-200/50">
                        <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                        {t('components.share.modals.deleteWarning')}<br />
                        <span className="text-slate-900  font-black italic border-b border-rose-200 mt-2 inline-block">
                            {fileToDeleteIdx !== null ? libFiles[fileToDeleteIdx].name : ''}
                        </span>
                        <p className="text-[12px] text-slate-400 mt-2">{t('components.share.modals.deleteLoseWarning')}</p>
                    </div>
                </div>
            </Modal>

            {/* --- Help Modal --- */}
            <Modal
                isOpen={helpModalOpen}
                onClose={onCloseHelpModal}
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-[14px]">{t('components.share.modals.presetSamples')} - {helpType.toUpperCase()}</span>
                    </div>
                }
                width="max-w-[420px]"
                footer={
                    <>
                        <button onClick={onCloseHelpModal} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100  transition-all">{t('components.share.modals.cancel')}</button>
                        <button id="tour-apply-btn" onClick={onApplySample} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-700 shadow-lg shadow-primary/20 active:scale-95 transition-all relative z-10">
                            {t('components.share.modals.oneClickLoad')}
                        </button>
                    </>
                }
            >
                <div className="py-2 text-[13px] text-slate-600  leading-relaxed font-medium">
                    {t('components.share.modals.helpIntro')} <strong>『全局物理通知组件 (Toast)』</strong>。<br /><br />
                    {helpType === 'meta' && t('components.share.modals.helpMeta')}
                    {helpType === 'scenario' && t('components.share.modals.helpScenario')}
                    {helpType === 'logic' && t('components.share.modals.helpLogic')}
                    {helpType === 'env' && t('components.share.modals.helpEnv')}
                    {helpType === 'css' && t('components.share.modals.helpCss')}
                </div>
            </Modal>

            {/* --- Edit Scenario Modal --- */}
            <Modal
                isOpen={editScenarioModalOpen}
                onClose={onCloseEditScenarioModal}
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
                            <Edit2 className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-[14px]">{t('components.share.modals.editScenario')}</span>
                    </div>
                }
                width="max-w-[400px]"
                footer={
                    <>
                        <button onClick={onCloseEditScenarioModal} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100  transition-all">{t('components.share.modals.cancel')}</button>
                        <button onClick={onEditScenarioSubmit} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-700 shadow-lg shadow-primary/20 active:scale-95 transition-all">
                            {t('components.share.modals.saveChanges')}
                        </button>
                    </>
                }
            >
                <div className="space-y-4 py-2">
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 block mb-2">{t('components.share.modals.chineseName')}</label>
                        <input
                            autoFocus
                            value={editScenTitleZh}
                            onChange={(e) => setEditScenTitleZh(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') onEditScenarioSubmit(); }}
                            className="w-full px-4 py-3 bg-slate-50  border border-slate-200  rounded-2xl text-[13px] font-bold text-slate-900  focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300"
                            placeholder={t('components.share.modals.chineseNamePlaceholder')}
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 block mb-2">English Title</label>
                        <input
                            value={editScenTitleEn}
                            onChange={(e) => setEditScenTitleEn(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') onEditScenarioSubmit(); }}
                            className="w-full px-4 py-3 bg-slate-50  border border-slate-200  rounded-2xl text-[13px] font-bold text-slate-900  focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300"
                            placeholder="e.g. Interaction Study"
                        />
                    </div>
                </div>
            </Modal>

            {/* --- Tour Welcome Modal --- */}
            <Modal
                isOpen={tourWelcomeOpen}
                onClose={onTourWelcomeSkip}
                title={t('components.share.modals.welcomeTitle')}
                footer={
                    <>
                        <button onClick={onTourWelcomeSkip} className="px-5 py-2.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-all">
                            {t('components.share.modals.welcomeReject')}
                        </button>
                        <button onClick={onTourWelcomeStart} className="px-6 py-2.5 bg-primary hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center gap-2">
                            <Compass className="w-4 h-4" /> {t('components.share.modals.startTour')}
                        </button>
                    </>
                }
            >
                <div className="text-slate-600  text-[13px] leading-loose">
                    {t('components.share.modals.welcomeDesc')}
                </div>
            </Modal>

            {/* --- Tour Spotlight --- */}
            <TourSpotlight targetConfig={currentTourTarget} onSkip={onTourSpotlightSkip} />
        </>
    );
};

ShareModals.propTypes = {
    // Modal visibility
    addModalOpen: PropTypes.bool.isRequired,
    deleteModalOpen: PropTypes.bool.isRequired,
    helpModalOpen: PropTypes.bool.isRequired,
    editScenarioModalOpen: PropTypes.bool.isRequired,
    tourWelcomeOpen: PropTypes.bool.isRequired,
    // Modal handlers
    onCloseAddModal: PropTypes.func.isRequired,
    onAddFileSubmit: PropTypes.func.isRequired,
    onCloseDeleteModal: PropTypes.func.isRequired,
    onConfirmDeleteFile: PropTypes.func.isRequired,
    onCloseHelpModal: PropTypes.func.isRequired,
    onApplySample: PropTypes.func.isRequired,
    onCloseEditScenarioModal: PropTypes.func.isRequired,
    onEditScenarioSubmit: PropTypes.func.isRequired,
    onTourWelcomeSkip: PropTypes.func.isRequired,
    onTourWelcomeStart: PropTypes.func.isRequired,
    onTourSpotlightSkip: PropTypes.func.isRequired,
    // Form state
    newFileName: PropTypes.string.isRequired,
    setNewFileName: PropTypes.func.isRequired,
    fileToDeleteIdx: PropTypes.number,
    helpType: PropTypes.string.isRequired,
    editScenTitleZh: PropTypes.string.isRequired,
    setEditScenTitleZh: PropTypes.func.isRequired,
    editScenTitleEn: PropTypes.string.isRequired,
    setEditScenTitleEn: PropTypes.func.isRequired,
    // Data
    libFiles: PropTypes.array.isRequired,
    // Tour
    currentTourTarget: PropTypes.object,
};

export default ShareModals;
