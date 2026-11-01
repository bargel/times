import { describe, expect, it } from 'vitest'

import { ZONES } from '@/config/zones'

import { messagesFor, monthLabel, pickLocale, shortDate, type Locale } from './i18n'

const LOCALES: Locale[] = ['en', 'uk', 'pl']

describe('pickLocale', () => {
  it.each([
    [['uk-UA'], 'uk'],
    [['pl'], 'pl'],
    [['PL-pl'], 'pl'],
    [['en-CA', 'uk'], 'en'],
    [['de-DE', 'pl-PL', 'en'], 'pl'],
    [['fr-CA'], 'en'],
    [[], 'en'],
  ])('reads %j as %s', (languages, expected) => {
    expect(pickLocale(languages)).toBe(expected)
  })

  it('is not fooled by names every object has', () => {
    expect(pickLocale(['constructor'])).toBe('en')
  })
})

describe('messages', () => {
  it.each(LOCALES)('has seven weekdays and every city in %s', (language) => {
    const messages = messagesFor(language)
    expect(messages.weekdays).toHaveLength(7)
    for (const zone of ZONES) expect(messages.cities[zone.id]).toBeTruthy()
  })
})

describe('dates', () => {
  it.each<[Locale, RegExp]>([
    ['en', /Sat.*31.*Oct/],
    ['uk', /сб.*31.*жовт/],
    ['pl', /sob.*31.*paź/],
  ])('writes a short date in %s', (language, expected) => {
    expect(shortDate('2026-10-31', language)).toMatch(expected)
  })

  it.each<[Locale, string]>([
    ['en', 'November 2026'],
    ['uk', 'Листопад 2026'],
    ['pl', 'Listopad 2026'],
  ])('capitalises a month in %s', (language, expected) => {
    expect(monthLabel('2026-11', language)).toBe(expected)
  })
})
