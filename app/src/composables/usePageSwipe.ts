import { nextTick, ref, type Ref } from 'vue'

/** How far a finger moves before it counts as a swipe rather than a tap. */
const START_PX = 10
const TURN_PX = 56
/** A quick flick turns the page with less distance. */
const FLICK_PX = 24
const FLICK_PX_PER_MS = 0.4
/** With no page to turn to, the sheet follows the finger only this much. */
const RESISTANCE = 0.25

const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)'
const LEAVE_MS = 140
const ENTER_MS = 220
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
 * Lets a finger drag a sheet sideways and turn its page. Bind the handlers on an element around
 * the sheet with `touch-action: pan-y`, so the browser leaves sideways movement to this.
 */
export function usePageSwipe(
  sheet: Readonly<Ref<HTMLElement | null>>,
  canTurn: (step: PageStep) => boolean,
  turn: (step: PageStep) => void,
) {
  /** The sheet is off its place, so whatever holds it should clip it. */
  const swiping = ref(false)

  let start: { pointerId: number; x: number; y: number; time: number } | null = null
  let dragging = false
  let offset = 0
  let swallowClick = false

  function slide(element: HTMLElement, frames: Keyframe[], duration: number) {
    return element.animate(frames, { duration, easing: EASING, fill: 'forwards' })
  }

  async function settle(element: HTMLElement) {
    const back = slide(
      element,
      [{ transform: `translateX(${offset}px)` }, { transform: 'none' }],
      SETTLE_MS,
    )
    await back.finished.catch(() => {})
    back.cancel()
  }

  async function turnPage(element: HTMLElement, step: PageStep) {
    const width = element.getBoundingClientRect().width
    const leave = slide(
      element,
      [
        { transform: `translateX(${offset}px)`, opacity: 1 },
        { transform: `translateX(${-step * width}px)`, opacity: 0 },
      ],
      LEAVE_MS,
    )
    await leave.finished.catch(() => {})
    turn(step)
    await nextTick()
    const enter = slide(
      element,
      [
        { transform: `translateX(${step * width * 0.4}px)`, opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      ENTER_MS,
    )
    leave.cancel()
    await enter.finished.catch(() => {})
    enter.cancel()
  }

  async function release(step: PageStep) {
    const element = sheet.value!
    element.style.transform = ''
    if (reducedMotion()) {
      if (step) turn(step)
    } else if (step) {
      await turnPage(element, step)
    } else {
      await settle(element)
    }
    swiping.value = false
  }

  function onPointerDown(event: PointerEvent) {
    swallowClick = false
    if (event.pointerType === 'mouse' || !event.isPrimary) return
    // A new swipe doesn't wait for the last page to finish arriving.
    sheet.value!.getAnimations().forEach((animation) => animation.finish())
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
      swiping.value = true
      swallowClick = true
    }
    offset = canTurn(distance < 0 ? 1 : -1) ? distance : distance * RESISTANCE
    sheet.value!.style.transform = `translateX(${offset}px)`
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

  return { swiping, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture }
}
