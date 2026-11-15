export type Track = 'dj' | 'producer'

export interface MembershipPlan {
  key: string
  track: Track
  name: string
  monthlyPrice: number
  hoursPerMonth: number
  commitmentMonths: number
  /** Founding price in pounds (DJ tiers only), null when there is none. */
  foundingPrice: number | null
  /** Booking credit each month in pounds (DJ tiers), null when there is none. */
  monthlyCredit?: number | null
  included: string[]
  /** The room a producer plan books into (Cue's room_venue_id), null otherwise. */
  roomId?: string | null
  /** 'prepaid_term' for a plan paid upfront for a fixed term; absent on Sanity plans. */
  billingModel?: 'subscription' | 'prepaid_term'
  /** Prepaid plans: the term in months and its upfront price in pounds. monthlyPrice is the per-month equivalent. */
  termMonths?: number | null
  termPrice?: number | null
  /** Prepaid plans: unused monthly credit carries over until the term ends. */
  creditRollover?: boolean
  /** Member discount on room bookings, percent, and the rooms it applies to. */
  discountPercent?: number | null
  discountRoomIds?: string[]
  planFamily?: string | null
  /** Cue's founding_offer_open: a new joiner can get the founding price now. */
  foundingOpen?: boolean
}

/** A tier room from Cue: public rate, opening hours and gated rows. */
export interface MembershipRoom {
  id: string
  name: string
  /** venues.price_per_hour in pounds, null when Cue has none. */
  rate: number | null
  availability: { day: number; isOpen: boolean; open: string; close: string }[]
  memberHours: { day: number; start: string; end: string; type: string | null; tierId: string | null }[]
  /** Public price bands from Cue; [] when Cue sends none. */
  bands: PriceBand[]
}

/** One public price band: a day, a window and its £/hr. */
export interface PriceBand { day: number; start: string; end: string; label: string; price: number }

export interface SavingsRow {
  key: string
  name: string
  hoursPerMonth: number
  commitmentMonths: number
  publicCost: number
  memberPrice: number
  perHour: number
  savingPerHour: number
  savingPerMonth: number
  percent: number
}

/** Minutes from midnight, [start, end). */
export type Span = [number, number]

export interface WeekDay {
  day: number
  short: string
  long: string
  public: Span | null
  members: Span[]
}

/** A tier as stored on the Sanity membershipPage singleton. */
export interface StoredTier {
  _key?: string
  track?: string | null
  name?: string | null
  monthlyPrice?: number | null
  foundingPrice?: number | null
  monthlyCredit?: number | null
  hoursPerMonth?: number | null
  commitmentMonths?: number | null
  included?: string[] | null
}

export interface FoundingInfo {
  dj: number | null
  producer: number | null
  djCap: number
  producerCap: number
  prices: Record<string, number>
  /** Per Cue tier id: whether its founding offer is open, and its price in pounds. */
  plans: Record<string, { open: boolean; price: number | null }>
}

export interface DjCardModel {
  prepaid: boolean
  headline: { amount: string; unit: string }
  was: string
  subline: string
  credit: { amount: string; note: string } | null
  discount: string
  perks: string[]
  saving: string
  terms: string
  termMonths: number
}

export declare const CUE_API_URL: string
export declare const CUE_TENANT_ID: string
export declare const CUE_MEMBERSHIP_URL: string
export declare const TRACKS: readonly Track[]

