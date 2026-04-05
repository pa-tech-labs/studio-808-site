import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'studio',
  title: 'Studio',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name (e.g. Studio 1 — Performer)', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' }, validation: r => r.required() }),
    defineField({ name: 'studioNumber', title: 'Studio Number (e.g. 01)', type: 'string', validation: r => r.required() }),
    defineField({ name: 'tagline', title: 'Tagline (e.g. Performer)', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description (home page card)',
      type: 'text',
      rows: 2,
      description: 'One or two sentences shown on the home page studio card.',
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'text',
      rows: 4,
      description: 'Longer description shown on the studio detail page.',
    }),
    defineField({ name: 'hourlyRate', title: 'Hourly Rate (£)', type: 'number', validation: r => r.required().min(1) }),
    defineField({ name: 'minimumHours', title: 'Minimum Hours', type: 'number', validation: r => r.required().min(1) }),
    defineField({ name: 'capacity', title: 'Capacity (e.g. Up to 8 people)', type: 'string' }),
    defineField({
      name: 'tags',
      title: 'Home Page Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Short feature tags shown on the home page card (e.g. Streaming, Air Con).',
    }),
    defineField({
      name: 'equipment',
      title: 'Equipment List',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'services',
      title: 'Services & Pricing',
      type: 'array',
      description: 'Only needed for the Production Studio. Dry hire, with engineer, mix & master, etc.',
      of: [
        {
          type: 'object',
          name: 'service',
          fields: [
            defineField({ name: 'name', title: 'Service Name', type: 'string' }),
            defineField({ name: 'price', title: 'Price', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
          ],
        },
      ],
    }),
    defineField({ name: 'note', title: 'Important Note (optional)', type: 'string', description: 'Shown as a warning box on the studio detail page.' }),
    defineField({ name: 'pageHref', title: 'Page URL (e.g. /dj-studio)', type: 'string' }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'galleryImages',
      title: 'Gallery Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Studio 1 = 1, Studio 2 = 2, etc.',
      validation: r => r.required(),
    }),
  ],
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'tagline', media: 'heroImage' },
  },
})
