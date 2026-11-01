import { ref } from 'vue'

/**
 * For a native date or time field that lies invisible over its own label. A press anywhere on it
 * opens the system's picker, not just on a browser's small icon. Reached by keyboard, `typing`
 * tells the field to show itself, so what is being typed can be seen.
 *
 * `typeWithMouse` treats a mouse like the keyboard: some desktop browsers have no time picker at
 * all, so a click would only focus an invisible field.
 */
export function useHiddenField({ typeWithMouse = false } = {}) {
  const typing = ref(false)
  let pressed = false

  function onPointerDown(event: PointerEvent) {
    if (typeWithMouse && event.pointerType === 'mouse') {
      if (typing.value) return
      // Start from the first part of the value, not whichever part ends up under the pointer.
      event.preventDefault()
      ;(event.target as HTMLInputElement).focus()
      return
    }
    pressed = true
  }

  function onFocus() {
    typing.value = !pressed
    pressed = false
  }

  function onBlur() {
    typing.value = false
  }

  function onClick(event: Event) {
    if (typing.value) return
    try {
      ;(event.target as HTMLInputElement).showPicker()
    } catch {
      // Not supported or not allowed here: the field still opens or edits the way the browser does it.
    }
  }

  return { typing, onPointerDown, onFocus, onBlur, onClick }
}
