import type { ZoneId } from '@/config/zones'

import type { Theme } from './theme'
import type { IsoDate } from './time'
import type { YearMonth } from './calendar'

export type Locale = 'en' | 'uk' | 'pl'

interface Messages {
  now: string
  copyForDiscord: string
  copyPlainText: string
  copied: string
  copyFailed: string
  clipboardBlocked: string
  textToCopy: string
  previousDay: string
  nextDay: string
  date: string
  previousMonth: string
  nextMonth: string
  calendar: string
  /** The theme switch, and each of its buttons. */
  theme: string
  themes: Record<Theme, string>
  timeIn: (city: string) => string
  /** Monday first, as the calendar's page is. */
  weekdays: readonly string[]
  cities: Record<ZoneId, string>
}

const MESSAGES: Record<Locale, Messages> = {
  en: {
    now: 'Now',
    copyForDiscord: 'Copy for Discord',
    copyPlainText: 'Copy plain text',
    copied: 'Copied!',
    copyFailed: 'Copy failed',
    clipboardBlocked: 'The browser blocked the clipboard. Copy this by hand:',
    textToCopy: 'Text to copy',
    previousDay: 'Previous day',
    nextDay: 'Next day',
    date: 'Date',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    calendar: 'Calendar',
    theme: 'Theme',
    themes: { day: 'Day', night: 'Night', auto: 'As on this device' },
    timeIn: (city) => `Time in ${city}`,
    weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    cities: { canada: 'Vancouver', ukraine: 'Kyiv', poland: 'Warsaw' },
  },
  uk: {
    now: 'Зараз',
    copyForDiscord: 'Копія для Discord',
    copyPlainText: 'Копія текстом',
    copied: 'Скопійовано!',
    copyFailed: 'Не вдалося',
    clipboardBlocked: 'Браузер заблокував буфер обміну. Скопіюйте вручну:',
    textToCopy: 'Текст для копіювання',
    previousDay: 'Попередній день',
    nextDay: 'Наступний день',
    date: 'Дата',
    previousMonth: 'Попередній місяць',
    nextMonth: 'Наступний місяць',
    calendar: 'Календар',
    theme: 'Тема',
    themes: { day: 'День', night: 'Ніч', auto: 'Як на пристрої' },
    timeIn: (city) => `Час: ${city}`,
    weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
    cities: { canada: 'Ванкувер', ukraine: 'Київ', poland: 'Варшава' },
  },
  pl: {
    now: 'Teraz',
    copyForDiscord: 'Kopiuj do Discorda',
    copyPlainText: 'Kopiuj tekst',
    copied: 'Skopiowano!',
    copyFailed: 'Nie udało się',
    clipboardBlocked: 'Przeglądarka zablokowała schowek. Skopiuj ręcznie:',
    textToCopy: 'Tekst do skopiowania',
    previousDay: 'Poprzedni dzień',
    nextDay: 'Następny dzień',
    date: 'Data',
    previousMonth: 'Poprzedni miesiąc',
    nextMonth: 'Następny miesiąc',
    calendar: 'Kalendarz',
    theme: 'Motyw',
    themes: { day: 'Dzień', night: 'Noc', auto: 'Jak w urządzeniu' },
    timeIn: (city) => `Czas: ${city}`,
    weekdays: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'],
    cities: { canada: 'Vancouver', ukraine: 'Kijów', poland: 'Warszawa' },
  },
}

/** en-GB, not en-US: the page writes the day before the month in every language. */
const INTL_TAGS: Record<Locale, string> = { en: 'en-GB', uk: 'uk', pl: 'pl' }

/** The first of the reader's languages the page has, in the reader's own order; otherwise English. */
export function pickLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0]
    if (base && Object.hasOwn(MESSAGES, base)) return base as Locale
  }
  return 'en'
}

export const locale = pickLocale(navigator.languages)
export const t = MESSAGES[locale]

export function messagesFor(language: Locale): Messages {
  return MESSAGES[language]
}

/** `Sat 31 Oct`, `сб, 31 жовт.`, `sob., 31 paź`. */
export function shortDate(date: IsoDate, language: Locale = locale): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(INTL_TAGS[language], {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** `November 2026`, `Листопад 2026`, `Listopad 2026`: built from parts, to leave out Ukrainian's `р.`. */
export function monthLabel(month: YearMonth, language: Locale = locale): string {
  const parts = new Intl.DateTimeFormat(INTL_TAGS[language], {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).formatToParts(new Date(`${month}-01T00:00:00Z`))
  const name = parts.find(({ type }) => type === 'month')!.value
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${month.slice(0, 4)}`
}
