import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

import useBack from './useBack.js';

const setHistoryState = (value) => {
  Object.defineProperty(window.history, 'state', {
    configurable: true,
    writable: true,
    value,
  });
};

describe('useBack', () => {
  beforeEach(() => {
    navigateMock.mockClear();
  });

  afterEach(() => {
    setHistoryState(undefined);
  });

  it('有历史记录时回退上一页', () => {
    setHistoryState({ idx: 3 });
    const { result } = renderHook(() => useBack('/fallback'), {
      wrapper: MemoryRouter,
    });
    act(() => result.current());
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('无历史记录时跳转兜底路由', () => {
    setHistoryState({ idx: 0 });
    const { result } = renderHook(() => useBack('/workspace'), {
      wrapper: MemoryRouter,
    });
    act(() => result.current());
    expect(navigateMock).toHaveBeenCalledWith('/workspace');
  });

  it('默认兜底首页', () => {
    setHistoryState({ idx: 0 });
    const { result } = renderHook(() => useBack(), {
      wrapper: MemoryRouter,
    });
    act(() => result.current());
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
})