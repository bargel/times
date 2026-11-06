import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'

import { wallClockAt } from '@/lib/time'

import { useTimeSelection } from './useTimeSelection'

const utc = (iso: string) => Date.parse(iso)

function selection(timeZone: string) {
  const scope = effectScope()
  const result = scope.run(() => useTimeSelection(timeZone))!
  return { ...result, stop: () => scope.stop() }
}

describe('useTimeSelection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(utc('2026-10-31T23:07:42Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts live on the exact minute, on the date of the home zone', () => {
    const { isLive, date, instant, stop } = selection('Europe/Kyiv')
    expect(isLive.value).toBe(true)
    // 01:07 on Nov 1 in Kyiv. The old code paired this date with the UTC time, a day off.
    expect(date.value).toBe('2026-11-01')
    expect(instant.value).toBe(utc('2026-10-31T23:07:00Z'))
    stop()
  })

  it('follows the clock while live, across midnight', () => {
    const { date, instant, stop } = selection('UTC')
    expect(date.value).toBe('2026-10-31')
    vi.advanceTimersByTime(53 * 60_000)
    expect(instant.value).toBe(utc('2026-11-01T00:00:00Z'))
    expect(date.value).toBe('2026-11-01')
    stop()
  })

  it('stops following the clock once a slot is picked', () => {
    const { isLive, instant, selectSlot, stop } = selection('UTC')
    selectSlot(10)
    expect(isLive.value).toBe(false)
    expect(instant.value).toBe(utc('2026-10-31T05:00:00Z'))
    vi.advanceTimersByTime(5 * 60_000)
    expect(instant.value).toBe(utc('2026-10-31T05:00:00Z'))
    stop()
  })

  it('reaches the 24:00 stop and no further', () => {
    const { instant, selectSlot, stop } = selection('UTC')
    selectSlot(48)
    expect(instant.value).toBe(utc('2026-11-01T00:00:00Z'))
    selectSlot(99)
    expect(instant.value).toBe(utc('2026-11-01T00:00:00Z'))
    stop()
  })

  it('keeps the time of day when the date changes, snapped to a slot', () => {
    const { date, instant, isLive, selectDate, stop } = selection('UTC')
    selectDate('2026-12-25')
    expect(isLive.value).toBe(false)
    expect(date.value).toBe('2026-12-25')
    expect(instant.value).toBe(utc('2026-12-25T23:00:00Z'))
    stop()
  })

  it('keeps the slot the line shows, the nearest one, when the date changes', () => {
    vi.setSystemTime(utc('2026-10-31T10:29:00Z'))
    const { instant, selectDate, stop } = selection('UTC')
    selectDate('2026-12-25')
    expect(instant.value).toBe(utc('2026-12-25T10:30:00Z'))
    stop()
  })

  it('keeps the 24:00 stop the line shows from a quarter to midnight', () => {
    vi.setSystemTime(utc('2026-10-31T23:50:00Z'))
    const { atDayEnd, date, instant, selectDate, stop } = selection('UTC')
    selectDate('2026-12-25')
    expect(date.value).toBe('2026-12-25')
    expect(atDayEnd.value).toBe(true)
    expect(instant.value).toBe(utc('2026-12-26T00:00:00Z'))
    stop()
  })

  it.each([
    ['into a short day', '2027-03-27', '2027-03-28'],
    ['past a short day', '2027-03-28', '2027-03-29'],
    ['into a long day', '2027-10-30', '2027-10-31'],
    ['past a long day', '2027-10-31', '2027-11-01'],
  ])('keeps the time on the clock when moving %s', (_, from, to) => {
    const { instant, moveZoneClock, selectDate, stop } = selection('Europe/Warsaw')
    selectDate(from)
    moveZoneClock('Europe/Warsaw', 16 * 60)
    selectDate(to)
    expect(wallClockAt(instant.value, 'Europe/Warsaw')).toEqual({ date: to, hours: 16, minutes: 0 })
    stop()
  })

  it('stays on 24:00 when the date changes there', () => {
    const { atDayEnd, selectDate, selectSlot, stop } = selection('Europe/Warsaw')
    selectSlot(48)
    selectDate('2027-03-28')
    expect(atDayEnd.value).toBe(true)
    stop()
  })

  it('reaches both ends of the selected day from the line', () => {
    const { atDayEnd, date, instant, moveZoneClock, selectDate, stop } = selection('Europe/Warsaw')
    selectDate('2026-07-15')
    moveZoneClock('Europe/Warsaw', 0)
    expect(wallClockAt(instant.value, 'Europe/Warsaw')).toEqual({ date: '2026-07-15', hours: 0, minutes: 0 })
    moveZoneClock('Europe/Warsaw', 24 * 60)
    expect(atDayEnd.value).toBe(true)
    expect(date.value).toBe('2026-07-15')
    moveZoneClock('Europe/Warsaw', 0)
    expect(atDayEnd.value).toBe(false)
    stop()
  })

  it('sets a minute between the half hours, in any zone', () => {
    const { instant, moveZoneClock, selectDate, stop } = selection('Europe/Kyiv')
    selectDate('2026-12-15')
    moveZoneClock('America/Vancouver', 18 * 60 + 10)
    expect(wallClockAt(instant.value, 'America/Vancouver')).toMatchObject({ hours: 18, minutes: 10 })
    stop()
  })

  it('keeps the minutes of a half hour that ends the home day', () => {
    // Midnight to midnight in Vancouver runs 09:00 to 09:00 in Kyiv, and the clock is near the end.
    const { instant, moveZoneClock, stop } = selection('America/Vancouver')
    moveZoneClock('Europe/Kyiv', 9 * 60 + 30)
    expect(wallClockAt(instant.value, 'Europe/Kyiv')).toMatchObject({ hours: 9, minutes: 30 })
    stop()
  })

  it('cancelling an edit goes back to following the clock', () => {
    const { beginEdit, cancelEdit, isLive, moveZoneClock, stop } = selection('Europe/Kyiv')
    beginEdit()
    moveZoneClock('Europe/Kyiv', 9 * 60)
    moveZoneClock('Europe/Kyiv', 9 * 60 + 30)
    cancelEdit()
    expect(isLive.value).toBe(true)
    stop()
  })

  it('cancelling an edit goes back to the time picked before it', () => {
    const { beginEdit, cancelEdit, instant, moveZoneClock, selectDate, stop } =
      selection('Europe/Kyiv')
    selectDate('2026-12-15')
    moveZoneClock('Europe/Kyiv', 18 * 60)
    beginEdit()
    moveZoneClock('Europe/Kyiv', 7 * 60 + 25)
    cancelEdit()
    expect(wallClockAt(instant.value, 'Europe/Kyiv')).toEqual({
      date: '2026-12-15',
      hours: 18,
      minutes: 0,
    })
    stop()
  })

  it('keeps a picked minute when the date changes', () => {
    const { date, instant, moveZoneClock, selectDate, stop } = selection('Europe/Kyiv')
    selectDate('2026-12-15')
    moveZoneClock('Europe/Kyiv', 18 * 60 + 45)
    selectDate('2026-12-16')
    expect(date.value).toBe('2026-12-16')
    expect(wallClockAt(instant.value, 'Europe/Kyiv')).toEqual({
      date: '2026-12-16',
      hours: 18,
      minutes: 45,
    })
    stop()
  })

  it('ignores a date before the first selectable one', () => {
    const { date, isLive, selectDate, stop } = selection('UTC')
    selectDate('2024-12-31')
    expect(isLive.value).toBe(true)
    expect(date.value).toBe('2026-10-31')
    selectDate('2025-01-01')
    expect(date.value).toBe('2025-01-01')
    stop()
  })

  it('ignores a cleared or invalid date', () => {
    const { date, isLive, selectDate, stop } = selection('UTC')
    selectDate('')
    selectDate('2026-02-30')
    expect(date.value).toBe('2026-10-31')
    expect(isLive.value).toBe(true)
    stop()
  })

  it('clamps the slot to a shorter DST day', () => {
    const { axis, position, selectDate, selectSlot, stop } = selection('Europe/Kyiv')
    selectDate('2026-07-15')
    selectSlot(48)
    selectDate('2026-03-29')
    expect(axis.value.slots).toBe(46)
    expect(position.value).toBe(46)
    stop()
  })

  it('moves everything when one zone is dragged, without leaving the date', () => {
    const { date, instant, isLive, moveZoneClock, stop } = selection('Europe/Kyiv')
    moveZoneClock('America/Vancouver', 9 * 60)
    expect(isLive.value).toBe(false)
    expect(date.value).toBe('2026-11-01')
    expect(instant.value).toBe(utc('2026-11-01T16:00:00Z'))
    stop()
  })

  it.each([
    ['Europe/Kyiv', '2026-11-01'],
    ['Europe/Warsaw', '2026-11-01'],
    ['America/Vancouver', '2026-10-31'],
  ])('takes the date from the local zone in %s', (timeZone, expected) => {
    const { date, stop } = selection(timeZone)
    expect(date.value).toBe(expected)
    stop()
  })

  it.each(['Europe/Kyiv', 'Europe/Warsaw'])('picks a day and a time from %s', (timeZone) => {
    const { date, instant, moveZoneClock, selectDate, stop } = selection(timeZone)
    selectDate('2026-12-15')
    moveZoneClock(timeZone, 18 * 60)
    expect(date.value).toBe('2026-12-15')
    const expected = timeZone === 'Europe/Kyiv' ? '2026-12-15T16:00:00Z' : '2026-12-15T17:00:00Z'
    expect(instant.value).toBe(utc(expected))
    stop()
  })

  it('knows when it stands on the 24:00 stop', () => {
    const { atDayEnd, selectSlot, stop } = selection('UTC')
    expect(atDayEnd.value).toBe(false)
    selectSlot(48)
    expect(atDayEnd.value).toBe(true)
    stop()
  })

  it('returns to the clock', () => {
    const { isLive, instant, selectSlot, followNow, stop } = selection('UTC')
    selectSlot(1)
    followNow()
    expect(isLive.value).toBe(true)
    expect(instant.value).toBe(utc('2026-10-31T23:07:00Z'))
    stop()
  })

  it('stops its timer with the scope', () => {
    const { stop } = selection('UTC')
    expect(vi.getTimerCount()).toBe(1)
    stop()
    expect(vi.getTimerCount()).toBe(0)
  })
})
