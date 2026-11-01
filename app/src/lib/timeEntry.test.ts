import { describe, expect, it } from 'vitest'

import { minuteOf, moveCursor, stepPart, typeDigit, type TimeEntry } from './timeEntry'

function type(start: string, digits: string, cursor = 0): TimeEntry {
  return [...digits].reduce<TimeEntry>((entry, digit) => typeDigit(entry, Number(digit)), {
    time: start,
    cursor,
  })
}

describe('typeDigit', () => {
  it.each([
    ['07:41', '1810', '18:10'],
    ['07:41', '0930', '09:30'],
    ['07:41', '2359', '23:59'],
    ['07:41', '0000', '00:00'],
  ])('from %s, typing %s gives %s', (start, digits, expected) => {
    expect(type(start, digits).time).toBe(expected)
  })

  it('never shows an impossible hour on the way', () => {
    expect(type('09:15', '2').time).toBe('23:15')
  })

  it('takes a digit that cannot start hours as their second one', () => {
    expect(type('12:00', '7')).toEqual({ time: '07:00', cursor: 2 })
  })

  it('takes a digit that cannot start minutes as their second one', () => {
    expect(type('12:00', '7', 2)).toEqual({ time: '12:07', cursor: 3 })
  })

  it('refuses an hour past 23', () => {
    expect(type('20:00', '7', 1)).toEqual({ time: '20:00', cursor: 1 })
  })

  it('stays on the last digit', () => {
    expect(type('12:34', '89', 3)).toEqual({ time: '12:39', cursor: 3 })
  })
})

describe('stepPart', () => {
  it('moves hours from their digits and goes round', () => {
    expect(stepPart({ time: '23:30', cursor: 1 }, 1).time).toBe('00:30')
    expect(stepPart({ time: '00:30', cursor: 0 }, -1).time).toBe('23:30')
  })

  it('moves minutes from their digits and goes round', () => {
    expect(stepPart({ time: '10:59', cursor: 2 }, 1).time).toBe('10:00')
    expect(stepPart({ time: '10:00', cursor: 3 }, -1).time).toBe('10:59')
  })
})

describe('the rest', () => {
  it('stops the cursor at both ends', () => {
    expect(moveCursor(0, -1)).toBe(0)
    expect(moveCursor(3, 1)).toBe(3)
    expect(moveCursor(1, 1)).toBe(2)
  })

  it('reads a time as minutes', () => {
    expect(minuteOf('18:10')).toBe(18 * 60 + 10)
  })
})
