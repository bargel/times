import { addDays, type IsoDate } from './time'

/** A calendar month as `YYYY-MM`. */
export type YearMonth = string

const CELLS_IN_GRID = 6 * 7

export function monthOf(date: IsoDate): YearMonth {
  return date.slice(0, 7)
}

export function shiftMonth(month: YearMonth, by: number): YearMonth {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(Date.UTC(year!, monthNumber! - 1 + by, 1)).toISOString().slice(0, 7)
}

/** The same day in another month, or that month's last day if it is shorter. */
export function shiftDateByMonths(date: IsoDate, by: number): IsoDate {
  const month = shiftMonth(monthOf(date), by)
  const lastDay = addDays(`${shiftMonth(month, 1)}-01`, -1).slice(8)
  const day = date.slice(8)
  return `${month}-${day < lastDay ? day : lastDay}`
}

/**
 * The 42 days a month's page shows, Monday first. Always six weeks, so the page keeps
 * its height from month to month.
 */
export function monthGrid(month: YearMonth): IsoDate[] {
  const first = `${month}-01`
  const daysSinceMonday = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7
  return Array.from({ length: CELLS_IN_GRID }, (_, index) =>
    addDays(first, index - daysSinceMonday),
  )
}

/** `November 2026`. */
export function monthLabel(month: YearMonth): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-GB', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  })
}
