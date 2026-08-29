import React from 'react';
import { useTranslation } from 'react-i18next';

const ArticlePerformanceCard = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col shrink-0 rounded-[20px] bg-white p-5 shadow-sm min-h-[220px]">
      <div className="text-base font-bold text-ink mb-4">{t('blogManage.performance', '发布表现')} <span className="text-sm font-normal text-ink-muted">({t('blogManage.recent7Days', '近7天')})</span></div>
      
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div>
          <div className="text-xs text-ink-muted mb-1">{t('blogManage.stats.views', '阅读量')}</div>
          <div className="text-xl font-bold text-ink mb-0.5">12.4w</div>
          <div className="text-[10px] font-medium text-green-500">↑ 18.6%</div>
        </div>
        <div>
          <div className="text-xs text-ink-muted mb-1">{t('blogManage.stats.likes', '点赞数')}</div>
          <div className="text-xl font-bold text-ink mb-0.5">2,860</div>
          <div className="text-[10px] font-medium text-green-500">↑ 12.3%</div>
        </div>
        <div>
          <div className="text-xs text-ink-muted mb-1">{t('blogManage.stats.engagement', '互动率')}</div>
          <div className="text-xl font-bold text-ink mb-0.5">3.21%</div>
          <div className="text-[10px] font-medium text-green-500">↑ 9.8%</div>
        </div>
      </div>

      {/* SVG Chart placeholder (mocking the line chart) */}
      <div className="relative h-[80px] w-full mt-auto">
        <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.2)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <path d="M 0 50 C 30 50, 40 30, 60 40 S 90 20, 110 30 S 140 10, 160 20 S 190 30, 210 20 S 240 50, 260 40 S 290 30, 300 20 L 300 80 L 0 80 Z" fill="url(#chart-gradient)" />
          
          {/* Line */}
          <path d="M 0 50 C 30 50, 40 30, 60 40 S 90 20, 110 30 S 140 10, 160 20 S 190 30, 210 20 S 240 50, 260 40 S 290 30, 300 20" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Dots */}
          <circle cx="60" cy="40" r="3" fill="white" stroke="#6366f1" strokeWidth="2" />
          <circle cx="110" cy="30" r="3" fill="white" stroke="#6366f1" strokeWidth="2" />
          <circle cx="160" cy="20" r="3" fill="white" stroke="#6366f1" strokeWidth="2" />
          <circle cx="210" cy="20" r="3" fill="white" stroke="#6366f1" strokeWidth="2" />
          <circle cx="260" cy="40" r="3" fill="white" stroke="#6366f1" strokeWidth="2" />
          <circle cx="300" cy="20" r="3" fill="white" stroke="#6366f1" strokeWidth="2" />
        </svg>

        {/* X-axis labels */}
        <div className="absolute -bottom-5 left-0 w-full flex justify-between text-[10px] text-ink-muted">
          <span>05-12</span>
          <span>05-13</span>
          <span>05-14</span>
          <span>05-15</span>
          <span>05-16</span>
          <span>05-17</span>
          <span>05-18</span>
        </div>
      </div>
    </div>
  );
};

export default ArticlePerformanceCard;
