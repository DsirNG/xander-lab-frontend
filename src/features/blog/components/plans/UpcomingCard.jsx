import React from 'react';
import { PLAN_STATUS } from '../../services/blogPlanService';
import { Code, Link as LinkIcon, CalendarDays } from 'lucide-react';

const UpcomingCard = ({ plans }) => {
  // Sort and take top 3 upcoming
  const upcoming = plans
    .filter(p => p.status === PLAN_STATUS.ACTIVE || p.status === PLAN_STATUS.RUNNING)
    .sort((a, b) => new Date(a.nextRunAt) - new Date(b.nextRunAt))
    .slice(0, 3);

  // Use mock data if API doesn't have upcoming plans yet to match the design
  const items = upcoming.length > 0 ? upcoming.map((p, i) => ({
    id: p.id,
    title: p.topic,
    time: p.nextRunAt ? new Date(p.nextRunAt).toLocaleString() : '今天',
    icon: i === 0 ? Code : i === 1 ? LinkIcon : CalendarDays,
    iconColor: i === 0 ? 'text-warning-fg' : i === 1 ? 'text-accent' : 'text-purple-600',
    iconBg: i === 0 ? 'bg-warning-soft' : i === 1 ? 'bg-accent-soft' : 'bg-purple-50'
  })) : [
    {
      id: '1',
      title: '中级前端开发知识',
      time: '今天 12:51',
      icon: Code,
      iconColor: 'text-warning-fg',
      iconBg: 'bg-warning-soft'
    },
    {
      id: '2',
      title: '下载链路设计: File System Access API 实践',
      time: '明天 12:00',
      icon: LinkIcon,
      iconColor: 'text-accent',
      iconBg: 'bg-accent-soft'
    },
    {
      id: '3',
      title: 'JavaScript 闭包深入理解',
      time: '明天 20:00',
      icon: CalendarDays,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50'
    }
  ];

  return (
    <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm border border-border flex-1 min-h-[240px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-ink">即将执行</h3>
        <button className="text-sm font-medium text-accent hover:opacity-80 transition-opacity">
          查看全部
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${item.iconBg}`}>
               <item.icon className={`w-4.5 h-4.5 ${item.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-ink truncate" title={item.title}>{item.title}</div>
              <div className="text-xs text-ink-muted mt-0.5">{item.time}</div>
            </div>
            <div className="shrink-0 rounded-full border border-accent/20 bg-accent-soft px-2.5 py-0.5 text-[10px] font-bold text-accent">
              即将执行
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingCard;
