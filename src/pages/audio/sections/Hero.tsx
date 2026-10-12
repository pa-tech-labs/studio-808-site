import type { CSSProperties } from 'react'
import type { AudioPage } from '../../../lib/audioPage'
import { audioImageSrcSet, audioImageUrl } from '../image'
import Waveform from './Waveform'

/** Full-viewport hero from audioPage.hero. Copy enters in order (--i). */
export default function Hero({ hero, size }: { hero: AudioPage['hero']; size?: AudioPage['heroImageSize'] }) {
  if (!hero) return null
  // The LCP element: eager, high priority, real dimensions, sized per screen
  // and never upscaled past the original.
  const original = size?.width && size?.height ? { w: size.width, h: size.height } : { w: 2000, h: 1333 }
  const widths = [640, 960, 1280, 1600, 2000].filter(w => w <= original.w)
  if (!widths.includes(original.w) && original.w < 2000) widths.push(original.w)
  const bg = audioImageUrl(hero.backgroundImage, Math.min(1600, original.w))
  let i = 0

  return (
    <section className="a8-hero" aria-labelledby="a8-hero-title">
      {bg && (
        <div className="a8-hero-media">
          <img
            src={bg}
            srcSet={audioImageSrcSet(hero.backgroundImage, widths) ?? undefined}
            sizes="100vw"
            alt={hero.backgroundImage?.alt || hero.headline || 'Studio 808 Voice recording studio'}
            width={original.w}
            height={original.h}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
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
