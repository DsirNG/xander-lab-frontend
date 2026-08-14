import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Modal from './index.jsx';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()} title="标题">内容</Modal>
    );
    expect(container).not.toHaveTextContent('标题');
  });

  it('renders the title and children when open', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="弹窗标题">
        <div>弹窗内容</div>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('弹窗标题')).toBeInTheDocument();
    expect(screen.getByText('弹窗内容')).toBeInTheDocument();
  });

  it('renders the footer when provided', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="标题" footer={<button type="button">确定</button>}>
        内容
      </Modal>
    );
    expect(screen.getByRole('button', { name: '确定' })).toBeInTheDocument();
  });

  it('calls onClose when clicking the close button', () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="标题">内容</Modal>);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when pressing Escape', () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="标题">内容</Modal>);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose for Escape when closeOnOutsideClick is false', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="标题" closeOnOutsideClick={false}>
        内容
      </Modal>
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('hides the close button when hideCloseButton is set', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="标题" hideCloseButton>
        内容
      </Modal>
    );
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('does not render the header when title is empty and close button is hidden', () => {
    render(
      <Modal isOpen onClose={vi.fn()} hideCloseButton>
        内容
      </Modal>
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('restores body scroll when closed', () => {
    const { rerender } = render(
      <Modal isOpen onClose={vi.fn()} title="标题">内容</Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<Modal isOpen={false} onClose={vi.fn()} title="标题">内容</Modal>);
    expect(document.body.style.overflow).toBe('');
  });

  it('traps focus on Tab: wraps from the last focusable element to the first', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="标题"
        footer={(
          <>
            <button type="button">取消</button>
            <button type="button">确认</button>
          </>
        )}
      >
        内容
      </Modal>
    );
    const close = screen.getByRole('button', { name: /close/i });
    const confirm = screen.getByRole('button', { name: '确认' });
    confirm.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(close).toHaveFocus();
  });
})