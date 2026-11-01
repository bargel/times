/**
 * Time zone rules that are too new to trust a device to know.
 *
 * Browsers read zones from data that ships with the OS or the browser, so an
 * older phone keeps following old rules. When a place changes its clocks, add
 * it here, and the app gives the right time on every device.
 */
interface RuleChange {
  /** The names a browser may use for this place. */
  timeZones: readonly string[]
  /** The instant the new rule starts. */
  from: number
  /** A zone with the new offset. `Etc/GMT+7` means UTC-7: the sign in these names is reversed. */
  use: string
}

const RULE_CHANGES: readonly RuleChange[] = [
  // British Columbia made Pacific Daylight Time permanent: the clocks do not go back
  // on 2026-11-01 (tzdata 2026b). Devices with older data would show UTC-8 from then on.
  {
    timeZones: ['America/Vancouver', 'Canada/Pacific'],
    from: Date.UTC(2026, 10, 1, 9),
    use: 'Etc/GMT+7',
  },
]

/** The zone whose clock is right for this place at this instant: the latest rule already started. */
export function zoneInEffect(
  timeZone: string,
  instant: number,
  changes: readonly RuleChange[] = RULE_CHANGES,
): string {
  let latest: RuleChange | undefined
  for (const change of changes) {
    const applies = change.timeZones.includes(timeZone) && instant >= change.from
    if (applies && (!latest || change.from > latest.from)) latest = change
  }
  return latest?.use ?? timeZone
}
