import { describe, expect, it } from 'vitest'

import { findZone, homeFirst, ZONES } from './zones'

describe('homeFirst', () => {
  it.each([
    ['America/Vancouver', ['canada', 'ukraine', 'poland']],
    ['Europe/Kyiv', ['ukraine', 'canada', 'poland']],
    ['Europe/Warsaw', ['poland', 'canada', 'ukraine']],
  ])('puts the reader in %s first', (timeZone, order) => {
    expect(homeFirst(findZone(timeZone)).map(({ id }) => id)).toEqual(order)
  })

  it('keeps the usual order for a reader elsewhere', () => {
    expect(homeFirst(undefined)).toBe(ZONES)
  })
})
