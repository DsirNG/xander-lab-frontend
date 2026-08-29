import React from 'react';

const RhythmCard = () => {
  const days = ['一', '二', '三', '四', '五', '六', '日'];
  const values = [20, 30, 40, 80, 50, 10, 15]; // percentages
  
  return (
    <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm border border-border min-h-[200px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-ink">发布节奏</h3>
        <button className="text-sm font-medium text-accent hover:opacity-80 transition-opacity">
          编辑节奏
        </button>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-ink-muted">每日发布</div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold text-ink">2.1</span>
          <span className="text-sm text-ink-muted">篇</span>
        </div>
      </div>

      <div className="flex items-end justify-between h-20 pt-4 border-t border-border border-dashed mt-auto">
        {days.map((day, i) => (
          <div key={day} className="flex flex-col items-center gap-2 w-full">
             <div className="w-2.5 bg-surface-muted rounded-full overflow-hidden flex flex-col justify-end" style={{ height: '40px' }}>
                <div 
                  className={`w-full rounded-full transition-all duration-500 ${i === 3 ? 'bg-accent' : 'bg-border-strong'}`} 
                  style={{ height: `${values[i]}%` }}
                ></div>
             </div>
             <div className="text-[10px] text-ink-muted font-medium">{day}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RhythmCard;
