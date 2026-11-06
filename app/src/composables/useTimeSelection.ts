import { computed, onScopeDispose, ref } from 'vue'

import { FIRST_SELECTABLE_DATE } from '@/config/dates'
import {
  DAY_MINUTES,
  dayAxis,
  floorToMinute,
  isIsoDate,
  minuteOfDay,
  SLOT_MINUTES,
  SLOT_MS,
  slotForZoneClock,
  wallClockAt,
  type DayAxis,
  type IsoDate,
} from '@/lib/time'

interface Pick {
  date: IsoDate
  slot: number
}

const CLOCK_TICK_MS = 1000

/** The slot where `timeZone` shows `minute`, between two slots if the minute isn't on a half hour. */
function exactSlot(instant: number, axis: DayAxis, minute: number, timeZone: string): number {
  const pastSlot = minute % SLOT_MINUTES
  const onHalfHour = minute - pastSlot
  const slot = slotForZoneClock(instant, axis, onHalfHour, timeZone)
  if (!pastSlot) return slot
  // That half hour can come at both ends of the day. The last slot has no minutes after it.
  const fits = slot < axis.slots ? slot : slotForZoneClock(axis.start, axis, onHalfHour, timeZone)
  return fits + pastSlot / SLOT_MINUTES
}

/**
 * The one instant the whole page shows. It follows the clock until the user
 * picks a date or a time, and `followNow` hands it back to the clock.
 */
export function useTimeSelection(homeTimeZone: string) {
  const now = ref(floorToMinute(Date.now()))
  const timer = setInterval(() => {
    now.value = floorToMinute(Date.now())
  }, CLOCK_TICK_MS)
  onScopeDispose(() => clearInterval(timer))

  const pick = ref<Pick | null>(null)

  const isLive = computed(() => pick.value === null)
  const today = computed(() => wallClockAt(now.value, homeTimeZone).date)
  const date = computed(() => pick.value?.date ?? today.value)
  const axis = computed(() => dayAxis(date.value, homeTimeZone))
  const instant = computed(() =>
    pick.value ? axis.value.start + pick.value.slot * SLOT_MS : now.value,
  )
  /** Distance from the start of the day in slots. Fractional only while live. */
  const position = computed(() => (instant.value - axis.value.start) / SLOT_MS)
  /** True on the 24:00 stop, the one moment that belongs to the end of the line. */
  const atDayEnd = computed(() => position.value === axis.value.slots)

  function selectSlot(slot: number) {
    pick.value = { date: date.value, slot: Math.min(Math.max(slot, 0), axis.value.slots) }
  }

  function selectDate(nextDate: string) {
    if (!isIsoDate(nextDate) || nextDate < FIRST_SELECTABLE_DATE) return
    // Keep the time on the clock, not the slot: days with a DST change have more or fewer slots.
    // A picked time stays exact; the clock's own minute goes to the nearest slot, where the line
    // shows it, and from a quarter to midnight that is the 24:00 stop.
    const liveSlot = Math.round(position.value)
    const kept = pick.value ? instant.value : axis.value.start + liveSlot * SLOT_MS
    const endsDay = pick.value ? atDayEnd.value : liveSlot === axis.value.slots
    const minute = endsDay ? DAY_MINUTES : minuteOfDay(wallClockAt(kept, homeTimeZone))
    const nextAxis = dayAxis(nextDate, homeTimeZone)
    pick.value = {
      date: nextDate,
      slot: exactSlot(nextAxis.start, nextAxis, minute, homeTimeZone),
    }
  }

  /** Moves the moment so that `timeZone`'s clock shows `targetMinute`, on the selected day. */
  function moveZoneClock(timeZone: string, targetMinute: number) {
    selectSlot(exactSlot(instant.value, axis.value, targetMinute, timeZone))
  }

  function followNow() {
    pick.value = null
  }

  // Typing a time moves the page digit by digit, so cancelling has to go back past all of them.
  let pickBeforeEdit: Pick | null = null

  function beginEdit() {
    pickBeforeEdit = pick.value
  }

  function cancelEdit() {
    pick.value = pickBeforeEdit
  }

  return {
    isLive,
    today,
    date,
    axis,
    instant,
    position,
    atDayEnd,
    selectSlot,
    selectDate,
    moveZoneClock,
    followNow,
    beginEdit,
    cancelEdit,
  }
}
