import { defineType, defineField } from 'sanity'
import { AUDIO_CLIP_TYPES } from './audioClip'

// One credit (client, show or talent) on the Studio 808 Voice page (/audio). A credit
// shows publicly only once "Cleared" is on: the page query returns every
// credit and the frontend filters on `cleared`.

export default defineType({
  name: 'audioCredit',
  title: 'Audio credit',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', description: 'e.g. BBC Watchdog', validation: r => r.required() }),
    defineField({ name: 'logo', title: 'Logo (optional)', type: 'image' }),
    defineField({ name: 'talent', title: 'Talent (optional)', type: 'string' }),
    defineField({ name: 'talentPhoto', title: 'Talent photo (optional)', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'creditType',
      title: 'Credit type',
      type: 'string',
      options: { list: AUDIO_CLIP_TYPES.filter(t => t.value !== 'other'), layout: 'radio' },
    }),
    defineField({ name: 'url', title: 'Link (optional)', type: 'url' }),
    defineField({
      name: 'cleared',
      title: 'Cleared',
      type: 'boolean',
      initialValue: false,
      description: 'Permission received to display name/logo/photo',
    }),
    defineField({ name: 'order', title: 'Order', type: 'number', description: 'Lower numbers show first.' }),
  ],
  orderings: [
    { title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', talent: 'talent', cleared: 'cleared', logo: 'logo', photo: 'talentPhoto' },
    prepare: ({ title, talent, cleared, logo, photo }) => ({
      title,
      subtitle: [cleared ? 'Cleared' : 'Not cleared', talent].filter(Boolean).join(' - '),
      media: logo ?? photo,
    }),
  },
})
