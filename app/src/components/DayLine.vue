<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

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
    // Only the home zone's day ends at 24:00; for the others that step is 00:00 at the start.
    const stepOnLine = zone === props.homeZone ? nearestStep : nearestStep % DAY_MINUTES
    return { zone, position: atEnd ? 1 : stepOnLine / DAY_MINUTES }
  }),
)
/** Half-hour steps along the line that a pole stands on: even ones are numbers, odd ones are dots. */
const touchedSteps = computed(
  () => new Set(poles.value.map(({ position }) => Math.round((position * DAY_MINUTES) / SLOT_MINUTES))),
)
const touchedHours = computed(
  () => new Set([...touchedSteps.value].filter((step) => step % 2 === 0).map((step) => step / 2)),
)

/**
 * The day starts and ends this far inside the picture's edges, so 00 and 24 sit centred on their
 * hours like every other number, with a half-hour dot on either side of each.
 */
const INSET = 12

/** Where an hour, or a fraction of the day, stands along the picture. */
const along = (fraction: number) => `calc(${INSET}px + (100% - ${2 * INSET}px) * ${fraction})`

const line = useTemplateRef('line')

/** A flag this close to the picture's right edge flies on the pole's other side, so it stays inside. */
const FLAG_ROOM = 32
const lineWidth = ref(0)
const resizes = new ResizeObserver(([entry]) => {
  lineWidth.value = entry!.contentRect.width
})
onMounted(() => {
  lineWidth.value = line.value!.clientWidth
  resizes.observe(line.value!)
})
onUnmounted(() => resizes.disconnect())

const flies = (position: number) => (1 - position) * (lineWidth.value - 2 * INSET) + INSET < FLAG_ROOM

const lineHeld = ref(false)
const poleHeld = ref(false)

function dragZone(zone: Zone, clientX: number) {
  const box = line.value!.getBoundingClientRect()
  const share = Math.min(Math.max((clientX - box.left - INSET) / (box.width - 2 * INSET), 0), 1)
  // Only the home zone's day ends at 24:00. Another zone's flag stops at 23:30, under the finger,
  // because its 00:00 is at the start of the line.
  const lastStep = zone === props.homeZone ? STEPS_ON_LINE : STEPS_ON_LINE - 1
  const step = Math.min(Math.round(share * STEPS_ON_LINE), lastStep)
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
          :class="{ sixth: hour % 6 === 0, touched: touchedHours.has(hour) }"
          :style="{ left: along(hour / 24) }"
        >
          {{ String(hour).padStart(2, '0') }}
        </span>
        <i
          v-for="hour in HALF_HOURS"
          :key="`half-${hour}`"
          class="half-hour"
          :class="{ touched: touchedSteps.has(hour * 2 + 1) }"
          :style="{ left: along((hour + 0.5) / 24) }"
        />
      </div>
    </div>

    <div class="poles" :style="{ marginInline: `${INSET}px` }">
      <ZonePole
        v-for="{ zone, position } in poles"
        :key="zone.id"
        :zone="zone"
        :instant="instant"
        :position="position"
        :last-step="zone === homeZone ? STEPS_ON_LINE : STEPS_ON_LINE - 1"
        :line-held="lineHeld"
        :flies-back="flies(position)"
        @drag="dragZone(zone, $event)"
        @set-minute="emit('move', zone.timeZone, $event)"
        @held="poleHeld = $event"
      />
    </div>
  </div>
</template>

<style scoped>
/* The picture's heights: its sky, and the strip of ground at its foot that the hours stand on. */
.line {
  --sky-height: clamp(52px, 6.4vw, 72px);
  --ground-height: 22px;
  --scene-height: calc(var(--sky-height) + var(--ground-height));

  user-select: none;
}

.surface {
  position: relative;
  cursor: pointer;
  touch-action: none;
}

.is-held .surface {
  cursor: grabbing;
}

/* The picture is the ruler; a little night carries on past 00 and 24. */
.hours {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: var(--ground-height);
}

.hour {
  position: absolute;
  top: 2px;
  transform: translateX(-50%);
  font-size: 12px;
  line-height: 17px;
  color: rgb(255 255 255 / 0.82);
}

.touched {
  color: #fff;
  font-weight: 700;
}

/* Marks the half hour, so a pole between two numbers still touches something. */
.half-hour {
  position: absolute;
  top: 9.5px;
  width: 3px;
  height: 3px;
  margin-left: -1.5px;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.55);
}

.half-hour.touched {
  top: 8.5px;
  width: 5px;
  height: 5px;
  margin-left: -2.5px;
  background: #fff;
}

/* Carries the pole, which starts under the picture, up to the dot level with the numbers. */
.half-hour.touched::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  width: 2px;
  height: calc(var(--ground-height) - 13.5px);
  margin-left: -1px;
  background: #fff;
}

/* Past the lowest flag and its touch area, so a tap on the buttons below can't catch it. */
.poles {
  position: relative;
  height: 100px;
}

/*
 * Too narrow for 25 numbers: a ruler that never changes as the flags move. A tick for every hour, a
 * number and a longer tick every six. The big times above say the exact time, so this only places it.
 */
@media (max-width: 759px) {
  .line {
    --ground-height: 24px;
  }

  .half-hour {
    display: none;
  }

  .hour {
    top: 7px;
    font-weight: 500;
    line-height: 15px;
  }

  .hour:not(.sixth) {
    width: 0;
    font-size: 0;
  }

  /* The ticks hang from the top of the ground. */
  .hour::after {
    content: '';
    position: absolute;
    top: -7px;
    left: 50%;
    width: 1px;
    height: 4px;
    margin-left: -0.5px;
    background: rgb(255 255 255 / 0.45);
  }

  .hour.sixth::after {
    width: 1.5px;
    height: 6px;
    margin-left: -0.75px;
    background: rgb(255 255 255 / 0.8);
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .line {
    --sky-height: 40px;
  }

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
