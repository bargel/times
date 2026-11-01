<script setup lang="ts">
// Horizontal positions are percent of the 24 hours; the sky runs midnight to midnight.
const STARS = [
  [1.5, 18], [4.5, 44], [7.5, 14], [10, 34], [12.5, 56], [15, 20], [17, 42],
  [88, 40], [90.5, 16], [93, 50], [95.5, 26], [98.5, 44],
] as const
</script>

<template>
  <div class="scene" aria-hidden="true">
    <div class="sky">
      <i v-for="[x, y] in STARS" :key="x" class="star" :style="{ left: `${x}%`, top: `${y}%` }" />
      <svg class="moon" viewBox="0 0 24 24">
        <path d="M15 2a10 10 0 1 0 7.4 14.6A9 9 0 0 1 15 2Z" />
      </svg>
      <i class="sun" />
    </div>

    <svg class="hills" viewBox="0 0 1200 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="hills-far">
          <stop offset="0" stop-color="#141a42" />
          <stop offset="0.2" stop-color="#1c2452" />
          <stop offset="0.28" stop-color="#8a6f66" />
          <stop offset="0.38" stop-color="#6fa596" />
          <stop offset="0.68" stop-color="#6fa596" />
          <stop offset="0.78" stop-color="#a0694f" />
          <stop offset="0.86" stop-color="#1c2452" />
          <stop offset="1" stop-color="#141a42" />
        </linearGradient>
        <linearGradient id="hills-near">
          <stop offset="0" stop-color="#090d24" />
          <stop offset="0.2" stop-color="#0f1433" />
          <stop offset="0.28" stop-color="#4f4140" />
          <stop offset="0.38" stop-color="#3a7564" />
          <stop offset="0.68" stop-color="#3a7564" />
          <stop offset="0.78" stop-color="#5e3b30" />
          <stop offset="0.86" stop-color="#0f1433" />
          <stop offset="1" stop-color="#090d24" />
        </linearGradient>
      </defs>
      <path
        fill="url(#hills-far)"
        d="M0 46C110 12 230 18 350 44S560 74 700 38 960 8 1200 46V100H0Z"
      />
      <path
        fill="url(#hills-near)"
        d="M0 72C130 44 290 50 430 70S700 92 840 66 1050 48 1200 72V100H0Z"
      />
    </svg>

    <!-- The night carries on past 24:00, under the room kept for the last flag. -->
    <svg class="tail" viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect y="46" width="100" height="54" fill="#141a42" />
      <rect y="72" width="100" height="28" fill="#090d24" />
    </svg>
  </div>
</template>

<style scoped>
.scene {
  --hours: calc(100% - var(--line-tail));

  position: relative;
  height: clamp(52px, 6.4vw, 72px);
  margin-right: calc(var(--line-tail) * -1);
  border-radius: var(--radius);
  overflow: hidden;
  background: #0c1130;
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

.sky,
.hills {
  position: absolute;
  left: 0;
  width: var(--hours);
}

.sky {
  top: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    #0c1130 0%,
    #1a2358 18%,
    #5f4d7f 23%,
    #d98a78 26.5%,
    #f9d2a0 30%,
    #cde6f0 37%,
    #86c9ef 50%,
    #cde6f0 66%,
    #fbd6a0 73%,
    #ea906a 78%,
    #5f4d7f 83%,
    #1a2358 89%,
    #0c1130 100%
  );
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #fff;
  opacity: 0.8;
}

.star:nth-child(3n) {
  opacity: 0.45;
}

.moon {
  position: absolute;
  left: 8.3%;
  top: 12%;
  height: 46%;
  aspect-ratio: 1;
  fill: #f4efd8;
  transform: translateX(-50%);
}

.sun {
  position: absolute;
  left: 50%;
  top: 10%;
  height: 50%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #fff4c2;
  transform: translateX(-50%);
}

.hills {
  bottom: 0;
  height: 42%;
  display: block;
}

.tail {
  position: absolute;
  right: 0;
  bottom: 0;
  width: var(--line-tail);
  height: 42%;
  display: block;
}

@media (orientation: landscape) and (max-height: 500px) {
  .scene {
    height: 40px;
  }
}
</style>
