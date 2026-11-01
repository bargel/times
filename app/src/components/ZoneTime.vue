<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue'

import { useHiddenField } from '@/composables/useHiddenField'
import { minuteOf, moveCursor, stepPart, typeDigit, type TimeEntry } from '@/lib/timeEntry'

const props = defineProps<{ time: string; label: string }>()

const emit = defineEmits<{ set: [minute: number]; begin: []; cancel: [] }>()

const field = useHiddenField({ typeWithMouse: true })
const { typing } = field

const cursor = ref(0)
const COLON_INDEX = 2
const cursorIndex = computed(() => (cursor.value < COLON_INDEX ? cursor.value : cursor.value + 1))

const digits = useTemplateRef('digits')

/** The digit nearest a click, so a click on the minutes starts there. */
function digitAt(clientX: number): number {
  const spans = [...digits.value!.querySelectorAll('.digit:not(.colon)')]
  const distance = (span: Element) => {
    const { left, width } = span.getBoundingClientRect()
    return Math.abs(left + width / 2 - clientX)
  }
  return spans.reduce((nearest, span, index) => (distance(span) < distance(spans[nearest]!) ? index : nearest), 0)
}

function onPointerDown(event: PointerEvent) {
  field.onPointerDown(event)
  if (event.pointerType === 'mouse') cursor.value = digitAt(event.clientX)
}

function onFocus() {
  field.onFocus()
  cursor.value = 0
  emit('begin')
}

function apply(entry: TimeEntry) {
  cursor.value = entry.cursor
  if (entry.time !== props.time) emit('set', minuteOf(entry.time))
}

/** The digits are drawn here; the real field only holds focus, and brings the picker on touch. */
function onKeydown(event: KeyboardEvent) {
  if (!typing.value || event.ctrlKey || event.metaKey || event.altKey) return
  const entry = { time: props.time, cursor: cursor.value }
  const input = event.target as HTMLInputElement

  if (/^\d$/.test(event.key)) apply(typeDigit(entry, Number(event.key)))
  else if (event.key === 'ArrowLeft' || event.key === 'Backspace') cursor.value = moveCursor(cursor.value, -1)
  else if (event.key === 'ArrowRight') cursor.value = moveCursor(cursor.value, 1)
  else if (event.key === 'ArrowUp') apply(stepPart(entry, 1))
  else if (event.key === 'ArrowDown') apply(stepPart(entry, -1))
  else if (event.key === 'Enter') input.blur()
  else if (event.key === 'Escape') {
    emit('cancel')
    input.blur()
  } else return
  event.preventDefault()
}

/** Only the system's picker on touch gets here: from the keyboard, the keys never reach the field. */
function onTimeChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.value) emit('set', minuteOf(input.value))
  // A cleared field goes back to the time on show.
  nextTick(() => {
    input.value = props.time
  })
}
</script>

<template>
  <dd class="time" :class="{ typing }">
    <span ref="digits" class="digits">
      <span
        v-for="(char, index) in time"
        :key="index"
        class="digit"
        :class="{ colon: index === COLON_INDEX, current: typing && index === cursorIndex }"
        >{{ char }}</span
      >
    </span>
    <input
      class="field"
      type="time"
      :aria-label="label"
      :value="time"
      @pointerdown="onPointerDown"
      @focus="onFocus"
      @blur="field.onBlur"
      @click="field.onClick"
      @change="onTimeChange"
      @keydown="onKeydown"
    />
  </dd>
</template>

<style scoped>
/*
 * As wide as the digits, not the column. The clip holds the native field in here: some phones won't
 * make one as narrow as asked. The outline is always there, only clear, so opening the editor paints
 * nothing new around it; it stays mostly inside, as the city's name sits 2px above.
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

/* The real field, invisible over the digits. */
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

/* Its small clock icon would catch a click meant for the digits, and can't be seen. */
.field::-webkit-calendar-picker-indicator {
  display: none;
}

/* A box of the line's height, so a mark at its bottom is inside the clip above. */
.digit {
  position: relative;
  display: inline-block;
}

.typing {
  outline-color: var(--sunset);
}

.typing .field {
  cursor: text;
}

/* The digit the next key goes to. */
.current::after {
  content: '';
  position: absolute;
  right: 0.04em;
  bottom: 0.06em;
  left: 0.04em;
  height: max(2px, 0.05em);
  border-radius: 1px;
  background: var(--sunset);
}

/* A little past the digits, without moving them, so the highlight doesn't touch them. */
@media (hover: hover) {
  .time:not(.typing):hover {
    background: color-mix(in srgb, var(--ink) 8%, transparent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--ink) 8%, transparent);
  }
}
</style>
