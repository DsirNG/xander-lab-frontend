import { afterEach, describe, expect, it, vi } from 'vitest'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  getStream: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  'delete': vi.fn(),
}))

vi.mock('@api', () => apiMock)

const { blogPlanService, PLAN_STATUS, RUN_STATUS } = await import('./blogPlanService.js')

afterEach(() => {
  vi.clearAllMocks()
})

describe('状态常量', () => {
  it('计划状态包含 ACTIVE/RUNNING/PAUSED/CANCELLED/FINISHED/FAILED', () => {
    expect(PLAN_STATUS).toEqual({
      ACTIVE: 'ACTIVE',
      RUNNING: 'RUNNING',
      PAUSED: 'PAUSED',
      CANCELLED: 'CANCELLED',
      FINISHED: 'FINISHED',
      FAILED: 'FAILED',
    })
  })

  it('运行状态包含生成/审核/发布/成功/失败', () => {
    expect(RUN_STATUS).toEqual({
      GENERATING: 'GENERATING',
      REVIEWING: 'REVIEWING',
      PUBLISHING: 'PUBLISHING',
      SUCCEEDED: 'SUCCEEDED',
      FAILED: 'FAILED',
      REVIEW_REJECTED: 'REVIEW_REJECTED',
    })
  })
})

describe('blogPlanService 计划 CRUD', () => {
  it('创建/列表/详情映射正确端点', () => {
    blogPlanService.createPlan({ theme: 'AI' })
    expect(apiMock.post).toHaveBeenCalledWith('/api/blog-plans', { theme: 'AI' }, undefined)
    blogPlanService.listPlans({ page: 2, size: 5 })
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog-plans', { page: 2, size: 5 }, undefined)
    blogPlanService.listPlans()
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog-plans', { page: 1, size: 10 }, undefined)
    blogPlanService.getPlan(7)
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog-plans/7', undefined, undefined)
  })

  it('更新/状态/删除/手动触发', () => {
    blogPlanService.updatePlan(7, { title: 'x' })
    expect(apiMock.patch).toHaveBeenCalledWith('/api/blog-plans/7', { title: 'x' }, undefined)
    blogPlanService.updatePlanStatus(7, 'PAUSE')
    expect(apiMock.patch).toHaveBeenCalledWith('/api/blog-plans/7/status', { action: 'PAUSE' }, undefined)
    blogPlanService.deletePlan(7)
    expect(apiMock['delete']).toHaveBeenCalledWith('/api/blog-plans/7', undefined, undefined)
    blogPlanService.triggerPlan(7)
    expect(apiMock.post).toHaveBeenCalledWith('/api/blog-plans/7/trigger', undefined, undefined)
  })
})

describe('blogPlanService 运行记录与 AI 生成', () => {
  it('运行列表/详情/下一次运行时间', () => {
    blogPlanService.listRuns(7, { page: 3 })
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog-plans/7/runs', { page: 3, size: 10 }, undefined)
    blogPlanService.getRun(7, 99)
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog-plans/7/runs/99', undefined, undefined)
    blogPlanService.nextRun(7)
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog-plans/7/next', { count: 1 }, undefined)
    blogPlanService.nextRun(7, 3)
    expect(apiMock.get).toHaveBeenCalledWith('/api/blog-plans/7/next', { count: 3 }, undefined)
  })

  it('主题细化与 AI 生成计划', () => {
    blogPlanService.generateTopics({ seed: 's' })
    expect(apiMock.post).toHaveBeenCalledWith('/api/blog-plans/topics/generate', { seed: 's' }, undefined)
    blogPlanService.aiGenerate({ days: 7 })
    expect(apiMock.post).toHaveBeenCalledWith('/api/blog-plans/ai-generate', { days: 7 }, undefined)
  })
})

describe('blogPlanService 用户通知', () => {
  it('列表与已读操作', () => {
    blogPlanService.listNotifications()
    expect(apiMock.get).toHaveBeenCalledWith('/api/notifications', { page: 1, size: 20 }, undefined)
    blogPlanService.markNotificationRead(3)
    expect(apiMock.patch).toHaveBeenCalledWith('/api/notifications/3/read', undefined, undefined)
    blogPlanService.markAllNotificationsRead()
    expect(apiMock.patch).toHaveBeenCalledWith('/api/notifications/read-all', undefined, undefined)
  })

  it('SSE 订阅透传 onEvent 回调', () => {
    const onEvent = vi.fn()
    blogPlanService.subscribeNotifications(onEvent, { signal: 1 })
    expect(apiMock.getStream).toHaveBeenCalledWith(
      '/api/notifications/events',
      { signal: 1, onEvent }
    )
  })
})