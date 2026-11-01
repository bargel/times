import type { Zone } from '@/config/zones'

import { clock12, clock24, wallClockAt } from './time'

/** Discord renders this in each reader's own time zone. */
export function discordTimestamp(instant: number): string {
  return `<t:${Math.floor(instant / 1000)}:f>`
}

/** One `🇨🇦 4:00PM (16:00) - 2026-10-31` line per zone. */
export function plainText(instant: number, zones: readonly Zone[]): string {
  return zones
    .map((zone) => {
      const wall = wallClockAt(instant, zone.timeZone)
      return `${zone.emoji} ${clock12(wall)} (${clock24(wall)}) - ${wall.date}`
    })
    .join('\n')
}
