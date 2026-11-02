/** A colour along the day: `[place, '#rrggbb']`, places from 0 at midnight to 1 at the next one. */
export type ColourStop = readonly [number, string]

/** A range of hills, in the hills box's own units: 1200 across, 100 down. */
export interface Ridge {
  /** The ridge's middle height. */
  top: number
  /** How far it rises and falls from there. */
  amplitude: number
  /** About how many crests across the day. */
  waves: number
  /** Where along its waves the ridge starts. */
  phase: number
}

export const HILLS_WIDTH = 1200
const HILLS_HEIGHT = 100
const PATH_STEP = 10

function channel(hex: string, index: number): number {
  return parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16)
}

/** The colour at `place`, blended between the stops on either side. */
export function colourAt(stops: readonly ColourStop[], place: number): string {
  const after = stops.findIndex(([at]) => at >= place)
  if (after === -1) return stops.at(-1)![1]
  if (after === 0) return stops[0]![1]
  const [from, fromColour] = stops[after - 1]!
  const [to, toColour] = stops[after]!
  const share = (place - from) / (to - from)
  const mixed = [0, 1, 2].map((index) => {
    const start = channel(fromColour, index)
    return Math.round(start + (channel(toColour, index) - start) * share)
  })
  return `#${mixed.map((value) => value.toString(16).padStart(2, '0')).join('')}`
}

/** The ridge's height at `place` (0 to 1 across), in the hills box's units. */
export function ridgeTop({ top, amplitude, waves, phase }: Ridge, place: number): number {
  const turn = place * Math.PI
  return (
    top +
    amplitude *
      (0.55 * Math.sin(turn * waves + phase) +
        0.3 * Math.sin(turn * waves * 2.3 + phase * 1.7) +
        0.15 * Math.sin(turn * 9 + phase))
  )
}

/** The ridge filled down to the bottom of the hills box, as SVG path data. */
export function ridgePath(ridge: Ridge): string {
  let path = ''
  for (let x = 0; x <= HILLS_WIDTH; x += PATH_STEP) {
    const y = ridgeTop(ridge, x / HILLS_WIDTH).toFixed(1)
    path += `${x === 0 ? 'M' : 'L'}${x} ${y}`
  }
  return `${path}V${HILLS_HEIGHT}H0Z`
}
