import React from 'react';
import { useTranslation } from 'react-i18next';
import { PLAN_STATUS } from '../../services/blogPlanService';
import { Code, Link as LinkIcon, CalendarDays } from 'lucide-react';

const UpcomingCard = () => {
  const { t } = useTranslation();
  // Use mock data if API doesn't have upcoming plans yet to match the design
  const items = [
    {
      id: '1',
      title: '中级前端开发知识',
      time: t('blogPlans.timeFormat', '今天 12:51'),
      icon: Code,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-50'
    },
    {
      id: '2',
      title: '下载链路设计: File System Access API 实践',
      time: t('blogPlans.timeFormat2', '明天 12:00'),
      icon: LinkIcon,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50'
    },
    {
      id: '3',
      title: 'JavaScript 闭包深入理解',
      time: t('blogPlans.timeFormat3', '明天 20:00'),
      icon: CalendarDays,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-50'
    }
  ];

  return (
    <div className="flex flex-col shrink-0 rounded-[20px] bg-white p-5 shadow-sm flex-1 min-h-[240px]">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="text-base font-bold text-ink min-w-0 truncate" title={t('blogPlans.upcomingExecution', '即将执行')}>{t('blogPlans.upcomingExecution', '即将执行')}</h3>
        <button className="text-[13px] font-medium text-blue-600 hover:opacity-80 transition-opacity shrink-0">
          {t('blogPlans.viewAll', '查看全部')}
        </button>
      </div>

      <div className="flex flex-col gap-[22px]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3.5">
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${item.iconBg}`}>
               <item.icon className={`w-5 h-5 ${item.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-ink truncate mb-1" title={item.title}>{item.title}</div>
              <div className="text-[11px] text-ink-muted">{item.time}</div>
            </div>
            <div className="shrink-0 rounded-[6px] bg-indigo-50/80 px-2 py-0.5 text-[11px] font-medium text-indigo-600 border border-indigo-100/50">
              {t('blogPlans.upcomingExecution', '即将执行')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingCard;
