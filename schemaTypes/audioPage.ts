import { defineType, defineField, defineArrayMember } from 'sanity'

// The Studio 808 Voice page (/audio, later voice.studio-808.com). A SINGLETON: one
// document, id "audioPage", pinned in the desk by sanity.config.ts. All of the
// page's copy lives here, so it can change without a deploy. The clips and
// credits are their own documents (audioClip, audioCredit).

const imageWithAlt = (name: string, title: string) => defineField({
  name,
  title,
  type: 'image',
  options: { hotspot: true },
  fields: [defineField({ name: 'alt', title: 'Image description (alt text)', type: 'string' })],
})

// One engineer: shared by the "engineers" list and the old single field.
const engineerFields = () => [
  defineField({ name: 'name', title: 'Name', type: 'string' }),
  defineField({ name: 'role', title: 'Role', type: 'string' }),
  defineField({ name: 'bio', title: 'Bio', type: 'array', of: [{ type: 'block' }] }),
  imageWithAlt('headshot', 'Headshot'),
  defineField({ name: 'credits', title: 'Credits', type: 'array', of: [{ type: 'string' }] }),
]

const link = defineArrayMember({
  type: 'object',
  name: 'link',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', validation: r => r.required() }),
    defineField({ name: 'href', title: 'Link', type: 'string', description: 'A path like /contact or a full URL.', validation: r => r.required() }),
  ],
  preview: { select: { title: 'label', subtitle: 'href' } },
})

