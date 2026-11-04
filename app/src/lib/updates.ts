import { registerSW } from 'virtual:pwa-register'

/** How often a page left open asks the server for a new version. */
const CHECK_EVERY_MS = 60 * 60 * 1000

/**
 * A new version is put in only when nobody can see it happen, and nothing is lost: the page is out
 * of sight and still follows the clock. A picked time may be on its way into Discord.
 */
export function shouldApplyNow({ hidden, live }: { hidden: boolean; live: boolean }): boolean {
  return hidden && live
}

/** Until the app says otherwise, there is no picked time to lose: a build that broke on start gets its fix. */
let followsClock: () => boolean = () => true

/** Lets the app tell whether the page still follows the clock. */
export function reportFollowsClock(isLive: () => boolean): void {
  followsClock = isLive
}

/**
 * Keeps an installed copy current without asking anyone. A new version downloads in the background
 * and waits; this page takes it, and reloads into it, only at a moment `shouldApplyNow` allows,
 * checked again at each step, since a phone may hold a hidden page frozen until it is back in view.
 * Closing every window of the app also lets the next start open the new version.
 */
export function startUpdates(): void {
  if (!('serviceWorker' in navigator)) return

  let registration: ServiceWorkerRegistration | undefined
  /** A new version is installed and waits to take over. */
  let waiting = false
  /** The new version took over, from this window or another, and this page is still the old one. */
  let behind = false
  let reloading = false

  const safe = () =>
    shouldApplyNow({ hidden: document.visibilityState === 'hidden', live: followsClock() })

  const settle = () => {
    if (reloading || !safe()) return
    if (behind) {
      reloading = true
      window.location.reload()
    } else if (waiting) {
      waiting = false
      void takeOver()
    }
  }

  const check = () => {
    // Offline, mid-download or with a new version already waiting, asking again only wastes a request.
    if (!registration || registration.installing || registration.waiting || !navigator.onLine) return
    registration.update().catch(() => {})
  }

  const takeOver = registerSW({
    onNeedRefresh() {
      waiting = true
      settle()
    },
    // Without this the plugin reloads every open window at once, seen or not.
    onNeedReload() {
      behind = true
      settle()
    },
    onRegisteredSW(_url, found) {
      registration = found
      setInterval(check, CHECK_EVERY_MS)
    },
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check()
    else settle()
  })
}
