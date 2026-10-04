import type { StoredTier, Track } from './membershipPlans.js'

/** A Sanity image with an asset reference. */
export interface MembershipImage {
  asset?: { _ref: string; _type: string }
  _type?: 'image'
}

export interface FaqItem { _key?: string; q?: string | null; a?: string | null }

export interface PerkCard { _key?: string; title?: string | null; body?: string | null; icon?: string | null }

export interface JoinCta { heading?: string | null; body?: string | null; buttonLabel?: string | null }

/** Copy for one track (DJ or producer). */
export interface TrackCopy {
  heading?: string | null
  intro?: string | null
  highlight?: string | null
  stats?: string[] | null
  image?: MembershipImage | null
  imageAlt?: string | null
  perksLabel?: string | null
  perks?: PerkCard[] | null
  planLabel?: string | null
  planIntro?: string | null
  foundingBadgeLabel?: string | null
  foundingPriceNote?: string | null
  bestValueLabel?: string | null
  compareLabel?: string | null
  creditLine?: string | null
  foundingTerms?: string | null
  standardTerms?: string | null
  joinLabel?: string | null
  faqLabel?: string | null
  faqHeading?: string | null
  faq?: FaqItem[] | null
  cta?: JoinCta | null
}

/** The "Membership page" singleton (schemaTypes/membershipPage.ts). */
export interface MembershipPageContent {
  seoTitle?: string | null
  seoDescription?: string | null
  eyebrow?: string | null
  heading?: string | null
  intro?: string | null
  selector?: { djLabel?: string | null; producerLabel?: string | null } | null
  dj?: TrackCopy | null
  producer?: TrackCopy | null
  socials?: {
    showFor?: Track[] | null
    eyebrow?: string | null
    heading?: string | null
    body?: string | null
    image?: MembershipImage | null
    imageAlt?: string | null
  } | null
  tiers?: StoredTier[] | null
}

export declare const membershipPageContent: MembershipPageContent & { _id: string; _type: string }
