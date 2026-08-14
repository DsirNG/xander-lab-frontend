import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import PureReadingContext from '@/context/pureReadingContextValue'
import usePureReading from './usePureReading.js'

const wrapper =
  ({ isPureReading = false } = {}) => {
    const TestWrapper = ({ children }) => (
      <PureReadingContext.Provider value={{
        isPureReading,
        setIsPureReading: vi.fn(),
        togglePureReading: vi.fn(),
      }}>
        {children}
      </PureReadingContext.Provider>
    )
    TestWrapper.displayName = 'TestWrapper'
    return TestWrapper
  }

describe('usePureReading', () => {
  it('returns the context default value when no provider is present', () => {
    const { result } = renderHook(() => usePureReading())
    expect(result.current.isPureReading).toBe(false)
    expect(typeof result.current.setIsPureReading).toBe('function')
    expect(typeof result.current.togglePureReading).toBe('function')
  })

  it('reads the provider value', () => {
    const { result } = renderHook(() => usePureReading(), {
      wrapper: wrapper({ isPureReading: true }),
    })
    expect(result.current.isPureReading).toBe(true)
  })

  it('exposes the setters from the provider', () => {
    const toggle = vi.fn()
    const set = vi.fn()
    const customWrapper = ({ children }) => (
      <PureReadingContext.Provider value={{ isPureReading: false, setIsPureReading: set, togglePureReading: toggle }}>
        {children}
      </PureReadingContext.Provider>
    )
    const { result } = renderHook(() => usePureReading(), { wrapper: customWrapper })
    act(() => result.current.togglePureReading())
    expect(toggle).toHaveBeenCalledTimes(1)
    act(() => result.current.setIsPureReading(true))
    expect(set).toHaveBeenCalledWith(true)
  })
})