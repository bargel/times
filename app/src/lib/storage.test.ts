import { afterEach, describe, expect, it } from 'vitest'

import { pageStorage } from './storage'

describe('pageStorage', () => {
  afterEach(() => {
    delete (globalThis as { localStorage?: unknown }).localStorage
  })

  it('is the browser storage when the site may keep things', () => {
    const storage = { getItem: () => 'kept', setItem: () => {}, removeItem: () => {} }
    Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
    expect(pageStorage()).toBe(storage)
  })

  it('keeps nothing, without throwing, when even reaching for storage is refused', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      get: () => {
        throw new DOMException('The operation is insecure.', 'SecurityError')
      },
      configurable: true,
    })
    const storage = pageStorage()
    expect(() => storage.setItem('key', 'value')).not.toThrow()
    expect(storage.getItem('key')).toBeNull()
  })
})
