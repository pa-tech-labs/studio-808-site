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
  included: string[]
}

/** A tier as stored on the Sanity membershipPage singleton. */
export interface StoredTier {
  _key?: string
  track?: string | null
  name?: string | null
  monthlyPrice?: number | null
  foundingPrice?: number | null
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
export declare function mergePlans(
  cuePlans: MembershipPlan[] | null | undefined,
  sanityPlans: MembershipPlan[] | null | undefined,
): { plans: MembershipPlan[]; source: 'cue' | 'sanity' }
export interface CueFetchOptions {
  fetchImpl?: (url: string, init?: { signal?: AbortSignal }) => Promise<{ ok: boolean; json(): Promise<unknown> }>
  apiUrl?: string
  tenantId?: string
  timeoutMs?: number
}
export declare function fetchCueTiers(opts?: CueFetchOptions): Promise<MembershipPlan[]>
export declare function loadPlans(opts?: CueFetchOptions & { sanityTiers?: StoredTier[] | null }): Promise<{ plans: MembershipPlan[]; source: 'cue' | 'sanity' }>
export declare function plansForTrack(plans: MembershipPlan[] | null | undefined, track: Track): MembershipPlan[]
export declare function formatPounds(amount: number): string
export declare function priceFromLabel(plans: MembershipPlan[] | null | undefined, track: Track): string
export declare function perHourLabel(plan: MembershipPlan | null | undefined): string
export declare function parseFoundingStatus(body: unknown): FoundingInfo
export declare function foundingPriceFor(plan: MembershipPlan | null | undefined, founding: Partial<FoundingInfo> | null | undefined): number | null
export declare function fillTerms(template: string | null | undefined, plan: Pick<MembershipPlan, 'commitmentMonths'> | null | undefined): string
