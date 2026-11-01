export type ZoneId = 'canada' | 'ukraine' | 'poland'

export interface Zone {
  id: ZoneId
  country: string
  timeZone: string
  /** Goes into the copied plain text. The UI draws its own SVG flag instead. */
  emoji: string
  /** Other names a browser may report for this zone, e.g. the pre-2022 Kyiv spelling. */
  aliases?: readonly string[]
  /**
   * How low the flag hangs under the line. Warsaw is always an hour left of Kyiv,
   * so it hangs lower and its pole clears Kyiv's flag. Vancouver is never near either.
   */
  lane: 0 | 1
}

/** Order here is the display order and the line order of the copied plain text. */
export const ZONES: readonly Zone[] = [
  {
    id: 'canada',
    country: 'Canada',
    timeZone: 'America/Vancouver',
    emoji: '🇨🇦',
    lane: 0,
  },
  {
    id: 'ukraine',
    country: 'Ukraine',
    timeZone: 'Europe/Kyiv',
    emoji: '🇺🇦',
    aliases: ['Europe/Kiev', 'Europe/Uzhgorod', 'Europe/Zaporozhye'],
    lane: 0,
  },
  {
    id: 'poland',
    country: 'Poland',
    timeZone: 'Europe/Warsaw',
    emoji: '🇵🇱',
    lane: 1,
  },
]

export function findZone(timeZone: string): Zone | undefined {
  return ZONES.find((zone) => zone.timeZone === timeZone || zone.aliases?.includes(timeZone))
}
