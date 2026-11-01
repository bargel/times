import { describe, expect, it } from 'vitest'

import { monthGrid, monthLabel, monthOf, shiftDateByMonths, shiftMonth } from './calendar'

describe('monthGrid', () => {
  it('starts on a Monday, even when the month starts on one', () => {
    expect(monthGrid('2026-11')[0]).toBe('2026-10-26')
    expect(monthGrid('2026-06')[0]).toBe('2026-06-01')
  })

  it('treats a month starting on Sunday as the end of a week', () => {
    expect(monthGrid('2026-03')[0]).toBe('2026-02-23')
  })

  it.each(['2026-02', '2026-11', '2027-08', '2028-02'])('always shows six weeks in %s', (month) => {
    const grid = monthGrid(month)
    expect(grid).toHaveLength(42)
    expect(grid).toContain(`${month}-01`)
    expect(new Set(grid).size).toBe(42)
  })

  it('crosses a DST change without repeating or skipping a day', () => {
    const grid = monthGrid('2026-10')
    expect(grid.slice(grid.indexOf('2026-10-24'), grid.indexOf('2026-10-24') + 3)).toEqual([
      '2026-10-24',
      '2026-10-25',
      '2026-10-26',
    ])
  })
})

describe('months', () => {
  it('moves across years', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
  })

  it('keeps the day, or falls back to the last day of a shorter month', () => {
    expect(shiftDateByMonths('2026-11-15', 1)).toBe('2026-12-15')
    expect(shiftDateByMonths('2026-01-31', 1)).toBe('2026-02-28')
    expect(shiftDateByMonths('2028-01-31', 1)).toBe('2028-02-29')
    expect(shiftDateByMonths('2026-03-31', -1)).toBe('2026-02-28')
  })

  it('reads a month from a date and names it', () => {
    expect(monthOf('2026-11-15')).toBe('2026-11')
    expect(monthLabel('2026-11')).toBe('November 2026')
  })
})
