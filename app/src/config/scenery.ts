import type { ColourStop, Ridge } from '@/lib/scenery'

/*
 * The day as one picture: midnight at both ends, noon in the middle. Places run 0 to 1 across it.
 * The figures are drawn in units that scale with the sky's height.
 */

/** Night ends where windows go dark, and starts again where they light up. */
export const isNightAt = (place: number) => place < 0.25 || place > 0.79

export const FAR_HILLS: readonly ColourStop[] = [
  [0, '#1b2350'],
  [0.2, '#252f68'],
  [0.255, '#6d5a86'],
  [0.3, '#c7978c'],
  [0.38, '#93c1c8'],
  [0.66, '#93c1c8'],
  [0.73, '#d39d82'],
  [0.79, '#7a587c'],
  [0.86, '#252f68'],
  [1, '#1b2350'],
]

export const MID_HILLS: readonly ColourStop[] = [
  [0, '#121839'],
  [0.2, '#19204a'],
  [0.26, '#4f4058'],
  [0.33, '#6f9c8e'],
  [0.67, '#6f9c8e'],
  [0.75, '#8d5c4c'],
  [0.84, '#19204a'],
  [1, '#121839'],
]

/** The near hill and the ground strip under it, dark enough everywhere to carry white hours. */
export const NEAR_HILL: readonly ColourStop[] = [
  [0, '#090d24'],
  [0.2, '#0d1230'],
  [0.28, '#3f3438'],
  [0.38, '#2f6656'],
  [0.68, '#2f6656'],
  [0.78, '#55352c'],
  [0.86, '#0d1230'],
  [1, '#090d24'],
]

export const RIDGES = {
  far: { top: 26, amplitude: 22, waves: 3.2, phase: 0.6 },
  mid: { top: 52, amplitude: 15, waves: 2.2, phase: 2.4 },
  near: { top: 76, amplitude: 10, waves: 3.6, phase: 4.1 },
} satisfies Record<string, Ridge>

/** A small thing drawn standing on its baseline: the bottom of its view box, at its middle. */
export interface Figure {
  viewBox: readonly [x: number, y: number, width: number, height: number]
  /** Filled with the near hill's colour where it stands. */
  body: string
  /** Lit at night: `[x, y, width, height]`. */
  windows?: readonly (readonly [number, number, number, number])[]
  /** Drawn only at night, in fire colours. */
  fire?: string
  /** A thin line of chimney smoke. */
  smoke?: string
  /** Sails that turn slowly around `[x, y]`. */
  sails?: { centre: readonly [number, number]; path: string }
}

const HOUSE = 'M1 10V5L6 1l5 4v5ZM8 4.4V1.2h1.4v4.4Z'

export const FIGURES = {
  pine: { viewBox: [0, 0, 6, 13], body: 'M3 0l2 4.4h-.9l1.6 4H4.5L6 12.2H3.5V13h-1v-.8H0l1.5-3.8H.3l1.6-4H1Z' },
  fir: { viewBox: [0, 0, 4, 14], body: 'M2 0c.9 3.6 1.5 8.4 2 13H2.4v1h-.8v-1H0C.5 8.4 1.1 3.6 2 0Z' },
  oak: {
    viewBox: [0, 0, 10, 10],
    body: 'M5 .4a3.6 3.6 0 0 1 3.4 3.2 2.6 2.6 0 0 1-.8 4.6H5.6V10H4.4V8.2H2.4a2.6 2.6 0 0 1-.8-4.6A3.6 3.6 0 0 1 5 .4Z',
  },
  poplar: { viewBox: [0, 0, 4, 15], body: 'M2 0c1.5 2.4 1.9 7.6 1 12h-.6v3h-.8v-3H1C.1 7.6.5 2.4 2 0Z' },
  bush: { viewBox: [0, 0, 8, 4], body: 'M0 4c0-1.8 1.3-2.8 2.7-2.4C3.3.3 5.1 0 6 1.3 7.3 1.3 8 2.6 8 4Z' },
  house: { viewBox: [0, 0, 12, 10], body: HOUSE, windows: [[4.9, 6, 2.2, 2.2]] },
  cottage: {
    viewBox: [0, -7, 12, 17],
    body: HOUSE,
    windows: [[3.2, 6, 2, 2]],
    smoke: 'M8.7 1c-.7-2 1.1-3 .3-4.8S10.4-6 10-7',
  },
  tallHouse: {
    viewBox: [0, 0, 9, 14],
    body: 'M.5 14V5l4-3.8 4 3.8v9Z',
    windows: [
      [2, 6, 1.8, 1.8],
      [5.2, 6, 1.8, 1.8],
      [2, 9.6, 1.8, 1.8],
      [5.2, 9.6, 1.8, 1.8],
    ],
  },
  barn: { viewBox: [0, 0, 16, 10], body: 'M.6 10V4.4l1.8-3L8 0l5.6 1.4 1.8 3V10Z', windows: [[7.1, 3, 1.8, 1.8]] },
  windmill: {
    viewBox: [-3, -3, 14, 17],
    body: 'M2.3 14l.8-9.4h1.8l.8 9.4ZM2.7 5 4 3l1.3 2Z',
    windows: [[3.5, 9, 1, 1.4]],
    sails: { centre: [4, 3.8], path: 'M3.7 3.8v-5.4h.6v5.4ZM4.3-1.4h1.5v3.8H4.3Z' },
  },
  lamp: { viewBox: [0, 0, 3, 11], body: 'M1 11V2.4h.6V11ZM1 2.2h1.9l-.3 1H1.9Z', windows: [[1.9, 3.1, 0.8, 0.7]] },
  camp: {
    viewBox: [0, 0, 15, 7],
    body: 'M0 7 4 .6 8 7Zm10 0 3-.7V7Z',
    fire: 'M11.5 6.6c-.9-.9-.5-2 .1-3 .3 1.1 1.2 1.4.8 3Z',
  },
  fence: {
    viewBox: [0, 0, 14, 4],
    body: 'M0 4V1h.7v3Zm4.4 0V1h.7v3Zm4.5 0V1h.7v3Zm4.4 0V1H14v3ZM0 1.7h14v.6H0Zm0 1.3h14v.5H0Z',
  },
} satisfies Record<string, Figure>

