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
    deleteScenarioModalOpen,
    helpModalOpen,
    editScenarioModalOpen,
    tourWelcomeOpen,
    // Modal handlers
    onCloseAddModal,
    onAddFileSubmit,
    onCloseDeleteModal,
    onConfirmDeleteFile,
    onCloseDeleteScenarioModal,
    onConfirmDeleteScenario,
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
    scenarioToDeleteIdx,
    helpType,
    editScenTitleZh,
    setEditScenTitleZh,
    editScenTitleEn,
    setEditScenTitleEn,
    // Data
    libFiles,
    scenarios = [],
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
                        <div className="w-8 h-8 rounded-xl bg-accent-soft flex items-center justify-center">
                            <FileCode className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-body">{t('components.share.modals.newFile')}</span>
                    </div>
                }
                width="max-w-[400px]"
                footer={
                    <>
                        <button onClick={onCloseAddModal} className="px-5 py-2.5 rounded-xl text-caption font-bold text-ink-muted hover:bg-surface-muted  transition-all">{t('components.share.modals.cancel')}</button>
                        <button onClick={onAddFileSubmit} className="px-6 py-2.5 rounded-xl text-caption font-bold text-white bg-accent hover:bg-accent-700 shadow-lg shadow-accent/20 active:scale-95 transition-all">{t('components.share.modals.confirmCreate')}</button>
                    </>
                }
            >
                <div className="space-y-4 py-2">
                    <div>
                        <label className="text-micro font-black text-ink-faint uppercase tracking-widest pl-1 block mb-2">File Name</label>
                        <input
                            autoFocus
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') onAddFileSubmit(); }}
                            className="w-full px-4 py-3 bg-surface  border border-border  rounded-2xl text-body font-mono text-ink  focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all placeholder:text-ink-faint "
                            placeholder="e.g. Button.tsx"
                        />
                    </div>
                    <div className="bg-warning-soft text-warning p-3 flex gap-3 text-caption rounded-xl font-medium border border-warning/20 ">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>{t('components.share.modals.fileExtensionHint')} <code className="bg-warning/10 px-1 py-0.5 rounded font-black italic">.jsx</code>, <code className="bg-warning/10 px-1 py-0.5 rounded font-black italic">.ts</code>, <code className="bg-warning/10 px-1 py-0.5 rounded font-black italic">.tsx</code>。</p>
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
                        <button onClick={onCloseDeleteModal} className="px-5 py-2.5 rounded-xl text-caption font-bold text-ink-muted hover:bg-surface-muted  transition-all">{t('components.share.modals.cancel')}</button>
                        <button onClick={onConfirmDeleteFile} className="px-6 py-2.5 rounded-xl text-caption font-bold text-white bg-danger hover:bg-danger-fg shadow-lg shadow-danger/20 active:scale-95 transition-all flex items-center gap-2">
                            <Trash2 className="w-3.5 h-3.5" /> {t('components.share.modals.confirmDelete')}
                        </button>
                    </>
                }
            >
                <div className="py-2 text-body font-medium flex items-start gap-4 text-ink-muted ">
                    <div className="w-10 h-10 rounded-full bg-danger-soft text-danger shrink-0 flex items-center justify-center border border-danger/30">
                        <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                        {t('components.share.modals.deleteWarning')}<br />
                        <span className="text-ink  font-black italic border-b border-danger/30 mt-2 inline-block">
                            {fileToDeleteIdx !== null ? libFiles[fileToDeleteIdx].name : ''}
                        </span>
                        <p className="text-caption text-ink-faint mt-2">{t('components.share.modals.deleteLoseWarning')}</p>
                    </div>
                </div>
            </Modal>

            {/* --- Delete Scenario Modal --- */}
            <Modal
                isOpen={deleteScenarioModalOpen}
                onClose={onCloseDeleteScenarioModal}
                title={t('components.share.modals.deleteScenarioConfirm')}
                width="max-w-[360px]"
                footer={
                    <>
                        <button onClick={onCloseDeleteScenarioModal} className="px-5 py-2.5 rounded-xl text-caption font-bold text-ink-muted hover:bg-surface-muted transition-all">{t('components.share.modals.cancel')}</button>
                        <button onClick={onConfirmDeleteScenario} className="px-6 py-2.5 rounded-xl text-caption font-bold text-white bg-danger hover:bg-danger-fg shadow-lg shadow-danger/20 active:scale-95 transition-all flex items-center gap-2">
                            <Trash2 className="w-3.5 h-3.5" /> {t('components.share.modals.confirmDelete')}
                        </button>
                    </>
                }
            >
                <div className="py-2 text-body font-medium flex items-start gap-4 text-ink-muted">
                    <div className="w-10 h-10 rounded-full bg-danger-soft text-danger shrink-0 flex items-center justify-center border border-danger/30">
                        <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                        {t('components.share.modals.deleteScenarioWarning')}<br />
                        <span className="text-ink font-black italic border-b border-danger/30 mt-2 inline-block">
                            {scenarioToDeleteIdx !== null
                                ? (scenarios[scenarioToDeleteIdx]?.titleZh || scenarios[scenarioToDeleteIdx]?.titleEn || '')
                                : ''}
                        </span>
                        <p className="text-caption text-ink-faint mt-2">{t('components.share.modals.deleteScenarioLoseWarning')}</p>
                    </div>
                </div>
            </Modal>

            {/* --- Help Modal --- */}
            <Modal
                isOpen={helpModalOpen}
                onClose={onCloseHelpModal}
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-accent-soft flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-body">{t('components.share.modals.presetSamples')} - {helpType.toUpperCase()}</span>
                    </div>
                }
                width="max-w-[420px]"
                footer={
                    <>
                        <button onClick={onCloseHelpModal} className="px-5 py-2.5 rounded-xl text-caption font-bold text-ink-muted hover:bg-surface-muted  transition-all">{t('components.share.modals.cancel')}</button>
                        <button id="tour-apply-btn" onClick={onApplySample} className="px-6 py-2.5 rounded-xl text-caption font-bold text-white bg-accent hover:bg-accent-700 shadow-lg shadow-accent/20 active:scale-95 transition-all relative z-10">
                            {t('components.share.modals.oneClickLoad')}
                        </button>
                    </>
                }
            >
                <div className="py-2 text-body text-ink-muted  leading-relaxed font-medium">
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
                        <div className="w-8 h-8 rounded-xl bg-accent-soft flex items-center justify-center">
                            <Edit2 className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-body">{t('components.share.modals.editScenario')}</span>
                    </div>
                }
                width="max-w-[400px]"
                footer={
                    <>
                        <button onClick={onCloseEditScenarioModal} className="px-5 py-2.5 rounded-xl text-caption font-bold text-ink-muted hover:bg-surface-muted  transition-all">{t('components.share.modals.cancel')}</button>
                        <button onClick={onEditScenarioSubmit} className="px-6 py-2.5 rounded-xl text-caption font-bold text-white bg-accent hover:bg-accent-700 shadow-lg shadow-accent/20 active:scale-95 transition-all">
                            {t('components.share.modals.saveChanges')}
                        </button>
                    </>
                }
            >
                <div className="space-y-4 py-2">
                    <div>
                        <label className="text-micro font-black text-ink-faint uppercase tracking-widest pl-1 block mb-2">{t('components.share.modals.chineseName')}</label>
                        <input
                            autoFocus
                            value={editScenTitleZh}
                            onChange={(e) => setEditScenTitleZh(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') onEditScenarioSubmit(); }}
                            className="w-full px-4 py-3 bg-surface  border border-border  rounded-2xl text-body font-bold text-ink  focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all placeholder:text-ink-faint"
                            placeholder={t('components.share.modals.chineseNamePlaceholder')}
                        />
                    </div>
                    <div>
                        <label className="text-micro font-black text-ink-faint uppercase tracking-widest pl-1 block mb-2">English Title</label>
                        <input
                            value={editScenTitleEn}
                            onChange={(e) => setEditScenTitleEn(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') onEditScenarioSubmit(); }}
                            className="w-full px-4 py-3 bg-surface  border border-border  rounded-2xl text-body font-bold text-ink  focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all placeholder:text-ink-faint"
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
                        <button onClick={onTourWelcomeSkip} className="px-5 py-2.5 text-caption text-ink-muted hover:bg-surface-muted rounded-xl font-bold transition-all">
                            {t('components.share.modals.welcomeReject')}
                        </button>
                        <button onClick={onTourWelcomeStart} className="px-6 py-2.5 bg-accent hover:bg-accent-700 text-white rounded-xl text-caption font-bold shadow-xl shadow-accent/20 active:scale-95 transition-all flex items-center gap-2">
                            <Compass className="w-4 h-4" /> {t('components.share.modals.startTour')}
                        </button>
                    </>
                }
            >
                <div className="text-ink-muted  text-body leading-loose">
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
    deleteScenarioModalOpen: PropTypes.bool,
    helpModalOpen: PropTypes.bool.isRequired,
    editScenarioModalOpen: PropTypes.bool.isRequired,
    tourWelcomeOpen: PropTypes.bool.isRequired,
    // Modal handlers
    onCloseAddModal: PropTypes.func.isRequired,
    onAddFileSubmit: PropTypes.func.isRequired,
    onCloseDeleteModal: PropTypes.func.isRequired,
    onConfirmDeleteFile: PropTypes.func.isRequired,
    onCloseDeleteScenarioModal: PropTypes.func,
    onConfirmDeleteScenario: PropTypes.func,
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
    scenarioToDeleteIdx: PropTypes.number,
    helpType: PropTypes.string.isRequired,
    editScenTitleZh: PropTypes.string.isRequired,
    setEditScenTitleZh: PropTypes.func.isRequired,
    editScenTitleEn: PropTypes.string.isRequired,
    setEditScenTitleEn: PropTypes.func.isRequired,
    // Data
    libFiles: PropTypes.array.isRequired,
    scenarios: PropTypes.array,
    // Tour
    currentTourTarget: PropTypes.object,
};

export default ShareModals;
