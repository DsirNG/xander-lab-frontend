import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import NotFoundPage from './index.jsx';

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const renderPage = (initialEntries = ['/'], initialIndex = 0) =>
  render(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <NotFoundPage />
      <LocationProbe />
    </MemoryRouter>
  );

const setHistoryState = (value) => {
  Object.defineProperty(window.history, 'state', {
    configurable: true,
    writable: true,
    value,
  });
};

describe('NotFoundPage', () => {
  afterEach(() => {
    setHistoryState(undefined);
  });

  it('renders the 404 status and page-not-found texts', () => {
    renderPage();
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('页面未找到')).toBeInTheDocument();
    expect(screen.getByText(/你访问的页面不存在或已被移动/)).toBeInTheDocument();
  });

  it('navigates back to the home page', () => {
    renderPage();
    const homeBtn = screen.getByRole('button', { name: '返回首页' });
    fireEvent.click(homeBtn);
    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });

  it('goes back in history via the back button when there is history', () => {
    setHistoryState({ idx: 2 });
    renderPage(['/', '/unknown'], 1);
    fireEvent.click(screen.getByRole('button', { name: '返回上页' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });

  it('falls back to home when there is no history', () => {
    setHistoryState({ idx: 0 });
    renderPage(['/unknown']);
    fireEvent.click(screen.getByRole('button', { name: '返回上页' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });
})