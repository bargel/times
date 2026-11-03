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
  /* Poland's white half has to stay visible on a pale ground; by night a faint edge is enough. */
  outline: 1px solid var(--flag-edge);
  outline-offset: -1px;
}
</style>
