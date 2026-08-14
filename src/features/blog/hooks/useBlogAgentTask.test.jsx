import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const navigateMock = vi.hoisted(() => vi.fn())
const agentServiceMock = vi.hoisted(() => ({
  createTask: vi.fn(),
  getTask: vi.fn(),
  runTaskStream: vi.fn(),
  reviseTaskStream: vi.fn(),
  subscribeTaskEvents: vi.fn(),
}))
const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

const runtimeMock = vi.hoisted(() => ({
  TASK_TERMINAL_STATUSES: new Set(['ready', 'failed']),
  createAbortError: () => {
    const err = new Error('aborted')
    err.name = 'AbortError'
    return err
  },
  eventCursorKey: (id) => `cursor:${id}`,
  getReconnectDelay: () => 100,
  getStoredProcessLogs: () => [],
  isAbortError: (err) => err?.name === 'AbortError' || err?.code === 'ERR_CANCELED',
  readSessionValue: vi.fn(() => ''),
  removeSessionValue: vi.fn(),
  streamTextKey: (id) => `stream:${id}`,
  waitForReconnect: vi.fn(() => Promise.resolve()),
  writeSessionValue: vi.fn(),
}))
const i18nMock = vi.hoisted(() => ({
  t: (key) => `t:${key}`,
}))

vi.mock('react-router-dom', () => ({ useNavigate: () => navigateMock }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: i18nMock.t }) }))
vi.mock('@/hooks/useToast', () => ({ useToast: () => toastMock }))
vi.mock('../services/blogAgentService', () => ({ blogAgentService: agentServiceMock }))
vi.mock('../utils/agentRuntime', () => runtimeMock)

const { default: useBlogAgentTaskHook } = await import('./useBlogAgentTask.js')

const flush = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

const readyTask = { task: { id: 't1', status: 'ready', stage: 'ready' } }
const runningTask = { task: { id: 't1', status: 'running', stage: 'analyze' }, messages: [] }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useBlogAgentTask 任务恢复', () => {
  it('无 taskId 时不请求且不加载', async () => {
    const { result } = renderHook(() =>
      useBlogAgentTaskHook({ taskId: null, onReady: vi.fn(), onSessionsChanged: vi.fn() })
    )
    await flush()
    expect(agentServiceMock.getTask).not.toHaveBeenCalled()
    expect(result.current.isTaskLoading).toBe(false)
  })

  it('恢复已就绪任务并回调 onReady', async () => {
    agentServiceMock.getTask.mockResolvedValue(readyTask)
    const onReady = vi.fn()
    const { result } = renderHook(() =>
      useBlogAgentTaskHook({ taskId: 't1', onReady, onSessionsChanged: vi.fn() })
    )
    await flush()
    expect(agentServiceMock.getTask).toHaveBeenCalledWith('t1', { _silent: true, signal: expect.any(AbortSignal) })
    expect(result.current.taskData).toEqual(readyTask)
    expect(result.current.isTaskLoading).toBe(false)
    expect(onReady).toHaveBeenCalledWith(readyTask)
  })

  it('恢复运行中任务走 SSE 订阅直至终态', async () => {
    agentServiceMock.getTask
      .mockResolvedValueOnce(runningTask)
      .mockResolvedValueOnce(readyTask)
    agentServiceMock.subscribeTaskEvents.mockResolvedValue(undefined)
    const onSessionsChanged = vi.fn()
    const { result } = renderHook(() =>
      useBlogAgentTaskHook({ taskId: 't1', onReady: vi.fn(), onSessionsChanged })
    )
    await flush()
    expect(agentServiceMock.subscribeTaskEvents).toHaveBeenCalledWith(
      't1',
      0,
      expect.any(Function),
      { _silent: true, signal: expect.any(AbortSignal) }
    )
    expect(result.current.isRunning).toBe(false)
    expect(result.current.taskData).toEqual(readyTask)
  })

  it('恢复失败时提示错误', async () => {
    agentServiceMock.getTask.mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() =>
      useBlogAgentTaskHook({ taskId: 't1', onReady: vi.fn(), onSessionsChanged: vi.fn() })
    )
    await flush()
    expect(toastMock.error).toHaveBeenCalledWith('offline')
    expect(result.current.isTaskLoading).toBe(false)
  })

  it('恢复被卸载中止时静默返回', async () => {
    agentServiceMock.getTask.mockRejectedValue({ name: 'AbortError' })
    const { unmount } = renderHook(() =>
      useBlogAgentTaskHook({ taskId: 't1', onReady: vi.fn(), onSessionsChanged: vi.fn() })
    )
    await act(async () => { unmount() })
    expect(toastMock.error).not.toHaveBeenCalled()
  })
})

