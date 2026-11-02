import { describe, expect, it } from 'vitest'

import {
  colourAt,
  inkReadsBetter,
  isFestive,
  ridgePath,
  ridgeTop,
  seasonOf,
  type ColourStop,
} from './scenery'

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

describe('seasonOf', () => {
  it('follows the months of the northern year', () => {
    expect(seasonOf('2026-12-01')).toBe('winter')
    expect(seasonOf('2027-02-28')).toBe('winter')
    expect(seasonOf('2027-03-01')).toBe('spring')
    expect(seasonOf('2027-05-31')).toBe('spring')
    expect(seasonOf('2027-06-01')).toBe('summer')
    expect(seasonOf('2027-08-31')).toBe('summer')
    expect(seasonOf('2026-09-01')).toBe('autumn')
    expect(seasonOf('2026-11-30')).toBe('autumn')
  })
})

describe('isFestive', () => {
  it('lasts all of December and January', () => {
    expect(isFestive('2026-11-30')).toBe(false)
    expect(isFestive('2026-12-01')).toBe(true)
    expect(isFestive('2027-01-31')).toBe(true)
    expect(isFestive('2027-02-01')).toBe(false)
  })
})

describe('inkReadsBetter', () => {
  it('keeps the hours white over dark ground', () => {
    expect(inkReadsBetter('#090d24')).toBe(false)
    expect(inkReadsBetter('#2f6656')).toBe(false)
    expect(inkReadsBetter('#3a467f')).toBe(false)
  })

  it('turns them dark over snow', () => {
    expect(inkReadsBetter('#e9eef3')).toBe(true)
    expect(inkReadsBetter('#cdb3ad')).toBe(true)
  })
})
