import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getRetryDelay,
  isRetryAllowed,
  shouldRetryRequest,
} from './httpPolicy.js'

test('only safe methods retry by default', () => {
  assert.equal(isRetryAllowed({ method: 'GET' }), true)
  assert.equal(isRetryAllowed({ method: 'post' }), false)
  assert.equal(isRetryAllowed({ method: 'POST', _retryIdempotent: true }), true)
})

test('retry policy handles network and server failures within the limit', () => {
  const get = { method: 'get', _retryCount: 0 }
  assert.equal(shouldRetryRequest(get, undefined), true)
  assert.equal(shouldRetryRequest(get, { status: 503 }), true)
  assert.equal(shouldRetryRequest(get, { status: 404 }), false)
  assert.equal(shouldRetryRequest({ ...get, _retryCount: 2 }, undefined), false)
  assert.equal(shouldRetryRequest({ ...get, _skipRetry: true }, undefined), false)
})

test('retry delay grows exponentially', () => {
  assert.deepEqual([1, 2, 3].map(getRetryDelay), [500, 1000, 2000])
})
