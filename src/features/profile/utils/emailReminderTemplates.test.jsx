import { describe, expect, it } from 'vitest'
import {
  looksLikeHtml,
  looksLikeFullHtmlDocument,
  resolveContentType,
  TEMPLATE_IDS,
  TEMPLATE_NONE,
  TEMPLATE_SWATCH,
} from './emailReminderTemplates.js'

describe('emailReminderTemplates', () => {
  it('exposes the four built-in templates and the none sentinel', () => {
    expect(TEMPLATE_IDS).toEqual(['classic', 'minimal', 'card', 'notice'])
    expect(TEMPLATE_NONE).toBe('none')
    TEMPLATE_IDS.forEach((id) => expect(TEMPLATE_SWATCH[id]).toBeTruthy())
  })

  describe('looksLikeHtml', () => {
    it('detects html tags', () => {
      expect(looksLikeHtml('<b>bold</b>')).toBe(true)
      expect(looksLikeHtml('<p>段落</p>')).toBe(true)
    })

    it('rejects plain text', () => {
      expect(looksLikeHtml('hello world')).toBe(false)
      expect(looksLikeHtml('')).toBe(false)
    })
  })

  describe('looksLikeFullHtmlDocument', () => {
    it('detects doctype and html roots', () => {
      expect(looksLikeFullHtmlDocument('<!doctype html><html><body>x</body></html>')).toBe(true)
      expect(looksLikeFullHtmlDocument('<html lang="en">x</html>')).toBe(true)
    })

    it('rejects fragments', () => {
      expect(looksLikeFullHtmlDocument('<b>bold</b>')).toBe(false)
    })
  })

  describe('resolveContentType', () => {
    it('returns HTML when a template is selected', () => {
      expect(resolveContentType('plain text', 'classic')).toBe('HTML')
    })

    it('returns HTML for html-looking content without a template', () => {
      expect(resolveContentType('<p>x</p>', TEMPLATE_NONE)).toBe('HTML')
    })

    it('returns PLAIN for plain text without a template', () => {
      expect(resolveContentType('hello', TEMPLATE_NONE)).toBe('PLAIN')
      expect(resolveContentType('hello')).toBe('PLAIN')
    })
  })
})