import { describe, expect, it, vi } from 'vitest'
import { cn, debounce, throttle, deepClone, storage } from './index.js'

describe('cn', () => {
  it('merges truthy class names with a single space', () => {
    expect(cn('a', 'b', null, undefined, false, 0, 'c')).toBe('a b c')
  })

  it('returns empty string when nothing is passed', () => {
    expect(cn()).toBe('')
  })

  it('ignores empty strings', () => {
    expect(cn('a', '', 'b')).toBe('a b')
  })
})

describe('debounce', () => {
  it('only calls the function once after the wait period', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    debounced()
    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(299)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('forwards arguments to the wrapped function', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced(1, 'a')
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledWith(1, 'a')
    vi.useRealTimers()
  })

  it('uses the default wait of 300ms', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn)

    debounced()
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})

describe('throttle', () => {
  it('fires immediately and then at most once per limit window', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 300)

    throttled()
    throttled()
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(299)
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1)
    throttled()
    expect(fn).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })

  it('uses the default limit of 300ms', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn)

    throttled()
    vi.advanceTimersByTime(300)
    throttled()
    expect(fn).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })
})

describe('deepClone', () => {
  it('returns primitives and null as-is', () => {
    expect(deepClone(null)).toBe(null)
    expect(deepClone(42)).toBe(42)
    expect(deepClone('str')).toBe('str')
  })

  it('clones dates by value', () => {
    const now = new Date()
    const cloned = deepClone(now)
    expect(cloned).not.toBe(now)
    expect(cloned.getTime()).toBe(now.getTime())
  })

  it('clones nested arrays and objects without shared references', () => {
    const original = { a: [1, { b: 2 }], c: { d: [3, 4] } }
    const cloned = deepClone(original)
    expect(cloned).toEqual(original)
    expect(cloned.a).not.toBe(original.a)
    expect(cloned.a[1]).not.toBe(original.a[1])
    expect(cloned.c.d).not.toBe(original.c.d)
  })
})

describe('storage', () => {
  it('stores and retrieves JSON values', () => {
    storage.set('key', { foo: 'bar' })
    expect(storage.get('key')).toEqual({ foo: 'bar' })
  })

  it('returns the default value for missing keys', () => {
    storage.remove('missing')
    expect(storage.get('missing')).toBe(null)
    expect(storage.get('missing', 'fallback')).toBe('fallback')
  })

  it('returns the default when the stored value is not valid JSON', () => {
    localStorage.setItem('corrupt', '{not-json')
    expect(storage.get('corrupt', 'fallback')).toBe('fallback')
  })

  it('removes a single key', () => {
    storage.set('a', 1)
    storage.remove('a')
    expect(storage.get('a')).toBe(null)
  })

  it('clears every key', () => {
    storage.set('a', 1)
    storage.set('b', 2)
    storage.clear()
    expect(storage.get('a')).toBe(null)
    expect(storage.get('b')).toBe(null)
  })
})
