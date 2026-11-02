import { describe, expect, it } from 'vitest'

import { colourAt, ridgePath, ridgeTop, type ColourStop } from './scenery'

const STOPS: ColourStop[] = [
  [0, '#000000'],
  [0.5, '#ff0080'],
  [1, '#ffffff'],
]

describe('colourAt', () => {
  it('gives a stop its own colour', () => {
    expect(colourAt(STOPS, 0)).toBe('#000000')
    expect(colourAt(STOPS, 0.5)).toBe('#ff0080')
    expect(colourAt(STOPS, 1)).toBe('#ffffff')
  })

  it('blends between stops', () => {
    expect(colourAt(STOPS, 0.25)).toBe('#800040')
    expect(colourAt(STOPS, 0.75)).toBe('#ff80c0')
  })
})

describe('ridges', () => {
  const ridge = { top: 50, amplitude: 10, waves: 3, phase: 1 }

  it('stays within its amplitude', () => {
    for (let place = 0; place <= 1; place += 0.01) {
      expect(Math.abs(ridgeTop(ridge, place) - 50)).toBeLessThanOrEqual(10)
    }
  })

  it('fills down to the bottom across the whole width', () => {
    const path = ridgePath(ridge)
    expect(path).toMatch(/^M0 /)
    expect(path).toMatch(/L1200 [\d.]+V100H0Z$/)
  })
})
