export type ConsentChoice = 'granted' | 'denied'
export interface AdsConversion { tagId: string; sendTo: string }

export const CONSENT_KEY: string
export const CONSENT_MAX_AGE_MS: number
export function readConsent(raw: string | null | undefined, now?: number): ConsentChoice | null
export function consentRecord(choice: ConsentChoice, now?: number): string
export function ga4Id(v: unknown): string
export function adsConversion(v: unknown): AdsConversion | null
export function trackingEvents(
  type: string,
  detail: Record<string, unknown> | null | undefined,
  opts?: { ads?: AdsConversion | null },
): [string, Record<string, unknown>][]
export const TRACKED_EVENTS: string[]
