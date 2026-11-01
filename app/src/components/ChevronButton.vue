<script setup lang="ts">
defineProps<{ direction: 'back' | 'forward'; label: string; disabled?: boolean }>()
</script>

<template>
  <button type="button" class="chevron" :aria-label="label" :disabled="disabled">
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path :d="direction === 'back' ? 'M12.5 4 6.5 10l6 6' : 'M7.5 4l6 6-6 6'" />
    </svg>
  </button>
</template>

<style scoped>
.chevron {
  flex: none;
  width: var(--control-height);
  height: 100%;
  padding: 0;
  background: none;
  border: 0;
  border-radius: var(--radius);
  cursor: pointer;
}

.chevron:disabled {
  opacity: 0.35;
  cursor: default;
}

.chevron svg {
  display: block;
  width: 20px;
  height: 20px;
  margin: auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (hover: hover) {
  .chevron:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ink) 8%, transparent);
  }
}
</style>
