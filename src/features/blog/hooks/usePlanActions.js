import { useState } from 'react';
import { blogPlanService } from '../services/blogPlanService';
import { useToast } from '@/hooks/useToast';

/**
 * 计划列表/详情共用的计划操作（暂停/恢复/取消/删除/立即执行）
 * @param {{ onChanged?: () => void }} params 操作成功后刷新数据的回调
 */
export function usePlanActions({ onChanged, t }) {
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  const run = async (plan, task, okKey, failKey) => {
    setBusyId(plan.id);
    try {
      await task();
      toast.success(t(okKey));
      await onChanged?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || t(failKey));
    } finally {
      setBusyId(null);
    }
  };

  return {
    busyId,
    pause: (plan) => run(plan, () => blogPlanService.updatePlanStatus(plan.id, 'PAUSED'), 'blogPlans.paused', 'blogPlans.actionFailed'),
    resume: (plan) => run(plan, () => blogPlanService.updatePlanStatus(plan.id, 'RESUME'), 'blogPlans.resumed', 'blogPlans.actionFailed'),
    cancel: (plan) => run(plan, () => blogPlanService.updatePlanStatus(plan.id, 'CANCELLED'), 'blogPlans.cancelled', 'blogPlans.actionFailed'),
    trigger: (plan) => run(plan, () => blogPlanService.triggerPlan(plan.id), 'blogPlans.triggered', 'blogPlans.triggerFailed'),
    remove: (plan) => {
      if (!window.confirm(t('blogPlans.deleteConfirm').replace('{{topic}}', plan.topic))) return;
      return run(plan, () => blogPlanService.deletePlan(plan.id), 'blogPlans.deleted', 'blogPlans.deleteFailed');
    },
  };
}
