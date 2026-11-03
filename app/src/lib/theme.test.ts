import { describe, expect, it } from 'vitest'

import page from '../../index.html?raw'

import {
  BAR_COLOURS,
  barColoursOf,
  readTheme,
  saveTheme,
  THEME_KEY,
  THEMES,
  type Theme,
} from './theme'

/** A storage that keeps what it is given, as `localStorage` does. */
function memory(initial: Record<string, string> = {}) {
  const kept = new Map(Object.entries(initial))
  return {
    kept,
    getItem: (key: string) => kept.get(key) ?? null,
    setItem: (key: string, value: string) => void kept.set(key, value),
    removeItem: (key: string) => void kept.delete(key),
  }
}

/** A storage the browser has closed off, as in some private windows. */
const closed = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
  removeItem: () => {
    throw new Error('blocked')
  },
}

describe('readTheme', () => {
  it.each<Theme>(['day', 'night'])('reads back a kept %s', (theme) => {
    expect(readTheme(memory({ [THEME_KEY]: theme }))).toBe(theme)
  })

  it('follows the device when nothing is kept', () => {
    expect(readTheme(memory())).toBe('auto')
  })

  it('follows the device when the kept value is not a theme', () => {
    expect(readTheme(memory({ [THEME_KEY]: 'sepia' }))).toBe('auto')
  })

  it('follows the device when storage is off limits', () => {
    expect(readTheme(closed)).toBe('auto')
  })
})

describe('saveTheme', () => {
  it.each(THEMES)('keeps %s so that it reads back the same', (theme) => {
    const storage = memory()
    saveTheme(theme, storage)
    expect(readTheme(storage)).toBe(theme)
  })

  it('keeps nothing for auto', () => {
    const storage = memory({ [THEME_KEY]: 'night' })
    saveTheme('auto', storage)
    expect(storage.kept.size).toBe(0)
  })

  it('does not throw when storage is off limits', () => {
    expect(() => saveTheme('night', closed)).not.toThrow()
  })
})

describe('colours', () => {
  it('paints the bar the picked ground on every device', () => {
    expect(barColoursOf('night')).toEqual({ light: BAR_COLOURS.night, dark: BAR_COLOURS.night })
    expect(barColoursOf('auto')).toEqual({ light: BAR_COLOURS.day, dark: BAR_COLOURS.night })
  })
})

/** The page reads the pick itself before its first paint; it must look where this module writes. */
describe('the script in index.html', () => {
  it('reads the same key and paints the same colours', () => {
    expect(page).toContain(`'${THEME_KEY}'`)
    expect(page).toContain(BAR_COLOURS.day)
    expect(page).toContain(BAR_COLOURS.night)
  })

  it('runs in the head, before the app and after the bar colours it changes', () => {
    const head = page.slice(0, page.indexOf('</head>'))
    expect(head).toContain(THEME_KEY)
    expect(head.lastIndexOf('<meta name="theme-color"')).toBeLessThan(head.indexOf(THEME_KEY))
  })
})
