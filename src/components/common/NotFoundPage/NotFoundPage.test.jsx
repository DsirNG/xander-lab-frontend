import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from './index.jsx';

describe('NotFoundPage', () => {
  it('renders the 404 status and page-not-found texts', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('页面未找到')).toBeInTheDocument();
    expect(screen.getByText(/你访问的页面不存在或已被移动/)).toBeInTheDocument();
  });

  it('links back to the home page', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );
    const homeLink = screen.getByRole('link', { name: '返回首页' });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('goes back in history via the back button', () => {
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: '返回上页' }));
    expect(back).toHaveBeenCalled();
    back.mockRestore();
  });
})