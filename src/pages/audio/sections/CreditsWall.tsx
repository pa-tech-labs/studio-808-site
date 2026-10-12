// Credits wall, directly under the hero. Only credits marked "Cleared" in
// Sanity show; the query returns all of them and the filter lives here.
// Logos run in a slow marquee (pauses on hover and from its own button;
// a static wrapped grid under reduced motion). Credits with a talent photo
// show as "Voices we've recorded". No cleared credits, no section.

import { useState, type CSSProperties } from 'react'
import type { AudioCredit } from '../../../lib/audioPage'
import { audioImageUrl } from '../image'

export default function CreditsWall({ credits }: { credits: AudioCredit[] }) {
  const cleared = credits.filter(c => c.cleared === true)
  const logos = cleared.filter(c => audioImageUrl(c.logo, 300))
  const voices = cleared.filter(c => audioImageUrl(c.talentPhoto, 480, 600))
  if (logos.length === 0 && voices.length === 0) return null

  return (
    <section className="a8-credits" aria-label="Credits">
      {logos.length > 0 && <LogoMarquee credits={logos} />}
      {voices.length > 0 && <Voices credits={voices} />}
    </section>
  )
}

function LogoMarquee({ credits }: { credits: AudioCredit[] }) {
  const [paused, setPaused] = useState(false)
  const row = (copy: boolean) => (
    <ul className="a8-logos-row" aria-hidden={copy || undefined}>
      {credits.map(c => {
        const img = <img className="a8-logo" src={audioImageUrl(c.logo, 300)!} alt={copy ? '' : c.name} loading="lazy" decoding="async" />
        return (
          <li key={c._id}>
            {c.url
              ? <a href={c.url} target="_blank" rel="noopener noreferrer" tabIndex={copy ? -1 : undefined}>{img}</a>
              : img}
          </li>
        )
      })}
    </ul>
  )

  return (
    <div>
      <h2 className="a8-wrap a8-caption">Recorded for</h2>
      <div className="a8-logos" data-paused={paused}>
        <div className="a8-logos-track" style={{ '--a8-mq-dur': `${Math.max(48, credits.length * 9)}s` } as CSSProperties}>
          {row(false)}
          {row(true)}
        </div>
      </div>
      <div className="a8-wrap">
        <button type="button" className="a8-logos-toggle" onClick={() => setPaused(p => !p)} aria-pressed={paused}>
          <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true" fill="currentColor">
            {paused ? <path d="M3 1.5v9l7.5-4.5z" /> : <><rect x="2.5" y="1.5" width="2.5" height="9" rx="0.5" /><rect x="7" y="1.5" width="2.5" height="9" rx="0.5" /></>}
          </svg>
          {paused ? 'Play logos' : 'Pause logos'}
        </button>
      </div>
    </div>
  )
}

function Voices({ credits }: { credits: AudioCredit[] }) {
  return (
    <div className="a8-wrap a8-voices">
      <h2>Voices we've recorded</h2>
      <ul>
        {credits.map(c => (
          <li key={c._id}>
            <img className="a8-voice-photo" src={audioImageUrl(c.talentPhoto, 480, 600)!} alt="" width={480} height={600} loading="lazy" decoding="async" />
            {c.talent && <p className="a8-voice-name">{c.talent}</p>}
            <p className="a8-voice-prod">
              {c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer">{c.name}</a> : c.name}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
