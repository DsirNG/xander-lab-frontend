import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toolCallSummary, compactToolResult } from './useAgentConversation.js'
import { agentConversationService } from '../services/agentConversationService.js'

const { translate } = vi.hoisted(() => ({ translate: (key) => key }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: translate }),
}))

vi.mock('../services/agentConversationService.js', () => ({
  agentConversationService: {
    create: vi.fn(),
    list: vi.fn(),
    get: vi.fn(),
    sendMessageStream: vi.fn(),
    subscribeEvents: vi.fn(),
    cancel: vi.fn(),
  },
  parseToolPayload: (content) => {
    if (!content) return null
    try { return JSON.parse(content) } catch { return null }
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  agentConversationService.list.mockResolvedValue([])
})

describe('toolCallSummary', () => {
  it('extracts the tool name from the parsed payload', () => {
    const message = { content: '{"tool":"webSearch","query":"x"}' }
    const summary = toolCallSummary(message, vi.fn())
    expect(summary.tool).toBe('webSearch')
    expect(summary.payload).toEqual({ tool: 'webSearch', query: 'x' })
  })

  it('falls back to message.toolName when the payload has no tool', () => {
    const summary = toolCallSummary({ content: '{"a":1}', toolName: 'readFile' }, vi.fn())
    expect(summary.tool).toBe('readFile')
  })

  it('uses the translated unknown label when nothing is available', () => {
    const t = vi.fn((key) => `i18n:${key}`)
    const summary = toolCallSummary({ content: 'bad json' }, t)
    expect(summary.tool).toBe('i18n:blog.agentChat.unknownTool')
    expect(t).toHaveBeenCalledWith('blog.agentChat.unknownTool')
  })

  it('returns null payload for empty content', () => {
    const summary = toolCallSummary({}, vi.fn())
    expect(summary.payload).toBe(null)
  })
})

describe('compactToolResult', () => {
  it('passes short strings through unchanged', () => {
    expect(compactToolResult('ok')).toBe('ok')
  })

  it('serializes objects', () => {
    expect(compactToolResult({ a: 1 })).toBe('{"a":1}')
  })

  it('truncates long strings to 200 chars with an ellipsis', () => {
    const long = 'x'.repeat(500)
    const compact = compactToolResult(long)
    expect(compact).toHaveLength(201)
    expect(compact.endsWith('…')).toBe(true)
  })

  it('serializes long objects and truncates the result', () => {
    const compact = compactToolResult({ data: 'y'.repeat(300) })
    expect(compact).toHaveLength(201)
  })

  it('returns undefined for nullish input', () => {
    expect(compactToolResult(null)).toBe('null')
    expect(compactToolResult(undefined)).toBeUndefined()
    expect(compactToolResult('')).toBe('')
  })
})

describe('useAgentConversation new conversation', () => {
  it('uses the created shell without entering recovery loading and streams the first message', async () => {
    const { useAgentConversation } = await import('./useAgentConversation.js')
    const calls = []
    const shell = {
      conversation: { id: 42, status: 'ready', runVersion: 0 },
      messages: [],
    }
    agentConversationService.create.mockImplementation(async () => {
      calls.push('create')
      return shell
    })
    agentConversationService.sendMessageStream.mockImplementation(async () => {
      calls.push('stream')
    })
    agentConversationService.get.mockImplementation(async () => {
      calls.push('get')
      return shell
    })

    const { result, rerender } = renderHook(
      ({ conversationId }) => useAgentConversation({ conversationId }),
      { initialProps: { conversationId: null } },
    )

    await act(async () => {
      await result.current.createConversation('hello')
    })
    expect(result.current.liveSteps).toContainEqual({ type: 'user', content: 'hello' })
    rerender({ conversationId: '42' })

    expect(result.current.loading).toBe(false)
    await waitFor(() => expect(agentConversationService.sendMessageStream).toHaveBeenCalledWith(
      '42',
      'hello',
      expect.any(Function),
      expect.objectContaining({ _silent: true }),
    ))
    expect(calls.indexOf('stream')).toBeLessThan(calls.indexOf('get'))
  })
})
