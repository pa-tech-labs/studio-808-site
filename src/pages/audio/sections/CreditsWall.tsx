// Credits wall, directly under the hero. Only credits marked "Cleared" in
// Sanity show; the query returns all of them and the filter lives here.
// Logos sit in one static centred row when they fit, and run as a slow
// marquee only when they do not (pauses on hover and from its own button;
// a static wrapped grid under reduced motion). Credits with a talent photo
// show as "Voices we've recorded". No cleared credits, no section.

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { AudioCredit } from '../../../lib/audioPage'
import { audioImageSrcSet, audioImageUrl, audioLogoUrl } from '../image'

export default function CreditsWall({ credits }: { credits: AudioCredit[] }) {
  const cleared = credits.filter(c => c.cleared === true)
  const logos = cleared.filter(c => audioLogoUrl(c.logo, 96))
  const voices = cleared.filter(c => audioImageUrl(c.talentPhoto, 480, 600))
  if (logos.length === 0 && voices.length === 0) return null

  return (
    <section className="a8-credits" aria-label="Credits">
      {logos.length > 0 && <LogoRow credits={logos} />}
      {voices.length > 0 && <Voices credits={voices} />}
    </section>
  )
}

// Speed of the marquee, so a long row and a short one move alike.
const MARQUEE_PX_PER_SECOND = 28

function LogoRow({ credits }: { credits: AudioCredit[] }) {
  const [paused, setPaused] = useState(false)
  // Does one row of logos fit the content width? Measured from the real row
  // (logo widths come from each asset's aspect ratio, so the row has its
  // final width before any image loads). Fits: one static centred row.
  // Overflows: the edge-to-edge marquee with the row duplicated.
  const [rowWidth, setRowWidth] = useState(0)
  const [overflows, setOverflows] = useState(false)
  const rowRef = useRef<HTMLUListElement>(null)
  const boxRef = useRef<HTMLHeadingElement>(null)

  useLayoutEffect(() => {
    const row = rowRef.current
    const box = boxRef.current
    if (!row || !box) return
    const measure = () => {
      const cs = getComputedStyle(box)
      const available = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const width = row.scrollWidth
      setRowWidth(width)
      setOverflows(width > available + 1)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(row)
    ro.observe(box)
    return () => ro.disconnect()
  }, [credits])

  const row = (copy: boolean) => (
    <ul className="a8-logos-row" ref={copy ? undefined : rowRef} aria-hidden={copy || undefined}>
      {credits.map(c => {
        const style = c.logoAspect ? ({ '--a8-logo-ar': c.logoAspect } as CSSProperties) : undefined
        const img = (
          <img
            className="a8-logo"
            src={audioLogoUrl(c.logo, 96)!}
            alt={c.name}
            style={style}
            data-sized={c.logoAspect ? 'true' : undefined}
            // Intrinsic size (the 96px-tall file); CSS sets the shown height.
            width={c.logoAspect ? Math.round(96 * c.logoAspect) : undefined}
            height={c.logoAspect ? 96 : undefined}
            loading="lazy"
            decoding="async"
          />
        )
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
      <h2 className="a8-wrap a8-caption" ref={boxRef}>Recorded for</h2>
      <div className="a8-logos" data-mode={overflows ? 'marquee' : 'static'} data-paused={paused}>
        <div
          className="a8-logos-track"
          style={overflows ? ({ '--a8-mq-dur': `${Math.max(20, Math.round(rowWidth / MARQUEE_PX_PER_SECOND))}s` } as CSSProperties) : undefined}
        >
          {row(false)}
          {overflows && row(true)}
        </div>
      </div>
      {overflows && (
        <div className="a8-wrap">
          <button type="button" className="a8-logos-toggle" onClick={() => setPaused(p => !p)} aria-pressed={paused}>
            <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true" fill="currentColor">
              {paused ? <path d="M3 1.5v9l7.5-4.5z" /> : <><rect x="2.5" y="1.5" width="2.5" height="9" rx="0.5" /><rect x="7" y="1.5" width="2.5" height="9" rx="0.5" /></>}
            </svg>
            {paused ? 'Play logos' : 'Pause logos'}
          </button>
        </div>
      )}
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
            <img
              className="a8-voice-photo"
              src={audioImageUrl(c.talentPhoto, 480, 600)!}
              srcSet={audioImageSrcSet(c.talentPhoto, [240, 360, 480, 720], 4 / 5) ?? undefined}
              sizes="(min-width: 768px) 25vw, 50vw"
              alt={c.talent || c.name}
              width={480}
              height={600}
              loading="lazy"
              decoding="async"
            />
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
