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
  { _id: 'c1', name: 'Northfield Press', logo: { url: wordmark('Northfield Press', true) }, creditType: 'audiobook', cleared: true, order: 1 },
  { _id: 'c2', name: 'Harbour FM', logo: { url: wordmark('HARBOUR FM') }, creditType: 'broadcast', cleared: true, order: 2 },
  { _id: 'c3', name: 'Kestrel Learning', logo: { url: wordmark('kestrel learning') }, creditType: 'elearning', cleared: true, order: 3 },
  { _id: 'c4', name: 'Ashdown Books', logo: { url: wordmark('Ashdown', true) }, creditType: 'audiobook', cleared: true, order: 4 },
  { _id: 'c5', name: 'Lowmoor Studios', logo: { url: wordmark('LOWMOOR') }, creditType: 'commercial', cleared: true, order: 5 },
  { _id: 'c6', name: 'The Quiet Hour', logo: { url: wordmark('The Quiet Hour', true) }, creditType: 'podcast', cleared: true, order: 6 },
  { _id: 'c7', name: 'Not cleared yet', logo: { url: wordmark('HIDDEN') }, creditType: 'broadcast', cleared: false, order: 7 },
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

export const AUDIO_FIXTURE = {
  page: {
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
      companyLine: '808 Audio, part of Studio 808',
      addressLine: 'Unit 11-11A Robjohns House, Navigation Road, Chelmsford CM2 6ND',
      phone: '01245 000000',
      email: 'audio@example.com',
      links: [{ _key: 'l1', label: 'Privacy', href: '/privacy' }],
    },
  },
  clips,
  credits,
} as unknown as AudioPageData
