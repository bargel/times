import { onScopeDispose, ref } from 'vue'

export type CopyStatus = 'idle' | 'copied' | 'failed'

const STATUS_VISIBLE_MS = 1500

/**
 * Copies text and reports the result, tagged with what was copied. Success shows for a
 * moment; a failure stays until the next attempt, because the way out has to stay on screen.
 */
export function useClipboard<Target extends string>() {
  const status = ref<CopyStatus>('idle')
  const target = ref<Target | null>(null)
  let timer: ReturnType<typeof setTimeout> | undefined

  function report(nextStatus: CopyStatus, nextTarget: Target) {
    status.value = nextStatus
    target.value = nextTarget
    clearTimeout(timer)
    if (nextStatus === 'failed') return
    timer = setTimeout(() => {
      status.value = 'idle'
      target.value = null
    }, STATUS_VISIBLE_MS)
  }

  async function copy(text: string, copiedTarget: Target) {
    try {
      await navigator.clipboard.writeText(text)
      report('copied', copiedTarget)
    } catch {
      report('failed', copiedTarget)
    }
  }

  onScopeDispose(() => clearTimeout(timer))

  return { status, target, copy }
}
