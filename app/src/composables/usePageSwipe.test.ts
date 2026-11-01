import { describe, expect, it } from 'vitest'

import { pageStepFor } from './usePageSwipe'

describe('pageStepFor', () => {
  it('turns forward on a swipe to the left and back on a swipe to the right', () => {
    expect(pageStepFor(-80, 400)).toBe(1)
    expect(pageStepFor(80, 400)).toBe(-1)
  })

  it('stays on a short, slow movement', () => {
    expect(pageStepFor(-40, 400)).toBe(0)
    expect(pageStepFor(40, 400)).toBe(0)
  })

  it('turns on a short, quick flick', () => {
    expect(pageStepFor(-30, 50)).toBe(1)
  })

  it('does not take a tiny quick twitch for a flick', () => {
    expect(pageStepFor(-12, 5)).toBe(0)
  })
})
