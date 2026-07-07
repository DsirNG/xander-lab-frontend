import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Share2, Compass } from 'lucide-react';

const ShareHeader = ({ onPublish, onTourStart, onNavigateBack }) => {
    const { t } = useTranslation();
    return (
        <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-50 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30" onClick={onNavigateBack}>
                    {/*<Command className="w-5 h-5 text-white" />*/}
                    <img src="https://xander-lab.dsircity.top/favicon.png" alt="" />
                </div>
                <div>
                    <h1 className="text-[13px] font-black uppercase italic tracking-widest mb-0.5">{t('components.share.header.title')}</h1>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                        Architecture Synchronized // <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={onTourStart} className="px-3 sm:px-5 py-2 sm:py-3 text-slate-400 hover:text-primary hover:bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black transition-all active:scale-95 flex items-center gap-2" title={t('components.share.header.restartTour')}>
                    <Compass className="w-4 h-4" /> <span className="hidden sm:inline">{t('components.share.header.tour')}</span>
                </button>
                <button onClick={onPublish} className="px-4 sm:px-10 py-2 sm:py-3 bg-primary hover:bg-primary-600 text-white rounded-2xl text-[10px] font-black shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-2">
                    <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">{t('components.share.header.publish')}</span>
                </button>
            </div>
        </header>
    );
};

ShareHeader.propTypes = {
    onPublish: PropTypes.func.isRequired,
    onTourStart: PropTypes.func.isRequired,
    onNavigateBack: PropTypes.func.isRequired,
};

export default ShareHeader;
