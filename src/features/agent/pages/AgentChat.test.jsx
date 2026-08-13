import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThinkingIndicator } from './AgentChat';

describe('ThinkingIndicator', () => {
  it('announces the pending response and renders stable animated dots', () => {
    const { container } = render(<ThinkingIndicator label="Working..." />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Working...')).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-bounce')).toHaveLength(3);
  });
});
