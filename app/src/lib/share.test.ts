import { describe, expect, it } from 'vitest'

import { ZONES } from '@/config/zones'

import { discordTimestamp, plainText } from './share'

// Golden strings: the live site produced these for 2026-10-31 23:00 UTC.
const GOLDEN_INSTANT = Date.parse('2026-10-31T23:00:00Z')

describe('discordTimestamp', () => {
  it('matches the existing format', () => {
    expect(discordTimestamp(GOLDEN_INSTANT)).toBe('<t:1793487600:f>')
  })
})

describe('plainText', () => {
  it('matches the existing format byte for byte', () => {
    expect(plainText(GOLDEN_INSTANT, ZONES)).toBe(
      [
        '🇨🇦 4:00PM (16:00) - 2026-10-31',
        '🇺🇦 1:00AM (1:00) - 2026-11-01',
        '🇵🇱 12:00AM (00:00) - 2026-11-01',
      ].join('\n'),
    )
  })

  it('carries half hours', () => {
    expect(plainText(Date.parse('2026-07-15T10:30:00Z'), ZONES)).toBe(
      [
        '🇨🇦 3:30AM (3:30) - 2026-07-15',
        '🇺🇦 1:30PM (13:30) - 2026-07-15',
        '🇵🇱 12:30PM (12:30) - 2026-07-15',
      ].join('\n'),
    )
  })
})
