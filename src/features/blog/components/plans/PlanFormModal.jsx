import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Clock, Book, Check, Sparkles, ChevronDown } from 'lucide-react';
import { blogPlanService } from '../../services/blogPlanService';
import { useToast } from '@/hooks/useToast';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const initialForm = () => ({
  topic: '',
  knowledgeBase: 'frontend',
  planType: 'once', // once, daily, weekly
  date: '2026/08/18',
  triggerTime: '12:00',
  platforms: ['juejin', 'zhihu', 'wechat', 'csdn', 'weibo'],
  aiOption: 'deep', // deep, practical, news, opinion
  autoPublish: true,
});

const PlanFormModal = ({ isOpen, plan, onClose, onSaved }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState(initialForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(plan?.id
        ? {
            ...initialForm(),
            topic: plan.topic || '',
            triggerTime: plan.triggerTime || plan.triggerTimes?.[0] || '12:00',
          }
        : initialForm());
    }
  }, [isOpen, plan]);

  const submit = async () => {
    if (!form.topic.trim()) {
      toast.error('请输入文章主题');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        topic: form.topic.trim(),
        timezone: 'Asia/Shanghai',
        triggerTime: form.triggerTime,
        // The original backend payload expects some of these fields. 
        // We will just map what we can.
        syncCsdn: form.platforms.includes('csdn'),
        syncJuejin: form.platforms.includes('juejin'),
        audience: '',
        tone: '',
      };
      if (plan?.id) {
        await blogPlanService.updatePlan(plan.id, payload);
        toast.success(t('blogPlans.updated', '更新成功'));
      } else {
        await blogPlanService.createPlan(payload);
        toast.success(t('blogPlans.created', '创建成功'));
      }
      onClose();
      await onSaved?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || t('blogPlans.saveFailed', '保存失败'));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-8 py-5 shrink-0">
          <h2 className="text-xl font-bold text-ink">{plan?.id ? '编辑发布计划' : '新建发布计划'}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-ink-muted hover:bg-surface hover:text-ink transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex flex-1 min-h-[600px] overflow-hidden">
          {/* Left: Form */}
          <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
            <div className="space-y-7 max-w-2xl">
              
              {/* 文章主题 */}
              <div>
                <label className="mb-2.5 block text-[15px] font-bold text-ink">文章主题</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={form.topic}
                    onChange={e => setForm({...form, topic: e.target.value})}
                    placeholder="前端性能优化：从加载到渲染的核心策略"
                    className="w-full rounded-xl border border-border/60 bg-white px-4 py-3 text-[14px] text-ink font-medium outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent pr-16 shadow-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-faint">
                    {form.topic.length}/100
                  </div>
                </div>
              </div>

              {/* 绑定知识库 */}
              <div>
                <label className="mb-2.5 block text-[15px] font-bold text-ink">绑定知识库</label>
                <div className="flex w-full items-center justify-between rounded-xl border border-border/60 px-4 py-3 cursor-pointer hover:bg-surface transition-colors shadow-sm">
                  <div className="flex items-center gap-2">
                    <Book className="w-4 h-4 text-purple-500" />
                    <span className="text-[14px] text-ink font-bold">中级前端开发知识体系（笔记）</span>
                    <X className="w-3.5 h-3.5 text-ink-muted hover:text-ink ml-1" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-ink-muted" />
                </div>
              </div>

              {/* 计划类型 */}
              <div>
                <label className="mb-2.5 block text-[15px] font-bold text-ink">计划类型</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className={`flex flex-col rounded-xl border ${form.planType === 'once' ? 'border-purple-500 bg-purple-50/40' : 'border-border/60 bg-white hover:border-border'} p-3.5 cursor-pointer transition-colors shadow-sm`} onClick={() => setForm({...form, planType: 'once'})}>
                    <div className={`text-[15px] font-bold ${form.planType === 'once' ? 'text-purple-600' : 'text-ink'}`}>一次性</div>
                    <div className={`text-[12px] font-medium mt-1 ${form.planType === 'once' ? 'text-purple-500/80' : 'text-ink-muted'}`}>仅执行一次</div>
                  </div>
                  <div className={`flex flex-col rounded-xl border ${form.planType === 'daily' ? 'border-purple-500 bg-purple-50/40' : 'border-border/60 bg-white hover:border-border'} p-3.5 cursor-pointer transition-colors shadow-sm`} onClick={() => setForm({...form, planType: 'daily'})}>
                    <div className={`text-[15px] font-bold ${form.planType === 'daily' ? 'text-purple-600' : 'text-ink'}`}>每日</div>
                    <div className={`text-[12px] font-medium mt-1 ${form.planType === 'daily' ? 'text-purple-500/80' : 'text-ink-muted'}`}>每天固定时间执行</div>
                  </div>
                  <div className={`flex flex-col rounded-xl border ${form.planType === 'weekly' ? 'border-purple-500 bg-purple-50/40' : 'border-border/60 bg-white hover:border-border'} p-3.5 cursor-pointer transition-colors shadow-sm`} onClick={() => setForm({...form, planType: 'weekly'})}>
                    <div className={`text-[15px] font-bold ${form.planType === 'weekly' ? 'text-purple-600' : 'text-ink'}`}>每周</div>
                    <div className={`text-[12px] font-medium mt-1 ${form.planType === 'weekly' ? 'text-purple-500/80' : 'text-ink-muted'}`}>每周固定日执行</div>
                  </div>
                </div>
              </div>

              {/* 执行时间 */}
              <div>
                <label className="mb-2.5 block text-[15px] font-bold text-ink">执行时间</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2.5 rounded-xl border border-border/60 px-4 py-3 shadow-sm">
                    <Calendar className="w-4 h-4 text-ink-muted" />
                    <input type="text" className="w-full bg-transparent text-[14px] font-medium text-ink outline-none" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                    <ChevronDown className="w-4 h-4 text-ink-muted ml-auto" />
                  </div>
                  <div className="flex-1 flex items-center gap-2.5 rounded-xl border border-border/60 px-4 py-3 shadow-sm">
                    <Clock className="w-4 h-4 text-ink-muted" />
                    <input type="text" className="w-full bg-transparent text-[14px] font-medium text-ink outline-none" value={form.triggerTime} onChange={e => setForm({...form, triggerTime: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* 发布平台 */}
              <div>
                <label className="mb-2.5 block text-[15px] font-bold text-ink">发布平台</label>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-50/50 px-3 py-1.5 text-xs font-bold text-blue-600">
                    <div className="w-3.5 h-3.5 rounded bg-blue-500 flex items-center justify-center text-white text-[9px]">掘</div> 掘金
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-50/50 px-3 py-1.5 text-xs font-bold text-blue-600">
                    <div className="w-3.5 h-3.5 rounded bg-blue-500 flex items-center justify-center text-white text-[9px]">知</div> 知乎
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-50/50 px-3 py-1.5 text-xs font-bold text-green-600">
                    <div className="w-3.5 h-3.5 rounded bg-green-500 flex items-center justify-center text-white text-[9px]">公</div> 公众号
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-orange-50/50 px-3 py-1.5 text-xs font-bold text-orange-600">
                    <div className="w-3.5 h-3.5 rounded bg-orange-500 flex items-center justify-center text-white text-[9px]">C</div> CSDN
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-50/50 px-3 py-1.5 text-xs font-bold text-red-600">
                    <div className="w-3.5 h-3.5 rounded bg-red-500 flex items-center justify-center text-white text-[9px]">微</div> 微博
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-border/60 bg-white px-2 py-1.5 text-xs font-bold text-ink-muted cursor-pointer hover:bg-surface">
                    +2 <ChevronDown className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* AI 规划选项 */}
              <div>
                <label className="mb-2.5 block text-[15px] font-bold text-ink">AI 规划选项</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className={`relative flex flex-col rounded-xl border ${form.aiOption === 'deep' ? 'border-purple-500 bg-purple-50/40' : 'border-border/60 bg-white hover:border-border'} p-3.5 cursor-pointer transition-colors shadow-sm`} onClick={() => setForm({...form, aiOption: 'deep'})}>
                    {form.aiOption === 'deep' && (
                      <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 rounded-full bg-purple-500 p-0.5 text-white shadow-sm"><Check className="w-3.5 h-3.5" /></div>
                    )}
                    <div className={`text-[14px] font-bold ${form.aiOption === 'deep' ? 'text-purple-600' : 'text-ink'}`}>深度解析</div>
                    <div className="text-[11px] text-ink-muted mt-1.5 leading-tight font-medium">深入拆解知识<br/>点透技术本质</div>
                  </div>
                  <div className={`relative flex flex-col rounded-xl border ${form.aiOption === 'practical' ? 'border-purple-500 bg-purple-50/40' : 'border-border/60 bg-white hover:border-border'} p-3.5 cursor-pointer transition-colors shadow-sm`} onClick={() => setForm({...form, aiOption: 'practical'})}>
                    <div className={`text-[14px] font-bold ${form.aiOption === 'practical' ? 'text-purple-600' : 'text-ink'}`}>实战教程</div>
                    <div className="text-[11px] text-ink-muted mt-1.5 leading-tight font-medium">步骤图解，<br/>注重实操演示</div>
                  </div>
                  <div className={`relative flex flex-col rounded-xl border ${form.aiOption === 'news' ? 'border-purple-500 bg-purple-50/40' : 'border-border/60 bg-white hover:border-border'} p-3.5 cursor-pointer transition-colors shadow-sm`} onClick={() => setForm({...form, aiOption: 'news'})}>
                    <div className={`text-[14px] font-bold ${form.aiOption === 'news' ? 'text-purple-600' : 'text-ink'}`}>资讯解读</div>
                    <div className="text-[11px] text-ink-muted mt-1.5 leading-tight font-medium">快速解读热点，<br/>传递关键信息</div>
                  </div>
                  <div className={`relative flex flex-col rounded-xl border ${form.aiOption === 'opinion' ? 'border-purple-500 bg-purple-50/40' : 'border-border/60 bg-white hover:border-border'} p-3.5 cursor-pointer transition-colors shadow-sm`} onClick={() => setForm({...form, aiOption: 'opinion'})}>
                    <div className={`text-[14px] font-bold ${form.aiOption === 'opinion' ? 'text-purple-600' : 'text-ink'}`}>观点评论</div>
                    <div className="text-[11px] text-ink-muted mt-1.5 leading-tight font-medium">表达观点，<br/>适合讨论与思考</div>
                  </div>
                </div>
              </div>

              {/* 自动生成后同步发布 */}
              <div className="flex items-center gap-3 pt-2 pb-6">
                <button 
                  className={`relative h-[22px] w-[40px] rounded-full transition-colors ${form.autoPublish ? 'bg-purple-500' : 'bg-border'}`}
                  onClick={() => setForm({...form, autoPublish: !form.autoPublish})}
                >
                  <div className={`absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-white transition-transform ${form.autoPublish ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                </button>
                <span className="text-[14px] font-medium text-ink-muted">内容生成完成后，将自动发布到已选平台</span>
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="w-[320px] shrink-0 bg-[#F4F6FE] px-8 py-8 border-l border-border/40 flex flex-col overflow-y-auto">
            <h3 className="text-[15px] font-bold text-ink mb-7">计划摘要</h3>
            
            <div className="space-y-1.5 mb-7">
              <div className="text-[13px] font-bold text-ink mb-2">下次执行</div>
              <div className="text-[22px] font-black text-ink mb-1">2026/08/18 <span className="text-[14px] font-bold text-ink-muted ml-1">(周二)</span> 12:00</div>
              <div className="text-[12px] font-bold text-ink-muted">预计在 3 天后执行</div>
            </div>

            <div className="h-px bg-border/50 w-full mb-7"></div>

            <div className="space-y-5 mb-8">
              <h4 className="text-[14px] font-bold text-ink mb-4">预期产出</h4>
              
              <div className="flex flex-col">
                <div className="text-[12px] font-medium text-ink-muted mb-1">文章类型</div>
                <div className="text-[14px] font-bold text-ink">技术文章</div>
              </div>
              
              <div className="flex flex-col">
                <div className="text-[12px] font-medium text-ink-muted mb-1">预计字数</div>
                <div className="text-[14px] font-bold text-ink">1,200 - 1,800 字</div>
              </div>

              <div className="flex flex-col">
                <div className="text-[12px] font-medium text-ink-muted mb-1">内容来源</div>
                <div className="text-[14px] font-bold text-ink">中级前端开发知识体系（笔记）</div>
              </div>

              <div className="flex flex-col">
                <div className="text-[12px] font-medium text-ink-muted mb-1">发布平台</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-[18px] h-[18px] rounded-[4px] bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">掘</div>
                  <div className="w-[18px] h-[18px] rounded-[4px] bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">知</div>
                  <div className="w-[18px] h-[18px] rounded-[4px] bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">公</div>
                  <div className="w-[18px] h-[18px] rounded-[4px] bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">C</div>
                  <div className="text-[12px] font-bold text-ink-muted ml-1">等 6 个平台</div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="text-[12px] font-medium text-ink-muted mb-1">AI 规划方向</div>
                <div className="text-[14px] font-bold text-ink">深度解析</div>
              </div>
            </div>

            <div className="mt-auto bg-[#E8EBFC] rounded-2xl p-4 flex gap-3 shadow-sm border border-white/50">
              <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div className="text-[13px] text-indigo-900/80 leading-relaxed font-bold">
                AI 将基于知识库内容生成结构化文章，包含核心原理，实战案例与最佳实践。
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border/40 px-8 py-5 bg-white shrink-0">
          <button onClick={onClose} className="rounded-xl border border-border/60 bg-white px-7 py-3 text-[14px] font-bold text-ink hover:bg-surface transition-colors">
            保存草稿
          </button>
          <button onClick={submit} disabled={saving} className="rounded-xl bg-purple-600 px-7 py-3 text-[14px] font-bold text-white shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50">
            {saving ? '创建中...' : '创建计划'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanFormModal;
