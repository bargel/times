<script setup lang="ts">
import { ref } from 'vue'

import { t } from '@/lib/i18n'
import { applyTheme, readTheme, saveTheme, THEMES, type Theme } from '@/lib/theme'

/** The page already wears this pick: the script in index.html put it on before the first paint. */
const picked = ref(readTheme(localStorage))

function pick(theme: Theme) {
  picked.value = theme
  saveTheme(theme, localStorage)
  applyTheme(theme)
}
</script>

<template>
  <div class="switch" role="group" :aria-label="t.theme">
    <button
      v-for="theme in THEMES"
      :key="theme"
      type="button"
      :aria-pressed="theme === picked"
      :aria-label="t.themes[theme]"
      :title="t.themes[theme]"
      @click="pick(theme)"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <g v-if="theme === 'day'" stroke-linecap="round">
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"
          />
        </g>
        <path v-else-if="theme === 'night'" d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
        <g v-else stroke-linecap="round">
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </g>
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* Small and quiet by the name: picked once, then left alone. */
.switch {
  display: inline-flex;
  flex: none;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--edge);
  border-radius: var(--radius);
}

button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 34px;
  padding: 0;
  color: var(--ink-soft);
  background: none;
  border: 0;
  border-radius: calc(var(--radius) - 2px);
  cursor: pointer;
}

svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linejoin: round;
}

@media (hover: hover) {
  button:hover {
    color: var(--ink);
    background: color-mix(in srgb, var(--ink) 8%, transparent);
  }
}

/* Filled like Now when it follows the clock. */
button[aria-pressed='true'],
button[aria-pressed='true']:hover {
  color: var(--ground);
  background: var(--ink);
}
</style>
