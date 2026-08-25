import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ImageToolProgressPanel, ImageToolResult, PlanCard, ReflectionCard, ThinkingIndicator } from './AgentChat';

describe('ThinkingIndicator', () => {
  it('announces the pending response and renders stable animated dots', () => {
    const { container } = render(<ThinkingIndicator label="Working..." />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Working...');
    expect(screen.queryByText('Working...')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.animate-bounce')).toHaveLength(3);
  });
});

describe('PlanCard', () => {
  const plan = [
    { title: '查知识库', status: 'DONE', note: '' },
    { title: '整理复习清单', status: 'IN_PROGRESS', note: '按掌握度排序' },
    { title: '生成配图', status: 'DROPPED', note: '' },
    { title: '发布', status: 'PENDING', note: '' },
  ];

  it('lists every step and strikes through the ones that are already settled', () => {
    const { container } = render(<PlanCard items={plan} />);

    expect(container.querySelectorAll('li')).toHaveLength(4);
    expect(screen.getByText('查知识库')).toHaveClass('line-through');
    expect(screen.getByText('生成配图')).toHaveClass('line-through');
    expect(screen.getByText('整理复习清单')).not.toHaveClass('line-through');
    expect(screen.getByText('发布')).not.toHaveClass('line-through');
    expect(screen.getByText('— 按掌握度排序')).toBeInTheDocument();
  });

  it('renders nothing when the agent has no plan yet', () => {
    const { container } = render(<PlanCard items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('falls back to the pending style for an unknown status', () => {
    render(<PlanCard items={[{ title: '未知状态', status: 'WAT', note: '' }]} />);

    expect(screen.getByText('未知状态')).not.toHaveClass('line-through');
  });
});

describe('ReflectionCard', () => {
  it('shows the critique with its round so a rejected reply is explained', () => {
    render(<ReflectionCard content="还有 1 个步骤没有收口" round={2} />);

    expect(screen.getByText('还有 1 个步骤没有收口')).toBeInTheDocument();
    const card = screen.getByText('还有 1 个步骤没有收口').parentElement;
    expect(card.textContent).toContain('2');
    expect(card.textContent).not.toContain('blog.agentChat');
  });

  it('renders nothing without a critique', () => {
    const { container } = render(<ReflectionCard content="" round={1} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('image generation UI', () => {
  it('renders the dedicated animated generation state', () => {
    const { container } = render(<ImageToolProgressPanel message="正在生成图片…" />);

    expect(screen.getByRole('status')).toHaveTextContent('正在生成图片…');
    expect(container.querySelectorAll('.animate-bounce')).toHaveLength(3);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders a generated image inline instead of a view link', () => {
    render(<ImageToolResult url="https://cdn.example.com/cat.png" title="可爱小猫" />);

    const image = screen.getByRole('img', { name: '可爱小猫' });
    expect(image).toHaveAttribute('src', 'https://cdn.example.com/cat.png');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
