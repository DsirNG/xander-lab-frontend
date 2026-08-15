import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
    Plus, Zap, Database,
    FileCode, Edit2,
    Trash2, HelpCircle
} from 'lucide-react';
import Button from '@components/common/Button';

const ShareSidebar = ({
    meta,
    setMeta,
    scenarios,
    activeSIdx,
    setActiveSIdx,
    onAddScenario,
    onEditScenario,
    onDeleteScenario,
    onHelpClick,
    tourIds,
    isSidebarOpen,
    onToggleSidebar,
}) => {
    const { t } = useTranslation();
    return (
        <>
            {/* 移动端遮罩层 */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 z-30"
                    style={{ top: '64px' }}
                    onClick={onToggleSidebar}
                />
            )}

            <aside className={`
                fixed lg:static
                top-[64px] left-0 bottom-0
                w-[80vw] max-w-[300px] sm:w-[300px] md:w-[300px] lg:w-[320px] flex-shrink-0
                bg-canvas border-r border-border flex flex-col overflow-y-auto custom-scrollbar
                transform transition-transform duration-300 ease-in-out z-40
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
            <div className="p-6 space-y-10">
                <section className="space-y-6">
                    <div className="text-micro font-black text-ink-faint uppercase tracking-widest italic flex items-center justify-between">
                        <span className="flex items-center gap-2"><Database className="w-4 h-4 text-accent" /> {t('components.share.sidebar.registerMeta')}</span>
                        <Button id={tourIds.metaHelp} onClick={() => onHelpClick('meta')} variant="ghost" size="xs" className="h-auto w-auto p-1 rounded text-ink-faint hover:bg-surface hover:text-accent transition-colors relative z-10"><HelpCircle className="w-4 h-4" /></Button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-micro font-black text-ink-faint uppercase tracking-widest pl-1">{t('components.share.sidebar.titleZh')}</label>
                            <input value={meta.titleZh} onChange={e => setMeta({ ...meta, titleZh: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-micro font-bold focus:border-accent focus:bg-canvas transition-all outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-micro font-black text-ink-faint uppercase tracking-widest pl-1">English Title</label>
                            <input value={meta.titleEn} onChange={e => setMeta({ ...meta, titleEn: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-micro font-bold focus:border-accent focus:bg-canvas transition-all outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-micro font-black text-ink-faint uppercase tracking-widest pl-1">{t('components.share.sidebar.descLabel')}</label>
                            <textarea value={meta.descriptionZh} onChange={e => setMeta({ ...meta, descriptionZh: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-micro h-16 outline-none focus:border-accent transition-all resize-none mb-2" placeholder={t('components.share.sidebar.descZhPlaceholder')} />
                            <textarea value={meta.descriptionEn} onChange={e => setMeta({ ...meta, descriptionEn: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-micro h-16 outline-none focus:border-accent transition-all resize-none" placeholder="English Detail..." />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-xl">
                            <span className="text-micro font-black text-ink-faint uppercase tracking-widest">Version</span>
                            <input value={meta.version} onChange={e => setMeta({ ...meta, version: e.target.value })} className="w-16 bg-transparent text-right text-accent font-black italic text-caption outline-none" />
                        </div>
                    </div>
                </section>

                <div className="h-px bg-border" />

                <section className="space-y-4 pb-24">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-micro font-black text-ink-faint uppercase tracking-widest italic flex items-center gap-2">
                            <Zap className="w-4 h-4 text-warning" /> {t('components.share.sidebar.testScenarios')}
                        </span>
                        <div className="flex items-center gap-1 relative z-10">
                            <Button id={tourIds.scenarioHelp} onClick={() => onHelpClick('scenario')} variant="ghost" size="xs" className="h-auto w-auto p-1 rounded-lg text-ink-faint hover:bg-surface hover:text-accent transition-colors">
                                <HelpCircle className="w-4 h-4" />
                            </Button>
                            <Button onClick={onAddScenario} variant="ghost" size="xs" className="h-auto w-auto p-1 rounded-lg text-accent transition-all active:scale-125">
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {scenarios.map((s, i) => (
                            <div key={s.id} onClick={() => setActiveSIdx(i)} className={`relative group px-5 py-4 rounded-2xl cursor-pointer border transition-all ${activeSIdx === i ? 'bg-accent-soft border-accent shadow-sm' : 'bg-canvas border-border hover:border-border-strong'}`}>
                                <div className={`text-micro font-black uppercase italic mb-1 ${activeSIdx === i ? 'text-accent-fg' : 'text-ink'}`}>{s.titleEn}</div>
                                <div className={`text-micro font-bold ${activeSIdx === i ? 'text-accent' : 'text-ink-faint'}`}>{s.titleZh}</div>
                                <div className="absolute top-4 right-4 flex sm:opacity-0 sm:group-hover:opacity-100 transition-all gap-1">
                                    <Button
                                        onClick={(e) => { e.stopPropagation(); onEditScenario(i); }}
                                        variant="ghost"
                                        size="xs"
                                        className={`h-auto w-auto p-1.5 rounded transition-all outline-none ${activeSIdx === i ? 'text-accent/40 hover:text-accent' : 'text-ink-faint hover:text-accent'}`}
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </Button>
                                    {scenarios.length > 1 && (
                                        <Button
                                            onClick={(e) => { e.stopPropagation(); onDeleteScenario(i); }}
                                            variant="ghost"
                                            size="xs"
                                            className={`h-auto w-auto p-1.5 rounded transition-all outline-none ${activeSIdx === i ? 'text-accent/40 hover:text-danger' : 'text-ink-faint hover:text-danger'}`}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </aside>
        </>
    );
};

ShareSidebar.propTypes = {
    meta: PropTypes.object.isRequired,
    setMeta: PropTypes.func.isRequired,
    scenarios: PropTypes.array.isRequired,
    activeSIdx: PropTypes.number.isRequired,
    setActiveSIdx: PropTypes.func.isRequired,
    onAddScenario: PropTypes.func.isRequired,
    onEditScenario: PropTypes.func.isRequired,
    onDeleteScenario: PropTypes.func.isRequired,
    onHelpClick: PropTypes.func.isRequired,
    tourIds: PropTypes.shape({
        metaHelp: PropTypes.string,
        scenarioHelp: PropTypes.string,
    }).isRequired,
    isSidebarOpen: PropTypes.bool,
    onToggleSidebar: PropTypes.func,
};

export default ShareSidebar;
