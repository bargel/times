<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { BAT } from '@/config/scenery'
import type { Occasion } from '@/lib/occasions'
import { nextUfo, nextUfoDelay, type UfoVisit } from '@/lib/ufo'

/** What the night sky holds on a special day, and now and then on any day. */
const props = defineProps<{ occasions: ReadonlySet<Occasion> }>()

/**
 * Bursts over the night end of New Year's Eve, and over the start of New Year's Day, clear of the
 * moon even on a phone: `[percent across at the end, at the start, percent down, colour, seconds
 * per round, delay, radius in px]`. The third stays off the phone, where the sky is narrow.
 */
const BURSTS = [
  [89, 16, 30, '#ff6a7a', 2.6, 0, 13],
  [95, 21, 22, '#ffd34d', 3.1, -1.1, 15],
  [92.2, 18.5, 48, '#7de0ff', 2.8, -2, 10],
] as const
const SPOKES = Array.from({ length: 12 }, (_, index) => index * 30)

const fireworks = computed(() => {
  const atStart = props.occasions.has('newYearsDay')
  if (!atStart && !props.occasions.has('newYearsEve')) return []
  return BURSTS.map(([atEnd, atTheStart, y, colour, round, delay, radius]) => ({
    left: `${atStart ? atTheStart : atEnd}%`,
    top: `${y}%`,
    '--colour': colour,
    '--round': `${round}s`,
    '--delay': `${delay}s`,
    '--burst-delay': `${delay + round * 0.14}s`,
    '--radius': `${radius}px`,
  }))
})

/** Now and then a saucer: never under reduced motion, never on a hidden tab. */
const ufo = ref<UfoVisit & { id: number }>()
let visits = 0
let waiting: ReturnType<typeof setTimeout> | undefined
const stillMotion = matchMedia('(prefers-reduced-motion: reduce)')

function waitForUfo() {
  waiting = setTimeout(() => {
    if (!stillMotion.matches && !document.hidden) ufo.value = { ...nextUfo(), id: ++visits }
    waitForUfo()
  }, nextUfoDelay())
}

onMounted(waitForUfo)
onUnmounted(() => clearTimeout(waiting))
</script>

<template>
  <!-- Northern lights: a thin curtain over the night at the end of the day, green at its foot. -->
  <svg
    v-if="occasions.has('aurora')"
    class="aurora"
    viewBox="0 0 100 40"
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient id="scene-aurora" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#b48cff" stop-opacity="0" />
        <stop offset="0.45" stop-color="#9a86ff" stop-opacity="0.35" />
        <stop offset="0.82" stop-color="#5ff2b0" stop-opacity="0.95" />
        <stop offset="1" stop-color="#5ff2b0" stop-opacity="0.1" />
      </linearGradient>
      <pattern id="scene-aurora-rays" width="3" height="40" patternUnits="userSpaceOnUse">
        <rect width="1.7" height="40" fill="#fff" />
        <rect x="1.7" width="1.3" height="40" fill="#fff" opacity="0.4" />
      </pattern>
      <mask id="scene-aurora-mask">
        <rect x="-10" width="120" height="40" fill="url(#scene-aurora-rays)" />
      </mask>
      <filter id="scene-aurora-soft" x="-10%" y="-20%" width="120%" height="140%">
        <feGaussianBlur stdDeviation="0.7 0.9" />
      </filter>
    </defs>
    <g filter="url(#scene-aurora-soft)">
      <g class="curtain far" mask="url(#scene-aurora-mask)">
        <path
          fill="url(#scene-aurora)"
          d="M-5 26C12 20 30 30 52 22S84 18 105 24V4C84 0 70 10 50 6S12 2-5 9Z"
        />
      </g>
      <g class="curtain" mask="url(#scene-aurora-mask)">
        <path
          fill="url(#scene-aurora)"
          d="M-5 31C15 25 30 35 50 28S80 23 105 30V9C80 5 70 15 50 11S15 7-5 14Z"
        />
      </g>
    </g>
  </svg>

  <!-- A spark climbs, opens into twelve lights, and they drift apart, sink a little and go out. -->
  <template v-for="(burst, index) in fireworks" :key="index">
    <i class="trail" :class="{ extra: index === 2 }" :style="burst" />
    <i class="burst" :class="{ extra: index === 2 }" :style="burst">
      <b v-for="angle in SPOKES" :key="angle" :style="{ '--angle': `${angle}deg` }" />
    </i>
  </template>

  <!-- On Halloween night a bat circles the moon, passing in front of it. -->
  <svg v-if="occasions.has('halloween')" class="moon-bat" :viewBox="BAT.viewBox">
    <g class="turning">
      <path :d="BAT.body" />
      <path v-for="wing in BAT.wings" :key="wing" class="wing" :d="wing" />
    </g>
  </svg>

  <!-- A saucer drifts in, hovers, shines down on the hill for a moment and leaves. -->
  <svg
    v-if="ufo"
    :key="ufo.id"
    class="ufo"
    :class="{ 'at-start': ufo.atStart }"
    viewBox="0 0 10 4"
    :style="{ top: `${ufo.y}%` }"
    @animationend.self="ufo = undefined"
  >
    <defs>
      <linearGradient id="scene-ufo-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#c8ffe6" stop-opacity="0.55" />
        <stop offset="1" stop-color="#c8ffe6" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path class="beam" d="M4.3 3.4h1.4L8.4 16H1.6Z" fill="url(#scene-ufo-beam)" />
    <ellipse cx="5" cy="1.6" rx="1.9" ry="1.4" fill="#9fe6d0" opacity="0.85" />
    <ellipse cx="5" cy="2.7" rx="5" ry="1.1" fill="#b9bfd6" />
    <ellipse cx="5" cy="3.1" rx="3.2" ry="0.5" fill="#6d7390" />
    <circle class="lamp" cx="2" cy="2.8" r="0.42" fill="#ff6a6a" />
    <circle class="lamp alternate" cx="5" cy="3.2" r="0.42" fill="#ffd34d" />
    <circle class="lamp" cx="8" cy="2.8" r="0.42" fill="#7de0ff" />
  </svg>
