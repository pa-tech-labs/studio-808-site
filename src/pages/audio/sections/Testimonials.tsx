// Testimonials, from audioTestimonial documents, directly after "Voices
// we've recorded". Only testimonials marked "Cleared" show, and the section
// renders nothing at all when there are none or audioPage.showTestimonials is
// off (lib/audioTestimonials.js decides both).
//
// One testimonial is an editorial pull quote: a small label in the left
// column, the quote large in serif italic on the right, the name and byline
// under a short rule. Two or three sit side by side in a grid at a smaller
// size. No carousel and no scroll reveal (the style lock has none per section).

import type { CSSProperties } from 'react'
import type { AudioPageData, AudioTestimonial } from '../../../lib/audioPage'
import { testimonialByline, testimonialsHeading, visibleTestimonials } from '../../../lib/audioTestimonials.js'
import { audioLogoUrl } from '../image'

export default function Testimonials({ data }: { data: AudioPageData }) {
  const list = visibleTestimonials(data)
  if (list.length === 0) return null
  const mode = list.length === 1 ? 'single' : 'grid'

  return (
    <section className="a8-sec a8-testi-sec" aria-labelledby="a8-testi-title">
      <div className="a8-wrap a8-testi" data-mode={mode}>
        <h2 id="a8-testi-title" className="a8-caption a8-testi-title">{testimonialsHeading(data.page)}</h2>
        <div className="a8-testi-list" data-count={Math.min(list.length, 3)}>
          {list.map(t => <Quote key={t._id} t={t} />)}
        </div>
      </div>
    </section>
  )
}

function Quote({ t }: { t: AudioTestimonial }) {
  const byline = testimonialByline(t)
  // 64px tall file, shown at 28px: sharp on 2x screens.
  const logo = audioLogoUrl(t.logo, 64)
  const style = t.logoAspect ? ({ '--a8-logo-ar': t.logoAspect } as CSSProperties) : undefined

  return (
    <figure className="a8-testi-item">
      <blockquote><p>{t.quote.trim()}</p></blockquote>
      <figcaption>
        <span className="a8-testi-who">
          <span className="a8-testi-name">{t.name}</span>
          {byline && <span className="a8-testi-by">{byline}</span>}
        </span>
        {logo && (
          // Decorative: the company is named in the byline beside it.
          <img
            className="a8-testi-logo"
            src={logo}
            alt=""
            style={style}
            width={t.logoAspect ? Math.round(64 * t.logoAspect) : undefined}
            height={t.logoAspect ? 64 : undefined}
            loading="lazy"
            decoding="async"
          />
        )}
      </figcaption>
    </figure>
  )
}
