// DEV ONLY placeholder content for /audio?fixture, so the page can be worked
// on before Sanity has any. Every client, show and person here is invented;
// none of it is a real credit. Never imported by a production build.

import type { AudioPageData, AudioCredit } from '../../lib/audioPage'
// Generated with ffmpeg (tones shaped like speech, a gradient test video).
// Imported as URLs from here, so they only ever exist in dev builds.
import narrationUrl from './fixture/tone-narration.mp3?url'
import narrationPeaksUrl from './fixture/tone-narration.peaks.json?url'
import spotUrl from './fixture/tone-spot.mp3?url'
import videoUrl from './fixture/clip.mp4?url'
import posterUrl from './fixture/poster.jpg?url'

const svg = (body: string, w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`)}`

const wordmark = (text: string, serif = false) => svg(
  `<text x="0" y="30" textLength="${text.length * 15}" lengthAdjust="spacingAndGlyphs" fill="#f0ede8" font-family="${serif ? 'Georgia, serif' : 'Helvetica, Arial, sans-serif'}" font-size="28" font-weight="${serif ? 400 : 700}" letter-spacing="${serif ? 0 : -0.5}">${text}</text>`,
  text.length * 15,
  40,
)

const portrait = (hue: number) => svg(
  `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 12% 26%)"/><stop offset="1" stop-color="hsl(${hue} 10% 12%)"/></linearGradient></defs>`
  + '<rect width="400" height="500" fill="url(#g)"/>'
  + `<circle cx="200" cy="200" r="78" fill="hsl(${hue} 8% 40%)"/><path d="M60 500c0-90 62-150 140-150s140 60 140 150z" fill="hsl(${hue} 8% 36%)"/>`,
  400,
  500,
)

type FixtureCredit = Omit<AudioCredit, 'logo' | 'talentPhoto'> & { logo?: { url: string } | null; talentPhoto?: { url: string } | null }

const credits: FixtureCredit[] = [
  { _id: 'c1', name: 'Northfield Press', logo: { url: wordmark('Northfield Press', true) }, logoAspect: 6.0, creditType: 'audiobook', cleared: true, order: 1 },
  { _id: 'c2', name: 'Harbour FM', logo: { url: wordmark('HARBOUR FM') }, logoAspect: 3.75, creditType: 'broadcast', cleared: true, order: 2 },
  { _id: 'c3', name: 'Kestrel Learning', logo: { url: wordmark('kestrel learning') }, logoAspect: 6.0, creditType: 'elearning', cleared: true, order: 3 },
  { _id: 'c4', name: 'Ashdown Books', logo: { url: wordmark('Ashdown', true) }, logoAspect: 2.625, creditType: 'audiobook', cleared: true, order: 4 },
  { _id: 'c5', name: 'Lowmoor Studios', logo: { url: wordmark('LOWMOOR') }, logoAspect: 2.625, creditType: 'commercial', cleared: true, order: 5 },
  { _id: 'c6', name: 'The Quiet Hour', logo: { url: wordmark('The Quiet Hour', true) }, logoAspect: 5.25, creditType: 'podcast', cleared: true, order: 6 },
  { _id: 'c7', name: 'Not cleared yet', logo: { url: wordmark('HIDDEN') }, logoAspect: 2.25, creditType: 'broadcast', cleared: false, order: 7 },
  { _id: 'v1', name: 'The Long Road North', talent: 'Placeholder Narrator', talentPhoto: { url: portrait(30) }, creditType: 'audiobook', cleared: true, order: 10 },
  { _id: 'v2', name: 'Morning Brief', talent: 'Placeholder Presenter', talentPhoto: { url: portrait(200) }, creditType: 'broadcast', cleared: true, order: 11 },
  { _id: 'v3', name: 'Field Notes', talent: 'Placeholder Host', talentPhoto: { url: portrait(120) }, creditType: 'podcast', cleared: true, order: 12 },
  { _id: 'v4', name: 'Safety Induction 2026', talent: 'Placeholder Voice', talentPhoto: { url: portrait(260) }, creditType: 'elearning', cleared: true, order: 13 },
  { _id: 'v5', name: 'Hidden Voice', talent: 'Not cleared', talentPhoto: { url: portrait(0) }, creditType: 'audiobook', cleared: false, order: 14 },
]

const clips = [
  {
    _id: 'k1', title: 'Chapter one, opening', clipType: 'audiobook', mediaType: 'audio', featured: true, order: 2,
    client: 'Northfield Press', production: 'The Long Road North', talent: 'Placeholder Narrator', engineer: 'Heetan',
    description: 'Unabridged narration recorded over four days, edited and mastered to ACX spec.',
    audioUrl: narrationUrl, peaksUrl: narrationPeaksUrl, durationSeconds: 24,
    coverImage: { url: portrait(30) },
    transcript: 'This is placeholder text standing in for the transcript of the clip.\n\nA real transcript gives every clip crawlable, accessible copy.',
    cleared: true,
  },
  {
    _id: 'k2', title: 'Character voices', clipType: 'audiobook', order: 1,
    client: 'Ashdown Books', production: 'Field Notes', talent: 'Placeholder Voice', engineer: 'Heetan',
    description: 'A dialogue-heavy chapter with four character voices from one narrator.',
    audioUrl: spotUrl, durationSeconds: 16, cleared: true,
  },
  {
    _id: 'k3', title: 'Thirty second spot', clipType: 'commercial', mediaType: 'video', order: 1,
    client: 'Lowmoor Studios', production: 'Winter campaign', talent: 'Placeholder Presenter', engineer: 'Heetan',
    description: 'Voiceover recorded to picture and delivered as broadcast stems.',
    videoUrl, posterImage: { url: posterUrl }, durationSeconds: 12, cleared: true,
  },
  {
    _id: 'k4', title: 'Radio read', clipType: 'commercial', order: 2,
    client: 'Harbour FM', production: 'Morning Brief sponsor', talent: 'Placeholder Presenter', engineer: 'Heetan',
    audioUrl: spotUrl, durationSeconds: 16, cleared: true,
  },
  {
    _id: 'k5', title: 'Module 3 narration', clipType: 'elearning', order: 1,
    client: 'Kestrel Learning', production: 'Safety Induction 2026', talent: 'Placeholder Host', engineer: 'Heetan',
    description: 'Course narration recorded from a script with on-screen timings.',
    audioUrl: narrationUrl, durationSeconds: 24, cleared: true,
  },
  {
    _id: 'k6', title: 'Not cleared yet', clipType: 'broadcast', audioUrl: spotUrl, durationSeconds: 16, cleared: false,
  },
]


const pt = (style: string, text: string, key: string) => ({ _type: 'block', _key: key, style, markDefs: [], children: [{ _type: 'span', _key: `${key}s`, text, marks: [] }] })

// Placeholder copy for every section after the showreel.
const sections = {
  caseStudy: {
    enabled: true,
    cleared: true,
    eyebrow: 'Case study',
    heading: 'Twelve hours of narration in four sessions',
    client: 'Northfield Press',
    body: [
      pt('normal', 'Placeholder copy. The publisher needed a full-length memoir recorded with the author, who had never read for audio before.', 'cs1'),
      pt('normal', 'We split the book into four sessions, coached pacing in the first hour and delivered chapter files to ACX spec the week after the last session.', 'cs2'),
    ],
    quote: 'Placeholder quote. The booth felt calm, and the files came back ready to publish.',
    quoteAttribution: 'Placeholder Name, Audio Producer, Northfield Press',
    image: { url: '/images/studios/studio4-production-2.jpg', alt: 'The control room during a narration session' },
  },
  room: {
    heading: 'The booth',
    body: 'Placeholder copy. A floated, treated vocal booth with its own control room, built for long spoken-word sessions.',
    gallery: [
      { _key: 'g1', url: '/images/studios/studio4-production-1.jpg', alt: 'Control room with the desk and monitors' },
      { _key: 'g2', url: '/images/studios/studio4-production-2.jpg', alt: 'Monitoring position at the desk' },
      { _key: 'g3', url: '/images/studios/studio2-creator-1.jpg', alt: 'Microphone set up in the booth' },
      { _key: 'g4', url: '/images/studios/studio2-creator-2.jpg', alt: 'Acoustic treatment on the booth walls' },
      { _key: 'g5', url: '/images/studios/studio1-performer-1.jpg', alt: 'Talent seat and script stand' },
    ],
    gearList: ['Neumann U87 Ai', 'Universal Audio Apollo x8', 'Genelec 8341 monitors', 'Pro Tools Studio', 'iZotope RX 11'],
    specs: [
      { _key: 's1', label: 'Noise floor', value: 'Below ACX -60 dB' },
      { _key: 's2', label: 'Room treatment', value: 'Floated booth, broadband absorption' },
      { _key: 's3', label: 'Monitoring', value: 'Nearfield, calibrated to 79 dB SPL' },
      { _key: 's4', label: 'Delivery', value: 'WAV, MP3, ACX and broadcast stems' },
    ],
  },
  engineersHeading: 'The people on the desk',
  engineers: [
    {
      _key: 'e1',
      name: 'Heetan',
      role: 'Recording engineer',
      bio: [
        pt('normal', 'Placeholder copy. Engineer and producer, recording spoken word, music and broadcast audio from the Chelmsford booth.', 'b1'),
        pt('normal', 'Directs sessions from the control room and edits and masters everything in house.', 'b2'),
      ],
      headshot: { url: portrait(40), alt: 'Heetan at the desk' },
      credits: ['Placeholder Audiobook One', 'Placeholder Broadcast', 'Placeholder Podcast Series'],
    },
    {
      _key: 'e2',
      name: 'Placeholder Engineer',
      role: 'Editor and mastering',
      bio: [pt('normal', 'Placeholder copy. Edits, cleans and masters long-form narration to ACX spec.', 'b3')],
      headshot: { url: portrait(210), alt: 'Placeholder Engineer' },
      credits: ['Placeholder Course', 'Placeholder Title Two'],
    },
  ],
  services: [
    { _key: 'sv1', title: 'Audiobook narration', description: 'Placeholder copy. Unabridged and abridged titles, recorded, edited and mastered to ACX and Audible specs.', typicalUse: 'Publishers and authors' },
    { _key: 'sv2', title: 'Commercial voiceover', description: 'Placeholder copy. Radio, TV and online spots recorded to picture or to time.', typicalUse: 'Agencies and brands' },
    { _key: 'sv3', title: 'eLearning narration', description: 'Placeholder copy. Course modules recorded from your script with consistent tone across hours of material.', typicalUse: 'Training teams' },
    { _key: 'sv4', title: 'Remote-directed sessions', description: 'Placeholder copy. Clients join live and direct the read from wherever they are.', typicalUse: 'Producers working remotely' },
  ],
  rates: {
    intro: 'Placeholder copy. Booth time includes an engineer. Editing and mastering are quoted per project.',
    vatNote: 'All prices exclusive of VAT at 20%',
    tiers: [
      { _key: 't1', name: 'Hourly', price: '£65', unit: 'per hour', includes: ['Booth and control room', 'Engineer', 'Raw files same day'] },
      { _key: 't2', name: 'Half day', price: '£240', unit: 'per 4 hours', includes: ['Everything in Hourly', 'Remote direction link', 'Rough edit'], featured: true },
      { _key: 't3', name: 'Audiobook', price: 'From £180', unit: 'per finished hour', includes: ['Recording, editing and mastering', 'ACX delivery', 'One round of pickups'] },
    ],
  },
  process: [
    { _key: 'p1', step: 1, title: 'Tell us about it', description: 'Placeholder copy. Send the script or a sample and the deadline.' },
    { _key: 'p2', step: 2, title: 'Get a quote', description: 'Placeholder copy. A fixed price and dates within one working day.' },
    { _key: 'p3', step: 3, title: 'Record', description: 'Placeholder copy. In the booth, or directed remotely.' },
    { _key: 'p4', step: 4, title: 'Deliver', description: 'Placeholder copy. Edited, mastered files in the format you need.' },
  ],
  faqs: [
    { _key: 'f1', question: 'Can I direct the session remotely?', answer: 'Placeholder answer. Yes. We send a low-latency link so you hear the booth in real time and can talk to the talent.' },
    { _key: 'f2', question: 'Do you provide voice talent?', answer: 'Placeholder answer. We can suggest narrators and voiceover artists, or you can bring your own.' },
    { _key: 'f3', question: 'What formats do you deliver?', answer: 'Placeholder answer. WAV and MP3 as standard, ACX-ready chapter files for audiobooks, and stems for broadcast.' },
    { _key: 'f4', question: 'How quickly can you turn work around?', answer: 'Placeholder answer. Raw files the same day. Edited and mastered files depend on length; we confirm dates with the quote.' },
  ],
  enquiry: {
    heading: 'Get a quote',
    body: 'Placeholder copy. Tell us about the project and we will reply within one working day.',
    successMessage: 'Thanks. Your enquiry is with us and we will reply within one working day.',
    projectTypes: ['Audiobook', 'Commercial voiceover', 'eLearning', 'Podcast', 'Other'],
    recipientNote: 'Internal only, never shown.',
  },
  terms: [
    pt('normal', 'Placeholder terms. These are not real terms and must be replaced in Sanity before launch.', 't0'),
    pt('h2', '1. Bookings', 't1'),
    pt('normal', 'Placeholder copy describing how sessions are booked and confirmed.', 't1a'),
    pt('h2', '2. Cancellations', 't2'),
    pt('normal', 'Placeholder copy describing notice periods and charges.', 't2a'),
    pt('h2', '3. Delivery and ownership', 't3'),
    pt('normal', 'Placeholder copy describing file delivery and who owns the recordings.', 't3a'),
  ],
  termsUpdated: '2026-10-12',
}

export const AUDIO_FIXTURE = {
  page: {
    ...sections,
    enabled: true,
    showreelIntro: {
      heading: 'Selected work',
      body: 'Narration, commercials and course audio recorded and finished in the booth. Pick a clip, or play straight through.',
    },
    hero: {
      eyebrow: 'Voiceover and audiobook recording, Chelmsford',
      headline: 'Voice recorded below the ACX noise floor.',
      subheadline: 'A treated booth, a Neumann on the stand and an engineer at the desk for every session.',
      primaryCtaLabel: 'Get a quote',
      primaryCtaHref: '#enquire',
      secondaryCtaLabel: 'Hear the work',
      secondaryCtaHref: '#work',
      backgroundImage: { url: '/images/studios/studio4-production-1.jpg', alt: '' },
    },
    footer: {
      companyLine: 'Studio 808 Voice is a service of Studio 808 Ltd',
      addressLine: 'Unit 11-11A Robjohns House, Navigation Road, Chelmsford CM2 6ND',
      phone: '01245 000000',
      email: 'audio@example.com',
      links: [{ _key: 'l1', label: 'Privacy', href: '/privacy' }],
    },
  },
  clips,
  credits,
} as unknown as AudioPageData
