import { describe, expect, it } from 'vitest'

import { zoneInEffect } from './timeZoneRules'

describe('zoneInEffect', () => {
  const place = ['Test/Place']
  const first = { timeZones: place, from: 100, use: 'Etc/GMT+7' }
  const second = { timeZones: place, from: 200, use: 'Etc/GMT+8' }

  it.each([
    [50, 'Test/Place'],
    [100, 'Etc/GMT+7'],
    [199, 'Etc/GMT+7'],
    [200, 'Etc/GMT+8'],
  ])('at %i uses %s, whichever order the rules are listed in', (instant, zone) => {
    expect(zoneInEffect('Test/Place', instant, [first, second])).toBe(zone)
    expect(zoneInEffect('Test/Place', instant, [second, first])).toBe(zone)
  })

  it('leaves other places alone', () => {
    expect(zoneInEffect('Test/Other', 300, [first, second])).toBe('Test/Other')
  })

  it('knows British Columbia stays on UTC-7 from 2026-11-01', () => {
    expect(zoneInEffect('America/Vancouver', Date.UTC(2026, 10, 1, 8, 59))).toBe('America/Vancouver')
    expect(zoneInEffect('America/Vancouver', Date.UTC(2026, 10, 1, 9))).toBe('Etc/GMT+7')
  })
})
