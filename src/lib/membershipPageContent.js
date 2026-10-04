// Copy for the /membership page, taken from Cue's live membership page
// (book.studio-808.com/membership) and its DJ intro. Pure data in the shape
// of the Sanity "membershipPage" singleton (schemaTypes/membershipPage.ts):
// seedMembershipPage.ts writes it to Sanity, and the page renders it as is
// when the singleton is missing or unreachable, so the page never goes blank.
// Once seeded, edit the copy in the studio, not here.
//
// Headings mark their serif italic tail with *stars*, as elsewhere on the
// site (components/Headline.tsx). Array items carry the _key Sanity needs.

const faq = (key, q, a) => ({ _key: key, _type: 'faqItem', q, a })
const card = (key, title, body, icon) => ({ _key: key, _type: 'perkCard', title, body, ...(icon ? { icon } : {}) })
const tier = (key, t) => ({ _key: key, _type: 'tier', ...t })

const PRODUCER_INCLUDED = [
  'Weekend Studio 4 access - producer members only',
  'Overflow hours at £25/hr when you run past your allowance',
]
const FILMED_SESSION = 'One professionally filmed session per year, shot and edited by us'

export const membershipPageContent = {
  _id: 'membershipPage',
  _type: 'membershipPage',

  seoTitle: 'Membership | Studio 808 Chelmsford',
  seoDescription:
    'Studio 808 membership for DJs and producers in Chelmsford. Monthly booking credit or Studio 4 hours, member rates, late-night access and more.',

  eyebrow: 'Studio 808 Membership',
  heading: 'More than *studio time.*',
  intro: 'Two memberships, one for DJs and one for producers. Pick the one that fits how you work.',

  selector: { djLabel: "I'm a DJ", producerLabel: "I'm a producer" },

  dj: {
    heading: 'Your creative space. *Every month.*',
    intro:
      'Monthly booking credit spent at member rates across every room, plus members-only late-night hours. Credit renews with your monthly payment and lasts until your next renewal - it never rolls over.',
    highlight: 'Member-only promos and discounts that non-members never get',
    stats: [],
    perksLabel: 'Member perks',
    perks: [
      card('events', 'Play at 808 events', 'Member-only slots to play our nights, to a real crowd.', 'mic'),
      card('featured', 'Get featured', 'Get the chance to be featured on our socials and YouTube channel, with your social posts reshared and collaborated on by the Studio 808 accounts.', 'megaphone'),
      card('discounts', 'Member-only discounts', 'Exclusive promos and discounts that non-members never get, on top of your member rates.', 'tag'),
    ],
    planLabel: 'DJ Membership',
    planIntro: '',
    foundingBadgeLabel: 'Founding offer - first 15 members only',
    foundingPriceNote: 'Founding price, locked for life',
    bestValueLabel: 'Best value',
    compareLabel: 'Compare plans',
    creditBackLine: '{credit} credit back every month, plus member rates and members-only hours',
    creditLine: 'Your credit renews with your monthly payment and lasts until your next renewal. It never rolls over.',
    foundingTerms: 'Founding memberships: 3-month initial term, then monthly rolling. Standard memberships: monthly rolling, cancel anytime.',
    standardTerms: 'Monthly rolling - cancel anytime.',
    joinLabel: 'Join Now',
    faqLabel: 'FAQ',
    faqHeading: 'Common *questions.*',
    faq: [
      faq('each-month', 'What do I get each month?', 'Booking credit (£25.00 on 808 DJ, £50.00 on 808 Resident) spent at member rates, member pricing on all rooms, members-only late-night hours, the chance to be featured on our socials and YouTube, and member event invites.'),
      faq('rollover', 'Does unused credit roll over?', 'No. Whatever is left when your next monthly payment renews your credit is gone.'),
      faq('arrive', 'When does my credit arrive?', 'With your first payment, and again with every monthly payment after it - the full amount each time, whatever day of the month you joined. It shows up in your dashboard within a minute or two of the payment going through.'),
      faq('studios', 'Which studios can I use?', 'Member rates apply on every room. The DJ rooms are Studios 1, 2 and 3, on the full Pioneer setup.'),
      faq('events', 'How do events and features work?', 'Members get first access to play at Studio 808 events, and can be featured on our socials and YouTube, with posts reshared - offered to members first.'),
      faq('cancel', 'Can I cancel anytime?', 'Standard memberships roll monthly - cancel whenever you like. Founding memberships have a 3-month initial term, then roll monthly.'),
    ],
    cta: {
      heading: 'Credit in your pocket, *every month.*',
      body: 'Your booking credit lands with your first payment, and again with every monthly payment after it.',
      buttonLabel: 'Join the DJ Membership',
    },
  },

  producer: {
    heading: 'Your studio. *Every month.*',
    intro: 'Stop paying day rates. Lock in Studio 4 with a fixed monthly plan and show up whenever inspiration hits.',
    highlight: '',
    stats: ['Save up to £620/mo', 'Studio 4 only'],
    imageAlt: 'Studio 4 production room at Studio 808 Chelmsford',
    perksLabel: 'How it works',
    perks: [
      card('pick', 'Pick your plan', 'Choose 8 or 16 hours a month, on a 3 or 6 month commitment.'),
      card('code', 'Get your monthly code', 'A unique booking code lands via WhatsApp with each monthly payment, and covers you until your next renewal.'),
      card('book', 'Book whenever', 'Use your code at checkout for Studio 4. Book sessions of {minHours} or more, any combination, until your hours are used.'),
    ],
    planLabel: 'Choose your plan',
    planIntro: '3-month plans offer flexibility. 6-month plans cost less - commit longer, save more.',
    foundingBadgeLabel: 'Founding producers - first 3 only',
    foundingPriceNote: 'Founding price, locked for life',
    bestValueLabel: 'Best value',
    compareLabel: 'Compare plans',
    creditLine: '',
    foundingTerms: 'Hours reset monthly and never roll over. {months}-month minimum, then monthly rolling.',
    standardTerms: 'Hours reset monthly and never roll over. {months}-month minimum, then monthly rolling.',
    joinLabel: 'Join Now',
    faqLabel: 'FAQ',
    faqHeading: 'Common *questions.*',
    faq: [
      faq('unused', "What happens if I don't use all my hours?", "Your hours are valid for the calendar month. Unused hours don't roll over - so make sure you book them in."),
      faq('overflow', 'Run out of hours in a big month?', 'Producer members book extra Studio 4 time at £25/hr - the member overflow rate - through normal checkout while your membership is active.'),
      faq('cancel', 'Can I cancel my membership?', 'You can cancel any time after your minimum commitment period (3 or 6 months depending on your plan). Your membership stays active until the end of your current billing period.'),
      faq('availability', 'Is Studio 4 always available to members?', 'Members get access to the standard booking calendar. We recommend booking early in the month to secure your preferred slots.'),
      faq('studio4', 'What is Studio 4?', 'Studio 4 is our dedicated music production room - a fully equipped space for beatmaking, recording, and music production. Located on the first floor at Studio 808, Chelmsford.'),
    ],
    cta: {
      heading: 'Ready to lock in your *studio time?*',
      body: 'Your booking code lands via WhatsApp with each monthly payment, and covers you until your next renewal.',
      buttonLabel: 'Join the Producer Membership',
    },
  },

  socials: {
    showFor: ['dj'],
    eyebrow: 'Get seen',
    heading: 'Your set, *on our socials*',
    body: 'Members get featured across the Studio 808 socials and YouTube, with your own posts reshared and collaborated on.',
    imageAlt: 'A DJ on the decks at Studio 808',
  },

  // Fallback plans, used only when Cue's tiers endpoint cannot be reached.
  // "What's included" always comes from here for a Cue tier of the same name.
  // Prices mirror Cue's membership_tiers rows as of 2026-09-28.
  tiers: [
    tier('808-dj', {
      track: 'dj', name: '808 DJ', monthlyPrice: 25, foundingPrice: 20, monthlyCredit: 25, hoursPerMonth: 0, commitmentMonths: 0,
      included: [
        '£25.00 booking credit, renewed by every monthly payment, spent at member rates',
        'Member pricing on all rooms',
        'Members-only late-night hours',
        'Featured on our socials and YouTube',
        'Event invites',
      ],
    }),
    tier('808-resident', {
      track: 'dj', name: '808 Resident', monthlyPrice: 50, foundingPrice: 45, monthlyCredit: 50, hoursPerMonth: 0, commitmentMonths: 0,
      included: [
        '£50.00 booking credit, renewed by every monthly payment, spent at member rates',
        'Everything in 808 DJ',
        'Your posts reshared and collaborated on by the studio',
        'First pick for features',
      ],
    }),
    tier('producer-8-3', {
      track: 'producer', name: 'Producer Membership - 8hrs/mo (3 Month)', monthlyPrice: 160, hoursPerMonth: 8, commitmentMonths: 3,
      included: ['8 hours a month in Studio 4 - the pro room', ...PRODUCER_INCLUDED],
    }),
    tier('producer-16-3', {
      track: 'producer', name: 'Producer Membership - 16hrs/mo (3 Month)', monthlyPrice: 260, hoursPerMonth: 16, commitmentMonths: 3,
      included: ['16 hours a month in Studio 4 - the pro room', ...PRODUCER_INCLUDED, FILMED_SESSION],
    }),
    tier('producer-8-6', {
      track: 'producer', name: 'Producer Membership - 8hrs/mo (6 Month)', monthlyPrice: 100, hoursPerMonth: 8, commitmentMonths: 6,
      included: ['8 hours a month in Studio 4 - the pro room', ...PRODUCER_INCLUDED],
    }),
    tier('producer-16-6', {
      track: 'producer', name: 'Producer Membership - 16hrs/mo (6 Month)', monthlyPrice: 200, hoursPerMonth: 16, commitmentMonths: 6,
      included: ['16 hours a month in Studio 4 - the pro room', ...PRODUCER_INCLUDED, FILMED_SESSION],
    }),
  ],
}
