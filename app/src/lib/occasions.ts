import { moonLight, moonPhase } from './moon'
import type { IsoDate } from './time'

/** Days that leave something special in the picture. */
export type Occasion =
  /** The whole picture hangs upside down. */
  | 'aprilFools'
  /** A painted egg hides in the grass, Sunday and Monday of either Easter. */
  | 'easter'
  /** A stork nests on a cottage roof while storks are here, April to August. */
  | 'storks'
  /** Kupala Night, 23 June: the camp fire burns big and throws sparks. */
  | 'kupala'
  /** Pumpkins by the cottages, bats in place of the birds. */
  | 'halloween'
  /** Fireworks at the night end of the day, and at its start the day after. */
  | 'newYearsEve'
  | 'newYearsDay'
  /** Northern lights, on the darkest nights of the long-night half of the year. */
  | 'aurora'

const isoOf = (time: number): IsoDate => new Date(time).toISOString().slice(0, 10)

/** Western Easter Sunday: the Gregorian computus, the anonymous algorithm. */
export function westernEaster(year: number): IsoDate {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return isoOf(Date.UTC(year, month - 1, day))
}

/**
 * Orthodox Easter Sunday: the Julian computus, moved onto our calendar. The two calendars are 13
 * days apart from 1900 to 2099.
 */
export function orthodoxEaster(year: number): IsoDate {
  const d = (19 * (year % 19) + 15) % 30
  const e = (2 * (year % 4) + 4 * (year % 7) - d + 34) % 7
  const month = Math.floor((d + e + 114) / 31)
  const day = ((d + e + 114) % 31) + 1
  return isoOf(Date.UTC(year, month - 1, day + 13))
}

const DAY_MS = 86_400_000

/** Sunday and Monday of an Easter. */
const easterDays = (sunday: IsoDate) => [sunday, isoOf(Date.parse(sunday) + DAY_MS)]

/** Below this much of its disc lit, the moon leaves the sky dark enough for the northern lights. */
const AURORA_MOONLIGHT = 0.15
/** September to March: summer nights are short and light up north. */
const AURORA_MONTHS = new Set([9, 10, 11, 12, 1, 2, 3])

export function occasionsOf(date: IsoDate): ReadonlySet<Occasion> {
  const year = Number(date.slice(0, 4))
  const month = Number(date.slice(5, 7))
  const monthDay = date.slice(5)
  const found = new Set<Occasion>()
  if (monthDay === '04-01') found.add('aprilFools')
  if ([westernEaster(year), orthodoxEaster(year)].flatMap(easterDays).includes(date)) found.add('easter')
  if (month >= 4 && month <= 8) found.add('storks')
  if (monthDay === '06-23') found.add('kupala')
  if (monthDay === '10-31') found.add('halloween')
  if (monthDay === '12-31') found.add('newYearsEve')
  if (monthDay === '01-01') found.add('newYearsDay')
  if (AURORA_MONTHS.has(month) && moonLight(moonPhase(date)).lit < AURORA_MOONLIGHT) found.add('aurora')
  return found
}
