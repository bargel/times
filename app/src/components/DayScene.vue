<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import {
  BIRDS,
  CLOUDS,
  FAR_HILLS,
  FIGURES,
  isNightAt,
  LIFE,
  MID_HILLS,
  NEAR_HILL,
  RIDGES,
  STARS,
  type Figure,
} from '@/config/scenery'
import { colourAt, ridgePath, ridgeTop } from '@/lib/scenery'
import { nextShootingStar, nextShootingStarDelay, type ShootingStar } from '@/lib/shootingStar'

const HILLS = [
  { id: 'far', stops: FAR_HILLS, path: ridgePath(RIDGES.far) },
  { id: 'mid', stops: MID_HILLS, path: ridgePath(RIDGES.mid) },
  { id: 'near', stops: NEAR_HILL, path: ridgePath(RIDGES.near) },
]

const SAIL_TURNS = [0, 90, 180, 270]

/** Each figure stands on the near hill where it is, in the hill's own colour there. */
const life = LIFE.map(({ kind, hour, size = 1, wide }) => {
  const place = hour / 24
  const figure: Figure = FIGURES[kind]
  const [x, y, width, height] = figure.viewBox
  return {
    key: `${kind}-${hour}`,
    figure,
    wide,
    isNight: isNightAt(place),
    colour: colourAt(NEAR_HILL, place),
    viewBox: `${x} ${y} ${width} ${height}`,
    style: {
      left: `${place * 100}%`,
      top: `${ridgeTop(RIDGES.near, place)}%`,
      width: `calc(${width * size} * var(--unit))`,
      height: `calc(${height * size} * var(--unit))`,
    },
  }
})

const groundColours = `linear-gradient(90deg, ${NEAR_HILL.map(([at, colour]) => `${colour} ${at * 100}%`).join(', ')})`

/** Now and then a star falls in the night sky: never under reduced motion, never on a hidden tab. */
const fallingStar = ref<ShootingStar & { id: number }>()
let fallen = 0
let waiting: ReturnType<typeof setTimeout> | undefined
const stillMotion = matchMedia('(prefers-reduced-motion: reduce)')

function waitForStar() {
  waiting = setTimeout(() => {
    if (!stillMotion.matches && !document.hidden) fallingStar.value = { ...nextShootingStar(), id: ++fallen }
    waitForStar()
  }, nextShootingStarDelay())
}

onMounted(waitForStar)
onUnmounted(() => clearTimeout(waiting))
</script>

