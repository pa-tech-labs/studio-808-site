import type { PriceBand } from './membershipPlans.js'

export interface PriceRow {
  label: string
  price: number
  start: string
  end: string
  /** "Weekdays", "Mon to Thu", ... across every day the band runs. */
  days: string
  /** Days that run differently, e.g. "Fri to 21:00". */
  notes: string[]
  /** The row's usual window as a fraction of all rows' windows together. */
  share: number
}

export declare function daysLabel(days: number[]): string
export declare function fromPrice(bands: PriceBand[] | null | undefined): number | null
export declare function priceRows(bands: PriceBand[] | null | undefined): PriceRow[]
export declare function sharedDays(rows: PriceRow[] | null | undefined): string
export declare function hoursText(hours: number): string
export declare function minimumText(hours: number | null | undefined): string
export declare function fromPriceLine(bands: PriceBand[] | null | undefined, minHours: number | null | undefined): string
export declare function fillMinHours(text: string | null | undefined, minHours: number | null | undefined): string
