/** A falling star crossing the night sky. Sizes are in the picture's units, which scale with the sky. */
export interface ShootingStar {
  /** Where it starts: percent across the sky, and percent down from its top. */
  x: number
  y: number
  /** Its heading, in degrees clockwise from flying right: always down towards the horizon. */
  angle: number
  length: number
  distance: number
  /** In milliseconds. */
  duration: number
}

const between = (random: () => number, low: number, high: number) => low + random() * (high - low)

/** High in the night at either end of the day, falling inwards so it stays in the picture. */
export function nextShootingStar(random: () => number = Math.random): ShootingStar {
  const atStart = random() < 0.5
  const x = atStart ? between(random, 2, 17) : between(random, 83, 98)
  const angle = atStart ? between(random, 15, 30) : between(random, 150, 165)
  return {
    x,
    y: between(random, 6, 30),
    angle,
    length: between(random, 18, 28),
    distance: between(random, 50, 75),
    duration: between(random, 600, 800),
  }
}

/** Rare enough to be a small surprise rather than something moving in the corner of the eye. */
export function nextShootingStarDelay(random: () => number = Math.random): number {
  return between(random, 15_000, 40_000)
}
