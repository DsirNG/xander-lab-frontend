import { describe, expect, it, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useIsMobile from './useIsMobile.js'

const mockMatchMedia = (matches) => {
  const listeners = new Set()
  const mql = {
    matches,
    addEventListener: vi.fn((event, cb) => {
      if (event === 'change') listeners.add(cb)
    }),
    removeEventListener: vi.fn((event, cb) => {
      if (event === 'change') listeners.delete(cb)
    }),
    dispatchChange: (nextMatches) => {
      listeners.forEach((cb) => cb({ matches: nextMatches }))
    },
  }
  window.matchMedia = vi.fn().mockReturnValue(mql)
  return mql
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useIsMobile', () => {
  it('returns true when the viewport is narrower than the breakpoint', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useIsMobile(1024))
    expect(result.current).toBe(true)
  })

  it('returns false when the viewport is wider than the breakpoint', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useIsMobile(1024))
    expect(result.current).toBe(false)
  })

  it('reacts to media query changes', () => {
    const mql = mockMatchMedia(false)
    const { result } = renderHook(() => useIsMobile(768))

    act(() => mql.dispatchChange(true))
    expect(result.current).toBe(true)

    act(() => mql.dispatchChange(false))
    expect(result.current).toBe(false)
  })

  it('uses the default breakpoint of 1024', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useIsMobile())
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 1023px)')
    expect(result.current).toBe(true)
  })

  it('cleans up the listener on unmount', () => {
    const mql = mockMatchMedia(false)
    const { unmount } = renderHook(() => useIsMobile())
    unmount()
    expect(mql.removeEventListener).toHaveBeenCalled()
  })
})