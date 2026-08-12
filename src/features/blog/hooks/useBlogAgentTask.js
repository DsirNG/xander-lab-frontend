/**
 * Owns the complete Blog Agent task lifecycle: create/revise streams, SSE
 * recovery, task restoration, cancellation, and transient process state.
 */
import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/useToast'
import { blogAgentService } from '../services/blogAgentService'
import {
  TASK_TERMINAL_STATUSES,
  createAbortError,
  eventCursorKey,
  getReconnectDelay,
  getStoredProcessLogs,
  isAbortError,
  readSessionValue,
  removeSessionValue,
  streamTextKey,
  waitForReconnect,
  writeSessionValue,
} from '../utils/agentRuntime'

const useBlogAgentTask = ({ taskId, onReady, onSessionsChanged }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const [taskData, setTaskData] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isTaskLoading, setIsTaskLoading] = useState(Boolean(taskId))
  const [streamText, setStreamText] = useState('')
  const [startedAt, setStartedAt] = useState(null)
  const [endedAt, setEndedAt] = useState(null)
  const [pendingUserInput, setPendingUserInput] = useState('')
  const [liveLogs, setLiveLogs] = useState([])
  const [liveStage, setLiveStage] = useState('analyze')
  const [liveUserInput, setLiveUserInput] = useState('')
  const streamBufferRef = useRef('')
  const streamErrorRef = useRef(null)
  const streamFrameRef = useRef(null)
  const activeRunAbortRef = useRef(null)
  const activeStreamTaskIdRef = useRef(null)
  const currentTaskIdRef = useRef(taskId)
  const eventCursorRef = useRef({ taskId: null, eventId: 0 })
  const isRunningRef = useRef(false)
  const onReadyRef = useRef(onReady)
  const onSessionsChangedRef = useRef(onSessionsChanged)
  const toastRef = useRef(toast)

  currentTaskIdRef.current = taskId
  isRunningRef.current = isRunning
  onReadyRef.current = onReady
  onSessionsChangedRef.current = onSessionsChanged
  toastRef.current = toast

  const applyTaskSnapshot = useCallback((data) => {
    if (!data?.task) return
    setTaskData(data)
    setLiveStage(data.task.stage || 'analyze')
    if (data.task.status === 'ready') onReadyRef.current?.(data)
  }, [])

  const rememberEventId = useCallback((id, rawEventId) => {
    const eventId = Number(rawEventId)
    if (!Number.isSafeInteger(eventId) || eventId <= 0) return true
    if (eventCursorRef.current.taskId !== String(id)) {
      eventCursorRef.current = {
        taskId: String(id),
        eventId: Number(readSessionValue(eventCursorKey(id), '0')) || 0,
      }
    }
    if (eventId <= eventCursorRef.current.eventId) return false
    eventCursorRef.current.eventId = eventId
    writeSessionValue(eventCursorKey(id), String(eventId))
    return true
  }, [])

  const applyStreamEvent = useCallback((id, { id: eventId, event, data }) => {
    if (!rememberEventId(id, eventId)) return
    if (event === 'delta') {
      streamBufferRef.current += data
      writeSessionValue(streamTextKey(id), streamBufferRef.current)
      if (!streamFrameRef.current) {
        streamFrameRef.current = requestAnimationFrame(() => {
          startTransition(() => setStreamText(streamBufferRef.current))
          streamFrameRef.current = null
        })
      }
    } else if (event === 'stage') {
      const [stage, message] = String(data).split('|', 2)
      setLiveStage(stage)
      setLiveLogs((current) => [...current, message || stage])
      setTaskData((current) => current && String(current.task?.id) === String(id)
        ? { ...current, task: { ...current.task, stage, status: 'running' } }
        : current)
    } else if (event === 'complete') {
      if (String(currentTaskIdRef.current) === String(id)) applyTaskSnapshot(data)
      removeSessionValue(streamTextKey(id))
    } else if (event === 'error') {
      streamErrorRef.current = typeof data === 'string' ? data : t('blog.agent.failed')
    }
  }, [applyTaskSnapshot, rememberEventId, t])

  const recoverTask = useCallback(async (id, signal, initialSnapshot = null) => {
    let snapshot = initialSnapshot
    let reconnectAttempt = 0
    const applyIfCurrent = (data) => {
      if (String(currentTaskIdRef.current) === String(id)) applyTaskSnapshot(data)
    }

    while (!signal?.aborted) {
      try {
        snapshot = snapshot || await blogAgentService.getTask(id, { _silent: true, signal })
        applyIfCurrent(snapshot)
        if (TASK_TERMINAL_STATUSES.has(snapshot?.task?.status)) return snapshot

        const afterEventId = Number(readSessionValue(eventCursorKey(id), '0')) || 0
        await blogAgentService.subscribeTaskEvents(
          id,
          afterEventId,
          (event) => applyStreamEvent(id, event),
          { _silent: true, signal },
        )
        snapshot = await blogAgentService.getTask(id, { _silent: true, signal })
        applyIfCurrent(snapshot)
        if (TASK_TERMINAL_STATUSES.has(snapshot?.task?.status)) return snapshot
      } catch (error) {
        if (signal?.aborted || isAbortError(error)) throw createAbortError()
        if (error?.status && error.status < 500) throw error
      }

      reconnectAttempt += 1
      await waitForReconnect(getReconnectDelay(reconnectAttempt), signal)
      snapshot = null
    }
    throw createAbortError()
  }, [applyStreamEvent, applyTaskSnapshot])

  useEffect(() => {
    if (!taskId) {
      setIsTaskLoading(false)
      setTaskData(null)
      setPendingUserInput('')
      setStreamText('')
      setStartedAt(null)
      setEndedAt(null)
      setLiveStage('analyze')
      return undefined
    }
    if (isRunningRef.current && String(activeStreamTaskIdRef.current) === String(taskId)) {
      setIsTaskLoading(false)
      return undefined
    }

    setIsTaskLoading(true)
    let active = true
    const controller = new AbortController()
    const restore = async () => {
      try {
        const data = await blogAgentService.getTask(taskId, { _silent: true, signal: controller.signal })
        if (!active) return
        applyTaskSnapshot(data)
        setPendingUserInput(data?.task?.input || '')
        setLiveUserInput('')
        setLiveLogs(data?.task?.status === 'running' ? getStoredProcessLogs(data.messages) : [])
        if (data?.task?.status === 'running') {
          const restoredText = readSessionValue(streamTextKey(taskId))
          streamBufferRef.current = restoredText
          setStreamText(restoredText)
          eventCursorRef.current = {
            taskId: String(taskId),
            eventId: Number(readSessionValue(eventCursorKey(taskId), '0')) || 0,
          }
          setIsRunning(true)
          setStartedAt((current) => current || Date.now())
          const recovered = await recoverTask(taskId, controller.signal, data)
          if (active) {
            setEndedAt(Date.now())
            if (recovered?.task?.status === 'ready') onSessionsChangedRef.current?.()
          }
        }
      } catch (error) {
        if (active && !isAbortError(error)) {
          toastRef.current.error(error.message || t('blog.agent.failed'))
        }
      } finally {
        if (active) {
          setIsTaskLoading(false)
          setIsRunning(false)
        }
      }
    }
    restore()
    return () => {
      active = false
      controller.abort()
    }
  }, [applyTaskSnapshot, recoverTask, taskId, t])

  const prepareRun = useCallback((submitted) => {
    setIsRunning(true)
    setStreamText('')
    setPendingUserInput(submitted)
    setLiveUserInput(submitted)
    setLiveLogs([])
    setLiveStage('analyze')
    setStartedAt(Date.now())
    setEndedAt(null)
    streamBufferRef.current = ''
    streamErrorRef.current = null
    activeRunAbortRef.current?.abort()
    const controller = new AbortController()
    activeRunAbortRef.current = controller
    return controller
  }, [])

  const finishRun = useCallback((controller) => {
    if (activeRunAbortRef.current === controller) {
      activeRunAbortRef.current = null
      activeStreamTaskIdRef.current = null
    }
    setIsRunning(false)
  }, [])

  const generate = useCallback(async (submitted) => {
    setTaskData(null)
    const controller = prepareRun(submitted)
    let createdTaskId = null
    try {
      const created = await blogAgentService.createTask({ input: submitted })
      createdTaskId = created.id
      activeStreamTaskIdRef.current = created.id
      removeSessionValue(eventCursorKey(created.id))
      removeSessionValue(streamTextKey(created.id))
      eventCursorRef.current = { taskId: String(created.id), eventId: 0 }
      navigate(`/workspace/agent/${created.id}`, { replace: true })
      onSessionsChangedRef.current?.()
      await blogAgentService.runTaskStream(
        created.id,
        (event) => applyStreamEvent(created.id, event),
        { signal: controller.signal },
      )
      const recovered = await recoverTask(created.id, controller.signal)
      if (recovered?.task?.status === 'failed') {
        throw new Error(recovered.task.errorMessage || t('blog.agent.failed'))
      }
      if (streamErrorRef.current) throw new Error(streamErrorRef.current)
      setEndedAt(Date.now())
      setLiveUserInput('')
      setLiveLogs([])
      onSessionsChangedRef.current?.()
      toastRef.current.success(t('blog.agent.complete'))
      return true
    } catch (error) {
      if (controller.signal.aborted || isAbortError(error)) return false
      let finalError = error
      if (createdTaskId) {
        try {
          const recovered = await recoverTask(createdTaskId, controller.signal)
          if (recovered?.task?.status === 'ready') {
            setEndedAt(Date.now())
            setLiveUserInput('')
            setLiveLogs([])
            onSessionsChangedRef.current?.()
            toastRef.current.success(t('blog.agent.complete'))
            return true
          }
          finalError = new Error(recovered?.task?.errorMessage || error.message)
        } catch (recoveryError) {
          if (controller.signal.aborted || isAbortError(recoveryError)) return false
          finalError = recoveryError
        }
      }
      onSessionsChangedRef.current?.()
      toastRef.current.error(finalError.message || t('blog.agent.failed'))
      return false
    } finally {
      finishRun(controller)
    }
  }, [applyStreamEvent, finishRun, navigate, prepareRun, recoverTask, t])

  const revise = useCallback(async (id, submitted) => {
    activeStreamTaskIdRef.current = id
    const controller = prepareRun(submitted)
    removeSessionValue(streamTextKey(id))
    try {
      await blogAgentService.reviseTaskStream(
        id,
        submitted,
        (event) => applyStreamEvent(id, event),
        { signal: controller.signal },
      )
      const recovered = await recoverTask(id, controller.signal)
      if (recovered?.task?.status === 'failed') {
        throw new Error(recovered.task.errorMessage || t('blog.agent.failed'))
      }
      if (streamErrorRef.current) throw new Error(streamErrorRef.current)
      setEndedAt(Date.now())
      setLiveUserInput('')
      setLiveLogs([])
      onSessionsChangedRef.current?.()
      toastRef.current.success(t('blog.agent.revisionComplete'))
      return true
    } catch (error) {
      if (controller.signal.aborted || isAbortError(error)) return false
      let finalError = error
      try {
        const recovered = await recoverTask(id, controller.signal)
        if (recovered?.task?.status === 'ready' && !recovered.task.errorMessage) {
          setEndedAt(Date.now())
          setLiveUserInput('')
          setLiveLogs([])
          onSessionsChangedRef.current?.()
          toastRef.current.success(t('blog.agent.revisionComplete'))
          return true
        }
        finalError = new Error(recovered?.task?.errorMessage || error.message)
      } catch (recoveryError) {
        if (controller.signal.aborted || isAbortError(recoveryError)) return false
        finalError = recoveryError
      }
      onSessionsChangedRef.current?.()
      toastRef.current.error(finalError.message || t('blog.agent.failed'))
      return false
    } finally {
      finishRun(controller)
    }
  }, [applyStreamEvent, finishRun, prepareRun, recoverTask, t])

  const reset = useCallback(() => {
    activeRunAbortRef.current?.abort()
    activeRunAbortRef.current = null
    activeStreamTaskIdRef.current = null
    setIsRunning(false)
    setTaskData(null)
    setPendingUserInput('')
    setStreamText('')
    setStartedAt(null)
    setEndedAt(null)
    setLiveUserInput('')
    setLiveLogs([])
    setLiveStage('analyze')
  }, [])

  useEffect(() => () => {
    activeRunAbortRef.current?.abort()
    if (streamFrameRef.current) cancelAnimationFrame(streamFrameRef.current)
  }, [])

  return {
    taskData,
    setTaskData,
    isRunning,
    isTaskLoading,
    streamText,
    startedAt,
    endedAt,
    pendingUserInput,
    liveLogs,
    liveStage,
    liveUserInput,
    generate,
    revise,
    reset,
  }
}

export default useBlogAgentTask
