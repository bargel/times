<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import {
  BAT,
  BIRDS,
  CLOUDS,
  FIGURES,
  groundOf,
  isNightAt,
  LIFE,
  RIDGES,
  SEASON_LOOKS,
  STARS,
  STORK,
  type Figure,
} from '@/config/scenery'
import { moonLight } from '@/lib/moon'
import type { Occasion } from '@/lib/occasions'
import { colourAt, ridgePath, ridgeTop, type Season } from '@/lib/scenery'
import { nextShootingStar, nextShootingStarDelay, type ShootingStar } from '@/lib/shootingStar'

import SceneEgg from './SceneEgg.vue'
import ScenePumpkin from './ScenePumpkin.vue'
import SceneSkyEvents from './SceneSkyEvents.vue'

const props = defineProps<{
  season: Season
  /** Lights on the trees and roofs at night. */
  festive: boolean
  /** Where the moon is in its cycle on the picked day, 0 new to 0.5 full and back. */
  moonPhase: number
  /** What the picked day leaves in the picture. */
  occasions: ReadonlySet<Occasion>
}>()

/** Where the Easter egg hides in the grass, between the poplars and the windmill. */
const EGG_PLACE = 10.5 / 24
const eggStyle = { left: `${EGG_PLACE * 100}%`, top: `${ridgeTop(RIDGES.near, EGG_PLACE)}%` }

/** Sparks over the Kupala fire: `[drift sideways, seconds to rise]`. Only four on a phone. */
const SPARKS = [
  [-3, 1.4],
  [2, 1.8],
  [-1, 2.2],
  [4, 1.5],
  [0, 1.9],
  [-4, 2.1],
  [3, 1.6],
] as const

const look = computed(() => SEASON_LOOKS[props.season])

/** Its light shines brighter around it the fuller it is. */
const moon = computed(() => moonLight(props.moonPhase))
const moonGlow = computed(() => Math.min(0.45 + 0.75 * moon.value.lit, 1))

const RIDGE_PATHS = { far: ridgePath(RIDGES.far), mid: ridgePath(RIDGES.mid), near: ridgePath(RIDGES.near) }
const hills = computed(() =>
  (['far', 'mid', 'near'] as const).map((id) => ({ id, stops: look.value[id], path: RIDGE_PATHS[id] })),
)

const SAIL_TURNS = [0, 90, 180, 270]
const BULB_COLOURS = ['#ff5a5a', '#ffd34d', '#5ad1ff', '#7dff8a']

/**
 * Each figure stands on the near hill where it is, in the hill's own colour there, or the season's
 * own: dark on snow, turned in autumn. Every other tree carries lights on a festive night.
 */
const life = computed(() => {
  let trees = 0
  return LIFE.map(({ kind, hour, size = 1, wide, stork }) => {
    const place = hour / 24
    const figure: Figure = FIGURES[kind]
    const [x, y, width, height] = figure.viewBox
    const isNight = isNightAt(place)
    const tint = isNight ? undefined : look.value.tints?.[kind]
    return {
      key: `${kind}-${hour}`,
      figure,
      wide,
      isNight,
      colour: tint ?? colourAt(look.value.figures ?? look.value.near, place),
      lit: props.festive && isNight && figure.lights !== undefined && trees++ % 2 === 0,
      nest: stork && props.occasions.has('storks') ? figure.nest : undefined,
      viewBox: `${x} ${y} ${width} ${height}`,
      style: {
        left: `${place * 100}%`,
        top: `${ridgeTop(RIDGES.near, place)}%`,
        width: `calc(${width * size} * var(--unit))`,
        height: `calc(${height * size} * var(--unit))`,
      },
    }
  })
})

const groundColours = computed(
  () => `linear-gradient(90deg, ${groundOf(look.value).map(([at, colour]) => `${colour} ${at * 100}%`).join(', ')})`,
)

/** The same scatter on every visit: a small generator from a fixed seed, five numbers per thing. */
function scatter(count: number, seed: number): number[][] {
  let state = seed
  const next = () => (state = (state * 16807) % 2147483647) / 2147483647
  return Array.from({ length: count }, () => Array.from({ length: 5 }, next))
}

/** Things drifting down over the whole sky, each at its own pace, already on their way. */
const FLAKES = scatter(40, 7).map(([across, size, pace, start, drift]) => ({
  left: `${across! * 100}%`,
  width: `${1 + size! * 1.4}px`,
  height: `${1 + size! * 1.4}px`,
  opacity: 0.55 + size! * 0.4,
  animationDuration: `${5 + pace! * 6}s`,
  animationDelay: `${-start! * 11}s`,
  '--drift': `${(drift! - 0.3) * 14}px`,
}))

