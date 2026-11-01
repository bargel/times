<script setup lang="ts">
import { computed } from 'vue'

import { useClipboard } from '@/composables/useClipboard'
import { ZONES } from '@/config/zones'
import { discordTimestamp, plainText } from '@/lib/share'

const props = defineProps<{ instant: number }>()

type Target = 'discord' | 'plain'

const { status, target, copy } = useClipboard<Target>()

const texts = computed<Record<Target, string>>(() => ({
  discord: discordTimestamp(props.instant),
  plain: plainText(props.instant, ZONES),
}))

function label(button: Target, idle: string) {
  if (target.value !== button) return idle
  return status.value === 'copied' ? 'Copied!' : 'Copy failed'
}

const copyByHand = computed(() =>
  status.value === 'failed' && target.value ? texts.value[target.value] : null,
)
</script>

<template>
  <div class="share">
    <div class="buttons">
      <button type="button" class="button primary" @click="copy(texts.discord, 'discord')">
        {{ label('discord', 'Copy for Discord') }}
      </button>
      <button type="button" class="button" @click="copy(texts.plain, 'plain')">
        {{ label('plain', 'Copy plain text') }}
      </button>
    </div>

    <div v-if="copyByHand" class="by-hand">
      <p class="note" role="alert">The browser blocked the clipboard. Copy this by hand:</p>
      <textarea
        class="text"
        readonly
        aria-label="Text to copy"
        :rows="copyByHand.split('\n').length"
        :value="copyByHand"
        @focus="($event.target as HTMLTextAreaElement).select()"
      />
    </div>
    <span class="visually-hidden" role="status">{{ status === 'copied' ? 'Copied' : '' }}</span>
  </div>
</template>

<style scoped>
.buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.button {
  height: 52px;
  padding: 0 8px;
  font-size: clamp(14px, 4vw, 16px);
  font-weight: 600;
  white-space: nowrap;
  background: none;
  border: 1.5px solid var(--ink);
  border-radius: var(--radius);
  cursor: pointer;
  transition: background-color 120ms var(--ease-out);
}

.button:active {
  transform: translateY(1px);
}

.primary {
  background: var(--ink);
  color: var(--ground);
}

.primary:active {
  background: var(--press);
}

@media (hover: hover) {
  .button:hover {
    background: color-mix(in srgb, var(--ink) 10%, transparent);
  }

  .primary:hover {
    background: var(--press);
  }
}

.by-hand {
  margin-top: 8px;
}

.note {
  font-size: 14px;
  color: var(--sunset);
}

.text {
  display: block;
  width: 100%;
  margin-top: 4px;
  padding: 6px 8px;
  font: 14px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  background: none;
  border: 1px solid var(--edge);
  border-radius: var(--radius);
  resize: none;
}

@media (min-width: 700px) {
  .buttons {
    grid-template-columns: repeat(2, 200px);
  }

  .text {
    width: 408px;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .button {
    height: 44px;
  }
}
</style>
