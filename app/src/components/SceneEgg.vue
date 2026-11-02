<script setup lang="ts">
import { ref } from 'vue'

/**
 * A painted Easter egg hidden in the grass. Found, it hops and turns into a basket of eggs, which
 * stays until the page reloads. A press on it never moves a flag.
 */
const found = ref(false)
const hopping = ref(false)

function find() {
  if (found.value || hopping.value) return
  hopping.value = true
}
</script>

<template>
  <svg v-if="!found" class="egg" viewBox="0 0 4 5.4" @pointerdown.stop @click="find">
    <circle class="hit" cx="2" cy="2.7" r="10" />
    <g class="art" :class="{ hopping }" @animationend="found = true">
      <ellipse cx="2" cy="2.7" rx="1.9" ry="2.6" fill="#c8302f" />
      <path d="M.25 2.3h3.5v.9H.25Z" fill="#f2c14e" />
      <path d="M.3 2.3l.6.45.6-.45.6.45.6-.45.6.45.5-.4" fill="none" stroke="#fff" stroke-width=".22" />
      <circle cx="2" cy="1" r=".3" fill="#fff" />
      <circle cx="1.1" cy="4.1" r=".25" fill="#fff" />
      <circle cx="2.9" cy="4.1" r=".25" fill="#fff" />
    </g>
  </svg>
  <svg v-else class="basket" viewBox="0 0 9 7" @pointerdown.stop>
    <g class="art">
      <ellipse cx="3" cy="2.6" rx="1.2" ry="1.6" fill="#c8302f" transform="rotate(-18 3 2.6)" />
      <ellipse cx="6" cy="2.6" rx="1.2" ry="1.6" fill="#3d7fd9" transform="rotate(16 6 2.6)" />
      <ellipse cx="4.5" cy="2.1" rx="1.2" ry="1.6" fill="#f2c14e" />
      <path d="M4 1.6h1M4.1 2.4h.8" stroke="#c8302f" stroke-width=".25" />
      <path d="M1.6 3.4C1.4-.9 7.6-.9 7.4 3.4" fill="none" stroke="#7a4c22" stroke-width=".45" />
      <path d="M.7 3.3h7.6l-1 3.7H1.7Z" fill="#b07a3c" />
      <path d="M1 4.5h7M1.3 5.8h6.4" stroke="#7a4c22" stroke-width=".3" />
    </g>
    <g class="glints">
      <circle cx="0" cy="0" r=".45" />
      <circle cx="9" cy=".5" r=".45" />
      <circle cx="-.5" cy="4" r=".35" />
      <circle cx="9.5" cy="4.5" r=".35" />
      <circle cx="4.5" cy="-1.6" r=".4" />
    </g>
  </svg>
</template>

<style scoped>
/* Standing in the grass at its foot, like the figures. */
.egg,
.basket {
  position: absolute;
  overflow: visible;
  transform: translate(-50%, calc(-100% + 1px));
}

.egg {
  width: calc(4 * var(--unit));
  height: calc(5.4 * var(--unit));
}

.basket {
  width: calc(9 * var(--unit));
  height: calc(7 * var(--unit));
}

/* Much bigger than the egg, so a finger finds it. */
.hit {
  fill: transparent;
  pointer-events: all;
  cursor: pointer;
}

.egg .art {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  transform: rotate(-14deg);
}

.egg .art.hopping {
  animation: hop 0.38s ease-out forwards;
}

@keyframes hop {
  40% {
    transform: translateY(-40%) rotate(-26deg);
  }

  100% {
    opacity: 0.3;
    transform: scale(0.6);
  }
}

.basket .art {
  transform-box: view-box;
  transform-origin: 4.5px 7px;
  animation: pop 0.45s ease-out;
}

/* It grows a touch too big, then settles. */
@keyframes pop {
  from {
    transform: scale(0);
  }

  65% {
    transform: scale(1.12);
  }
}

.glints {
  fill: #fff6c8;
  opacity: 0;
  animation: glint 0.9s ease-out 0.15s;
}

@keyframes glint {
  20% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .egg .art.hopping {
    animation-duration: 1ms;
  }

  .basket .art,
  .glints {
    animation: none;
  }
}
</style>
