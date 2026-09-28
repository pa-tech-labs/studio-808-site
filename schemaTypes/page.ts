import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Page Name (internal)', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: r => r.required(),
      description: 'Use: home, dj-studio, production-studio, podcast-studio, about, contact, residency',
    }),
    defineField({
      name: 'isEnabled',
      title: 'Page enabled',
      type: 'boolean',
      initialValue: true,
      description: 'Turn off to hide this page. Currently honoured by residency only: its nav link disappears and /residency redirects to /membership.',
    }),
    defineField({ name: 'heroHeadline', title: 'Hero Headline', type: 'string' }),
    defineField({ name: 'heroSubtext', title: 'Hero Subtext', type: 'text', rows: 2 }),
    defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string', description: 'Shown in browser tab and Google results. ~60 chars.' }),
    defineField({ name: 'seoDescription', title: 'SEO Description', type: 'text', rows: 2, description: 'Shown in Google results. ~155 chars.' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'slug.current' },
  },
})
