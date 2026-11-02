import { describe, expect, it } from 'vitest'

import { moonLight, moonPhase } from './moon'

/** How far apart two phases are around the cycle. */
const apart = (one: number, other: number) => {
  const gap = Math.abs(one - other) % 1
  return Math.min(gap, 1 - gap)
}

describe('moonPhase', () => {
  it('is new on the day of a solar eclipse', () => {
    expect(apart(moonPhase('2026-08-12'), 0)).toBeLessThan(0.03)
  })

  it('is full on the days of lunar eclipses', () => {
    expect(apart(moonPhase('2026-03-03'), 0.5)).toBeLessThan(0.03)
    expect(apart(moonPhase('2026-08-28'), 0.5)).toBeLessThan(0.03)
  })

  it('stays within the cycle', () => {
    for (const date of ['1999-12-31', '2026-11-02', '2040-06-15']) {
      expect(moonPhase(date)).toBeGreaterThanOrEqual(0)
      expect(moonPhase(date)).toBeLessThan(1)
    }
  })
})

describe('moonLight', () => {
  it('lights the right side while waxing and the left while waning', () => {
    expect(moonLight(0.2).waning).toBe(false)
    expect(moonLight(0.8).waning).toBe(true)
  })

  it('lights none of it when new, half at a quarter, all of it when full', () => {
    expect(moonLight(0).lit).toBeCloseTo(0)
    expect(moonLight(0.25).lit).toBeCloseTo(0.5)
    expect(moonLight(0.5).lit).toBeCloseTo(1)
  })

  it('bows the terminator towards the light while a crescent, away from it past a quarter', () => {
    expect(moonLight(0.1).path).toMatch(/0 0 0 12 2Z$/)
    expect(moonLight(0.4).path).toMatch(/0 0 1 12 2Z$/)
  })
})
