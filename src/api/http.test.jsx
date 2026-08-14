import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

const { requestInterceptors, responseInterceptors, axiosMock } = vi.hoisted(() => {
  const requestInterceptors = []
  const responseInterceptors = []
  const mockInstance = {
    interceptors: {
      request: { use: (fn) => requestInterceptors.push(fn) },
      response: { use: (fn, errFn) => responseInterceptors.push({ ok: fn, err: errFn }) },
    },
    defaults: {},
    request: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    head: vi.fn(),
    options: vi.fn(),
  }
  return {
    requestInterceptors,
    responseInterceptors,
    axiosMock: {
      default: vi.fn(),
      create: vi.fn(() => mockInstance),
      post: vi.fn(),
      isCancel: vi.fn(),
    },
  }
})

vi.mock('axios', () => {
  axiosMock.default.create = axiosMock.create
  axiosMock.default.post = axiosMock.post
  axiosMock.default.isCancel = axiosMock.isCancel
  return axiosMock
})

vi.mock('@config/env', () => ({
  ENV_CONFIG: {
    BASE_URL: '/api',
    TIMEOUT: 15000,
    IS_DEV: false,
    IS_PROD: true,
  },
}))

vi.mock('@locales/index', () => ({
  default: {
    t: (key, fallback) => fallback ?? key,
  },
}))

vi.mock('./httpPolicy.js', () => ({
  MAX_RETRY: 2,
  getRetryDelay: vi.fn(() => 0),
  shouldRetryRequest: vi.fn(() => false),
}))

vi.mock('../../utils', () => ({
  cn: (...parts) => parts.filter(Boolean).join(' '),
}))

const { tokenStorage, buildRequestKey, HttpError } = await import('./http.js')

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  axiosMock.isCancel.mockReturnValue(false)
})

afterEach(() => {
  delete window.__toast
  window.dispatchEvent(new Event('auth:logout'))
})

describe('tokenStorage', () => {
  it('stores and clears tokens', () => {
    tokenStorage.setToken('abc')
    expect(localStorage.getItem('access_token')).toBe('abc')
    tokenStorage.removeToken()
    expect(tokenStorage.getToken()).toBeNull()
  })

  it('stores refresh tokens separately', () => {
    tokenStorage.setRefreshToken('r1')
    expect(tokenStorage.getRefreshToken()).toBe('r1')
    tokenStorage.removeRefreshToken()
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })

  it('clear wipes the full session', () => {
    tokenStorage.setToken('a')
    tokenStorage.setRefreshToken('r')
    localStorage.setItem('user_info', '{}')
    tokenStorage.clear()
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
    expect(localStorage.getItem('user_info')).toBeNull()
  })
})

describe('HttpError', () => {
  it('carries status, business code and payload', () => {
    const err = new HttpError('boom', 403, 4003, { message: 'boom' })
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('HttpError')
    expect(err.message).toBe('boom')
    expect(err.status).toBe(403)
    expect(err.code).toBe(4003)
    expect(err.data).toEqual({ message: 'boom' })
  })
})

describe('buildRequestKey', () => {
  it('normalizes method case and serializes params/data', () => {
    const a = buildRequestKey({ method: 'GET', url: '/x', params: { a: 1 }, data: { b: 2 } })
    const b = buildRequestKey({ method: 'get', url: '/x', params: { a: 1 }, data: '{"b":2}' })
    expect(a).toBe(b)
  })

  it('handles missing params and data', () => {
    expect(buildRequestKey({ method: 'post', url: '/y' })).toBe('post|/y|{}|{}')
  })
})

describe('request interceptor', () => {
  it('attaches the Authorization header when a token exists', async () => {
    tokenStorage.setToken('tok-123', { notify: false })
    const config = await requestInterceptors[0]({ method: 'get', url: '/me', headers: {}, dedupe: false })
    expect(config.headers.Authorization).toBe('Bearer tok-123')
  })

  it('skips the token when withToken is false', async () => {
    tokenStorage.setToken('tok-123', { notify: false })
    const config = await requestInterceptors[0]({ method: 'get', url: '/x', headers: {}, dedupe: false, withToken: false })
    expect(config.headers.Authorization).toBeUndefined()
  })

  it('wires the dedup controller signal into the config', async () => {
    const config = await requestInterceptors[0]({ method: 'get', url: '/x', headers: {} })
    expect(config.signal).toBeInstanceOf(AbortSignal)
    expect(config._pendingRequestKey).toBeDefined()
  })

  it('does not dedupe when dedupe is false', async () => {
    const config = await requestInterceptors[0]({ method: 'get', url: '/x', headers: {}, dedupe: false })
    expect(config.signal).toBeUndefined()
  })
})

describe('response interceptor success path', () => {
  it('unwraps { code: 200, data } envelopes', async () => {
    const result = await responseInterceptors[0].ok({ data: { code: 200, data: { id: 1 }, message: 'ok' }, config: {} })
    expect(result).toEqual({ id: 1 })
  })

  it('accepts code 0 as success too', async () => {
    const result = await responseInterceptors[0].ok({ data: { code: 0, data: [1, 2] }, config: {} })
    expect(result).toEqual([1, 2])
  })

  it('returns the full body when rawResponse is requested', async () => {
    const body = { code: 200, data: { id: 1 }, message: 'ok' }
    const result = await responseInterceptors[0].ok({ data: body, config: { rawResponse: true } })
    expect(result).toBe(body)
  })

  it('passes through non-envelope responses untouched', async () => {
    const result = await responseInterceptors[0].ok({ data: 'plain', config: {} })
    expect(result).toBe('plain')
  })
})

describe('response interceptor error path', () => {
  const businessError = { code: 4001, message: '数据不存在', data: null }

  it('rejects business errors with HttpError and shows a toast', () => {
    const toast = vi.fn()
    window.__toast = toast
    let caught
    try {
      responseInterceptors[0].ok({ status: 200, data: businessError, config: {} })
    } catch (error) {
      caught = error
    }
    expect(caught).toMatchObject({ name: 'HttpError', code: 4001, status: 200 })
    expect(toast).toHaveBeenCalledWith('error', expect.any(String))
  })

  it('suppresses the toast when _silent is set', async () => {
    const toast = vi.fn()
    window.__toast = toast
    await expect(responseInterceptors[0].err({ config: { _silent: true }, response: { status: 200, data: businessError } }))
      .rejects.toMatchObject({ name: 'HttpError' })
    expect(toast).not.toHaveBeenCalled()
  })

  it('rejects cancelled requests with a standard CanceledError', async () => {
    axiosMock.isCancel.mockReturnValue(true)
    await expect(responseInterceptors[0].err({ config: {}, response: undefined }))
      .rejects.toMatchObject({ name: 'CanceledError', code: 'ERR_CANCELED', isCancelled: true })
  })

  it('formats network errors with the generic message and shows an error toast', async () => {
    const toast = vi.fn()
    window.__toast = toast
    await expect(responseInterceptors[0].err({ config: { url: '/x', method: 'get' }, response: undefined }))
      .rejects.toMatchObject({ name: 'HttpError', status: undefined })
    expect(toast).toHaveBeenCalledWith('error', expect.any(String))
  })
})
