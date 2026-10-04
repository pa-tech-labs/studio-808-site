import type { MembershipPageContent, TrackCopy } from './membershipPageContent.js'
import type { FoundingInfo, MembershipPlan, Track } from './membershipPlans.js'

export interface TeaserPerk { title: string; body: string }

export interface TeaserModel {
  track: Track
  eyebrow: string
  heading: string
  intro: string
  priceLine: string
  creditLine: string
  perks: TeaserPerk[]
  /** The perks are the track's numbered steps rather than perks. */
  perksAreSteps: boolean
  founding: { show: boolean; note: string; remaining: number | null; cap: number }
  heroKey: string | null
  bestValueLabel: string
  compareLabel: string
  creditBackLine: string
  terms: string
  foundingTerms: string
  planJoinLabel: string
  seeHref: string
  joinHref: string
  joinLabel: string
}

export declare function firstSentence(text: string | null | undefined): string
export declare function teaserPriceLine(
  plans: MembershipPlan[] | null | undefined,
  track: Track,
  founding: Partial<FoundingInfo> | null | undefined,
): string
export declare function teaserPerks(
  copy: TrackCopy | null | undefined,
  plans: MembershipPlan[] | null | undefined,
  track: Track,
): TeaserPerk[]
export declare function teaserPerksAreSteps(copy: TrackCopy | null | undefined): boolean
export declare function teaserModel(input: {
  track: string
  content: MembershipPageContent | null | undefined
  plans: MembershipPlan[] | null | undefined
  founding: Partial<FoundingInfo> | null | undefined
  minBookingHours?: number | null
}): TeaserModel