/** Leaves and petals keep to the daytime sky. */
const DRIFTERS = scatter(9, 11).map(([across, , pace, start, drift], index) => ({
  index,
  style: {
    left: `${30 + across! * 42}%`,
    animationDuration: `${6 + pace! * 5}s`,
    animationDelay: `${-start! * 11}s`,
    '--drift': `${12 + drift! * 18}px`,
  },
}))

/** By the ground at both night ends of the day. */
const FIREFLIES = scatter(10, 5).map(([across, height, pace, start], index) => ({
  left: `${index < 5 ? 2 + across! * 18 : 81 + across! * 17}%`,
  bottom: `${2 + height! * 14}px`,
  animationDuration: `${2.6 + pace! * 2.4}s`,
  animationDelay: `${-start! * 5}s`,
}))

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
  <div class="scene" :class="{ 'upside-down': occasions.has('aprilFools') }" aria-hidden="true">
    <div class="sky">
      <i
        v-for="([x, y, size], index) in STARS"
        :key="`${x}-${y}`"
        class="star"
        :class="{ twinkles: index % 2 === 0 }"
        :style="{
          left: `${x}%`,
          top: `${y}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDuration: `${3 + ((index * 7) % 5)}s`,
          animationDelay: `${-((index * 1.3) % 5)}s`,
        }"
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
      <!-- On Halloween the birds are bats. -->
      <template v-if="occasions.has('halloween')">
        <svg
          v-for="([x, y, size], index) in BIRDS"
          :key="`bat-${x}`"
          class="bat"
          :viewBox="BAT.viewBox"
          :style="{
            left: `${x}%`,
            top: `${y}%`,
            width: `calc(${6 * size} * var(--unit))`,
            '--phase': `${-index * 0.6}s`,
          }"
        >
          <path :d="BAT.body" />
          <path v-for="wing in BAT.wings" :key="wing" class="bat-wing" :d="wing" />
        </svg>
      </template>
      <template v-else>
        <svg
          v-for="([x, y, size], index) in BIRDS"
          :key="`bird-${x}`"
          class="bird"
          viewBox="0 0 4 1.6"
          :style="{
            left: `${x}%`,
            top: `${y}%`,
            width: `calc(${5 * size} * var(--unit))`,
            '--phase': `${-index * 0.9}s`,
          }"
        >
          <path class="wing" d="M0 1.4Q1 0 2 1.2" />
          <path class="wing right" d="M2 1.2Q3 0 4 1.4" />
        </svg>
      </template>
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
      <i class="moon-glow" :style="{ opacity: moonGlow }" />
      <!--
        The moon in its phase: the dark side faintly lit by the earth, the lit side shaded with a
        few seas and a soft edge to its shadow, all a little tilted. In winter a ring around it,
        as bright as the moon is full.
      -->
      <svg class="moon" viewBox="0 0 24 24">
        <defs>
          <filter id="scene-moon-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.35" />
          </filter>
          <filter id="scene-moon-seas" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.45" />
          </filter>
          <clipPath id="scene-moon-disc">
            <circle cx="12" cy="12" r="10" />
          </clipPath>
          <mask id="scene-moon-lit" maskUnits="userSpaceOnUse" x="-2" y="-2" width="28" height="28">
            <path
              :d="moon.path"
              fill="#fff"
              :transform="moon.waning ? 'translate(24 0) scale(-1 1)' : undefined"
              filter="url(#scene-moon-soft)"
            />
          </mask>
          <radialGradient id="scene-moon-shade" cx="0.42" cy="0.4" r="0.65">
            <stop offset="0" stop-color="#fffbe9" />
            <stop offset="1" stop-color="#e9e1c2" />
          </radialGradient>
        </defs>
        <circle
          v-if="look.snow"
          class="moon-halo"
          cx="12"
          cy="12"
          r="17"
          :style="{ opacity: moon.lit }"
        />
        <g transform="rotate(-18 12 12)">
          <circle class="earthshine" cx="12" cy="12" r="10" />
          <g clip-path="url(#scene-moon-disc)" mask="url(#scene-moon-lit)">
            <circle cx="12" cy="12" r="10" fill="url(#scene-moon-shade)" />
            <g class="seas" filter="url(#scene-moon-seas)">
              <ellipse cx="9" cy="8.5" rx="3.2" ry="2.4" />
              <ellipse cx="13.6" cy="7.4" rx="2.2" ry="1.7" />
              <ellipse cx="11.2" cy="12.4" rx="2.6" ry="2" />
              <ellipse cx="15.6" cy="11.2" rx="1.6" ry="2.4" />
              <ellipse cx="8.4" cy="15.4" rx="1.8" ry="1.3" />
            </g>
          </g>
        </g>
      </svg>
      <i class="sun-glow" />
      <i class="sun" />
      <SceneSkyEvents :occasions="occasions" />
    </div>

    <svg class="hills" viewBox="0 0 1200 100" preserveAspectRatio="none">
      <defs>
        <linearGradient v-for="hill in hills" :id="`scene-${hill.id}`" :key="hill.id">
          <stop
            v-for="[at, colour] in hill.stops"
            :key="at"
            :offset="at"
            :stop-color="colour"
          />
        </linearGradient>
        <linearGradient id="scene-smoke" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#fff" stop-opacity="0.45" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
        <radialGradient id="scene-light">
          <stop offset="0" stop-color="#ffc56a" stop-opacity="0.55" />
          <stop offset="1" stop-color="#ffc56a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <path v-for="hill in hills" :key="hill.id" :fill="`url(#scene-${hill.id})`" :d="hill.path" />
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
        <path
          v-if="piece.figure.smoke"
          class="smoke"
          :d="piece.figure.smoke"
          pathLength="10"
          stroke="url(#scene-smoke)"
        />
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
        <!-- On Kupala Night the fire burns twice the size, throwing sparks. -->
        <template v-if="piece.figure.fire && piece.isNight">
          <circle
            class="fire-glow"
            cx="11.9"
            cy="5.4"
            :r="occasions.has('kupala') ? 9 : 4"
            fill="url(#scene-light)"
          />
          <g
            :transform="
              occasions.has('kupala') ? 'translate(11.9 6.7) scale(2.1) translate(-11.9 -6.7)' : undefined
            "
          >
            <path class="fire" :d="piece.figure.fire" />
          </g>
          <g v-if="occasions.has('kupala')" class="sparks">
            <circle
              v-for="([drift, rise], index) in SPARKS"
              :key="index"
              cx="11.9"
              cy="2.5"
              r="0.6"
              :style="{
                '--drift': `${drift}px`,
                animationDuration: `${rise}s`,
                animationDelay: `${-index * 0.27}s`,
              }"
            />
          </g>
        </template>
        <ScenePumpkin
          v-if="occasions.has('halloween') && piece.figure.porch"
          :at="piece.figure.porch"
          :night="piece.isNight"
        />
        <!-- A stork in its nest on the ridge of the roof. -->
        <g v-if="piece.nest" class="stork" :transform="`translate(${piece.nest[0]} ${piece.nest[1]})`">
          <path class="stork-red" :d="STORK.legs" />
          <ellipse class="nest" rx="2.4" ry="0.75" />
          <path class="stork-white" :d="STORK.body" />
          <path class="stork-black" :d="STORK.wing" />
          <path class="stork-red" :d="STORK.beak" />
        </g>
        <template v-if="look.snow">
          <path
            v-if="piece.figure.roof"
            class="roof-snow"
            :class="{ night: piece.isNight }"
            :d="piece.figure.roof"
          />
          <path
            v-if="piece.figure.snowcap"
            class="snowcap"
            :class="{ night: piece.isNight }"
            :d="piece.figure.snowcap"
          />
        </template>
        <!-- A garland under the eaves: one dotted line per colour, each starting a bulb further on. -->
        <g v-if="festive && piece.isNight && piece.figure.roof" class="garland">
          <path
            v-for="(colour, index) in BULB_COLOURS"
            :key="colour"
            :class="{ alternate: index % 2 === 1 }"
            :d="piece.figure.roof"
            :stroke="colour"
            :stroke-dashoffset="-(0.6 + index * 1.3)"
          />
        </g>
        <template v-if="piece.lit && piece.figure.lights">
          <circle
            v-for="([x, y], index) in piece.figure.lights.bulbs"
            :key="`${x}-${y}`"
            class="bulb"
            :class="{ alternate: index % 2 === 1 }"
            :cx="x"
            :cy="y"
            r="0.5"
            :fill="BULB_COLOURS[index % BULB_COLOURS.length]"
          />
          <path
            class="tree-star"
            :d="`M${piece.figure.lights.star[0]} ${piece.figure.lights.star[1]}l.45 1 1 .1-.75.7.2 1-.9-.5-.9.5.2-1-.75-.7 1-.1Z`"
          />
        </template>
        <template v-if="look.blossom && !piece.isNight">
          <circle
            v-for="([x, y], index) in piece.figure.blossom ?? []"
            :key="`${x}-${y}`"
            class="blossom"
            :class="{ pale: index % 3 === 0 }"
            :cx="x"
            :cy="y"
            r="0.55"
          />
        </template>
      </svg>
      <SceneEgg v-if="occasions.has('easter')" :style="eggStyle" />
    </div>

    <!-- What the season lets drift through the air. -->
    <div class="weather">
      <template v-if="look.snow">
        <i v-for="(flake, index) in FLAKES" :key="`flake-${index}`" class="flake" :style="flake" />
      </template>
      <template v-if="look.leaves || look.blossom">
        <i
          v-for="{ index, style } in DRIFTERS"
          :key="`drifter-${index}`"
          :class="look.leaves ? ['leaf', `leaf-${index % 3}`] : 'petal'"
          :style="style"
        />
      </template>
      <template v-if="look.fireflies">
        <i v-for="(firefly, index) in FIREFLIES" :key="`firefly-${index}`" class="firefly" :style="firefly" />
      </template>
    </div>

    <!-- The near ground, flat and plain enough to carry the hours. -->
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