export default defineType({
  name: 'audioPage',
  title: '808 Audio page',
  type: 'document',
  groups: [
    { name: 'top', title: 'Top of page', default: true },
    { name: 'showcase', title: 'Showreel and case study' },
    { name: 'room', title: 'Room and engineer' },
    { name: 'offer', title: 'Services and rates' },
    { name: 'process', title: 'Process and FAQs' },
    { name: 'enquiry', title: 'Enquiry' },
    { name: 'footer', title: 'Footer' },
    { name: 'terms', title: 'Terms' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'enabled',
      title: 'Page enabled',
      type: 'boolean',
      group: 'top',
      description: 'Off hides /audio. Leave off until the page is ready.',
      initialValue: false,
    }),

    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'top',
      fields: [
        defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
        defineField({ name: 'headline', title: 'Headline', type: 'string' }),
        defineField({ name: 'subheadline', title: 'Subheadline', type: 'text', rows: 2 }),
        defineField({ name: 'primaryCtaLabel', title: 'Primary button label', type: 'string' }),
        defineField({ name: 'primaryCtaHref', title: 'Primary button link', type: 'string', description: 'A path like #enquiry or a full URL.' }),
        defineField({ name: 'secondaryCtaLabel', title: 'Secondary button label', type: 'string' }),
        defineField({ name: 'secondaryCtaHref', title: 'Secondary button link', type: 'string', description: 'A path like #showreel or a full URL.' }),
        imageWithAlt('backgroundImage', 'Background image'),
      ],
    }),

    defineField({
      name: 'showreelIntro',
      title: 'Showreel intro',
      type: 'object',
      group: 'showcase',
      description: 'Shown above the clips. The clips themselves are under 808 Audio > Clips.',
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        defineField({ name: 'body', title: 'Text', type: 'text', rows: 3 }),
      ],
    }),

    defineField({
      name: 'caseStudy',
      title: 'Case study',
      type: 'object',
      group: 'showcase',
      fields: [
        defineField({ name: 'enabled', title: 'Show case study', type: 'boolean', initialValue: false }),
        defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        defineField({ name: 'client', title: 'Client', type: 'string' }),
        defineField({ name: 'body', title: 'Text', type: 'array', of: [{ type: 'block' }] }),
        defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3 }),
        defineField({ name: 'quoteAttribution', title: 'Quote attribution', type: 'string', description: 'e.g. Jane Smith, Audio Producer, Hachette' }),
        imageWithAlt('image', 'Image'),
        defineField({
          name: 'cleared',
          title: 'Cleared',
          type: 'boolean',
          initialValue: false,
          description: 'Permission received to publish this case study, quote and image publicly',
        }),
      ],
    }),

    defineField({
      name: 'room',
      title: 'The room',
      type: 'object',
      group: 'room',
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        defineField({ name: 'body', title: 'Text', type: 'text', rows: 4 }),
        defineField({
          name: 'gallery',
          title: 'Gallery',
          type: 'array',
          of: [defineArrayMember({
            type: 'image',
            options: { hotspot: true },
            fields: [defineField({ name: 'alt', title: 'Image description (alt text)', type: 'string', validation: r => r.required() })],
          })],
        }),
        defineField({ name: 'gearList', title: 'Gear list', type: 'array', of: [{ type: 'string' }], description: 'e.g. Neumann U87, Universal Audio Apollo' }),
        defineField({
          name: 'specs',
          title: 'Specs',
          type: 'array',
          description: 'e.g. Noise floor / Below ACX -60 dB',
          of: [defineArrayMember({
            type: 'object',
            name: 'spec',
            fields: [
              defineField({ name: 'label', title: 'Label', type: 'string', validation: r => r.required() }),
              defineField({ name: 'value', title: 'Value', type: 'string', validation: r => r.required() }),
            ],
            preview: { select: { title: 'label', subtitle: 'value' } },
          })],
        }),
      ],
    }),

    defineField({
      name: 'engineersHeading',
      title: 'Engineers heading',
      type: 'string',
      group: 'room',
      description: 'e.g. The people on the desk',
    }),
    defineField({
      name: 'engineers',
      title: 'Engineers',
      type: 'array',
      group: 'room',
      description: 'Shown side by side on desktop. Each one is also listed as staff in the page\'s search data.',
      of: [defineArrayMember({
        type: 'object',
        name: 'engineerProfile',
        fields: engineerFields(),
        preview: { select: { title: 'name', subtitle: 'role', media: 'headshot' } },
      })],
    }),
    defineField({
      name: 'engineer',
      title: 'Engineer (old, single)',
      type: 'object',
      group: 'room',
      hidden: true,
      deprecated: { reason: 'Replaced by "Engineers". The site still reads this until Engineers has an entry; run scripts/migrateAudioEngineers.ts to move it.' },
      readOnly: true,
      fields: engineerFields(),
    }),

    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      group: 'offer',
      of: [defineArrayMember({
        type: 'object',
        name: 'audioService',
        fields: [
          defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
          defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
          defineField({ name: 'icon', title: 'Icon', type: 'string', description: 'Icon name, e.g. mic, book, broadcast' }),
          defineField({ name: 'typicalUse', title: 'Typical use', type: 'string', description: 'e.g. Audiobooks for ACX and Audible' }),
        ],
        preview: { select: { title: 'title', subtitle: 'typicalUse' } },
      })],
    }),

    defineField({
      name: 'rates',
      title: 'Rates',
      type: 'object',
      group: 'offer',
      fields: [
        defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
        defineField({ name: 'vatNote', title: 'VAT note', type: 'string', initialValue: 'All prices exclusive of VAT at 20%' }),
        defineField({
          name: 'tiers',
          title: 'Tiers',
          type: 'array',
          of: [defineArrayMember({
            type: 'object',
            name: 'rateTier',
            fields: [
              defineField({ name: 'name', title: 'Name', type: 'string', validation: r => r.required() }),
              defineField({ name: 'price', title: 'Price', type: 'string', description: 'As shown, e.g. £65 or From £350' }),
              defineField({ name: 'unit', title: 'Unit', type: 'string', description: 'e.g. per hour, per finished hour, per day' }),
              defineField({ name: 'includes', title: 'Includes', type: 'array', of: [{ type: 'string' }] }),
              defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
            ],
            preview: {
              select: { title: 'name', price: 'price', unit: 'unit' },
              prepare: ({ title, price, unit }) => ({ title, subtitle: [price, unit].filter(Boolean).join(' ') }),
            },
          })],
        }),
      ],
    }),

    defineField({
      name: 'process',
      title: 'Process',
      type: 'array',
      group: 'process',
      of: [defineArrayMember({
        type: 'object',
        name: 'processStep',
        fields: [
          defineField({ name: 'step', title: 'Step number', type: 'number' }),
          defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
          defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
        ],
        preview: {
          select: { title: 'title', step: 'step' },
          prepare: ({ title, step }) => ({ title: step != null ? `${step}. ${title ?? ''}` : title }),
        },
      })],
    }),

    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      group: 'process',
      of: [defineArrayMember({
        type: 'object',
        name: 'audioFaq',
        fields: [
          defineField({ name: 'question', title: 'Question', type: 'string', validation: r => r.required() }),
          defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 3, validation: r => r.required() }),
        ],
        preview: { select: { title: 'question', subtitle: 'answer' } },
      })],
    }),

    defineField({
      name: 'enquiry',
      title: 'Enquiry',
      type: 'object',
      group: 'enquiry',
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        defineField({ name: 'body', title: 'Text', type: 'text', rows: 2 }),
        defineField({ name: 'successMessage', title: 'Success message', type: 'text', rows: 2, description: 'Shown after the form is sent.' }),
        defineField({ name: 'projectTypes', title: 'Project types', type: 'array', of: [{ type: 'string' }], description: 'The choices in the form, e.g. Audiobook, Commercial' }),
        defineField({ name: 'recipientNote', title: 'Recipient note (internal)', type: 'text', rows: 2, description: 'Internal only, never shown on the site. e.g. who enquiries go to.' }),
      ],
    }),

    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      group: 'footer',
      fields: [
        defineField({ name: 'companyLine', title: 'Company line', type: 'string' }),
        defineField({ name: 'addressLine', title: 'Address line', type: 'string' }),
        defineField({ name: 'phone', title: 'Phone', type: 'string' }),
        defineField({ name: 'email', title: 'Email', type: 'string' }),
        defineField({ name: 'links', title: 'Links', type: 'array', of: [link] }),
      ],
    }),

    defineField({
      name: 'terms',
      title: 'Service terms',
      type: 'array',
      group: 'terms',
      description: 'Shown at /audio/terms. Use Heading 2 for each numbered section.',
      of: [defineArrayMember({
        type: 'block',
        styles: [
          { title: 'Normal', value: 'normal' },
          { title: 'Heading 2', value: 'h2' },
          { title: 'Heading 3', value: 'h3' },
        ],
      })],
    }),
    defineField({
      name: 'termsUpdated',
      title: 'Terms last updated',
      type: 'date',
      group: 'terms',
      options: { dateFormat: 'D MMMM YYYY' },
    }),

    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({ name: 'metaTitle', title: 'Meta title', type: 'string', description: 'Shown in the browser tab and Google results. About 60 characters.' }),
        defineField({ name: 'metaDescription', title: 'Meta description', type: 'text', rows: 2, description: 'Shown in Google results. About 155 characters.' }),
        defineField({ name: 'ogImage', title: 'Social share image', type: 'image', description: '1200 x 630 works best.' }),
        defineField({ name: 'canonicalUrl', title: 'Canonical URL', type: 'url', description: 'e.g. https://voice.studio-808.com/ once the subdomain is live.' }),
        defineField({ name: 'noindex', title: 'Hide from search engines (noindex)', type: 'boolean', initialValue: false }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: '808 Audio page' }) },
})
