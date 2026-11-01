import { describe, expect, it } from 'vitest'

import { findZone } from '@/config/zones'

import {
  clock12,
  clock24,
  clockDisplay,
  dayAxis,
  isIsoDate,
  nextDate,
  previousDate,
  SLOT_MS,
  slotForZoneClock,
  wallClockAt,
  wallClockToInstant,
} from './time'

const utc = (iso: string) => Date.parse(iso)

describe('wallClockAt', () => {
  it('reads date and time in each zone', () => {
    const instant = utc('2026-10-31T23:00:00Z')
    expect(wallClockAt(instant, 'America/Vancouver')).toEqual({ date: '2026-10-31', hours: 16, minutes: 0 })
    expect(wallClockAt(instant, 'Europe/Kyiv')).toEqual({ date: '2026-11-01', hours: 1, minutes: 0 })
    expect(wallClockAt(instant, 'Europe/Warsaw')).toEqual({ date: '2026-11-01', hours: 0, minutes: 0 })
  })

  it('handles zones with a 45-minute offset', () => {
    expect(wallClockAt(utc('2026-06-01T00:00:00Z'), 'Asia/Kathmandu')).toEqual({
      date: '2026-06-01',
      hours: 5,
      minutes: 45,
    })
  })

  // The old code read the offset at noon of the selected date, so these were an hour off.
  it.each([
    ['America/Vancouver', '2026-03-08T09:59:00Z', 1, 59],
    ['America/Vancouver', '2026-03-08T10:00:00Z', 3, 0],
    ['America/Vancouver', '2025-11-02T08:59:00Z', 1, 59],
    ['America/Vancouver', '2025-11-02T09:00:00Z', 1, 0],
    ['Europe/Warsaw', '2026-03-29T00:59:00Z', 1, 59],
    ['Europe/Warsaw', '2026-03-29T01:00:00Z', 3, 0],
    ['Europe/Warsaw', '2026-10-25T00:59:00Z', 2, 59],
    ['Europe/Warsaw', '2026-10-25T01:00:00Z', 2, 0],
    ['Europe/Kyiv', '2026-03-29T00:59:00Z', 2, 59],
    ['Europe/Kyiv', '2026-03-29T01:00:00Z', 4, 0],
    ['Europe/Kyiv', '2026-10-25T00:59:00Z', 3, 59],
    ['Europe/Kyiv', '2026-10-25T01:00:00Z', 3, 0],
  ])('reads %s across the DST change at %s', (timeZone, iso, hours, minutes) => {
    expect(wallClockAt(utc(iso), timeZone)).toMatchObject({ hours, minutes })
  })
})

describe('wallClockToInstant', () => {
  it.each(['UTC', 'Europe/Kyiv', 'America/Vancouver', 'Asia/Kathmandu'])('round-trips in %s', (timeZone) => {
    const instant = wallClockToInstant('2026-07-15', 9 * 60 + 30, timeZone)
    expect(wallClockAt(instant, timeZone)).toEqual({ date: '2026-07-15', hours: 9, minutes: 30 })
  })

  it('moves a time skipped by DST to right after the jump', () => {
    const instant = wallClockToInstant('2026-03-08', 2 * 60 + 30, 'America/Vancouver')
    expect(wallClockAt(instant, 'America/Vancouver')).toMatchObject({ hours: 3, minutes: 30 })
  })

  it('takes the first of two identical times', () => {
    expect(wallClockToInstant('2025-11-02', 60, 'America/Vancouver')).toBe(utc('2025-11-02T08:00:00Z'))
  })
})

