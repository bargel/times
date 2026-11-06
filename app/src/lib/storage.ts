export type PageStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/** Keeps nothing: every visit starts as the first one did. */
const NOTHING_KEPT: PageStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

/**
 * The site's storage. Where the browser keeps a site from storing anything (Safari's "Block All
 * Cookies", for one), merely reaching for `localStorage` throws, before any guard at the place it is
 * used, and the page would not start at all.
 */
export function pageStorage(): PageStorage {
  try {
    return localStorage
  } catch {
    return NOTHING_KEPT
  }
}