/*
 * April Fools' Day: the picture hangs upside down. Its hours run left to right as ever, so the
 * numbers under it stay right.
 */
.scene.upside-down {
  transform: scaleY(-1);
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

/* Every other star dims and comes back, each on its own beat, so they never pulse together. */
.star.twinkles {
  animation: twinkle ease-in-out infinite;
}

@keyframes twinkle {
  50% {
    opacity: 0.2;
  }
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
  animation: bob 2.7s ease-in-out var(--phase) infinite alternate;
}

@keyframes bob {
  to {
    transform: translateY(-1px);
  }
}

/*
 * Two beats of the wings, then a glide. Each wing swings about the body, so the line keeps its
 * weight all the way through. Each bird keeps its own time.
 */
.wing {
  --up: 18deg;
  --down: -28deg;

  transform-box: view-box;
  transform-origin: 2px 1.2px;
  animation: flap 2.4s ease-in-out var(--phase) infinite;
}

.wing.right {
  --up: -18deg;
  --down: 28deg;
}

@keyframes flap {
  0%,
  52%,
  100% {
    transform: rotate(0);
  }

  8%,
  30% {
    transform: rotate(var(--up));
  }

  19%,
  41% {
    transform: rotate(var(--down));
  }
}

/* Halloween's bats, where the birds fly, beating their wings fast. */
.bat {
  position: absolute;
  overflow: visible;
  fill: #2a2236;
  animation: bob 1.9s ease-in-out var(--phase) infinite alternate;
}

.bat-wing {
  transform-box: fill-box;
  animation: bat-beat 0.22s ease-in-out infinite alternate;
}

@keyframes bat-beat {
  to {
    transform: scaleY(-0.6);
  }
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
  overflow: visible;
  transform: translateX(-50%);
}

.earthshine {
  fill: rgb(201 208 240 / 0.07);
}

.seas {
  fill: rgb(185 176 143 / 0.38);
}

/* A frosty ring, just there. It is the moon's own light, so it fades with the moon's phase. */
.moon-halo {
  fill: none;
  stroke: rgb(223 230 255 / 0.09);
  stroke-width: 1.2;
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

/* The flame shivers from its foot, unevenly, and its light breathes more slowly around it. */
.fire {
  fill: #ffb24d;
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: flicker 1.3s linear infinite;
}

@keyframes flicker {
  0%,
  100% {
    transform: scale(1, 1);
  }

  18% {
    transform: scale(0.9, 1.18);
  }

  31% {
    transform: scale(1.06, 0.88);
  }

  52% {
    transform: scale(0.94, 1.12);
  }

  67% {
    transform: scale(1.04, 0.93);
  }

  84% {
    transform: scale(0.97, 1.08);
  }
}

.fire-glow {
  animation: glow 2.1s ease-in-out infinite alternate;
}

@keyframes glow {
  to {
    opacity: 0.7;
  }
}

.sparks circle {
  fill: #ffd27a;
  opacity: 0;
  animation: spark ease-out infinite;
}

@keyframes spark {
  15% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translate(var(--drift), -22px);
  }
}

/* A stork: white, a black wing, red beak and legs, on a nest of twigs. */
.nest {
  fill: #5a4128;
}

.stork-white {
  fill: #fbfaf5;
}

.stork-black {
  fill: #1b1b22;
}

.stork-red {
  fill: none;
  stroke: #d9532b;
  stroke-width: 0.32;
  stroke-linecap: round;
}

/*
 * Smoke thinning away as it climbs. Its dashes run up the line so it rises, and the line leans
 * back and forth from the chimney in the wind, most at its top.
 */
.smoke {
  fill: none;
  stroke-width: 0.7;
  stroke-linecap: round;
  stroke-dasharray: 3 1;
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation:
    rise 1.6s linear infinite,
    sway 5.5s ease-in-out infinite alternate;
}

@keyframes rise {
  to {
    stroke-dashoffset: -4;
  }
}

@keyframes sway {
  from {
    transform: skewX(-9deg);
  }

  to {
    transform: skewX(7deg);
  }
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

/* Winter: snow along the roofs and on the treetops, a little blue under the moon. */
.roof-snow {
  fill: none;
  stroke: #fff;
  stroke-width: 0.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.snowcap {
  fill: #fff;
}

.roof-snow.night,
.snowcap.night {
  stroke: #c9d3f0;
  opacity: 0.75;
}

.snowcap.night {
  fill: #c9d3f0;
}

/* Festive nights: a dotted garland just under the eaves, bulbs on the trees, half of them blinking. */
.garland {
  transform: translateY(0.55px);
}

.garland path {
  fill: none;
  stroke-width: 0.76;
  stroke-linecap: round;
  stroke-dasharray: 0 5.2;
}

.bulb,
.garland path {
  animation: blink 1.4s steps(1) infinite;
}

.bulb.alternate,
.garland .alternate {
  animation-delay: -0.7s;
}

@keyframes blink {
  50% {
    opacity: 0.25;
  }
}

.tree-star {
  fill: #ffd34d;
}

/* Spring blossom, pink and a little white. */
.blossom {
  fill: #ffd0e0;
}

.blossom.pale {
  fill: #fff6f8;
}

/* The air over the hills, down to the ground under the hours. */
.weather {
  position: absolute;
  top: 0;
  right: 0;
  bottom: var(--ground-height);
  left: 0;
  overflow: hidden;
  pointer-events: none;
}

.flake,
.leaf,
.petal {
  position: absolute;
  top: -4px;
}

.flake {
  border-radius: 50%;
  background: #fff;
  animation: fall linear infinite;
}

@keyframes fall {
  to {
    transform: translate(var(--drift), calc(var(--sky-height) + 8px));
  }
}

.leaf {
  width: 3px;
  height: 2px;
  border-radius: 2px 0;
  animation: tumble linear infinite;
}

.leaf-0 {
  background: #c4612a;
}

.leaf-1 {
  background: #d9a03a;
}

.leaf-2 {
  background: #a8462a;
}

.petal {
  width: 2px;
  height: 2px;
  border-radius: 50% 0;
  background: #ffd6e4;
  animation: tumble linear infinite;
}

@keyframes tumble {
  50% {
    transform: translate(calc(var(--drift) * 0.6), calc(var(--sky-height) * 0.5)) rotate(200deg);
  }

  100% {
    transform: translate(var(--drift), calc(var(--sky-height) + 8px)) rotate(420deg);
  }
}

.firefly {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #e9ff9a;
  box-shadow: 0 0 4px 1px rgb(233 255 154 / 0.7);
  opacity: 0;
  animation: hover ease-in-out infinite;
}

@keyframes hover {
  40% {
    opacity: 1;
  }

  60% {
    opacity: 0.9;
    transform: translate(3px, -3px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sails,
  .bird,
  .wing,
  .bat,
  .bat-wing,
  .sparks circle,
  .star.twinkles,
  .fire,
  .fire-glow,
  .bulb,
  .garland path {
    animation: none;
  }

  /* Held where each one is, scattered through the air. */
  .flake,
  .leaf,
  .petal {
    animation-play-state: paused;
  }

  .firefly {
    animation: none;
    opacity: 0.7;
  }

  /* An unbroken line, as it stands still. */
  .smoke {
    stroke-dasharray: none;
    animation: none;
  }
}

/* Where the line has no room, only every other thing stands on the hill. */
@media (max-width: 759px) {
  .figure.wide,
  .flake:nth-child(2n),
  .sparks circle:nth-child(n + 5) {
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
