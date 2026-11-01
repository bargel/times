<script setup lang="ts">
import { computed, ref } from 'vue'

import { nextDate, previousDate, shortDate, type IsoDate } from '@/lib/time'

const FIRST_SELECTABLE_DATE = '2025-01-01'

const props = defineProps<{ date: IsoDate; isLive: boolean }>()

const emit = defineEmits<{ select: [date: string]; followNow: [] }>()

const label = computed(() => {
  const year = props.date.slice(0, 4)
  const isThisYear = year === String(new Date().getFullYear())
  return isThisYear ? shortDate(props.date) : `${shortDate(props.date)} ${year}`
})

// A press anywhere on the label opens the system's calendar, not just on a browser's small icon.
function openCalendar(event: Event) {
  try {
    ;(event.target as HTMLInputElement).showPicker()
  } catch {
    // Not supported or not allowed here: the field still opens or edits the way the browser does it.
  }
}

// Reached by keyboard, the field swaps in for the label, so what is being typed can be seen.
const typing = ref(false)
let pressed = false

function onFieldFocus() {
  typing.value = !pressed
  pressed = false
}
</script>

<template>
  <div class="controls">
    <div class="day">
      <button
        type="button"
        class="step"
        aria-label="Previous day"
        :disabled="date <= FIRST_SELECTABLE_DATE"
        @click="emit('select', previousDate(date))"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" /></svg>
      </button>

      <label class="date" :class="{ typing }">
        <span class="date-text">{{ label }}</span>
        <input
          class="date-input"
          type="date"
          aria-label="Date"
          :min="FIRST_SELECTABLE_DATE"
          :value="date"
          @pointerdown="pressed = true"
          @focus="onFieldFocus"
          @blur="typing = false"
          @click="openCalendar"
          @change="emit('select', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <button
        type="button"
        class="step"
        aria-label="Next day"
        @click="emit('select', nextDate(date))"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4l6 6-6 6" /></svg>
      </button>
    </div>

    <button type="button" class="now" :aria-pressed="isLive" @click="emit('followNow')">Now</button>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  gap: 8px;
}

.day,
.now {
  height: var(--control-height);
  border: 1px solid var(--edge);
  border-radius: var(--radius);
}

.day {
  display: flex;
  flex: 1;
  min-width: 0;
}

.step {
  flex: none;
  width: var(--control-height);
  padding: 0;
  background: none;
  border: 0;
  border-radius: var(--radius);
  cursor: pointer;
}

.step:disabled {
  opacity: 0.35;
  cursor: default;
}

.step svg {
  display: block;
  width: 20px;
  height: 20px;
  margin: auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.date {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  cursor: pointer;
}

.date-text {
  font-size: 17px;
  font-weight: 600;
  white-space: nowrap;
}

/* The real field, invisible over the label: it brings the system's calendar and keyboard entry. */
.date-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  opacity: 0;
  cursor: pointer;
  accent-color: var(--sunset);
}

.date.typing {
  outline: 3px solid var(--sunset);
  outline-offset: 2px;
}

.typing .date-text {
  visibility: hidden;
}

.typing .date-input {
  opacity: 1;
  padding: 0 4px;
  background: none;
  outline: none;
  cursor: text;
}

.now {
  flex: none;
  padding: 0 14px;
  font-weight: 600;
  background: none;
  cursor: pointer;
}

@media (hover: hover) {
  .step:hover:not(:disabled),
  .now:hover,
  .date:hover {
    background: color-mix(in srgb, var(--ink) 8%, transparent);
  }
}

/* Filled while the page follows the clock; outlined once a time has been picked. */
.now[aria-pressed='true'],
.now[aria-pressed='true']:hover {
  background: var(--ink);
  color: var(--ground);
  border-color: var(--ink);
}

@media (min-width: 700px) {
  .day {
    flex: 0 0 280px;
  }
}
</style>
