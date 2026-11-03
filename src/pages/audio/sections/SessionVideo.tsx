// The engineer's session video (audioPage.sessionVideo), shown in the Process
// section. Click to play, with sound, never autoplay: the <video> is in the
// markup from the start (so the build-time prerender and crawlers see it) but
// preload="none", so nothing downloads until asked. Before the first play a
// poster with a play button and a still waveform sits over it; pressing it
// starts playback and hands over to the browser's own controls. English
// captions are on by default, and the transcript sits in a disclosure below.
//
// Analytics: 'audio:play' once, detail { clipId: 'session-video', title, mediaType: 'video' }.

import { useRef, useState } from 'react'
import type { AudioSessionVideo } from '../../../lib/audioPage'
import { clockDuration } from '../../../lib/audioSeo.js'
import { audioImageSrcSet, audioImageUrl } from '../image'

const PORTRAIT = 9 / 16

// A still, speech-shaped strip: louder in the middle of each phrase, quieter
// at the breaths. Deterministic so the prerendered markup matches.
const BARS = Array.from({ length: 36 }, (_, i) => {
  const phrase = Math.abs(Math.sin((i / 36) * Math.PI * 3))
  const grain = 0.55 + 0.45 * Math.abs(Math.sin(i * 2.399))
  return Math.max(0.16, Math.round(phrase * grain * 100) / 100)
})

/** Width / height of the poster, from its Sanity asset id ("image-<hash>-1080x1920-jpg"). */
function posterAspect(poster: AudioSessionVideo['poster']): number {
  const ref = (poster as { asset?: { _ref?: string } } | null | undefined)?.asset?._ref ?? ''
  const m = /-(\d+)x(\d+)-[a-z]+$/.exec(ref)
  return m ? Number(m[1]) / Number(m[2]) : PORTRAIT
}

/** The transcript as paragraphs: blank lines split them. */
function transcriptParagraphs(t: string | null | undefined): string[] {
  return (t ?? '').split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean)
}

export default function SessionVideo({ video, title }: { video: AudioSessionVideo; title: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const aspect = posterAspect(video.poster)
  const portrait = aspect < 1
  // Shown at up to ~400px wide (portrait) or the column width (landscape).
  const posterW = portrait ? 720 : 1280
  const posterH = Math.round(posterW / aspect)
  const posterUrl = audioImageUrl(video.poster, posterW, posterH)
  const srcSet = audioImageSrcSet(video.poster, portrait ? [400, 720, 1080] : [640, 1280, 1920], aspect)
  const duration = clockDuration(video.durationSeconds ?? NaN)
  const paragraphs = transcriptParagraphs(video.transcript)

  const play = () => {
    const el = ref.current
    if (!el) return
    setStarted(true)
    el.controls = true
    el.play().catch(() => { /* blocked or failed: the native controls are there now */ })
    window.dispatchEvent(new CustomEvent('audio:play', { detail: { clipId: 'session-video', title, mediaType: 'video' } }))
  }

  return (
    <div className="a8-session-media">
      <figure className="a8-session-frame" data-portrait={portrait} data-started={started} style={{ aspectRatio: String(aspect) }}>
        <video
          ref={ref}
          preload="none"
          playsInline
          crossOrigin="anonymous"
          poster={posterUrl ?? undefined}
          aria-label={title}
        >
          <source src={video.videoUrl!} type={video.videoMimeType || 'video/mp4'} />
          {video.captionsUrl && <track kind="captions" src={video.captionsUrl} srcLang="en" label="English" default />}
        </video>
        {!started && (
          <button type="button" className="a8-session-play" onClick={play} aria-label={`Play video: ${title}${duration ? `, ${duration}` : ''}`}>
            {posterUrl && (
              <img
                src={posterUrl}
                srcSet={srcSet ?? undefined}
                sizes={portrait ? '(min-width: 1024px) 400px, (min-width: 768px) 360px, calc(100vw - 40px)' : '(min-width: 1200px) 560px, 100vw'}
                alt=""
                width={posterW}
                height={posterH}
                loading="lazy"
                decoding="async"
              />
            )}
            <span className="a8-session-bar" aria-hidden="true">
              <span className="a8-session-glyph">
                <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 2.5v11l9.5-5.5z" fill="currentColor" /></svg>
              </span>
              <span className="a8-session-label">
                <span>Watch with sound</span>
                {duration && <span className="a8-session-time">{duration}</span>}
              </span>
              <span className="a8-session-wave">
                {BARS.map((h, i) => <i key={i} style={{ height: `${h * 100}%` }} />)}
              </span>
            </span>
          </button>
        )}
        {video.poster?.alt && <figcaption className="s8-sr">{video.poster.alt}</figcaption>}
      </figure>

      {paragraphs.length > 0 && (
        <details className="a8-session-tx">
          <summary>Read the transcript</summary>
          <div className="a8-session-tx-body">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </details>
      )}
    </div>
  )
}
