import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AgentMarkdown from './AgentMarkdown';

vi.mock('@/components/common/CodeBlock', () => ({
  default: ({ code, language, appearance }) => (
    <div data-testid="code-block" data-language={language} data-appearance={appearance}>{code}</div>
  ),
}));

describe('AgentMarkdown', () => {
  it('renders GFM structure and secures external links', () => {
    const content = [
      '## Result',
      '',
      '- first',
      '- second',
      '',
      '[OpenAI](https://openai.com)',
      '',
      '| Name | State |',
      '| --- | --- |',
      '| Agent | ready |',
    ].join('\n');

    const { container } = render(<AgentMarkdown content={content} />);

    expect(screen.getByRole('heading', { name: 'Result' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'OpenAI' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'OpenAI' })).toHaveAttribute('rel', 'noopener noreferrer');
    expect(container.querySelector('script')).not.toBeInTheDocument();
  });

  it('routes fenced HTML through the shared sandbox-capable code block', () => {
    render(<AgentMarkdown content={'```html\n<button>Run</button>\n```'} />);

    expect(screen.getByTestId('code-block')).toHaveAttribute('data-language', 'html');
    expect(screen.getByTestId('code-block')).toHaveAttribute('data-appearance', 'conversation');
    expect(screen.getByTestId('code-block')).toHaveTextContent('<button>Run</button>');
    expect(screen.queryByRole('button', { name: 'Run' })).not.toBeInTheDocument();
  });

  it('keeps raw HTML inert instead of injecting it into the page', () => {
    const { container } = render(<AgentMarkdown content={'<button>Unsafe</button>'} />);

    expect(screen.queryByRole('button', { name: 'Unsafe' })).not.toBeInTheDocument();
    expect(container).toHaveTextContent('<button>Unsafe</button>');
  });
});