<template>
  <div class="scene" aria-hidden="true">
    <div class="sky">
      <i
        v-for="[x, y, size] in STARS"
        :key="`${x}-${y}`"
        class="star"
        :style="{ left: `${x}%`, top: `${y}%`, width: `${size}px`, height: `${size}px` }"
      />
      <svg
        v-for="[x, y, size] in CLOUDS"
        :key="`cloud-${x}`"
        class="cloud"
        viewBox="0 0 19 6"
        :style="{ left: `${x}%`, top: `${y}%`, width: `calc(${19 * size} * var(--unit))` }"
      >
        <path
          d="M1 6C-.4 6 0 3.6 1.8 3.8 2.2 1.8 4.6 1.4 5.8 2.8 6.6.4 10 0 11.4 2c1.2-1.2 3.8-.6 4.2 1.4 2-.4 3 1.6 1.8 2.6Z"
        />
      </svg>
      <svg
        v-for="[x, y, size] in BIRDS"
        :key="`bird-${x}`"
        class="bird"
        viewBox="0 0 4 1.6"
        :style="{ left: `${x}%`, top: `${y}%`, width: `calc(${5 * size} * var(--unit))` }"
      >
        <path d="M0 1.4Q1 0 2 1.2 3 0 4 1.4" />
      </svg>
      <i
        v-if="fallingStar"
        :key="fallingStar.id"
        class="falling-star"
        :style="{
          left: `${fallingStar.x}%`,
          top: `${fallingStar.y}%`,
          '--angle': `${fallingStar.angle}deg`,
          '--length': `calc(${fallingStar.length} * var(--unit))`,
          '--distance': `calc(${fallingStar.distance} * var(--unit))`,
          '--duration': `${fallingStar.duration}ms`,
        }"
        @animationend="fallingStar = undefined"
      />
      <i class="moon-glow" />
      <svg class="moon" viewBox="0 0 24 24">
        <path d="M15 2a10 10 0 1 0 7.4 14.6A9 9 0 0 1 15 2Z" />
      </svg>
      <i class="sun-glow" />
      <i class="sun" />
    </div>

    <svg class="hills" viewBox="0 0 1200 100" preserveAspectRatio="none">
      <defs>
        <linearGradient v-for="hill in HILLS" :id="`scene-${hill.id}`" :key="hill.id">
          <stop
            v-for="[at, colour] in hill.stops"
            :key="at"
            :offset="at"
            :stop-color="colour"
          />
        </linearGradient>
        <radialGradient id="scene-light">
          <stop offset="0" stop-color="#ffc56a" stop-opacity="0.55" />
          <stop offset="1" stop-color="#ffc56a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <path v-for="hill in HILLS" :key="hill.id" :fill="`url(#scene-${hill.id})`" :d="hill.path" />
    </svg>

    <div class="life">
      <svg
        v-for="piece in life"
        :key="piece.key"
        class="figure"
        :class="{ wide: piece.wide }"
        :viewBox="piece.viewBox"
        :style="piece.style"
      >
        <path v-if="piece.figure.smoke" class="smoke" :d="piece.figure.smoke" />
        <path :fill="piece.colour" :d="piece.figure.body" />
        <g
          v-if="piece.figure.sails"
          class="sails"
          :style="{
            transformOrigin: `${piece.figure.sails.centre[0]}px ${piece.figure.sails.centre[1]}px`,
          }"
        >
          <path
            v-for="turn in SAIL_TURNS"
            :key="turn"
            :fill="piece.colour"
            :d="piece.figure.sails.path"
            :transform="`rotate(${turn} ${piece.figure.sails.centre[0]} ${piece.figure.sails.centre[1]})`"
          />
        </g>
        <template v-for="[x, y, width, height] in piece.figure.windows ?? []" :key="`${x}-${y}`">
          <circle
            v-if="piece.isNight"
            :cx="x + width / 2"
            :cy="y + height / 2"
            r="3.5"
            fill="url(#scene-light)"
          />
          <rect
            class="window"
            :class="{ lit: piece.isNight }"
            :x="x"
            :y="y"
            :width="width"
            :height="height"
            rx="0.3"
          />
        </template>
        <template v-if="piece.figure.fire && piece.isNight">
          <circle cx="11.9" cy="5.4" r="4" fill="url(#scene-light)" />
          <path class="fire" :d="piece.figure.fire" />
        </template>
      </svg>
    </div>

    <!-- The near ground, flat and dark enough to carry the hours. -->
    <div class="ground" :style="{ background: groundColours }" />
  </div>
</template>

<style scoped>
/*
 * The line sets the heights: the sky over the hills, and the strip of ground the hours stand on.
 * The small things are drawn in units a little over a pixel on the desktop's 72px sky, and scale
 * with it, so they stay readable on a phone.
 */
.scene {
  --unit: calc(var(--sky-height) / 60);

  position: relative;
  height: var(--scene-height);
  border-radius: var(--radius);
  overflow: hidden;
  background: #0a0e2a;
}

/* The night sky is nearly the dark page's own colour, so it needs an edge to stay a picture. */
@media (prefers-color-scheme: dark) {
  .scene::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink) 16%, transparent);
    pointer-events: none;
  }
}

/* The colours by the horizon, warm where the sun rises and sets. */
.sky {
  position: absolute;
  top: 0;
  right: 0;
  bottom: var(--ground-height);
  left: 0;
  background:
    radial-gradient(9% 75% at 27% 100%, rgb(255 178 120 / 0.8), transparent),
    radial-gradient(9% 75% at 76.5% 100%, rgb(255 150 100 / 0.8), transparent),
    linear-gradient(
      90deg,
      #0a0e2a 0%,
      #161f52 17%,
      #3e3a78 21.5%,
      #9a5e8c 24.5%,
      #e88a7a 27%,
      #fbc58f 30%,
      #f6e4c4 34.5%,
      #b9def0 40%,
      #7cc0ec 50%,
      #b9def0 62%,
      #f6e0bc 69%,
      #fbbf86 73.5%,
      #ec8068 76.5%,
      #a5577e 79.5%,
      #4a3e7c 83%,
      #182155 88%,
      #0a0e2a 100%
    );
}

