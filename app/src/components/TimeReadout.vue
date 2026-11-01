<script setup lang="ts">
import { computed } from 'vue'

import { ZONES } from '@/config/zones'
import { shortDate, t } from '@/lib/i18n'
import { clock12, clockDisplay, wallClockAt, type IsoDate } from '@/lib/time'

import ZoneFlag from './ZoneFlag.vue'

const props = defineProps<{ instant: number; selectedDate: IsoDate }>()

const readings = computed(() =>
  ZONES.map((zone) => {
    const wall = wallClockAt(props.instant, zone.timeZone)
    return {
      zone,
      time: clockDisplay(wall),
      time12: clock12(wall),
      date: shortDate(wall.date),
      otherDay: wall.date !== props.selectedDate,
    }
  }),
)
</script>

<template>
  <dl class="readout">
    <div v-for="reading in readings" :key="reading.zone.id" class="zone">
      <dt class="place">
        <ZoneFlag class="place-flag" :zone="reading.zone.id" />
        {{ t.cities[reading.zone.id] }}
      </dt>
      <dd class="time">{{ reading.time }}</dd>
      <dd class="detail">{{ reading.time12 }}</dd>
      <dd class="detail" :class="{ 'other-day': reading.otherDay }">{{ reading.date }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.readout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.place {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-soft);
  white-space: nowrap;
}

.place-flag {
  width: 18px;
  height: 12px;
}

.time {
  font-size: clamp(2rem, 9.6vw, 4.25rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.detail {
  font-size: 14px;
  color: var(--ink-soft);
}

.time + .detail {
  margin-top: 4px;
}

.other-day {
  color: var(--sunset);
  font-weight: 600;
}

@media (orientation: landscape) and (max-height: 500px) {
  .time {
    font-size: 1.625rem;
  }

  .detail {
    display: inline;
    margin-inline-end: 6px;
  }

  .time + .detail {
    margin-top: 0;
  }
}
</style>
