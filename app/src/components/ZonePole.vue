<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import type { Zone } from '@/config/zones'
import { shortDate, t } from '@/lib/i18n'
import { clockDisplay, SLOT_MINUTES, STEPS_ON_LINE, wallClockAt } from '@/lib/time'

import ZoneFlag from './ZoneFlag.vue'

const props = defineProps<{
  zone: Zone
  instant: number
  /** 0 to 1 along the line. */
  position: number
  /** The last step this zone's slider reaches: 24:00 for the home zone, 23:30 for the others. */
  lastStep: number
  /** The line is being dragged, so this pole should follow without easing. */
  lineHeld: boolean
  /** Too near the line's end for the flag: it flies on the pole's left. */
  fliesBack: boolean
}>()

const emit = defineEmits<{
  /** The flag was dragged; `clientX` is where the pole itself should now be. */
  drag: [clientX: number]
  /** Keyboard or screen reader picked a time on this zone's clock. */
  setMinute: [minute: number]
  held: [isHeld: boolean]
}>()

const wall = computed(() => wallClockAt(props.instant, props.zone.timeZone))
const step = computed(() => Math.round(props.position * STEPS_ON_LINE))
const city = computed(() => t.cities[props.zone.id])
const spoken = computed(
  () => `${city.value}, ${clockDisplay(wall.value)}, ${shortDate(wall.value.date)}`,
)

function onSliderInput(event: Event) {
  const slider = event.target as HTMLInputElement
  emit('setMinute', Number(slider.value) * SLOT_MINUTES)
  // The selected day decides where the moment lands, so the slider may have to go back in step.
  nextTick(() => {
    slider.value = String(step.value)
  })
}

// Another zone's clock has no ends within the day, so its slider carries on around them.
function onSliderKey(event: KeyboardEvent) {
  if (props.lastStep === STEPS_ON_LINE) return
  const isBack = event.key === 'ArrowLeft' || event.key === 'ArrowDown'
  const isForward = event.key === 'ArrowRight' || event.key === 'ArrowUp'
  if (isBack && step.value === 0) {
    event.preventDefault()
    emit('setMinute', props.lastStep * SLOT_MINUTES)
  } else if (isForward && step.value === props.lastStep) {
    event.preventDefault()
    emit('setMinute', 0)
  }
}

const held = ref(false)
let grabOffset = 0

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  const handle = event.currentTarget as HTMLElement
  handle.setPointerCapture(event.pointerId)
  grabOffset = event.clientX - handle.parentElement!.getBoundingClientRect().left
  held.value = true
  emit('held', true)
}

function onPointerMove(event: PointerEvent) {
  if (held.value) emit('drag', event.clientX - grabOffset)
}

function onRelease() {
  held.value = false
  emit('held', false)
}

// Ease a jump to a new time, but never a drag, and never a flag wrapping around the line.
const glides = ref(false)
watch(
  () => props.position,
  (next, previous) => {
    glides.value = !held.value && !props.lineHeld && Math.abs(next - previous) < 0.5
  },
)
</script>

<template>
  <div
    class="pole"
    :class="{
      'is-held': held,
      glides,
      'lane-low': zone.lane === 1,
      'flies-back': fliesBack,
    }"
    :style="{ left: `${position * 100}%` }"
  >
    <input
      class="visually-hidden"
      type="range"
      min="0"
      :max="lastStep"
      :value="step"
      :aria-label="t.timeIn(city)"
      :aria-valuetext="spoken"
      @input="onSliderInput"
      @keydown="onSliderKey"
    />
    <div
      class="handle"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @lostpointercapture="onRelease"
    >
      <ZoneFlag class="handle-flag" :zone="zone.id" />
    </div>
  </div>
</template>

<style scoped>
.pole {
  position: absolute;
  top: 0;
  width: 2px;
  height: 36px;
  margin-left: -1px;
  border-radius: 0 0 1px 1px;
  background: var(--ink);
}

.pole.lane-low {
  height: 80px;
}

.pole.glides {
  transition: left 280ms var(--ease-out);
}

/* A flag on a staff: flush against the pole, which carries on a little below it. */
.handle {
  position: absolute;
  bottom: 4px;
  left: 100%;
  border-radius: 0 5px 5px 0;
  box-shadow: 0 1px 3px rgb(9 13 36 / 0.28);
  cursor: grab;
  touch-action: none;
  user-select: none;
  transition:
    transform 120ms var(--ease-out),
    box-shadow 120ms var(--ease-out);
}

/* A fingertip-sized target around a small flag. */
.handle::before {
  content: '';
  position: absolute;
  inset: -12px -7px;
}

.handle .handle-flag {
  width: 30px;
  height: 20px;
  border-radius: inherit;
}

.is-held .handle {
  cursor: grabbing;
  transform: scale(1.12);
  transform-origin: left center;
  box-shadow: 0 3px 8px rgb(9 13 36 / 0.35);
}

.flies-back .handle {
  right: 100%;
  left: auto;
  border-radius: 5px 0 0 5px;
}

.flies-back.is-held .handle {
  transform-origin: right center;
}

input:focus-visible + .handle {
  outline: 3px solid var(--sunset);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .pole.glides,
  .handle {
    transition: none;
  }
}
</style>
