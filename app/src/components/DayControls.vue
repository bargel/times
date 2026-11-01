<script setup lang="ts">
import { computed, nextTick } from 'vue'

import { useHiddenField } from '@/composables/useHiddenField'
import { FIRST_SELECTABLE_DATE } from '@/config/dates'
import { shortDate, t } from '@/lib/i18n'
import { nextDate, previousDate, type IsoDate } from '@/lib/time'

import ChevronButton from './ChevronButton.vue'
import NowButton from './NowButton.vue'

const props = defineProps<{ date: IsoDate; isLive: boolean }>()

const emit = defineEmits<{ select: [date: string]; followNow: [] }>()

const label = computed(() => {
  const year = props.date.slice(0, 4)
  const isThisYear = year === String(new Date().getFullYear())
  return isThisYear ? shortDate(props.date) : `${shortDate(props.date)} ${year}`
})

const field = useHiddenField()
const { typing } = field

function onDateChange(event: Event) {
  const input = event.target as HTMLInputElement
  emit('select', input.value)
  // A date the page refused must not stay in the field as if it had been taken.
  nextTick(() => {
    input.value = props.date
  })
}
</script>

<template>
  <div class="controls">
    <div class="day">
      <ChevronButton
        direction="back"
        :label="t.previousDay"
        :disabled="date <= FIRST_SELECTABLE_DATE"
        @click="emit('select', previousDate(date))"
      />

      <label class="date" :class="{ typing }">
        <span class="date-text">{{ label }}</span>
        <input
          class="date-input"
          type="date"
          :aria-label="t.date"
          :min="FIRST_SELECTABLE_DATE"
          :value="date"
          @pointerdown="field.onPointerDown"
          @focus="field.onFocus"
          @blur="field.onBlur"
          @click="field.onClick"
          @change="onDateChange"
        />
      </label>

      <ChevronButton
        direction="forward"
        :label="t.nextDay"
        @click="emit('select', nextDate(date))"
      />
    </div>

    <NowButton :is-live="isLive" @click="emit('followNow')" />
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  gap: 8px;
}

.day {
  display: flex;
  flex: 1;
  min-width: 0;
  height: var(--control-height);
  border: 1px solid var(--edge);
  border-radius: var(--radius);
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

@media (hover: hover) {
  .date:hover {
    background: color-mix(in srgb, var(--ink) 8%, transparent);
  }
}

@media (min-width: 700px) {
  .day {
    flex: 0 0 280px;
  }
}
</style>
