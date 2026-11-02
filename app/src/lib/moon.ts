import type { IsoDate } from './time'

/** The mean length of the moon's cycle, new to new, in days. */
const SYNODIC_DAYS = 29.530588853
/** A new moon to count from: 6 January 2000, 18:14 UTC. */
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14)
const DAY_MS = 86_400_000

/**
 * Where the moon is in its cycle at noon UTC on the day: 0 new, 0.25 first quarter, 0.5 full,
 * 0.75 last quarter. The mean cycle drifts from the real one by up to about half a day, which a
 * picture of the day doesn't show.
 */
export function moonPhase(date: IsoDate): number {
  const days = (Date.parse(`${date}T12:00:00Z`) - KNOWN_NEW_MOON) / DAY_MS
  return (((days % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS) / SYNODIC_DAYS
}

/** The moon's lit part, drawn on a disc of radius 10 at (12, 12). */
export interface MoonLight {
  /** SVG path of the lit part, lit on the right; flip it when waning. */
  path: string
  /** After the full moon the light is on the left, as seen from the north. */
  waning: boolean
  /** How much of the disc is lit, 0 to 1. */
  lit: number
}

export function moonLight(phase: number): MoonLight {
  const cos = Math.cos(2 * Math.PI * phase)
  // The right limb from top to bottom, then the terminator, a half ellipse, back up to the top.
  // It bows towards the light while a crescent and away from it once past a quarter.
  const width = Math.abs(10 * cos).toFixed(3)
  const away = cos > 0 ? 0 : 1
  return {
    path: `M12 2A10 10 0 0 1 12 22A${width} 10 0 0 ${away} 12 2Z`,
    waning: phase > 0.5,
    lit: (1 - cos) / 2,
  }
}
