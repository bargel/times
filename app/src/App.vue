<script setup lang="ts">
import DayControls from '@/components/DayControls.vue'
import DayLine from '@/components/DayLine.vue'
import MonthCalendar from '@/components/MonthCalendar.vue'
import ShareActions from '@/components/ShareActions.vue'
import TimeReadout from '@/components/TimeReadout.vue'
import { useTimeSelection } from '@/composables/useTimeSelection'
import { findZone, ZONES } from '@/config/zones'
import { browserTimeZone } from '@/lib/time'

const homeTimeZone = browserTimeZone()
const {
  isLive,
  today,
  date,
  instant,
  atDayEnd,
  selectDate,
  moveZoneClock,
  followNow,
  beginEdit,
  cancelEdit,
} = useTimeSelection(homeTimeZone)

const homeZone = findZone(homeTimeZone)
const primaryZone = homeZone ?? ZONES[0]!
</script>

<template>
  <main class="page">
    <h1 class="name">
      <img class="emblem" src="/favicon.png" alt="" width="32" height="32" />
      PLUACAN
    </h1>

    <div class="work">
      <div class="top">
        <MonthCalendar
          class="calendar"
          :date="date"
          :today="today"
          :is-live="isLive"
          @select="selectDate"
          @follow-now="followNow"
        />
        <DayControls
          class="day-controls"
          :date="date"
          :is-live="isLive"
          @select="selectDate"
          @follow-now="followNow"
        />
        <TimeReadout
          class="readings"
          :instant="instant"
          :selected-date="date"
          :home-zone="homeZone"
          @set-time="moveZoneClock"
          @begin-edit="beginEdit"
          @cancel-edit="cancelEdit"
        />
      </div>
      <DayLine
        class="day-line"
        :instant="instant"
        :at-day-end="atDayEnd"
        :home-zone="homeZone"
        :primary-zone="primaryZone"
        @move="moveZoneClock"
      />
      <ShareActions :instant="instant" :is-live="isLive" />
    </div>
  </main>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  max-width: 960px;
  margin: 0 auto;
  padding: max(14px, env(safe-area-inset-top)) 16px max(14px, env(safe-area-inset-bottom));
}

.name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* The house emblem, shown as is: half of its 64px, so it stays sharp on a phone's 2x screen. */
.emblem {
  display: block;
  border-radius: var(--radius);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--ink) 22%, transparent),
    0 2px 6px rgb(9 13 36 / 0.25);
}

/* Low on a phone, where the thumb is. */
.work {
  margin-top: auto;
  padding-top: 24px;
}

.calendar {
  display: none;
}

.day-controls {
  margin-bottom: 16px;
}

.day-line {
  margin-top: 20px;
}

/* The calendar replaces the day stepper wherever the page still fits on one screen with it. */
@media (max-width: 699px) and (min-height: 745px), (min-width: 700px) and (min-height: 730px) {
  .calendar {
    display: block;
    margin-bottom: 16px;
  }

  .day-controls {
    display: none;
  }
}

@media (min-width: 700px) and (min-height: 730px) {
  .top {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    align-items: end;
    gap: 40px;
  }

  /* The columns stop growing beside the calendar, so the numbers stop in time to stay apart. */
  .readings :deep(.time) {
    font-size: clamp(2rem, 4.6vw, 3.5rem);
  }

  .calendar {
    margin-bottom: 0;
  }
}

@media (min-width: 700px) {
  .page {
    padding-top: 28px;
    padding-bottom: 28px;
  }

  .name {
    font-size: 20px;
  }

  /* Enough room on a big screen: rest in the middle. */
  .work {
    margin-block: auto;
    padding-block: 32px;
  }

  .day-line {
    margin-top: 32px;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .page {
    padding-top: 8px;
    padding-bottom: 6px;
  }

  /* No height to spare on a phone on its side, and the name is not what the screen is for. */
  .name {
    display: none;
  }

  .work {
    margin-block: 0;
    padding-block: 0;
  }

  .day-controls {
    margin-bottom: 6px;
  }

  .day-line {
    margin-top: 6px;
  }
}
</style>
