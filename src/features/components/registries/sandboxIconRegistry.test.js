import assert from 'node:assert/strict'
import test from 'node:test'
import SANDBOX_ICONS from './sandboxIconRegistry.js'

test('provides every icon required by the built-in Toast sandbox preset', () => {
  const requiredIcons = [
    'Activity',
    'AlertCircle',
    'CheckCircle2',
    'Clock',
    'ExternalLink',
    'Info',
    'Layers',
    'Palette',
    'X',
    'XCircle',
  ]

  requiredIcons.forEach((name) => {
    assert.equal(typeof SANDBOX_ICONS[name], 'object', `${name} must be registered`)
  })
  assert.equal(Object.isFrozen(SANDBOX_ICONS), true)
})
