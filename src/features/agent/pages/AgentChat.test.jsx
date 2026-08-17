import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HistoricalToolCard, ThinkingIndicator } from './AgentChat';

const t = (key) => ({
  'blog.agentChat.toolCalled': '已调用工具',
  'blog.agentChat.toolResult': '工具返回结果',
  'blog.agentChat.toolSucceeded': '调用成功',
  'blog.agentChat.toolFailed': '调用失败',
  'blog.agentChat.unknownTool': '工具',
  'blog.agentChat.viewBlog': '查看博客',
})[key] || key;

describe('ThinkingIndicator', () => {
  it('announces the pending response and renders stable animated dots', () => {
    const { container } = render(<ThinkingIndicator label="Working..." />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Working...')).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-bounce')).toHaveLength(3);
  });
});

describe('HistoricalToolCard', () => {
  it('shows success for a tool result with ok:true', () => {
    render(
      <HistoricalToolCard
        message={{ kind: 'tool_result', toolName: 'schedule_plan', content: JSON.stringify({ ok: true, planId: 15 }) }}
        t={t}
        onViewBlog={() => {}}
      />,
    );

    expect(screen.getByText('schedule_plan')).toBeInTheDocument();
    expect(screen.getByText('工具返回结果')).toBeInTheDocument();
    expect(screen.getByText('调用成功')).toBeInTheDocument();
  });

  it('shows failure for a tool result with ok:false and the error text', () => {
    render(
      <HistoricalToolCard
        message={{
          kind: 'tool_result',
          toolName: 'update_plan',
          content: JSON.stringify({ ok: false, tool: 'update_plan', error: '操作类型只支持 PAUSE / PAUSED / RESUME / CANCEL / CANCELLED / DELETE / EDIT' }),
        }}
        t={t}
        onViewBlog={() => {}}
      />,
    );

    expect(screen.getByText('update_plan')).toBeInTheDocument();
    expect(screen.getByText('调用失败')).toBeInTheDocument();
    expect(screen.queryByText('调用成功')).not.toBeInTheDocument();
    expect(screen.getByText(/操作类型只支持/)).toBeInTheDocument();
  });

  it('shows failure for a legacy error-only tool result without ok flag', () => {
    render(
      <HistoricalToolCard
        message={{
          kind: 'tool_result',
          toolName: 'update_plan',
          content: JSON.stringify({ tool: 'update_plan', error: '计划操作只支持 PAUSED / RESUME / CANCELLED' }),
        }}
        t={t}
        onViewBlog={() => {}}
      />,
    );

    expect(screen.getByText('调用失败')).toBeInTheDocument();
    expect(screen.queryByText('调用成功')).not.toBeInTheDocument();
    expect(screen.getByText(/计划操作只支持/)).toBeInTheDocument();
  });
});
