/** Pure HTTP retry policy. Keeping this outside Axios makes it independently testable. */
export const SAFE_RETRY_METHODS = new Set(['get', 'head', 'options'])
export const MAX_RETRY = 2
export const BASE_RETRY_DELAY = 500

export const isSafeRetryMethod = (method) => SAFE_RETRY_METHODS.has(
  String(method || '').toLowerCase(),
)

export const isRetryAllowed = (config) => (
  isSafeRetryMethod(config?.method) || config?._retryIdempotent === true
)

export const shouldRetryRequest = (config, response) => {
  if (!config || config._skipRetry || !isRetryAllowed(config)) return false
  const attempts = config._retryCount ?? 0
  if (attempts >= MAX_RETRY) return false
  return !response || response.status >= 500
}

export const getRetryDelay = (attempt) => (
  BASE_RETRY_DELAY * Math.pow(2, Math.max(0, attempt - 1))
)