export declare function joinUrl(track: string | null | undefined): string
export declare function tiersUrl(apiUrl?: string, tenantId?: string): string
export declare function foundingStatusUrl(apiUrl?: string, tenantId?: string): string
export declare function mapCueTiers(body: unknown): MembershipPlan[]
export declare function mapSanityTiers(tiers: StoredTier[] | null | undefined): MembershipPlan[]
export declare function mapCueRooms(body: unknown): MembershipRoom[]
export declare function withDefaultPerks(plan: MembershipPlan, roomName?: string, defaults?: Record<string, string[]>): MembershipPlan
export declare function mergePlans(
  cuePlans: MembershipPlan[] | null | undefined,
  sanityPlans: MembershipPlan[] | null | undefined,
  rooms?: MembershipRoom[] | null,
): { plans: MembershipPlan[]; source: 'cue' | 'sanity' }
export interface CueFetchOptions {
  fetchImpl?: (url: string, init?: { signal?: AbortSignal }) => Promise<{ ok: boolean; json(): Promise<unknown> }>
  apiUrl?: string
  tenantId?: string
  timeoutMs?: number
}
export declare function fetchCueMembership(opts?: CueFetchOptions): Promise<{ plans: MembershipPlan[]; rooms: MembershipRoom[]; minBookingHours: number | null }>
export declare function minBookingHoursOf(body: unknown): number | null
export declare function fetchCueTiers(opts?: CueFetchOptions): Promise<MembershipPlan[]>
export declare function loadPlans(opts?: CueFetchOptions & { sanityTiers?: StoredTier[] | null }): Promise<{ plans: MembershipPlan[]; source: 'cue' | 'sanity' }>
export declare function plansForTrack(plans: MembershipPlan[] | null | undefined, track: Track): MembershipPlan[]
export declare function formatPounds(amount: number): string
export declare function priceFromLabel(plans: MembershipPlan[] | null | undefined, track: Track): string
export declare function perHourLabel(plan: MembershipPlan | null | undefined): string
export declare function parseFoundingStatus(body: unknown): FoundingInfo
export declare function foundingPriceFor(plan: MembershipPlan | null | undefined, founding: Partial<FoundingInfo> | null | undefined): number | null
export declare function fillTerms(template: string | null | undefined, plan: Pick<MembershipPlan, 'commitmentMonths'> | null | undefined): string
export declare function producerRoom(plans: MembershipPlan[] | null | undefined, rooms: MembershipRoom[] | null | undefined): MembershipRoom | null
export declare function producerSavings(plans: MembershipPlan[] | null | undefined, rate: number | null | undefined): { rate: number | null; rows: SavingsRow[]; featuredKey: string | null }
export declare const WEEK: readonly { day: number; short: string; long: string }[]
export declare function clock(minutes: number): string
export declare function memberHoursWeek(room: MembershipRoom | null | undefined, producerTierIds?: string[]): {
  days: WeekDay[]
  axis: Span | null
  hasEvenings: boolean
  hasWeekends: boolean
}
export declare function planDisplayName(plan: MembershipPlan | null | undefined): string
export declare function termLabel(months: number): string
export declare function planSlug(plan: MembershipPlan | null | undefined): string
export declare function planTerms(plans: MembershipPlan[] | null | undefined, track: Track): number[]
export declare function pickTerm(plans: MembershipPlan[] | null | undefined, track: Track, requested: string | number | null | undefined): number
export declare function heroPlanKey(plans: MembershipPlan[] | null | undefined, track: Track, founding?: Partial<FoundingInfo> | null): string | null
export declare function planValue(
  plan: MembershipPlan | null | undefined,
  rate: number | null | undefined,
): { perHour: number | null; saving: number | null; credit: number | null }
export declare const DEFAULT_CREDIT_BACK_LINE: string
export declare function creditBackLine(template: string | null | undefined, credit: number | null | undefined): string
export declare function foundingSummary(
  note: string | null | undefined,
  remaining: number | null,
  cap: number,
): { show: boolean; label: string; count: string; taken: number | null; cap: number }
export declare function isPrepaid(plan: MembershipPlan | null | undefined): boolean
export declare function foundingOpenFor(plan: MembershipPlan | null | undefined, founding: Partial<FoundingInfo> | null | undefined): boolean
export declare function trackFoundingOpen(plans: MembershipPlan[] | null | undefined, track: Track, founding: Partial<FoundingInfo> | null | undefined): boolean
export declare function trackShowsFounding(plans: MembershipPlan[] | null | undefined, track: Track, founding: Partial<FoundingInfo> | null | undefined): boolean
export declare function roomsPhrase(names: string[] | null | undefined): string
export declare function rollingCounterpart(plan: MembershipPlan | null | undefined, plans: MembershipPlan[] | null | undefined): MembershipPlan | null
export declare function djCardModel(
  plan: MembershipPlan | null | undefined,
  opts?: { plans?: MembershipPlan[] | null; rooms?: MembershipRoom[] | null; founding?: Partial<FoundingInfo> | null },
): DjCardModel | null
