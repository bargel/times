import { describe, expect, it } from 'vitest'

import page from '../../index.html?raw'

import { keepHeld, readHeld, shapeOf, VIEWPORT_KEY } from './heldViewport'

function memory(initial: Record<string, string> = {}) {
  const kept = new Map(Object.entries(initial))
  return {
    kept,
    getItem: (key: string) => kept.get(key) ?? null,
    setItem: (key: string, value: string) => void kept.set(key, value),
  }
}

const closed = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
}

describe('held viewport', () => {
  it('tells a phone held upright from one on its side', () => {
    expect(shapeOf(430, 932)).toBe('portrait')
    expect(shapeOf(932, 430)).toBe('landscape')
  })

  it('keeps each shape apart, so turning the phone does not lose the other', () => {
    const storage = memory()
    keepHeld(storage, 'portrait', { height: 873, bottom: 34 })
    keepHeld(storage, 'landscape', { height: 430, bottom: 21 })
    expect(readHeld(storage, 'portrait')).toEqual({ height: 873, bottom: 34 })
    expect(readHeld(storage, 'landscape')).toEqual({ height: 430, bottom: 21 })
  })

  it('holds nothing on a first launch, from broken data, or with storage off limits', () => {
    expect(readHeld(memory(), 'portrait')).toBeUndefined()
    expect(readHeld(memory({ [VIEWPORT_KEY]: '{not json' }), 'portrait')).toBeUndefined()
    expect(readHeld(memory({ [VIEWPORT_KEY]: '{"portrait":{"height":"873"}}' }), 'portrait')).toBeUndefined()
    expect(readHeld(closed, 'portrait')).toBeUndefined()
    expect(() => keepHeld(closed, 'portrait', { height: 873, bottom: 34 })).not.toThrow()
  })

  it('is read by the script that runs before the first paint', () => {
    expect(page).toContain(`localStorage.getItem('${VIEWPORT_KEY}')`)
    expect(page).toContain("'--held-height'")
    expect(page).toContain("'--held-bottom'")
  })
})