</template>

<style scoped>
.aurora {
  position: absolute;
  top: 0;
  right: 0;
  width: 20%;
  height: 72%;
  opacity: 0.5;
  mix-blend-mode: screen;
  mask-image: linear-gradient(90deg, transparent, #000 30%, #000 88%, transparent);
}

.curtain {
  transform-box: view-box;
  transform-origin: 50% 100%;
  animation: drape 16s ease-in-out infinite alternate;
}

.curtain.far {
  opacity: 0.55;
  animation: drape 11s ease-in-out -4s infinite alternate-reverse;
}

@keyframes drape {
  0% {
    opacity: 0.7;
    transform: translateX(-4px) skewX(-6deg);
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.75;
    transform: translateX(5px) skewX(5deg);
  }
}

.trail,
.burst {
  position: absolute;
}

.trail {
  width: 1.2px;
  height: 6px;
  margin-left: -0.6px;
  border-radius: 1px;
  background: linear-gradient(#fff, transparent);
  opacity: 0;
  animation: climb var(--round) ease-out var(--delay) infinite;
}

@keyframes climb {
  0% {
    opacity: 0;
    transform: translateY(40px);
  }

  3% {
    opacity: 0.9;
  }

  14% {
    opacity: 0.8;
    transform: translateY(0);
  }

  16%,
  100% {
    opacity: 0;
  }
}

.burst b {
  position: absolute;
  width: 2px;
  height: 2px;
  margin: -1px;
  border-radius: 50%;
  background: var(--colour);
  box-shadow: 0 0 3px var(--colour);
  opacity: 0;
  animation: open var(--round) cubic-bezier(0.2, 0.7, 0.3, 1) var(--burst-delay) infinite;
}

@keyframes open {
  0% {
    opacity: 0;
    transform: rotate(var(--angle)) translateX(0);
  }

  6% {
    opacity: 1;
  }

  40% {
    opacity: 0.9;
  }

  62%,
  100% {
    opacity: 0;
    transform: rotate(var(--angle)) translateX(var(--radius)) translateY(4px);
  }
}

.moon-bat {
  position: absolute;
  left: 8.3%;
  top: 34%;
  width: calc(5 * var(--unit));
  margin-left: calc(-2.5 * var(--unit));
  overflow: visible;
  fill: #05071a;
  animation: circle 7s linear infinite;
}

@keyframes circle {
  0%,
  100% {
    transform: translate(calc(-22 * var(--unit)), calc(-3 * var(--unit)));
  }

  25% {
    transform: translate(0, calc(3 * var(--unit)));
  }

  50% {
    transform: translate(calc(22 * var(--unit)), calc(-2 * var(--unit)));
  }

  75% {
    transform: translate(0, calc(-10 * var(--unit)));
  }
}

/* Faces the way it flies: right along the bottom of its round, left along the top. */
.turning {
  transform-box: view-box;
  transform-origin: 3px 1.3px;
  animation: lean 7s linear infinite;
}

@keyframes lean {
  0%,
  50% {
    transform: rotate(-6deg);
  }

  51%,
  100% {
    transform: rotate(6deg) scaleX(-1);
  }
}

.wing {
  transform-box: fill-box;
  animation: beat 0.22s ease-in-out infinite alternate;
}

@keyframes beat {
  to {
    transform: scaleY(-0.6);
  }
}

/* It hovers over its night end, about where the night is darkest, and leaves towards the edge. */
.ufo {
  --way: 1;

  position: absolute;
  left: 88%;
  width: calc(10 * var(--unit));
  margin-left: calc(-5 * var(--unit));
  overflow: visible;
  animation: visit 5s ease-in-out forwards;
}

.ufo.at-start {
  --way: -1;

  left: 12%;
}

@keyframes visit {
  0% {
    opacity: 0;
    transform: translate(calc(-70 * var(--way) * var(--unit)), calc(5 * var(--unit)));
  }

  10%,
  90% {
    opacity: 1;
  }

  35% {
    transform: translate(calc(-5 * var(--way) * var(--unit)), calc(-2 * var(--unit)));
  }

  45%,
  62% {
    transform: translate(0, 0);
  }

  100% {
    opacity: 0;
    transform: translate(calc(80 * var(--way) * var(--unit)), calc(-12 * var(--unit)));
  }
}

.beam {
  opacity: 0;
  animation: shine 5s ease-in-out;
}

@keyframes shine {
  44%,
  100% {
    opacity: 0;
  }

  48%,
  58% {
    opacity: 1;
  }
}

.lamp {
  animation: blink 0.5s steps(1) infinite;
}

.lamp.alternate {
  animation-delay: -0.25s;
}

@keyframes blink {
  50% {
    opacity: 0.2;
  }
}

@media (max-width: 759px) {
  .extra {
    display: none;
  }
}

/* Held still: the curtain hangs, the bursts stay open, the bat waits by the moon. */
@media (prefers-reduced-motion: reduce) {
  .curtain,
  .moon-bat,
  .turning,
  .wing {
    animation: none;
  }

  .trail {
    display: none;
  }

  .burst b {
    opacity: 0.8;
    transform: rotate(var(--angle)) translateX(var(--radius));
    animation: none;
  }
}
</style>
