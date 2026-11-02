<script setup lang="ts">
import { ref } from 'vue'

import { BAT } from '@/config/scenery'

/**
 * A Halloween pumpkin by a cottage door, drawn in the cottage's own units. By night its face glows.
 * Pressed, it jumps, its face flares, and a bat flies out of it. A press on it never moves a flag.
 */
defineProps<{ at: readonly [number, number]; night: boolean }>()

const startled = ref(false)
const bats = ref<number[]>([])
let released = 0

function startle() {
  startled.value = false
  // On the next frame, so a second press while it still jumps starts the jump again.
  requestAnimationFrame(() => (startled.value = true))
  bats.value.push(++released)
}

const flown = (id: number) => (bats.value = bats.value.filter((bat) => bat !== id))
</script>

<template>
  <g :transform="`translate(${at[0]} ${at[1]})`" @pointerdown.stop @click="startle">
    <circle class="hit" cy="-1" r="10" />
    <circle v-if="night" cy="-0.2" r="3" fill="url(#scene-light)" />
    <g class="art" :class="{ startled, night }" @animationend.self="startled = false">
      <path class="stem" d="M0-1.1l.3-.6" />
      <ellipse class="body" rx="1.5" ry="1.1" />
      <path class="face" d="M-.7-.4l.3-.4.3.4ZM.1-.4l.3-.4.3.4ZM-.7.3c.4.4 1.1.4 1.4 0Z" />
    </g>
    <g
      v-for="id in bats"
      :key="id"
      class="flown"
      @animationend.self="flown(id)"
    >
      <g transform="translate(-3 -1.3)">
        <path :d="BAT.body" />
        <path v-for="wing in BAT.wings" :key="wing" class="wing" :d="wing" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.hit {
  fill: transparent;
  pointer-events: all;
  cursor: pointer;
}

.stem {
  stroke: #4b5a24;
  stroke-width: 0.35;
  stroke-linecap: round;
}

.body {
  fill: #e07a1f;
}

.night .body {
  fill: #b9561a;
}

/* Carved: only lit by night, and for a moment when startled by day. */
.face {
  fill: #ffd27a;
  opacity: 0;
}

.night .face {
  opacity: 1;
}

.art {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}

.art.startled {
  animation: jump 0.9s ease-out;
}

.art.startled .face {
  animation: flare 0.9s ease-out;
}

/* Over in the first two thirds, while its face still glows. */
@keyframes jump {
  20% {
    transform: translateY(-45%) scale(1.1, 0.9);
  }

  37% {
    transform: scale(1.15, 0.85);
  }

  50% {
    transform: scale(0.95, 1.05);
  }

  67%,
  100% {
    transform: none;
  }
}

@keyframes flare {
  0%,
  70% {
    opacity: 1;
    fill: #fff3b0;
  }
}

/* Out of the pumpkin, up and away over the roof, growing as it goes. */
.flown {
  fill: #1a1424;
  animation: away 1.6s ease-in forwards;
}

@keyframes away {
  from {
    opacity: 0;
    transform: translate(0, -1px) scale(0.4);
  }

  10% {
    opacity: 1;
  }

  to {
    opacity: 0;
    transform: translate(38px, -50px) scale(1.15);
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

@media (prefers-reduced-motion: reduce) {
  .art.startled,
  .art.startled .face,
  .wing {
    animation: none;
  }

  .flown {
    animation-duration: 1ms;
  }
}
</style>
