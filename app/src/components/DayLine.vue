<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'

import { ZONES, type Zone } from '@/config/zones'
import { DAY_MINUTES, minuteOfDay, SLOT_MINUTES, STEPS_ON_LINE, wallClockAt } from '@/lib/time'

import DayScene from './DayScene.vue'
import ZonePole from './ZonePole.vue'

const HOURS = Array.from({ length: 25 }, (_, hour) => hour)
const HALF_HOURS = HOURS.slice(0, -1)

const props = defineProps<{
  instant: number
  /** Standing on 24:00: the home zone's flag stays at the end of the line instead of wrapping. */
  atDayEnd: boolean
  /** The browser's own zone, when it is one of the three. Only its day ends at 24:00 on the line. */
  homeZone: Zone | undefined
  /** The zone whose clock the picture and the numbers control. */
  primaryZone: Zone
}>()

const emit = defineEmits<{ move: [timeZone: string, minute: number] }>()

const poles = computed(() =>
  ZONES.map((zone) => {
    const minute = minuteOfDay(wallClockAt(props.instant, zone.timeZone))
    const atEnd = props.atDayEnd && zone === props.homeZone
    // The line works in half hours: while following the clock, a pole stands on the nearest one.
    const nearestStep = Math.round(minute / SLOT_MINUTES) * SLOT_MINUTES
    return { zone, position: atEnd ? 1 : nearestStep / DAY_MINUTES }
  }),
)
/** Half-hour steps along the line that a pole stands on: even ones are numbers, odd ones are dots. */
const touchedSteps = computed(
  () => new Set(poles.value.map(({ position }) => Math.round((position * DAY_MINUTES) / SLOT_MINUTES))),
)
const touchedHours = computed(
  () => new Set([...touchedSteps.value].filter((step) => step % 2 === 0).map((step) => step / 2)),
)

/** On a phone an odd hour shows only when touched, and then needs its even neighbours out of the way. */
function isCrowdedOut(hour: number) {
  const touched = touchedHours.value
  if (hour % 2 === 1 || touched.has(hour)) return false
  return touched.has(hour - 1) || touched.has(hour + 1)
}

const line = useTemplateRef('line')
const lineHeld = ref(false)
const poleHeld = ref(false)

function dragZone(zone: Zone, clientX: number) {
  const box = line.value!.getBoundingClientRect()
  const along = Math.min(Math.max((clientX - box.left) / box.width, 0), 1)
  // Only the home zone's day ends at 24:00. Another zone's flag stops at 23:30, under the finger,
  // because its 00:00 is at the start of the line.
  const lastStep = zone === props.homeZone ? STEPS_ON_LINE : STEPS_ON_LINE - 1
  const step = Math.min(Math.round(along * STEPS_ON_LINE), lastStep)
  emit('move', zone.timeZone, step * SLOT_MINUTES)
}

function onLinePress(event: PointerEvent) {
  if (event.button !== 0) return
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  dragZone(props.primaryZone, event.clientX)
  // Only now, so the press itself eases to its new spot and the drag that follows doesn't.
  lineHeld.value = true
}

function onLineMove(event: PointerEvent) {
  if (lineHeld.value) dragZone(props.primaryZone, event.clientX)
}

function onLineRelease() {
  lineHeld.value = false
}
</script>

<template>
  <div ref="line" class="line" :class="{ 'is-held': lineHeld || poleHeld }">
    <div
      class="surface"
      @pointerdown="onLinePress"
      @pointermove="onLineMove"
      @lostpointercapture="onLineRelease"
    >
      <DayScene />
      <div class="hours" aria-hidden="true">
        <span
          v-for="hour in HOURS"
          :key="hour"
          class="hour"
          :class="{
            odd: hour % 2 === 1,
            sparse: hour % 4 !== 0 || touchedHours.has(hour - 2) || touchedHours.has(hour + 2),
            touched: touchedHours.has(hour),
            'crowded-out': isCrowdedOut(hour),
            'pair-left': touchedHours.has(hour) && touchedHours.has(hour + 1),
            'pair-right': touchedHours.has(hour) && touchedHours.has(hour - 1),
          }"
          :style="{ left: `${(hour / 24) * 100}%` }"
        >
          {{ String(hour).padStart(2, '0') }}
        </span>
        <i
          v-for="hour in HALF_HOURS"
          :key="`half-${hour}`"
          class="half-hour"
          :class="{ touched: touchedSteps.has(hour * 2 + 1) }"
          :style="{ left: `${((hour + 0.5) / 24) * 100}%` }"
        />
      </div>
    </div>

    <div class="poles">
      <ZonePole
        v-for="{ zone, position } in poles"
        :key="zone.id"
        :zone="zone"
        :instant="instant"
        :position="position"
        :last-step="zone === homeZone ? STEPS_ON_LINE : STEPS_ON_LINE - 1"
        :line-held="lineHeld"
        @drag="dragZone(zone, $event)"
        @set-minute="emit('move', zone.timeZone, $event)"
        @held="poleHeld = $event"
      />
    </div>
  </div>
</template>

<style scoped>
.line {
  margin-right: var(--line-tail);
  user-select: none;
}

.surface {
  cursor: pointer;
  touch-action: none;
}

.is-held .surface {
  cursor: grabbing;
}

.hours {
  position: relative;
  height: 20px;
}

.hour {
  position: absolute;
  top: 3px;
  transform: translateX(-50%);
  font-size: 12px;
  line-height: 17px;
  color: var(--ink-soft);
}

.touched {
  color: var(--ink);
  font-weight: 700;
}

/* Marks the half hour, so a pole between two numbers still touches something. */
.half-hour {
  position: absolute;
  top: 10px;
  width: 3px;
  height: 3px;
  margin-left: -1.5px;
  border-radius: 50%;
  background: var(--ink-soft);
}

.half-hour.touched {
  top: 9px;
  width: 5px;
  height: 5px;
  margin-left: -2.5px;
  background: var(--ink);
}

/* Carries the pole, which starts under the numbers, up to the dot level with them. */
.half-hour.touched::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  width: 2px;
  height: 6px;
  margin-left: -1px;
  background: var(--ink);
}

/* Past the lowest flag and its touch area, so a tap on the buttons below can't catch it. */
.poles {
  position: relative;
  height: 100px;
}

/* Too narrow for 25 numbers: keep the even hours and whichever ones a flag is touching. */
@media (max-width: 479px) {
  .odd:not(.touched),
  .crowded-out {
    display: none;
  }

  /* Warsaw and Kyiv often touch neighbouring numbers: part them, each to its own side of its pole. */
  .pair-left {
    transform: translateX(calc(-100% + 3px));
  }

  .pair-right {
    transform: translateX(-3px);
  }

  /* Numbers fill the row here, so the dots drop to a row of their own just under them. */
  .hours {
    height: 25px;
  }

  .half-hour {
    top: 20px;
  }

  .half-hour.touched {
    top: 19px;
  }

  .half-hour.touched::after {
    content: none;
  }

  /* Poles rise through the row of dots, so one on the hour still touches its number. */
  .poles {
    margin-top: -5px;
  }
}

/* The smallest phones: every fourth hour, plus the touched ones. */
@media (max-width: 379px) {
  .sparse:not(.touched) {
    display: none;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .poles {
    height: 86px;
  }

  .poles :deep(.pole.lane-low) {
    height: 62px;
  }

  .poles :deep(.pole) {
    height: 26px;
  }
}
</style>
