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
  founding: { show: boolean; label: string; remaining: number | null; cap: number }
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
export declare function teaserModel(input: {
  track: string
  content: MembershipPageContent | null | undefined
  plans: MembershipPlan[] | null | undefined
  founding: Partial<FoundingInfo> | null | undefined
}): TeaserModel
