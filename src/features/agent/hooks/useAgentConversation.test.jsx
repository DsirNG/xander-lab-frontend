import { describe, expect, it, vi } from 'vitest'
import { toolCallSummary, compactToolResult } from './useAgentConversation.js'

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