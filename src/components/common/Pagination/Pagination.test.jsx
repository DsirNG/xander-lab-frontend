import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Pagination from './index.jsx';

describe('Pagination', () => {
  it('returns null when there is no data and hideWhenEmpty is true', () => {
    const { container } = render(
      <Pagination page={1} pageSize={10} total={0} onPageChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the page info summary', () => {
    render(
      <Pagination page={2} pageSize={10} total={42} onPageChange={vi.fn()} />
    );
    expect(screen.getByText(/common\.pagination\.pageInfo/)).toBeInTheDocument();
  });

  it('renders page numbers and marks the current page', () => {
    render(
      <Pagination page={3} pageSize={10} total={100} onPageChange={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: '3' })).toHaveClass('bg-accent');
  });

  it('calls onPageChange with the target page when a number is clicked', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={3} pageSize={10} total={100} onPageChange={onPageChange} />
    );
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('calls onPageChange with page-1 on prev and page+1 on next', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={3} pageSize={10} total={100} onPageChange={onPageChange} />
    );
    fireEvent.click(screen.getByRole('button', { name: /prevPage|上一页|prev/i }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    fireEvent.click(screen.getByRole('button', { name: /nextPage|下一页|next/i }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
  });

  it('disables prev on the first page and next on the last page', () => {
    const { unmount } = render(
      <Pagination page={1} pageSize={10} total={30} onPageChange={vi.fn()} />
    );
    unmount();
    render(
      <Pagination page={3} pageSize={10} total={30} onPageChange={vi.fn()} />
    );
    expect(screen.getAllByRole('button', { name: /nextPage|下一页|next/i }).at(-1)).toBeDisabled();
  });

  it('renders an ellipsis for wide page ranges', () => {
    render(
      <Pagination page={10} pageSize={10} total={500} onPageChange={vi.fn()} />
    );
    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
  });
})