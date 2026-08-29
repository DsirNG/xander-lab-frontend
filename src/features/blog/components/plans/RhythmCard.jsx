import React from 'react';
import { useTranslation } from 'react-i18next';

const RhythmCard = () => {
  const { t } = useTranslation();
  const days = [
    t('blogPlans.days.mon', '一'),
    t('blogPlans.days.tue', '二'),
    t('blogPlans.days.wed', '三'),
    t('blogPlans.days.thu', '四'),
    t('blogPlans.days.fri', '五'),
    t('blogPlans.days.sat', '六'),
    t('blogPlans.days.sun', '日')
  ];
  const values = [20, 30, 40, 100, 50, 10, 15]; // percentages
  
  return (
    <div className="flex flex-col shrink-0 rounded-[20px] bg-white p-5 shadow-sm min-h-[200px]">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="text-base font-bold text-ink min-w-0 truncate" title={t('blogPlans.publishRhythm', '发布节奏')}>{t('blogPlans.publishRhythm', '发布节奏')}</h3>
        <button className="text-[13px] font-medium text-blue-600 hover:opacity-80 transition-opacity shrink-0">
          {t('blogPlans.editRhythm', '编辑节奏')}
        </button>
      </div>

      <div className="mb-2">
        <div className="text-[13px] font-medium text-ink-muted mb-1">{t('blogPlans.dailyPublish', '每日发布')}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-[26px] font-bold text-ink tracking-tight">2.1</span>
          <span className="text-[13px] text-ink-muted">{t('blogPlans.unitPosts', '篇')}</span>
        </div>
      </div>

      <div className="flex items-end justify-between h-[68px] pt-4 mt-auto">
        {days.map((day, i) => {
          const isToday = i === 3;
          return (
            <div key={day} className="flex flex-col items-center gap-2.5 w-full">
               <div className="w-[10px] bg-surface-muted rounded-full overflow-hidden flex flex-col justify-end" style={{ height: '42px' }}>
                  <div 
                    className={`w-full rounded-full transition-all duration-500 ${isToday ? 'bg-indigo-500' : 'bg-border-strong/50'}`} 
                    style={{ height: `${values[i]}%` }}
                  ></div>
               </div>
               <div className="text-[11px] text-ink-muted font-medium">{day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RhythmCard;
