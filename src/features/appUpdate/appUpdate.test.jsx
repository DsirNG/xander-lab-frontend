import { describe, expect, it } from 'vitest'
import { isChunkLoadError } from './appUpdate'

describe('isChunkLoadError', () => {
  it.each([
    'Failed to fetch dynamically imported module: /assets/LoginPage.js',
    'Importing a module script failed',
    'ChunkLoadError: Loading chunk 42 failed',
  ])('recognizes stale lazy-loaded assets: %s', (message) => {
    expect(isChunkLoadError(new TypeError(message))).toBe(true)
  })

  it('does not classify unrelated application errors as update errors', () => {
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false)
  })
})
