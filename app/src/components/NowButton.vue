<script setup lang="ts">
import { t } from '@/lib/i18n'

defineProps<{ isLive: boolean }>()
</script>

<template>
  <button type="button" class="now" :aria-pressed="isLive">{{ t.now }}</button>
</template>

<style scoped>
.now {
  flex: none;
  height: var(--control-height);
  padding: 0 14px;
  font-weight: 600;
  background: none;
  border: 1px solid var(--edge);
  border-radius: var(--radius);
  cursor: pointer;
}

@media (hover: hover) {
  .now:hover {
    background: color-mix(in srgb, var(--ink) 8%, transparent);
  }
}

/* Filled while the page follows the clock; outlined once a time has been picked. */
.now[aria-pressed='true'],
.now[aria-pressed='true']:hover {
  background: var(--ink);
  color: var(--ground);
  border-color: var(--ink);
}
</style>
