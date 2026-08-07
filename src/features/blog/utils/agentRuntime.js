/**
 * Pure runtime helpers shared by the Blog Agent page and its tests.
 * Browser storage failures are deliberately non-fatal because task snapshots
 * remain the source of truth during stream recovery.
 */
export const RESULT_MESSAGE_ID = 'result'
export const TASK_TERMINAL_STATUSES = new Set(['ready', 'failed'])
export const RECONNECT_BASE_DELAY = 600
export const RECONNECT_MAX_DELAY = 8000

export const getReconnectDelay = (attempt) => Math.min(
  RECONNECT_BASE_DELAY * (2 ** Math.max(0, attempt - 1)),
  RECONNECT_MAX_DELAY,
)

export const eventCursorKey = (id) => `xander-lab:blog-agent:event-cursor:${id}`
export const streamTextKey = (id) => `xander-lab:blog-agent:stream-text:${id}`

export const createAbortError = () => Object.assign(
  new Error('Request cancelled'),
  { name: 'AbortError' },
)

export const isAbortError = (error) => error?.name === 'AbortError'
  || error?.name === 'CanceledError'
  || error?.code === 'ERR_CANCELED'

export const waitForReconnect = (delay, signal) => new Promise((resolve, reject) => {
  if (signal?.aborted) {
    reject(createAbortError())
    return
  }

  const onAbort = () => {
    globalThis.clearTimeout(timer)
    reject(createAbortError())
  }
  const timer = globalThis.setTimeout(() => {
    signal?.removeEventListener('abort', onAbort)
    resolve()
  }, delay)
  signal?.addEventListener('abort', onAbort, { once: true })
})

export const readSessionValue = (key, fallback = '') => {
  try {
    return globalThis.sessionStorage?.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

export const writeSessionValue = (key, value) => {
  try {
    globalThis.sessionStorage?.setItem(key, value)
  } catch {
    // A later task snapshot can recover the state.
  }
}

export const removeSessionValue = (key) => {
  try {
    globalThis.sessionStorage?.removeItem(key)
  } catch {
    // Storage is an optional recovery optimization.
  }
}

export const buildStoredMessages = (stored = []) => {
  const result = []
  let process = null

  stored.forEach((message) => {
    if (message.kind === 'process') {
      if (!process) {
        process = {
          id: `process-${message.id}`,
          role: 'assistant',
          kind: 'process',
          status: 'ready',
          logs: [],
          stage: message.stage,
        }
        result.push(process)
      }
      process.logs.push(message.content)
      process.stage = message.stage || process.stage
      return
    }

    process = null
    if (message.role === 'user') {
      result.push({ id: `message-${message.id}`, role: 'user', content: message.content })
    } else if (message.kind === 'result') {
      result.push({
        id: `result-${message.id}`,
        role: 'assistant',
        kind: 'result',
        title: message.content,
      })
    }
  })

  return result
}

export const getStoredProcessLogs = (stored = []) => stored
  .filter((message) => message.kind === 'process' && message.content)
  .map((message) => message.content)
