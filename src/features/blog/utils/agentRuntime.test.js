import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildStoredMessages,
  createAbortError,
  getStoredProcessLogs,
  isAbortError,
} from './agentRuntime.js'

test('groups adjacent process messages and preserves user/result messages', () => {
  const messages = buildStoredMessages([
    { id: 1, kind: 'process', content: 'analyzing', stage: 'analyze' },
    { id: 2, kind: 'process', content: 'writing', stage: 'write' },
    { id: 3, role: 'user', content: 'focus on hooks' },
    { id: 4, kind: 'result', content: 'React hooks guide' },
  ])

  assert.deepEqual(messages[0].logs, ['analyzing', 'writing'])
  assert.equal(messages[0].stage, 'write')
  assert.equal(messages[1].content, 'focus on hooks')
  assert.equal(messages[2].kind, 'result')
})

test('extracts process logs and recognizes cancellation variants', () => {
  assert.deepEqual(getStoredProcessLogs([
    { kind: 'process', content: 'one' },
    { kind: 'result', content: 'ignored' },
  ]), ['one'])
  assert.equal(isAbortError(createAbortError()), true)
  assert.equal(isAbortError({ code: 'ERR_CANCELED' }), true)
  assert.equal(isAbortError(new Error('network')), false)
})
