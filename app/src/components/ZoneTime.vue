<script setup lang="ts">
import { nextTick } from 'vue'

import { useHiddenField } from '@/composables/useHiddenField'

const props = defineProps<{ time: string; label: string }>()

const emit = defineEmits<{ set: [minute: number]; begin: []; cancel: [] }>()

const field = useHiddenField({ typeWithMouse: true })
const { typing } = field

function onFocus() {
  field.onFocus()
  emit('begin')
}

function onEscape(event: KeyboardEvent) {
  emit('cancel')
  ;(event.target as HTMLInputElement).blur()
}

function onTimeChange(event: Event) {
  const input = event.target as HTMLInputElement
  const [hours, minutes] = input.value.split(':').map(Number)
  if (hours !== undefined && minutes !== undefined) emit('set', hours * 60 + minutes)
  // A cleared field goes back to the time on show.
  nextTick(() => {
    input.value = props.time
  })
}
</script>

<template>
  <dd class="time" :class="{ typing }">
    <span class="digits">{{ time }}</span>
    <input
      class="field"
      type="time"
      :aria-label="label"
      :value="time"
      @pointerdown="field.onPointerDown"
      @focus="onFocus"
      @blur="field.onBlur"
      @click="field.onClick"
      @change="onTimeChange"
      @keydown.enter="($event.target as HTMLInputElement).blur()"
      @keydown.esc="onEscape"
    />
  </dd>
</template>

<style scoped>
/*
 * As wide as the digits, not the column. The clip holds a native field in here: some phones won't
 * make one as narrow as asked. The outline is always there, only clear, so opening the field
 * paints nothing new around it; it stays mostly inside, as the city's name sits 2px above.
 */
.time {
  position: relative;
  width: fit-content;
  overflow: hidden;
  border-radius: var(--radius);
  outline: 3px solid transparent;
  outline-offset: -1px;
  cursor: pointer;
}

/* The real field, invisible over the digits: it brings the system's picker and keyboard entry. */
.field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: none;
  opacity: 0;
  outline: none;
  cursor: pointer;
  accent-color: var(--sunset);
}

/* Its small clock icon would catch a click meant for the field, under a pointer that can't see it. */
.field::-webkit-calendar-picker-indicator {
  display: none;
}

/* The browser's spacing around each part would push the digits sideways as the field opens. */
.field::-webkit-datetime-edit,
.field::-webkit-datetime-edit-fields-wrapper,
.field::-webkit-datetime-edit-hour-field,
.field::-webkit-datetime-edit-minute-field,
.field::-webkit-datetime-edit-ampm-field,
.field::-webkit-datetime-edit-text {
  padding: 0;
}

.typing {
  outline-color: var(--sunset);
}

.typing .digits {
  display: none;
}

/*
 * Takes the place of the digits, in their size. It sizes the box itself, so a 12-hour browser's
 * AM or PM makes the box wider instead of being cut off.
 */
.typing .field {
  position: static;
  display: block;
  width: auto;
  height: auto;
  /* Chrome leaves this much empty at the end, whatever the size: the box stays the digits' width. */
  margin-right: -9px;
  opacity: 1;
  font: inherit;
  letter-spacing: inherit;
  cursor: text;
}

/* A little past the digits, without moving them, so the highlight doesn't touch them. */
@media (hover: hover) {
  .time:not(.typing):hover {
    background: color-mix(in srgb, var(--ink) 8%, transparent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--ink) 8%, transparent);
  }
}
</style>
