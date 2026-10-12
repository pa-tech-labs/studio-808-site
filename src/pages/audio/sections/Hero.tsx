import type { CSSProperties } from 'react'
import type { AudioPage } from '../../../lib/audioPage'
import { audioImageUrl } from '../image'
import Waveform from './Waveform'

/** Full-viewport hero from audioPage.hero. Copy enters in order (--i). */
export default function Hero({ hero }: { hero: AudioPage['hero'] }) {
  if (!hero) return null
  const bg = audioImageUrl(hero.backgroundImage, 2000)
  let i = 0

  return (
    <section className="a8-hero" aria-labelledby="a8-hero-title">
      {bg && (
        <div className="a8-hero-media">
          <img src={bg} alt={hero.backgroundImage?.alt ?? ''} fetchPriority="high" decoding="async" />
        </div>
      )}
      <div className="a8-hero-shade" />

      <div className="a8-wrap a8-hero-copy">
        {hero.eyebrow && <p className="a8-eyebrow a8-in" style={{ '--i': i++ } as CSSProperties}>{hero.eyebrow}</p>}
        <h1 id="a8-hero-title" className="a8-in" style={{ '--i': i++ } as CSSProperties}>{hero.headline}</h1>
        {hero.subheadline && <p className="a8-hero-sub a8-in" style={{ '--i': i++ } as CSSProperties}>{hero.subheadline}</p>}
        {(hero.primaryCtaLabel || hero.secondaryCtaLabel) && (
          <div className="a8-hero-ctas a8-in" style={{ '--i': i++ } as CSSProperties}>
            {hero.primaryCtaLabel && hero.primaryCtaHref && (
              <a className="a8-btn a8-btn-solid" href={hero.primaryCtaHref}>{hero.primaryCtaLabel}</a>
            )}
            {hero.secondaryCtaLabel && hero.secondaryCtaHref && (
              <a className="a8-btn a8-btn-quiet" href={hero.secondaryCtaHref}>{hero.secondaryCtaLabel}</a>
            )}
          </div>
        )}
      </div>

      <div className="a8-wrap">
        <div className="a8-hero-wave"><Waveform /></div>
      </div>
    </section>
  )
}
