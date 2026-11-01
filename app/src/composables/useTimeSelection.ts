import { computed, onScopeDispose, ref } from 'vue'

import {
  DAY_MINUTES,
  dayAxis,
  floorToMinute,
  isIsoDate,
  minuteOfDay,
  SLOT_MS,
  slotForZoneClock,
  wallClockAt,
  type IsoDate,
} from '@/lib/time'

interface Pick {
  date: IsoDate
  slot: number
}

const CLOCK_TICK_MS = 1000

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
  const date = computed(() => pick.value?.date ?? wallClockAt(now.value, homeTimeZone).date)
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
    if (!isIsoDate(nextDate)) return
    // Keep the time on the clock, not the slot: days with a DST change have more or fewer slots.
    const shownSlot = axis.value.start + Math.floor(position.value) * SLOT_MS
    const minute = atDayEnd.value ? DAY_MINUTES : minuteOfDay(wallClockAt(shownSlot, homeTimeZone))
    const nextAxis = dayAxis(nextDate, homeTimeZone)
    pick.value = {
      date: nextDate,
      slot: slotForZoneClock(nextAxis.start, nextAxis, minute, homeTimeZone),
    }
  }

  /** Moves the moment so that `timeZone`'s clock shows `targetMinute`, on the selected day. */
  function moveZoneClock(timeZone: string, targetMinute: number) {
    selectSlot(slotForZoneClock(instant.value, axis.value, targetMinute, timeZone))
  }

  function followNow() {
    pick.value = null
  }

  return {
    isLive,
    date,
    axis,
    instant,
    position,
    atDayEnd,
    selectSlot,
    selectDate,
    moveZoneClock,
    followNow,
  }
}
