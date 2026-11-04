/**
 * An installed copy on iOS starts with the whole screen as its height and no safe area, then about a
 * tenth of a second later moves under the status bar and loses its height (932 → 873 on a 430×932
 * iPhone), with the home indicator's inset arriving at the same moment. The page stands low on the
 * screen, so it would jump. Instead, the height and the inset from the last launch are held from the
 * first frame, by the script at the top of `index.html`, and let go once the real ones match.
 */

/** Where the last launch's numbers are kept. The script in `index.html` reads it too: keep in step. */
export const VIEWPORT_KEY = 'pluacan-viewport'

export interface Held {
  height: number
  bottom: number
}

export type Shape = 'portrait' | 'landscape'

/** If no matching numbers arrive by then, the held ones go anyway. */
const LET_GO_AFTER_MS = 1500
/** A size that has not changed for this long has settled. */
const SETTLED_AFTER_MS = 500

export function shapeOf(width: number, height: number): Shape {
  return width > height ? 'landscape' : 'portrait'
}

const isHeld = (value: unknown): value is Held =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Held).height === 'number' &&
  typeof (value as Held).bottom === 'number'

function readAll(storage: Pick<Storage, 'getItem'>): Partial<Record<Shape, Held>> {
  try {
    const kept: unknown = JSON.parse(storage.getItem(VIEWPORT_KEY) ?? 'null')
    return typeof kept === 'object' && kept !== null ? kept : {}
  } catch {
    return {}
  }
}

/** The numbers from the last launch in this shape, if there are sound ones. */
export function readHeld(storage: Pick<Storage, 'getItem'>, shape: Shape): Held | undefined {
  const held = readAll(storage)[shape]
  return isHeld(held) ? held : undefined
}

export function keepHeld(storage: Pick<Storage, 'getItem' | 'setItem'>, shape: Shape, held: Held): void {
  try {
    storage.setItem(VIEWPORT_KEY, JSON.stringify({ ...readAll(storage), [shape]: held }))
  } catch {
    // Storage off limits: every launch starts as the first one did.
  }
}

export function isInstalled(): boolean {
  return (
    matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** Lets go of the held numbers once the real ones match, and keeps the real ones for next time. */
export function startHolding(): void {
  if (!isInstalled()) return

  const root = document.documentElement
  // Reads what the page's own CSS would get: `100dvh` and the bottom inset.
  const gauge = document.createElement('div')
  gauge.style.cssText =
    'position:fixed;top:0;left:-20px;width:1px;height:100dvh;padding-bottom:env(safe-area-inset-bottom);' +
    'visibility:hidden;pointer-events:none'
  root.append(gauge)

  const live = (): Held => {
    const style = getComputedStyle(gauge)
    return { height: Math.round(parseFloat(style.height)), bottom: Math.round(parseFloat(style.paddingBottom)) }
  }
  const keep = () => keepHeld(localStorage, shapeOf(innerWidth, innerHeight), live())

  const heldHeight = parseFloat(root.style.getPropertyValue('--held-height'))
  if (!Number.isNaN(heldHeight)) {
    const held = { height: heldHeight, bottom: parseFloat(root.style.getPropertyValue('--held-bottom')) }
    const startShape = shapeOf(innerWidth, innerHeight)
    const giveUpAt = performance.now() + LET_GO_AFTER_MS
    const letGo = () => {
      root.style.removeProperty('--held-height')
      root.style.removeProperty('--held-bottom')
    }
    const watch = () => {
      const now = live()
      // Matched, or the phone was turned and they belong to the other shape.
      if (now.height === held.height && now.bottom === held.bottom) return letGo()
      if (shapeOf(innerWidth, innerHeight) !== startShape) return letGo()
      if (performance.now() < giveUpAt) return void requestAnimationFrame(watch)
      // The numbers changed since last time: show the real ones, and keep them.
      letGo()
      keep()
    }
    watch()
  }

  // Only after a resize: before the first one, iOS still reports the whole screen.
  let settling: ReturnType<typeof setTimeout> | undefined
  addEventListener('resize', () => {
    clearTimeout(settling)
    settling = setTimeout(keep, SETTLED_AFTER_MS)
  })
}
