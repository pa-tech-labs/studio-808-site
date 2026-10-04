import { defineType, defineField, defineArrayMember } from 'sanity'

// The /membership page. A SINGLETON: one document, id "membershipPage",
// pinned in the desk by sanity.config.ts. All of the page's copy lives here,
// so it can change without a deploy.
//
// Plan names and prices are read live from Cue (book.studio-808.com) when the
// page loads. The Tiers below are the fallback for when Cue cannot be reached,
// and the source of each plan's "What's included" list: a Cue tier uses the
// list of the tier here with exactly the same name.
//
// Headings: wrap the ending in *stars* for the serif italic tail, e.g.
// "More than *studio time.*"

const HEADING_HELP = 'Wrap the ending in *stars* for the serif italic tail, e.g. More than *studio time.*'

const faqItem = defineArrayMember({
  type: 'object',
  name: 'faqItem',
  fields: [
    defineField({ name: 'q', title: 'Question', type: 'string', validation: r => r.required() }),
    defineField({ name: 'a', title: 'Answer', type: 'text', rows: 3, validation: r => r.required() }),
  ],
  preview: { select: { title: 'q', subtitle: 'a' } },
})

const perkCard = defineArrayMember({
  type: 'object',
  name: 'perkCard',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'body', title: 'Text', type: 'text', rows: 2, description: '{minHours} is replaced by the minimum booking length set in Cue, e.g. "2 hours".' }),
    defineField({
      name: 'icon',
      title: 'Icon (optional)',
      type: 'string',
      description: 'Leave empty to show the card number instead.',
      options: { list: [
        { title: 'Microphone', value: 'mic' },
        { title: 'Megaphone', value: 'megaphone' },
        { title: 'Tag', value: 'tag' },
        { title: 'Disc', value: 'disc' },
        { title: 'Sliders', value: 'sliders' },
      ] },
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'body' } },
})

const trackCopy = (name: 'dj' | 'producer', title: string) => defineField({
  name,
  title,
  type: 'object',
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', description: HEADING_HELP }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 3 }),
    defineField({ name: 'highlight', title: 'Highlight pill (optional)', type: 'string' }),
    defineField({ name: 'stats', title: 'Stat pills (optional)', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'image', title: 'Image (optional)', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'imageAlt', title: 'Image description (alt text)', type: 'string' }),
    defineField({ name: 'perksLabel', title: 'Cards label', type: 'string', description: 'e.g. Member perks, How it works' }),
    defineField({ name: 'perks', title: 'Cards', type: 'array', of: [perkCard] }),
    defineField({ name: 'planLabel', title: 'Plans label', type: 'string' }),
    defineField({ name: 'planIntro', title: 'Plans intro (optional)', type: 'text', rows: 2 }),
    defineField({ name: 'foundingBadgeLabel', title: 'Founding badge', type: 'string', deprecated: { reason: 'No longer shown: the plans now carry one founding line, written in "Founding line" below.' }, readOnly: true }),
    defineField({ name: 'foundingPriceNote', title: 'Founding line', type: 'string', description: 'Shown once above the plans while founding places remain, followed by the places left, e.g. Founding price, locked for life' }),
    defineField({ name: 'bestValueLabel', title: 'Best value pill', type: 'string', initialValue: 'Best value', description: 'On the one featured plan: the 6-month 8-hour plan for producers, the entry plan for DJs.' }),
    defineField({ name: 'creditBackLine', title: 'Credit line on DJ plans', type: 'string', initialValue: '{credit} credit back every month, plus member rates and members-only hours', description: 'Under the price on each DJ plan. {credit} is replaced by the plan\'s monthly booking credit from Cue, e.g. £25. Hidden when a plan has no credit.' }),
    defineField({ name: 'compareLabel', title: 'Compare link label', type: 'string', initialValue: 'Compare plans', description: 'Under each Join button; scrolls to "What members save". Producer plans only, and only while Cue gives the room rate.' }),
    defineField({ name: 'creditLine', title: 'Credit line (optional)', type: 'string', description: 'Small print under the plans.' }),
    defineField({ name: 'foundingTerms', title: 'Terms while founding places remain', type: 'text', rows: 2, description: 'Small print under the plans. {months} is replaced by the minimum term on show.' }),
    defineField({ name: 'standardTerms', title: 'Terms once founding places are gone', type: 'text', rows: 2, description: 'Small print under the plans. {months} is replaced by the minimum term on show.' }),
    defineField({ name: 'joinLabel', title: 'Plan button label', type: 'string', initialValue: 'Join Now' }),
    defineField({ name: 'faqLabel', title: 'FAQ label', type: 'string', initialValue: 'FAQ' }),
    defineField({ name: 'faqHeading', title: 'FAQ heading', type: 'string', description: HEADING_HELP }),
    defineField({ name: 'faq', title: 'FAQ', type: 'array', of: [faqItem] }),
    defineField({
      name: 'cta',
      title: 'Join section (end of page)',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', description: HEADING_HELP }),
        defineField({ name: 'body', title: 'Text', type: 'text', rows: 2 }),
        defineField({ name: 'buttonLabel', title: 'Button label', type: 'string' }),
      ],
    }),
  ],
})

