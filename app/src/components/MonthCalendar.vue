<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'

import { usePageSwipe } from '@/composables/usePageSwipe'
import { FIRST_SELECTABLE_DATE } from '@/config/dates'
import { monthGrid, monthOf, shiftDateByMonths, shiftMonth } from '@/lib/calendar'
import { monthLabel, shortDate, t } from '@/lib/i18n'
import { addDays, type IsoDate } from '@/lib/time'

import ChevronButton from './ChevronButton.vue'
import NowButton from './NowButton.vue'

const DAYS_IN_WEEK = 7

const props = defineProps<{ date: IsoDate; today: IsoDate; isLive: boolean }>()

const emit = defineEmits<{ select: [date: string]; followNow: [] }>()

const shownMonth = ref(monthOf(props.date))
watch(
  () => props.date,
  (date) => {
    shownMonth.value = monthOf(date)
  },
)

const days = computed(() => monthGrid(shownMonth.value))
const weeks = computed(() =>
  Array.from({ length: days.value.length / DAYS_IN_WEEK }, (_, week) =>
    days.value.slice(week * DAYS_IN_WEEK, (week + 1) * DAYS_IN_WEEK),
  ),
)
const atFirstMonth = computed(() => shownMonth.value <= monthOf(FIRST_SELECTABLE_DATE))

const swipe = usePageSwipe(
  useTemplateRef('sheet'),
  (step) => step >= 0 || !atFirstMonth.value,
  (step) => {
    shownMonth.value = shiftMonth(shownMonth.value, step)
  },
)

function followNow() {
  shownMonth.value = monthOf(props.today)
  emit('followNow')
}

// The whole page is one Tab stop; arrow keys move around it.
const focusedDate = ref<IsoDate | null>(null)
const tabStop = computed(() => {
  if (focusedDate.value && days.value.includes(focusedDate.value)) return focusedDate.value
  return days.value.includes(props.date) ? props.date : `${shownMonth.value}-01`
})

const grid = useTemplateRef('grid')

function moveFocus(event: KeyboardEvent, from: IsoDate) {
  const weekday = days.value.indexOf(from) % DAYS_IN_WEEK
  const targets: Record<string, IsoDate> = {
    ArrowLeft: addDays(from, -1),
    ArrowRight: addDays(from, 1),
    ArrowUp: addDays(from, -DAYS_IN_WEEK),
    ArrowDown: addDays(from, DAYS_IN_WEEK),
    Home: addDays(from, -weekday),
    End: addDays(from, DAYS_IN_WEEK - 1 - weekday),
    PageUp: shiftDateByMonths(from, -1),
    PageDown: shiftDateByMonths(from, 1),
  }
  const target = targets[event.key]
  if (!target) return
  event.preventDefault()
  if (target < FIRST_SELECTABLE_DATE) return

  focusedDate.value = target
  if (!days.value.includes(target)) shownMonth.value = monthOf(target)
  nextTick(() => grid.value?.querySelector<HTMLElement>(`[data-date="${target}"]`)?.focus())
}
</script>

<template>
  <section class="calendar" :aria-label="`${t.calendar}, ${monthLabel(shownMonth)}`">
    <div class="header">
      <ChevronButton
        direction="back"
        :label="t.previousMonth"
        :disabled="atFirstMonth"
        @click="shownMonth = shiftMonth(shownMonth, -1)"
      />
      <h2 class="month" aria-live="polite">{{ monthLabel(shownMonth) }}</h2>
      <ChevronButton
        direction="forward"
        :label="t.nextMonth"
        @click="shownMonth = shiftMonth(shownMonth, 1)"
      />
      <NowButton class="now-button" :is-live="isLive" @click="followNow" />
    </div>

    <div
      class="swipe-area"
      :class="{ swiping: swipe.swiping.value }"
      @pointerdown="swipe.onPointerDown"
      @pointermove="swipe.onPointerMove"
      @pointerup="swipe.onPointerUp"
      @pointercancel="swipe.onPointerCancel"
      @click.capture="swipe.onClickCapture"
    >
      <table ref="grid" class="grid" role="grid">
        <thead>
          <tr>
            <th v-for="weekday in t.weekdays" :key="weekday" class="weekday" scope="col">
              {{ weekday }}
            </th>
          </tr>
        </thead>
        <tbody ref="sheet">
          <tr v-for="week in weeks" :key="week[0]">
            <td v-for="day in week" :key="day">
              <button
                type="button"
                class="day"
                :class="{
                  selected: day === date,
                  today: day === today,
                  'other-month': monthOf(day) !== shownMonth,
                }"
                :data-date="day"
                :tabindex="day === tabStop ? 0 : -1"
                :disabled="day < FIRST_SELECTABLE_DATE"
                :aria-label="`${shortDate(day)} ${day.slice(0, 4)}`"
                :aria-pressed="day === date"
                :aria-current="day === today ? 'date' : undefined"
                @click="emit('select', day)"
                @keydown="moveFocus($event, day)"
              >
                {{ Number(day.slice(8)) }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  height: var(--control-height);
}

.month {
  flex: 1;
  min-width: 0;
  font-size: 17px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

/* The narrowest phones leave too little room beside the buttons for the longest month names. */
@media (max-width: 359px) {
  .month {
    font-size: 15px;
  }
}

.now-button {
  margin-left: 8px;
}

.grid {
  width: 100%;
  margin-top: 4px;
  border-collapse: collapse;
  table-layout: fixed;
}

.weekday {
  padding-bottom: 2px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: var(--ink-soft);
}

.weekday:nth-child(n + 6) {
  color: var(--sunset);
}

td {
  padding: 0;
}

/*
 * Sideways movement here belongs to the page turn. The whole area listens, not just the days:
 * a quick next swipe can land while the days are still sliding away from under the finger.
 */
.swipe-area {
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}

/* Holds only while the page is off its place, so it never clips a focus ring. */

.swiping {
  overflow: hidden;
}

.day {
  position: relative;
  display: block;
  width: 100%;
  height: 38px;
  padding: 0;
  font-size: 15px;
  font-weight: 400;
  background: none;
  border: 0;
  border-radius: var(--radius);
  cursor: pointer;
}

/*
 * Weekends, softer than their headers, so a date that differs in the readout stays the loudest.
 * :where keeps this weak, so the other-month and selected looks below still win.
 */
:where(td:nth-child(n + 6)) .day {
  color: color-mix(in srgb, var(--sunset) 70%, var(--ink-soft));
}

.day.other-month {
  color: var(--ink-soft);
}

/* A dot in the text colour, so it still shows on the selected day's fill. */
.day.today::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 50%;
  width: 4px;
  height: 4px;
  margin-left: -2px;
  border-radius: 50%;
  background: currentColor;
}

.day:disabled {
  opacity: 0.35;
  cursor: default;
}

@media (hover: hover) {
  .day:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ink) 8%, transparent);
  }
}

.day.selected,
.day.selected:hover {
  background: var(--ink);
  color: var(--ground);
  font-weight: 700;
}
</style>
