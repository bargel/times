<script setup lang="ts">
import canada from '@/assets/flags/canada.svg'
import poland from '@/assets/flags/poland.svg'
import ukraine from '@/assets/flags/ukraine.svg'
import type { ZoneId } from '@/config/zones'

defineProps<{ zone: ZoneId }>()

const FLAGS: Record<ZoneId, string> = { canada, ukraine, poland }
</script>

<template>
  <!-- Decorative: the city name always sits beside it or labels its control. -->
  <img class="flag" :src="FLAGS[zone]" alt="" draggable="false" />
</template>

<style scoped>
.flag {
  display: block;
  flex: none;
  object-fit: cover;
  border-radius: 2px;
  /* Poland's white half has to stay visible on a pale ground. */
  outline: 1px solid color-mix(in srgb, var(--ink) 24%, transparent);
  outline-offset: -1px;
}

@media (prefers-color-scheme: dark) {
  .flag {
    outline-color: color-mix(in srgb, var(--ink) 12%, transparent);
  }
}
</style>