// These must pass on a device with old time zone data too. Node 22 is one: it still has
// tzdata 2026a, where the clocks in British Columbia go back on 2026-11-01.
describe('British Columbia keeps summer time for good', () => {
  const hoursBehind = (iso: string, timeZone: string) => {
    const at = utc(iso)
    const minutes = (zone: string) => {
      const { date, hours, minutes } = wallClockAt(at, zone)
      return Date.parse(`${date}T00:00:00Z`) / 60_000 + hours * 60 + minutes
    }
    return (minutes(timeZone) - minutes('America/Vancouver')) / 60
  }

  it('does not move the clocks on 2026-11-01', () => {
    expect(wallClockAt(utc('2026-11-01T08:59:00Z'), 'America/Vancouver')).toMatchObject({ hours: 1, minutes: 59 })
    expect(wallClockAt(utc('2026-11-01T09:00:00Z'), 'America/Vancouver')).toMatchObject({ hours: 2, minutes: 0 })
    expect(dayAxis('2026-11-01', 'America/Vancouver').slots).toBe(48)
  })

  it.each([
    ['2026-12-15T12:00:00Z', 5],
    ['2027-03-14T12:00:00Z', 5],
    ['2027-07-01T12:00:00Z', 5],
    ['2027-11-07T12:00:00Z', 5],
    ['2030-01-15T12:00:00Z', 5],
  ])('stays on UTC-7 at %s', (iso, hours) => {
    expect(wallClockAt(utc(iso), 'America/Vancouver')).toMatchObject({ hours, minutes: 0 })
    expect(wallClockAt(utc(iso), 'Canada/Pacific')).toMatchObject({ hours, minutes: 0 })
  })

  it('keeps past dates on the old rule', () => {
    expect(wallClockAt(utc('2025-12-15T12:00:00Z'), 'America/Vancouver')).toMatchObject({ hours: 4 })
    expect(wallClockAt(utc('2026-02-15T12:00:00Z'), 'America/Vancouver')).toMatchObject({ hours: 4 })
    expect(dayAxis('2026-03-08', 'America/Vancouver').slots).toBe(46)
    expect(dayAxis('2025-11-02', 'America/Vancouver').slots).toBe(50)
  })

  it.each([
    ['last winter', '2026-01-15T12:00:00Z', 10, 9],
    ['this summer', '2026-07-15T12:00:00Z', 10, 9],
    ['this winter', '2026-12-15T12:00:00Z', 9, 8],
    ['next summer', '2027-07-15T12:00:00Z', 10, 9],
    ['next winter', '2027-12-15T12:00:00Z', 9, 8],
  ])('gives the right gap to Kyiv and Warsaw %s', (_, iso, kyiv, warsaw) => {
    expect(hoursBehind(iso, 'Europe/Kyiv')).toBe(kyiv)
    expect(hoursBehind(iso, 'Europe/Warsaw')).toBe(warsaw)
  })
})

describe('dayAxis', () => {
  it('has 48 slots on a normal day and 49 stops including 24:00', () => {
    expect(dayAxis('2026-07-15', 'Europe/Kyiv')).toEqual({ start: utc('2026-07-14T21:00:00Z'), slots: 48 })
  })

  it.each([
    ['Europe/Kyiv', '2026-03-29', 46],
    ['Europe/Kyiv', '2026-10-25', 50],
    ['Europe/Warsaw', '2026-03-29', 46],
    ['Europe/Warsaw', '2026-10-25', 50],
    ['America/Vancouver', '2026-03-08', 46],
    ['America/Vancouver', '2026-11-01', 48],
    ['Asia/Kathmandu', '2026-03-29', 48],
    ['UTC', '2026-03-29', 48],
  ])('%s on %s has %i slots', (timeZone, date, slots) => {
    expect(dayAxis(date, timeZone).slots).toBe(slots)
  })

  it('starts when midnight itself is skipped by DST', () => {
    const { start, slots } = dayAxis('2026-03-08', 'America/Havana')
    expect(wallClockAt(start, 'America/Havana')).toEqual({ date: '2026-03-08', hours: 1, minutes: 0 })
    expect(slots).toBe(46)
  })

  it('ends on the next midnight, where the 24:00 stop lands', () => {
    const { start, slots } = dayAxis('2026-07-15', 'Europe/Warsaw')
    expect(wallClockAt(start + slots * SLOT_MS, 'Europe/Warsaw')).toEqual({
      date: '2026-07-16',
      hours: 0,
      minutes: 0,
    })
  })
})

describe('clocks', () => {
  // Same output as parseTime() in the old Sliders.vue.
  it.each([
    [0, 0, '12:00AM', '00:00'],
    [0, 30, '12:30AM', '00:30'],
    [1, 0, '1:00AM', '1:00'],
    [9, 30, '9:30AM', '9:30'],
    [11, 30, '11:30AM', '11:30'],
    [12, 0, '12:00PM', '12:00'],
    [12, 30, '12:30PM', '12:30'],
    [13, 0, '1:00PM', '13:00'],
    [23, 30, '11:30PM', '23:30'],
  ])('formats %i:%i', (hours, minutes, twelve, twentyFour) => {
    expect(clock12({ hours, minutes })).toBe(twelve)
    expect(clock24({ hours, minutes })).toBe(twentyFour)
  })

  it('keeps minutes that are not on the half hour', () => {
    expect(clock12({ hours: 16, minutes: 7 })).toBe('4:07PM')
    expect(clock24({ hours: 16, minutes: 7 })).toBe('16:07')
  })
})

