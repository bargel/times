/** A time being typed in one digit at a time. `cursor` counts digits: 0 and 1 hours, 2 and 3 minutes. */
export interface TimeEntry {
  time: string
  cursor: number
}

const LAST_DIGIT = 3

function parts(time: string) {
  const [hours, minutes] = time.split(':').map(Number) as [number, number]
  return { hours, minutes }
}

function format(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function minuteOf(time: string): number {
  const { hours, minutes } = parts(time)
  return hours * 60 + minutes
}

/**
 * Puts a digit at the cursor and moves on. A digit that can't start hours or minutes counts as their
 * second digit: 7 at the start means 07. One that would make an impossible time is refused.
 */
export function typeDigit({ time, cursor }: TimeEntry, digit: number): TimeEntry {
  const { hours, minutes } = parts(time)
  const hoursUnits = hours % 10
  const minutesUnits = minutes % 10

  switch (cursor) {
    case 0:
      if (digit > 2) return { time: format(digit, minutes), cursor: 2 }
      return { time: format(Math.min(digit * 10 + hoursUnits, 23), minutes), cursor: 1 }
    case 1: {
      const tens = Math.floor(hours / 10)
      if (tens === 2 && digit > 3) return { time, cursor }
      return { time: format(tens * 10 + digit, minutes), cursor: 2 }
    }
    case 2:
      if (digit > 5) return { time: format(hours, digit), cursor: LAST_DIGIT }
      return { time: format(hours, digit * 10 + minutesUnits), cursor: LAST_DIGIT }
    default:
      return { time: format(hours, Math.floor(minutes / 10) * 10 + digit), cursor: LAST_DIGIT }
  }
}

/** Moves the cursor's part, hours or minutes, up or down by one, going round at its ends. */
export function stepPart({ time, cursor }: TimeEntry, by: 1 | -1): TimeEntry {
  const { hours, minutes } = parts(time)
  const next =
    cursor < 2 ? format((hours + by + 24) % 24, minutes) : format(hours, (minutes + by + 60) % 60)
  return { time: next, cursor }
}

export function moveCursor(cursor: number, by: 1 | -1): number {
  return Math.min(Math.max(cursor + by, 0), LAST_DIGIT)
}
