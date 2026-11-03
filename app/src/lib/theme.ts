/** The page's look: always day, always night, or whichever the device uses. */
export type Theme = 'day' | 'night' | 'auto'

export const THEMES: readonly Theme[] = ['day', 'night', 'auto']

/**
 * Where the pick is kept between visits. The script at the top of `index.html` reads it too, before
 * the first paint, so the page never shows the other theme for a moment: keep the two in step.
 */
export const THEME_KEY = 'pluacan-theme'

/**
 * The page's ground in each theme, which the browser's own bar on a phone takes on too. Kept in
 * step with `--ground` in tokens.css.
 */
export const BAR_COLOURS = { day: '#f3f7fb', night: '#0c1029' } as const

type Reads = Pick<Storage, 'getItem'>
type Writes = Pick<Storage, 'setItem' | 'removeItem'>

/** The pick from an earlier visit; `auto` when there is none or storage is off limits. */
export function readTheme(storage: Reads): Theme {
  try {
    const kept = storage.getItem(THEME_KEY)
    return kept === 'day' || kept === 'night' ? kept : 'auto'
  } catch {
    return 'auto'
  }
}

/** `auto` keeps nothing, so the page simply follows the device again. */
export function saveTheme(theme: Theme, storage: Writes): void {
  try {
    if (theme === 'auto') storage.removeItem(THEME_KEY)
    else storage.setItem(THEME_KEY, theme)
  } catch {
    // Storage off limits: the pick lasts until the page is closed.
  }
}

/** The bar colour for a device in light mode and in dark mode. */
export function barColoursOf(theme: Theme): { light: string; dark: string } {
  if (theme === 'auto') return { light: BAR_COLOURS.day, dark: BAR_COLOURS.night }
  return { light: BAR_COLOURS[theme], dark: BAR_COLOURS[theme] }
}

/** Puts the page, and the browser's bar over it, in this theme. tokens.css reads `data-theme`. */
export function applyTheme(theme: Theme, page: Document = document): void {
  if (theme === 'auto') delete page.documentElement.dataset.theme
  else page.documentElement.dataset.theme = theme
  const colours = barColoursOf(theme)
  for (const meta of page.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = meta.media.includes('dark') ? colours.dark : colours.light
  }
}
