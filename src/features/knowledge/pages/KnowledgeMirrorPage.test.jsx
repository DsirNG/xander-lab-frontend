import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AgentQuizPanel } from './KnowledgeMirrorPage';

const quiz = {
  id: 5,
  score: 50,
  questionCount: 2,
  correctCount: 1,
  verdict: '推导那题没答上',
  createdAt: '2026-08-20T10:00:00',
  items: [
    { question: '和角公式怎么写', userAnswer: 'sin a cos b + cos a sin b', credit: 1 },
    { question: '怎么推导', userAnswer: '画单位圆…', comment: '方向对了但写错了符号', credit: 0.5 },
  ],
};

describe('AgentQuizPanel', () => {
  it('把服务端算出的分数和逐题判分原样摆出来，不在前端重算总分', () => {
    render(<AgentQuizPanel quiz={quiz} onStart={() => {}} />);

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByText('推导那题没答上')).toBeInTheDocument();
    expect(screen.getByText('和角公式怎么写')).toBeInTheDocument();
    expect(screen.getByText('方向对了但写错了符号')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('答对一半的题不显示成答对，用户才知道错在哪', () => {
    const { container } = render(<AgentQuizPanel quiz={quiz} onStart={() => {}} />);
    const labels = [...container.querySelectorAll('li .rounded-full')].map((node) => node.textContent);

    expect(labels[0]).not.toEqual(labels[1]);
    expect(new Set(labels).size).toBe(2);
  });

  it('没测验过时给出提示而不是一片空白的成绩单', () => {
    render(<AgentQuizPanel quiz={null} onStart={() => {}} />);

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('入口按钮把出题这件事交给对话，页面自己不出题', async () => {
    const onStart = vi.fn();
    render(<AgentQuizPanel quiz={null} onStart={onStart} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('缺字段的历史记录不至于把页面打崩', () => {
    render(<AgentQuizPanel quiz={{ items: [{}, null], score: null }} onStart={() => {}} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('0/0')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
