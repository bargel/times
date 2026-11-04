import { describe, expect, it } from 'vitest'

import page from '../../index.html?raw'

import { shouldApplyNow } from './updates'

describe('shouldApplyNow', () => {
  it('puts a new version in while the page is out of sight and follows the clock', () => {
    expect(shouldApplyNow({ hidden: true, live: true })).toBe(true)
  })

  it('never reloads a page someone is looking at', () => {
    expect(shouldApplyNow({ hidden: false, live: true })).toBe(false)
    expect(shouldApplyNow({ hidden: false, live: false })).toBe(false)
  })

  it('keeps a picked time, which may be on its way into Discord', () => {
    expect(shouldApplyNow({ hidden: true, live: false })).toBe(false)
  })
})

describe('home screen icon', () => {
  it('is the large one, so it stays sharp on a phone', () => {
    expect(page).toMatch(/rel="apple-touch-icon"[^>]*href="\/icon-512\.png"/)
  })
})
