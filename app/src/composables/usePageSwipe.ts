import { nextTick, ref, type Ref } from 'vue'

/** How far a finger moves before it counts as a swipe rather than a tap. */
const START_PX = 10
const TURN_PX = 56
/** A quick flick turns the page with less distance. */
const FLICK_PX = 24
const FLICK_PX_PER_MS = 0.4
/** With no page to turn to, the strip follows the finger only this much. */
const RESISTANCE = 0.25

const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)'
const TURN_MS = 260
const SETTLE_MS = 180

export type PageStep = -1 | 0 | 1

/** Which way a finished swipe turns: to the left is the next page, to the right the previous. */
export function pageStepFor(distance: number, elapsedMs: number): PageStep {
  const length = Math.abs(distance)
  const isFlick = length >= FLICK_PX && length / Math.max(elapsedMs, 1) >= FLICK_PX_PER_MS
  if (length < TURN_PX && !isFlick) return 0
  return distance < 0 ? 1 : -1
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Lets a finger drag a strip of pages sideways and turn to the next one. The strip holds the
 * current page with its neighbours already beside it, `pageGap` away. Bind the handlers on an
 * element around the strip with `touch-action: pan-y`, so the browser leaves sideways movement
 * to this.
 */
export function usePageSwipe(
  strip: Readonly<Ref<HTMLElement | null>>,
  pageGap: number,
  canTurn: (step: PageStep) => boolean,
  turn: (step: PageStep) => void,
) {
  /** The strip is off its place, under column names that don't move with it. */
  const moving = ref(false)

  let start: { pointerId: number; x: number; y: number; time: number } | null = null
  let dragging = false
  let offset = 0
  let swallowClick = false

  /** Moves the strip from where the finger left it, and holds it there until the caller lets go. */
  function slideTo(element: HTMLElement, target: number, duration: number) {
    return element.animate(
      [{ transform: `translateX(${offset}px)` }, { transform: `translateX(${target}px)` }],
      { duration, easing: EASING, fill: 'forwards' },
    )
  }

  async function release(step: PageStep) {
    const element = strip.value!
    element.style.transform = ''
    if (reducedMotion()) {
      if (step) turn(step)
      moving.value = false
      return
    }
    const target = -step * (element.getBoundingClientRect().width + pageGap)
    const slide = slideTo(element, target, step ? TURN_MS : SETTLE_MS)
    await slide.finished.catch(() => {})
    if (step) {
      // The neighbour becomes the current page, and the strip returns to centre in the same frame.
      turn(step)
      await nextTick()
    }
    slide.cancel()
    // Unless the next swipe has already taken over.
    if (!dragging) moving.value = false
  }

  function onPointerDown(event: PointerEvent) {
    swallowClick = false
    if (event.pointerType === 'mouse' || !event.isPrimary) return
    // A new swipe doesn't wait for the last page to finish arriving.
    strip.value!.getAnimations().forEach((animation) => animation.finish())
    start = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp }
    dragging = false
  }

  function onPointerMove(event: PointerEvent) {
    if (start?.pointerId !== event.pointerId) return
    const distance = event.clientX - start.x
    if (!dragging) {
      if (Math.abs(distance) < START_PX) return
      if (Math.abs(event.clientY - start.y) > Math.abs(distance)) {
        start = null
        return
      }
      dragging = true
      moving.value = true
      swallowClick = true
    }
    offset = canTurn(distance < 0 ? 1 : -1) ? distance : distance * RESISTANCE
    strip.value!.style.transform = `translateX(${offset}px)`
  }

  function onPointerUp(event: PointerEvent) {
    if (start?.pointerId !== event.pointerId) return
    const step = pageStepFor(event.clientX - start.x, event.timeStamp - start.time)
    const wasDragging = dragging
    start = null
    dragging = false
    if (wasDragging) void release(canTurn(step) ? step : 0)
  }

  function onPointerCancel(event: PointerEvent) {
    if (start?.pointerId !== event.pointerId) return
    const wasDragging = dragging
    start = null
    dragging = false
    if (wasDragging) void release(0)
  }

  /** Lifting a finger on a day after a swipe must not also pick that day. */
  function onClickCapture(event: MouseEvent) {
    if (!swallowClick) return
    swallowClick = false
    event.preventDefault()
    event.stopPropagation()
  }

  return { moving, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture }
}
