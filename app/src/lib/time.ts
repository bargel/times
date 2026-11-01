import { zoneInEffect } from '@/config/timeZoneRules'

const MINUTE_MS = 60_000
export const DAY_MINUTES = 24 * 60
const DAY_MS = DAY_MINUTES * MINUTE_MS

export const SLOT_MINUTES = 30
export const SLOT_MS = SLOT_MINUTES * MINUTE_MS
/** The half-hour steps along the 24-hour line. */
export const STEPS_ON_LINE = DAY_MINUTES / SLOT_MINUTES

/** Calendar date as `YYYY-MM-DD`. */
export type IsoDate = string

export interface WallClock {
  date: IsoDate
  hours: number
  minutes: number
}

export interface DayAxis {
  /** The instant the day starts in its time zone. */
  start: number
  /** Number of 30-minute steps to the next midnight: 48, or 46/50 on a DST change day. */
  slots: number
}

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    formatters.set(timeZone, formatter)
  }
  return formatter
}

function partsAt(instant: number, timeZone: string) {
  const parts: Record<string, number> = {}
  const formatter = formatterFor(zoneInEffect(timeZone, instant))
  for (const { type, value } of formatter.formatToParts(instant)) {
    if (type !== 'literal') parts[type] = Number(value)
  }
  return parts as Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', number>
}

export function wallClockAt(instant: number, timeZone: string): WallClock {
  const { year, month, day, hour, minute } = partsAt(instant, timeZone)
  return {
    date: toIsoDate(year, month, day),
    hours: hour,
    minutes: minute,
  }
}

function toIsoDate(year: number, month: number, day: number): IsoDate {
  return `${String(year).padStart(4, '0')}-${pad2(month)}-${pad2(day)}`
}

function offsetMsAt(instant: number, timeZone: string): number {
  const { year, month, day, hour, minute, second } = partsAt(instant, timeZone)
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute, second)
  return wallAsUtc - Math.floor(instant / 1000) * 1000
}

/**
 * Finds the instant a wall clock in `timeZone` shows `minuteOfDay` on `date`.
 * A time that happens twice resolves to the first one; a time skipped by a DST
 * jump resolves to the moment right after the jump.
 */
export function wallClockToInstant(date: IsoDate, minuteOfDay: number, timeZone: string): number {
  const wall = Date.parse(`${date}T00:00:00Z`) + minuteOfDay * MINUTE_MS
  const beforeChange = wall - offsetMsAt(wall - DAY_MS, timeZone)
  const afterChange = wall - offsetMsAt(wall + DAY_MS, timeZone)
  const earlier = Math.min(beforeChange, afterChange)
  const later = Math.max(beforeChange, afterChange)

  if (earlier + offsetMsAt(earlier, timeZone) === wall) return earlier
  return later
}

export function nextDate(date: IsoDate): IsoDate {
  return new Date(Date.parse(`${date}T00:00:00Z`) + DAY_MS).toISOString().slice(0, 10)
}

export function previousDate(date: IsoDate): IsoDate {
  return new Date(Date.parse(`${date}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10)
}

export function dayAxis(date: IsoDate, timeZone: string): DayAxis {
  const start = wallClockToInstant(date, 0, timeZone)
  const end = wallClockToInstant(nextDate(date), 0, timeZone)
  return { start, slots: Math.round((end - start) / SLOT_MS) }
}

export function isIsoDate(value: string): value is IsoDate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
}

export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function floorToMinute(instant: number): number {
  return Math.floor(instant / MINUTE_MS) * MINUTE_MS
}

/** `4:00PM`, `12:30AM`. */
export function clock12({ hours, minutes }: Pick<WallClock, 'hours' | 'minutes'>): string {
  return `${hours % 12 || 12}:${pad2(minutes)}${hours < 12 ? 'AM' : 'PM'}`
}

/** `16:00`, `9:30`, `00:30`. Only the midnight hour keeps a leading zero, as the copied text always has. */
export function clock24({ hours, minutes }: Pick<WallClock, 'hours' | 'minutes'>): string {
  return `${hours === 0 ? '00' : hours}:${pad2(minutes)}`
}

/** `09:00` for the big readout. The copied text keeps its own format, see `clock24`. */
export function clockDisplay({ hours, minutes }: Pick<WallClock, 'hours' | 'minutes'>): string {
  return `${pad2(hours)}:${pad2(minutes)}`
}

/** `Sat 31 Oct`. */
export function shortDate(date: IsoDate): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function minuteOfDay({ hours, minutes }: Pick<WallClock, 'hours' | 'minutes'>): number {
  return hours * 60 + minutes
}

/**
 * Finds the slot of the selected day at which `timeZone` shows `targetMinute`, from 0 to
 * `DAY_MINUTES`. Reading every slot's clock keeps this right across DST changes.
 *
 * A time can happen twice: 00:00 at both ends of the home zone's day, or a repeated hour
 * when the clocks go back. Then 0 means the start of the day, `DAY_MINUTES` the end, and
 * anything else the one nearer to `instant`.
 */
export function slotForZoneClock(
  instant: number,
  axis: DayAxis,
  targetMinute: number,
  timeZone: string,
): number {
  const wanted = targetMinute % DAY_MINUTES
  const currentSlot = (instant - axis.start) / SLOT_MS
  let best = 0
  let bestMiss = Infinity

  for (let slot = 0; slot <= axis.slots; slot++) {
    const shown = minuteOfDay(wallClockAt(axis.start + slot * SLOT_MS, timeZone))
    const distance = Math.abs(shown - wanted)
    const miss = Math.min(distance, DAY_MINUTES - distance)
    const preferred =
      targetMinute === DAY_MINUTES ||
      (targetMinute !== 0 && Math.abs(slot - currentSlot) < Math.abs(best - currentSlot))
    if (miss < bestMiss || (miss === bestMiss && preferred)) {
      best = slot
      bestMiss = miss
    }
  }
  return best
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}
