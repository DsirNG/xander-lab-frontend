import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ImageToolProgressPanel, ImageToolResult, ThinkingIndicator } from './AgentChat';

describe('ThinkingIndicator', () => {
  it('announces the pending response and renders stable animated dots', () => {
    const { container } = render(<ThinkingIndicator label="Working..." />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Working...');
    expect(screen.queryByText('Working...')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.animate-bounce')).toHaveLength(3);
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