describe('slotForZoneClock', () => {
  const axis = dayAxis('2026-11-01', 'Europe/Kyiv')
  const at = (slot: number) => axis.start + slot * SLOT_MS

  it('moves the moment so the zone shows the target time', () => {
    const slot = slotForZoneClock(at(2), axis, 18 * 60, 'America/Vancouver')
    expect(wallClockAt(at(slot), 'America/Vancouver')).toMatchObject({ hours: 18, minutes: 0 })
  })

  it('stays on the selected day when a flag wraps past the end of the line', () => {
    const plain = dayAxis('2026-07-15', 'Europe/Kyiv')
    // Vancouver reads 14:00 at the start of the Kyiv day; dragging it back to 13:00 lands at the end.
    const slot = slotForZoneClock(plain.start, plain, 13 * 60, 'America/Vancouver')
    expect(slot).toBe(46)
    const landed = plain.start + slot * SLOT_MS
    expect(wallClockAt(landed, 'America/Vancouver')).toMatchObject({ hours: 13, minutes: 0 })
    expect(wallClockAt(landed, 'Europe/Kyiv').date).toBe('2026-07-15')
  })

  it.each([
    ['America/Vancouver', 'Europe/Kyiv', '2025-11-02'],
    ['America/Vancouver', 'Europe/Kyiv', '2026-03-08'],
    ['Europe/Warsaw', 'America/Vancouver', '2026-10-25'],
    ['Europe/Kyiv', 'Europe/Warsaw', '2026-03-29'],
  ])('lands on the dragged time when %s changes clocks that day (home %s, %s)', (timeZone, home, date) => {
    const day = dayAxis(date, home)
    // Times right around the jump itself can not all exist, so check the part of the day past it.
    for (const hour of [14, 16, 18, 20]) {
      const slot = slotForZoneClock(day.start + 2 * SLOT_MS, day, hour * 60, timeZone)
      const landed = day.start + slot * SLOT_MS
      expect(wallClockAt(landed, timeZone)).toMatchObject({ hours: hour, minutes: 0 })
      expect(slot).toBeLessThanOrEqual(day.slots)
    }
  })

  it('keeps the two ends of the home day apart', () => {
    for (const from of [0, 1, 24, 47, 48]) {
      expect(slotForZoneClock(at(from), axis, 0, 'Europe/Kyiv')).toBe(0)
      expect(slotForZoneClock(at(from), axis, 24 * 60, 'Europe/Kyiv')).toBe(48)
    }
  })

  it('goes to the nearer end when another zone reads the same time at both', () => {
    const warsawDay = dayAxis('2026-07-15', 'Europe/Warsaw')
    // Vancouver reads 15:00 both when the Warsaw day starts and when it ends.
    const near = (slot: number) =>
      slotForZoneClock(warsawDay.start + slot * SLOT_MS, warsawDay, 15 * 60, 'America/Vancouver')
    expect(near(2)).toBe(0)
    expect(near(46)).toBe(48)
  })

  it('reaches the 24:00 stop from the home zone', () => {
    expect(slotForZoneClock(at(47), axis, 24 * 60, 'Europe/Kyiv')).toBe(48)
  })

  it('leaves the 24:00 stop back into the same day', () => {
    expect(slotForZoneClock(at(48), axis, 23.5 * 60, 'Europe/Kyiv')).toBe(47)
  })

  it('keeps zones in step when the home zone is not on the half hour', () => {
    const kathmandu = dayAxis('2026-07-15', 'Asia/Kathmandu')
    const slot = slotForZoneClock(kathmandu.start, kathmandu, 12 * 60, 'Asia/Kathmandu')
    expect(slot).toBe(24)
  })

  it('stays inside a short DST day', () => {
    const short = dayAxis('2026-03-29', 'Europe/Kyiv')
    for (let target = 0; target < 24 * 60; target += 30) {
      const slot = slotForZoneClock(short.start + 10 * SLOT_MS, short, target, 'Europe/Warsaw')
      expect(slot).toBeGreaterThanOrEqual(0)
      expect(slot).toBeLessThanOrEqual(short.slots)
    }
  })
})

describe('display formats', () => {
  it('pads the big readout', () => {
    expect(clockDisplay({ hours: 9, minutes: 5 })).toBe('09:05')
  })
})

describe('dates', () => {
  it('rolls over months and years', () => {
    expect(nextDate('2026-10-31')).toBe('2026-11-01')
    expect(nextDate('2026-12-31')).toBe('2027-01-01')
    expect(previousDate('2026-11-01')).toBe('2026-10-31')
    expect(previousDate('2027-01-01')).toBe('2026-12-31')
  })

  it('accepts only real calendar dates', () => {
    expect(isIsoDate('2026-02-28')).toBe(true)
    expect(isIsoDate('2026-02-30')).toBe(false)
    expect(isIsoDate('')).toBe(false)
  })
})

describe('findZone', () => {
  it('recognises the old Kyiv spelling that some browsers still report', () => {
    expect(findZone('Europe/Kiev')?.id).toBe('ukraine')
    expect(findZone('Europe/Kyiv')?.id).toBe('ukraine')
    expect(findZone('Asia/Tokyo')).toBeUndefined()
  })
})
