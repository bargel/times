import { describe, expect, it } from 'vitest'

import { nextUfo, nextUfoDelay, UFO_MEAN_DELAY_MS } from './ufo'

const always = (value: number) => () => value

describe('nextUfoDelay', () => {
  it('can come at once', () => {
    expect(nextUfoDelay(always(0))).toBe(0)
  })

  it('comes within the mean about two times in three', () => {
    expect(nextUfoDelay(always(1 - Math.exp(-1)))).toBeCloseTo(UFO_MEAN_DELAY_MS)
  })

  it('comes within a minute about one time in twenty', () => {
    expect(nextUfoDelay(always(0.048))).toBeLessThan(60_000)
    expect(nextUfoDelay(always(0.052))).toBeGreaterThan(60_000)
  })
})

describe('nextUfo', () => {
  it('visits either night end, high in the sky', () => {
    expect(nextUfo(always(0.2)).atStart).toBe(true)
    expect(nextUfo(always(0.8)).atStart).toBe(false)
    expect(nextUfo(always(0.999)).y).toBeLessThanOrEqual(30)
  })
})
