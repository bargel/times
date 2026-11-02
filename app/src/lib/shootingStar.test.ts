import { describe, expect, it } from 'vitest'

import { nextShootingStar, nextShootingStarDelay } from './shootingStar'

/** Always the same number, so each draw lands where the test expects. */
const always = (value: number) => () => value

describe('nextShootingStar', () => {
  it('starts in the night at the start of the day and falls right', () => {
    const star = nextShootingStar(always(0.2))
    expect(star.x).toBeGreaterThanOrEqual(2)
    expect(star.x).toBeLessThanOrEqual(17)
    expect(star.angle).toBeGreaterThan(0)
    expect(star.angle).toBeLessThan(90)
  })

  it('starts in the night at the end of the day and falls left', () => {
    const star = nextShootingStar(always(0.8))
    expect(star.x).toBeGreaterThanOrEqual(83)
    expect(star.x).toBeLessThanOrEqual(98)
    expect(star.angle).toBeGreaterThan(90)
    expect(star.angle).toBeLessThan(180)
  })

  it('stays high in the sky and quick', () => {
    for (const value of [0, 0.5, 0.999]) {
      const star = nextShootingStar(always(value))
      expect(star.y).toBeLessThanOrEqual(30)
      expect(star.duration).toBeLessThanOrEqual(800)
    }
  })
})

describe('nextShootingStarDelay', () => {
  it('waits between 5 and 12 seconds', () => {
    expect(nextShootingStarDelay(always(0))).toBe(5_000)
    expect(nextShootingStarDelay(always(1))).toBe(12_000)
  })
})
