/** On average this long between visits. */
export const UFO_MEAN_DELAY_MS = 20 * 60_000

/**
 * How long until the next visit. Every moment is as likely as any other, so it can come in the
 * first minute on the page as well as after an hour: nobody has to wait it out.
 */
export function nextUfoDelay(random: () => number = Math.random): number {
  return Math.log(1 / (1 - random())) * UFO_MEAN_DELAY_MS
}

/** A visit: which night end of the day it comes to. It leaves towards that edge. */
export interface UfoVisit {
  atStart: boolean
  /** Percent down the sky where it hovers. */
  y: number
}

export function nextUfo(random: () => number = Math.random): UfoVisit {
  return { atStart: random() < 0.5, y: 14 + random() * 16 }
}