export default defineType({
  name: 'membershipPage',
  title: 'Membership page',
  type: 'document',
  groups: [
    { name: 'top', title: 'Top of page', default: true },
    { name: 'dj', title: 'DJ' },
    { name: 'producer', title: 'Producer' },
    { name: 'socials', title: 'Socials block' },
    { name: 'tiers', title: 'Tiers' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string', group: 'top' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string', group: 'top', description: HEADING_HELP }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2, group: 'top' }),
    defineField({
      name: 'selector',
      title: 'DJ / Producer selector',
      type: 'object',
      group: 'top',
      description: 'The price under each label comes from the plans.',
      fields: [
        defineField({ name: 'djLabel', title: 'DJ label', type: 'string', initialValue: "I'm a DJ" }),
        defineField({ name: 'producerLabel', title: 'Producer label', type: 'string', initialValue: "I'm a producer" }),
      ],
    }),

    { ...trackCopy('dj', 'DJ'), group: 'dj' },
    { ...trackCopy('producer', 'Producer'), group: 'producer' },

    defineField({
      name: 'socials',
      title: 'Socials block',
      type: 'object',
      group: 'socials',
      fields: [
        defineField({
          name: 'showFor',
          title: 'Show for',
          type: 'array',
          of: [{ type: 'string' }],
          options: { list: [{ title: 'DJ', value: 'dj' }, { title: 'Producer', value: 'producer' }], layout: 'grid' },
          initialValue: ['dj'],
        }),
        defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
        defineField({ name: 'heading', title: 'Heading', type: 'string', description: HEADING_HELP }),
        defineField({ name: 'body', title: 'Text', type: 'text', rows: 2 }),
        defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
        defineField({ name: 'imageAlt', title: 'Image description (alt text)', type: 'string' }),
      ],
    }),

    defineField({
      name: 'tiers',
      title: 'Tiers',
      type: 'array',
      group: 'tiers',
      description: 'Names and prices show only when Cue cannot be reached; Cue\'s live tiers win otherwise. "What\'s included" is always taken from here for the tier with exactly the same name as Cue\'s.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'tier',
          fields: [
            defineField({
              name: 'track',
              title: 'Track',
              type: 'string',
              options: { list: [{ title: 'DJ', value: 'dj' }, { title: 'Producer', value: 'producer' }], layout: 'radio' },
              validation: r => r.required(),
            }),
            defineField({ name: 'name', title: 'Name (exactly as in Cue)', type: 'string', validation: r => r.required() }),
            defineField({ name: 'monthlyPrice', title: 'Monthly price (£)', type: 'number', validation: r => r.required().positive() }),
            defineField({ name: 'foundingPrice', title: 'Founding price (£, DJ only)', type: 'number', validation: r => r.positive() }),
            defineField({ name: 'monthlyCredit', title: 'Monthly booking credit (£, DJ only)', type: 'number', description: 'Used only when Cue cannot be reached; Cue\'s monthly credit wins otherwise.', validation: r => r.positive() }),
            defineField({ name: 'hoursPerMonth', title: 'Hours per month', type: 'number', initialValue: 0, validation: r => r.min(0) }),
            defineField({ name: 'commitmentMonths', title: 'Minimum term (months)', type: 'number', initialValue: 0, validation: r => r.min(0) }),
            defineField({ name: 'included', title: "What's included", type: 'array', of: [{ type: 'string' }] }),
          ],
          preview: {
            select: { title: 'name', price: 'monthlyPrice', track: 'track' },
            prepare: ({ title, price, track }) => ({ title, subtitle: `${track === 'producer' ? 'Producer' : 'DJ'} · £${price ?? '?'}/mo` }),
          },
        }),
      ],
    }),

    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo' }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 2, group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Membership page' }) },
})