export type FigureKind = keyof typeof FIGURES

/** Life on the near hill, by the hour it stands at. `wide` ones only show where the line has room. */
export const LIFE: readonly { kind: FigureKind; hour: number; size?: number; wide?: true }[] = [
  { kind: 'pine', hour: 0.6 },
  { kind: 'fir', hour: 1.05, size: 1.1, wide: true },
  { kind: 'tallHouse', hour: 1.6 },
  { kind: 'lamp', hour: 2.35, wide: true },
  { kind: 'cottage', hour: 3.05 },
  { kind: 'pine', hour: 3.65, size: 0.8, wide: true },
  { kind: 'pine', hour: 4, size: 1.15 },
  { kind: 'bush', hour: 4.45, wide: true },
  { kind: 'house', hour: 5.25 },
  { kind: 'fence', hour: 6.05, wide: true },
  { kind: 'oak', hour: 6.9 },
  { kind: 'barn', hour: 7.75 },
  { kind: 'bush', hour: 8.5, size: 0.8, wide: true },
  { kind: 'poplar', hour: 9.25 },
  { kind: 'poplar', hour: 9.55, size: 0.85, wide: true },
  { kind: 'poplar', hour: 9.85, size: 1.1 },
  { kind: 'windmill', hour: 11.2, size: 1.25 },
  { kind: 'bush', hour: 12.45, wide: true },
  { kind: 'oak', hour: 13.2, size: 0.85, wide: true },
  { kind: 'oak', hour: 13.6, size: 1.1 },
  { kind: 'cottage', hour: 14.7 },
  { kind: 'pine', hour: 15.5, size: 0.9, wide: true },
  { kind: 'fir', hour: 15.8, size: 1.2 },
  { kind: 'fence', hour: 16.8, wide: true },
  { kind: 'house', hour: 17.55 },
  { kind: 'oak', hour: 18.35 },
  { kind: 'bush', hour: 18.95, size: 0.7, wide: true },
  { kind: 'tallHouse', hour: 19.65 },
  { kind: 'lamp', hour: 20.35, wide: true },
  { kind: 'pine', hour: 20.9 },
  { kind: 'pine', hour: 21.2, size: 0.75, wide: true },
  { kind: 'camp', hour: 21.95 },
  { kind: 'fir', hour: 22.75, wide: true },
  { kind: 'house', hour: 23.2 },
  { kind: 'pine', hour: 23.7, size: 0.9, wide: true },
]

/** Stars on the night ends of the sky: `[percent across, percent down, size in px]`. */
export const STARS: readonly (readonly [number, number, number])[] = [
  [1.2, 16, 1.5], [2.6, 44, 1], [3.9, 8, 2.5], [5.1, 30, 1], [6.4, 52, 1.5], [7.2, 12, 1],
  [9.8, 24, 1.5], [11, 6, 1], [12.3, 40, 2], [13.6, 18, 1], [15.2, 34, 1.5], [16.4, 10, 1],
  [17.8, 26, 1], [19.1, 14, 1.5],
  [84.6, 20, 1], [86.1, 8, 1.5], [87.3, 36, 1], [88.8, 14, 2], [90.2, 46, 1], [91.5, 24, 1.5],
  [92.9, 6, 1], [94.1, 32, 1], [95.4, 16, 2.5], [96.8, 42, 1], [98.1, 10, 1.5], [99.2, 28, 1],
]

/** Birds in the morning sky: `[percent across, percent down, size]`. */
export const BIRDS: readonly (readonly [number, number, number])[] = [
  [38.5, 34, 1],
  [39.6, 26, 0.8],
  [40.4, 38, 0.9],
]

/** Small clouds by day: `[percent across, percent down, size]`. */
export const CLOUDS: readonly (readonly [number, number, number])[] = [
  [34, 16, 1],
  [62.5, 10, 1.2],
]
