import { defineType, defineField } from 'sanity'

// One clip in the 808 Audio showreel (/audio). A clip shows publicly only
// once "Cleared" is on: the page query returns every clip and the frontend
// filters on `cleared`.

export const AUDIO_CLIP_TYPES = [
  { title: 'Audiobook', value: 'audiobook' },
  { title: 'Broadcast', value: 'broadcast' },
  { title: 'Commercial', value: 'commercial' },
  { title: 'eLearning', value: 'elearning' },
  { title: 'Podcast', value: 'podcast' },
  { title: 'Other', value: 'other' },
]

export default defineType({
  name: 'audioClip',
  title: 'Audio clip',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'clipType',
      title: 'Clip type',
      type: 'string',
      options: { list: AUDIO_CLIP_TYPES, layout: 'radio' },
    }),
    defineField({ name: 'client', title: 'Client', type: 'string', description: 'e.g. Hachette' }),
    defineField({ name: 'production', title: 'Production', type: 'string', description: 'e.g. The Dogs That Saved Me' }),
    defineField({ name: 'talent', title: 'Talent', type: 'string', description: 'e.g. Stacey Solomon' }),
    defineField({ name: 'engineer', title: 'Engineer', type: 'string', initialValue: 'Heetan' }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'One or two sentences on what we did.',
    }),
    defineField({
      name: 'audioFile',
      title: 'Audio file',
      type: 'file',
      options: { accept: 'audio/*' },
    }),
    defineField({
      name: 'peaks',
      title: 'Waveform peaks (optional)',
      type: 'file',
      options: { accept: '.json,application/json' },
      description: 'Pre-generated waveform peaks as JSON, so the player can draw the waveform without decoding the audio.',
    }),
    defineField({
      name: 'durationSeconds',
      title: 'Duration (seconds)',
      type: 'number',
      validation: r => r.min(0),
    }),
    defineField({
      name: 'transcript',
      title: 'Transcript (optional)',
      type: 'text',
      rows: 6,
      description: 'Used for accessibility and as crawlable copy.',
    }),
    defineField({ name: 'coverImage', title: 'Cover image (optional)', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'cleared',
      title: 'Cleared',
      type: 'boolean',
      initialValue: false,
      description: 'Permission received to publish this clip publicly',
    }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'order', title: 'Order', type: 'number', description: 'Lower numbers show first.' }),
  ],
  orderings: [
    { title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', client: 'client', talent: 'talent', cleared: 'cleared', media: 'coverImage' },
    prepare: ({ title, client, talent, cleared, media }) => ({
      title,
      subtitle: [cleared ? 'Cleared' : 'Not cleared', client, talent].filter(Boolean).join(' - '),
      media,
    }),
  },
})
