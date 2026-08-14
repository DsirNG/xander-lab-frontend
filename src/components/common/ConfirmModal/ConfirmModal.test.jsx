import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ConfirmModal from './index.jsx';

describe('ConfirmModal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <ConfirmModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} title="删除？" message="确定删除吗？" />
    );
    expect(container).not.toHaveTextContent('删除？');
  });

  it('renders title, message and default confirm/cancel texts', () => {
    render(
      <ConfirmModal isOpen onClose={vi.fn()} onConfirm={vi.fn()} title="删除？" message="确定删除吗？" />
    );
    expect(screen.getByText('删除？')).toBeInTheDocument();
    expect(screen.getByText('确定删除吗？')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /common\.confirm/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /common\.cancel/ })).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal isOpen onClose={vi.fn()} onConfirm={onConfirm} title="确认？" message="继续？" />
    );
    fireEvent.click(screen.getByRole('button', { name: /common\.confirm/ }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the cancel button is clicked', () => {
    const onClose = vi.fn();
    render(
      <ConfirmModal isOpen onClose={onClose} onConfirm={vi.fn()} title="确认？" message="继续？" />
    );
    fireEvent.click(screen.getByRole('button', { name: /common\.cancel/ }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('blocks close and shows a spinner while confirming', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmModal isOpen confirming onClose={onClose} onConfirm={onConfirm} title="确认？" message="继续？" />
    );
    expect(screen.getByRole('button', { name: /common\.cancel/ })).toBeDisabled();
    const confirmBtn = screen.getByRole('button', { name: /common\.confirm/ });
    expect(confirmBtn).toBeDisabled();
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    fireEvent.click(confirmBtn);
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /common\.cancel/ }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders children instead of the message when provided', () => {
    render(
      <ConfirmModal isOpen onClose={vi.fn()} onConfirm={vi.fn()} title="标题">
        <div>自定义内容</div>
      </ConfirmModal>
    );
    expect(screen.getByText('自定义内容')).toBeInTheDocument();
    expect(screen.queryByText('确定删除吗？')).not.toBeInTheDocument();
  });

  it('uses custom confirm/cancel texts when provided', () => {
    render(
      <ConfirmModal isOpen onClose={vi.fn()} onConfirm={vi.fn()} title="标题" message="内容"
        confirmText="好" cancelText="算了" />
    );
    expect(screen.getByRole('button', { name: '好' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '算了' })).toBeInTheDocument();
  });
})