/* Overhead the sky is deeper, fading down into the horizon's colours. */
.sky::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    #060920 0%,
    #0b1140 18%,
    #23276a 23%,
    #4c4790 27%,
    #4f86cc 32%,
    #3784d0 40%,
    #2f7fcf 50%,
    #3784d0 60%,
    #4f86cc 69%,
    #55468a 75%,
    #33296c 80%,
    #0e1346 86%,
    #060920 100%
  );
  mask-image: linear-gradient(180deg, #000, transparent 78%);
}

.star {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  opacity: 0.85;
}

.star:nth-child(3n) {
  opacity: 0.5;
}

/*
 * A falling star. The element only flies, in a straight line at one speed; the streak inside
 * brightens, grows its tail and fades on its own, so nothing about it can stall the flight.
 */
.falling-star {
  position: absolute;
  width: var(--length);
  height: 1.2px;
  margin-top: -0.6px;
  margin-left: calc(var(--length) * -1);
  transform-origin: 100% 50%;
  transform: rotate(var(--angle));
  animation: fly var(--duration) linear forwards;
}

.falling-star::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 1px;
  background: linear-gradient(90deg, rgb(255 255 255 / 0), rgb(255 255 255 / 0.7) 70%, #fff);
  transform-origin: 100% 50%;
  opacity: 0;
  animation: glint var(--duration) linear forwards;
}

@keyframes fly {
  to {
    transform: rotate(var(--angle)) translateX(var(--distance));
  }
}

@keyframes glint {
  0% {
    opacity: 0;
    transform: scaleX(0.25);
  }

  15% {
    opacity: 0.95;
  }

  45% {
    transform: scaleX(1);
  }

  60% {
    opacity: 0.95;
  }

  100% {
    opacity: 0;
    transform: scaleX(0.6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .falling-star {
    display: none;
  }
}

.cloud,
.bird {
  position: absolute;
  overflow: visible;
}

.cloud {
  fill: rgb(255 255 255 / 0.42);
}

.bird {
  fill: none;
  stroke: rgb(20 28 60 / 0.6);
  stroke-width: 0.45;
  stroke-linecap: round;
}

.moon-glow {
  position: absolute;
  left: 8.3%;
  top: 34%;
  height: 90%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgb(244 239 216 / 0.22), transparent);
  transform: translate(-50%, -50%);
}

.moon {
  position: absolute;
  left: 8.3%;
  top: 14%;
  height: 40%;
  aspect-ratio: 1;
  fill: #f4efd8;
  transform: translateX(-50%);
}

.sun {
  position: absolute;
  left: 50%;
  top: 15%;
  height: 42%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #fffbe6;
  transform: translateX(-50%);
}

/* The sun's light around it, behind the disc. */
.sun-glow {
  position: absolute;
  left: 50%;
  top: 36%;
  height: 109%;
  aspect-ratio: 1;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    closest-side,
    rgb(255 250 220 / 0.75),
    rgb(255 246 200 / 0.25) 55%,
    transparent
  );
}

/* A pixel into the ground, so no sky shows between them. The life on the hill shares the box. */
.hills,
.life {
  position: absolute;
  left: 0;
  width: 100%;
  bottom: calc(var(--ground-height) - 1px);
  height: calc((100% - var(--ground-height)) * 0.45);
}

.hills {
  display: block;
}

/* Standing on the hill, a little into it. */
.figure {
  position: absolute;
  overflow: visible;
  transform: translate(-50%, calc(-100% + 0.5px));
}

.window {
  fill: rgb(8 20 24 / 0.35);
}

.window.lit {
  fill: #ffd27a;
}

.fire {
  fill: #ffb24d;
}

.smoke {
  fill: none;
  stroke: rgb(255 255 255 / 0.3);
  stroke-width: 0.7;
  stroke-linecap: round;
}

.sails {
  transform-box: view-box;
  animation: turn 30s linear infinite;
}

@keyframes turn {
  to {
    transform: rotate(1turn);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sails {
    animation: none;
  }
}

/* Where the line has no room, only every other thing stands on the hill. */
@media (max-width: 759px) {
  .figure.wide {
    display: none;
  }
}

.ground {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: var(--ground-height);
}
</style>
