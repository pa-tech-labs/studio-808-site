// Seed content for the "Studio finder" singleton. Pure data: the seed script
// (seedStudioFinder.ts) writes it to Sanity, and the node:test suite runs the
// same rules through matchRule, so the rule order below is tested, not just
// written down.
//
// Rules name their studio by `studioSortOrder`. The seed script resolves that
// to a reference to the studio document with that sortOrder. Sanity array
// items need a stable _key, so every item carries one.

const opt = (label, value, helper) => ({ _key: value, _type: 'option', label, value, ...(helper ? { helper } : {}) })
const when = (questionKey, equals) => ({ _key: `${questionKey}-${equals}`, _type: 'condition', questionKey, equals })

export const TUTOR_FORM_INTRO =
  "Tell us a bit about you and we'll pass your details to Jack, our DJ tutor, to arrange a session."

export const questions = [
  {
    _key: 'purpose', _type: 'question', key: 'purpose',
    title: 'What are you here for?',
    options: [opt('DJ mixing', 'dj'), opt('Producing music', 'produce')],
  },
  {
    _key: 'level', _type: 'question', key: 'level',
    title: 'How long have you been DJing?',
    showIf: [when('purpose', 'dj')],
    skippable: true,
    options: [
      opt('Just starting', 'starting'),
      opt('Learning', 'learning'),
      opt('Experienced', 'experienced'),
      opt('Pro or content creator', 'pro'),
    ],
  },
  {
    _key: 'format', _type: 'question', key: 'format',
    title: 'What do you play on?',
    showIf: [when('purpose', 'dj')],
    skippable: true,
    options: [opt('CDJs', 'cdj'), opt('Vinyl', 'vinyl'), opt('Both', 'both')],
  },
  {
    _key: 'source', _type: 'question', key: 'source',
    title: 'Where is your music?',
    showIf: [when('purpose', 'dj')],
    skippable: true,
    options: [opt('USB', 'usb'), opt('Laptop', 'laptop'), opt('Streaming (Tidal or Beatport)', 'streaming')],
  },
  {
    _key: 'production', _type: 'question', key: 'production',
    title: 'How do you want to work?',
    showIf: [when('purpose', 'produce')],
    options: [
      opt('With an engineer in the flagship studio', 'engineer'),
      opt('Self-service, my own laptop', 'self'),
    ],
  },
  {
    _key: 'tutor', _type: 'question', key: 'tutor',
    title: 'Would you like a DJ tutor for your session?',
    options: [opt('Yes', 'yes'), opt('No', 'no')],
  },
]

export const rules = [
  { _key: 'vinyl', conditions: [when('format', 'vinyl')], studioSortOrder: 3,
    reason: 'Technics 1210s and CDJ-3000s side by side' },
  { _key: 'both', conditions: [when('format', 'both')], studioSortOrder: 3,
    reason: 'Technics 1210s and CDJ-3000s side by side' },
  { _key: 'pro', conditions: [when('level', 'pro')], studioSortOrder: 3,
    reason: 'Club-standard booth with a 4K camera for recording your sets',
    addOns: ['Recording and streaming bolt-on'] },
  { _key: 'experienced-cdj', conditions: [when('level', 'experienced'), when('format', 'cdj')], studioSortOrder: 3,
    reason: 'CDJ-3000s and a DJM-A9, the same setup as the clubs' },
  { _key: 'laptop', conditions: [when('source', 'laptop')], studioSortOrder: 2,
    reason: 'Plug your laptop straight into the DDJ-RX3 and monitors' },
  { _key: 'dj', conditions: [when('purpose', 'dj')], studioSortOrder: 1,
    reason: 'The XDJ-AZ is the easiest way to learn on current Pioneer kit, with USB and built-in streaming' },
  { _key: 'engineer', conditions: [when('production', 'engineer')], studioSortOrder: 4,
    reason: 'Our flagship studio with an engineer at the desk' },
  { _key: 'self', conditions: [when('production', 'self')], studioSortOrder: 2,
    reason: 'Bring your laptop and plug into the interface, keys and monitors' },
  { _key: 'fallback', conditions: [], studioSortOrder: 1,
    reason: 'A great place to start: plug in and play' },
]

export const singleton = {
  _id: 'studioFinder',
  _type: 'studioFinder',
  enabled: true,
  heading: 'Not sure which studio?',
  intro: 'Answer a few quick questions and we will point you at the right room for how you play.',
  ctaLabel: 'Find your studio',
  tutor: {
    enabled: true,
    questionCopy: 'Would you like a DJ tutor for your session?',
    formTitle: 'Book in with a tutor',
    formIntro: TUTOR_FORM_INTRO,
    successMessage: "Thanks. We've passed your details to Jack, who will be in touch to arrange a session.",
  },
  result: {
    heading: 'Your studio',
    bookLabel: 'Book this studio',
    restartLabel: 'Start again',
  },
}
