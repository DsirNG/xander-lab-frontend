import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Share2, Compass } from 'lucide-react';
import Button from '@components/common/Button';

const ShareHeader = ({ onPublish, onTourStart, onNavigateBack }) => {
    const { t } = useTranslation();
    return (
        <header className="h-16 flex-shrink-0 bg-canvas border-b border-border flex items-center justify-between px-3 sm:px-8 z-50 shadow-sm gap-3">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30 flex-shrink-0 cursor-pointer" onClick={onNavigateBack}>
                    {/*<Command className="w-5 h-5 text-white" />*/}
                    <img src="https://xander.dsircity.top/favicon.png" alt="" className="w-6 h-6 rounded-lg" />
                </div>
                <div className="min-w-0">
                    <div className="text-caption sm:text-body font-black uppercase italic tracking-widest mb-0.5 truncate">{t('components.share.header.title')}</div>
                    <span className="text-micro font-black text-ink-faint uppercase tracking-tighter flex items-center gap-2">
                        Architecture Synchronized // <div className="w-1.5 h-1.5 rounded-full bg-success" /> ACTIVE
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <Button onClick={onTourStart} variant="outline" size="sm" icon={Compass} className="text-ink-faint hover:text-accent hover:bg-surface font-black active:scale-95" title={t('components.share.header.restartTour')}>
                    <span className="hidden sm:inline">{t('components.share.header.tour')}</span>
                </Button>
                <Button onClick={onPublish} variant="primary" size="sm" icon={Share2} className="font-black active:scale-95 shadow-xl shadow-accent/20">
                    <span className="hidden sm:inline">{t('components.share.header.publish')}</span>
                </Button>
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
