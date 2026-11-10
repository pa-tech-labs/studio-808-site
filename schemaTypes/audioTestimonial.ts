import { defineType, defineField } from 'sanity'

// One client testimonial on the Studio 808 Voice page (/audio). A testimonial
// shows publicly only once "Cleared" is on: the page query returns every
// testimonial and the frontend filters on `cleared`. The whole section can
// also be switched off from the page (audioPage.showTestimonials).

export default defineType({
  name: 'audioTestimonial',
  title: 'Audio testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      description: 'The client\'s words, without quotation marks (the page adds them).',
      validation: r => r.required(),
    }),
    defineField({ name: 'name', title: 'Name', type: 'string', description: 'e.g. Jane Smith', validation: r => r.required() }),
    defineField({ name: 'role', title: 'Role (optional)', type: 'string', description: 'e.g. Audio Producer' }),
    defineField({ name: 'company', title: 'Company (optional)', type: 'string', description: 'e.g. Hachette' }),
    defineField({ name: 'logo', title: 'Company logo (optional)', type: 'image', description: 'A light or white logo on a transparent background works best on the dark page.' }),
    defineField({
      name: 'cleared',
      title: 'Cleared',
      type: 'boolean',
      initialValue: false,
      description: 'Permission received to publish this quote, name and logo',
    }),
    defineField({ name: 'order', title: 'Order', type: 'number', description: 'Lower numbers show first.' }),
  ],
  orderings: [
    { title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { name: 'name', company: 'company', quote: 'quote', cleared: 'cleared', logo: 'logo' },
    prepare: ({ name, company, quote, cleared, logo }) => ({
      title: [name, company].filter(Boolean).join(', ') || quote,
      subtitle: [cleared ? 'Cleared' : 'Not cleared', quote].filter(Boolean).join(' - '),
      media: logo,
    }),
  },
})
