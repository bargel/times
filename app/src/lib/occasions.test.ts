import { describe, expect, it } from 'vitest'

import { occasionsOf, orthodoxEaster, westernEaster } from './occasions'

describe('Easter', () => {
  it('finds western Easter Sunday', () => {
    expect(westernEaster(2024)).toBe('2024-03-31')
    expect(westernEaster(2025)).toBe('2025-04-20')
    expect(westernEaster(2026)).toBe('2026-04-05')
    expect(westernEaster(2027)).toBe('2027-03-28')
  })

  it('finds Orthodox Easter Sunday', () => {
    expect(orthodoxEaster(2024)).toBe('2024-05-05')
    expect(orthodoxEaster(2025)).toBe('2025-04-20')
    expect(orthodoxEaster(2026)).toBe('2026-04-12')
    expect(orthodoxEaster(2027)).toBe('2027-05-02')
  })
})

describe('occasionsOf', () => {
  it('hides the egg on Sunday and Monday of both Easters, and not between', () => {
    for (const date of ['2026-04-05', '2026-04-06', '2026-04-12', '2026-04-13']) {
      expect(occasionsOf(date).has('easter')).toBe(true)
    }
    for (const date of ['2026-04-04', '2026-04-07', '2026-04-11', '2026-04-14']) {
      expect(occasionsOf(date).has('easter')).toBe(false)
    }
  })

  it('marks the fixed days', () => {
    expect(occasionsOf('2026-04-01').has('aprilFools')).toBe(true)
    expect(occasionsOf('2026-06-23').has('kupala')).toBe(true)
    expect(occasionsOf('2026-10-31').has('halloween')).toBe(true)
    expect(occasionsOf('2026-12-31').has('newYearsEve')).toBe(true)
    expect(occasionsOf('2027-01-01').has('newYearsDay')).toBe(true)
    expect(occasionsOf('2026-06-24').size).toBe(1)
  })

  it('keeps the stork from April to August', () => {
    expect(occasionsOf('2026-03-31').has('storks')).toBe(false)
    expect(occasionsOf('2026-04-01').has('storks')).toBe(true)
    expect(occasionsOf('2026-08-31').has('storks')).toBe(true)
    expect(occasionsOf('2026-09-01').has('storks')).toBe(false)
  })

  it('shows the northern lights only near a new moon, September to March', () => {
    // 2026-11-09 is a new moon; 2026-11-02 is a last quarter; 2026-08-12 is new but in summer.
    expect(occasionsOf('2026-11-09').has('aurora')).toBe(true)
    expect(occasionsOf('2026-11-02').has('aurora')).toBe(false)
    expect(occasionsOf('2026-08-12').has('aurora')).toBe(false)
  })
})