describe('useBlogAgentTask 生成', () => {
  it('创建任务并流式生成，成功后提示并返回 true', async () => {
    agentServiceMock.createTask.mockResolvedValue({ id: 't1' })
    agentServiceMock.runTaskStream.mockResolvedValue(undefined)
    agentServiceMock.getTask.mockResolvedValue(readyTask)
    const onSessionsChanged = vi.fn()
    const { result } = renderHook(() =>
      useBlogAgentTaskHook({ taskId: null, onReady: vi.fn(), onSessionsChanged })
    )

    let ok
    await act(async () => {
      ok = await result.current.generate('写一篇 AI 文章')
    })

    expect(agentServiceMock.createTask).toHaveBeenCalledWith({ input: '写一篇 AI 文章' })
    expect(navigateMock).toHaveBeenCalledWith('/workspace/blog-tool/t1', { replace: true })
    expect(agentServiceMock.runTaskStream).toHaveBeenCalledWith('t1', expect.any(Function), {
      signal: expect.any(AbortSignal),
    })
    expect(toastMock.success).toHaveBeenCalledWith('t:blog.agent.complete')
    expect(onSessionsChanged).toHaveBeenCalled()
    expect(ok).toBe(true)
    expect(result.current.isRunning).toBe(false)
  })

  it('生成期间状态字段被正确设置', async () => {
    let runResolve
    agentServiceMock.createTask.mockResolvedValue({ id: 't1' })
    agentServiceMock.runTaskStream.mockReturnValue(new Promise((r) => { runResolve = r }))
    agentServiceMock.getTask.mockResolvedValue(readyTask)
    const { result } = renderHook(() =>
      useBlogAgentTaskHook({ taskId: null, onReady: vi.fn(), onSessionsChanged: vi.fn() })
    )

    let promise
    act(() => {
      promise = result.current.generate('任务')
    })
    expect(result.current.isRunning).toBe(true)
    expect(result.current.pendingUserInput).toBe('任务')

    await act(async () => {
      runResolve(undefined)
      await promise
    })
    expect(result.current.isRunning).toBe(false)
    expect(result.current.endedAt).toEqual(expect.any(Number))
  })

  it('流式中断时静默返回 false 且不提示', async () => {
    agentServiceMock.createTask.mockResolvedValue({ id: 't1' })
    agentServiceMock.runTaskStream.mockRejectedValue({ name: 'AbortError' })
    const { result } = renderHook(() =>
      useBlogAgentTaskHook({ taskId: null, onReady: vi.fn(), onSessionsChanged: vi.fn() })
    )

    let ok
    await act(async () => {
      ok = await result.current.generate('任务')
    })

    expect(ok).toBe(false)
    expect(toastMock.error).not.toHaveBeenCalled()
  })

  it('生成失败且任务无法恢复时提示错误并返回 false', async () => {
    agentServiceMock.createTask.mockResolvedValue({ id: 't1' })
    agentServiceMock.runTaskStream.mockRejectedValue(new Error('net'))
    agentServiceMock.getTask.mockResolvedValue({ task: { id: 't1', status: 'failed', errorMessage: '服务器崩了' } })
    const { result } = renderHook(() =>
      useBlogAgentTaskHook({ taskId: null, onReady: vi.fn(), onSessionsChanged: vi.fn() })
    )

    let ok
    await act(async () => {
      ok = await result.current.generate('任务')
    })

    expect(ok).toBe(false)
    expect(toastMock.error).toHaveBeenCalledWith('服务器崩了')
  })
})

describe('useBlogAgentTask 修订与重置', () => {
  it('修订成功提示 revisionComplete', async () => {
    agentServiceMock.reviseTaskStream.mockResolvedValue(undefined)
    agentServiceMock.getTask.mockResolvedValue(readyTask)
    const { result } = renderHook(() =>
      useBlogAgentTaskHook({ taskId: 't1', onReady: vi.fn(), onSessionsChanged: vi.fn() })
    )

    let ok
    await act(async () => {
      ok = await result.current.revise('t1', '改一下')
    })

    expect(agentServiceMock.reviseTaskStream).toHaveBeenCalledWith('t1', '改一下', expect.any(Function), {
      signal: expect.any(AbortSignal),
    })
    expect(toastMock.success).toHaveBeenCalledWith('t:blog.agent.revisionComplete')
    expect(ok).toBe(true)
  })

  it('reset 清空全部临时状态', async () => {
    const { result } = renderHook(() =>
      useBlogAgentTaskHook({ taskId: 't1', onReady: vi.fn(), onSessionsChanged: vi.fn() })
    )
    await flush()
    expect(result.current.taskData).toEqual(readyTask)

    act(() => {
      result.current.reset()
    })
    expect(result.current.taskData).toBeNull()
    expect(result.current.isRunning).toBe(false)
    expect(result.current.pendingUserInput).toBe('')
    expect(result.current.streamText).toBe('')
    expect(result.current.liveLogs).toEqual([])
  })
})