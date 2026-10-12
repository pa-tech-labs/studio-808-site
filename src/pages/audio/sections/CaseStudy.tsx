// Case study (#case-study) from audioPage.caseStudy. Shows only when both
// "Show case study" and "Cleared" are ticked. Image left, story right; the
// pull quote is the one serif moment in the section.

import type { AudioPageData } from '../../../lib/audioPage'
import { audioImageUrl } from '../image'
import BlockContent from './Blocks'
import { hasCaseStudy } from './has'

export default function CaseStudy({ data }: { data: AudioPageData }) {
  const c = data.page?.caseStudy
  if (!c || !hasCaseStudy(data.page)) return null
  const img = audioImageUrl(c.image, 1000, 1250)

  return (
    <section id="case-study" className="a8-sec a8-case" aria-labelledby="a8-case-title">
      <div className={`a8-wrap a8-case-grid${img ? '' : ' a8-case-noimg'}`}>
        {img && (
          <figure className="a8-case-media">
            <img src={img} alt={c.image?.alt ?? ''} width={1000} height={1250} loading="lazy" decoding="async" />
          </figure>
        )}
        <div className="a8-case-body">
          {c.eyebrow && <p className="a8-eyebrow">{c.eyebrow}</p>}
          <h2 id="a8-case-title" className="a8-h2">{c.heading || c.client}</h2>
          {c.client && c.heading && <p className="a8-case-client">{c.client}</p>}
          <BlockContent value={c.body} />
          {c.quote && (
            <figure className="a8-quote">
              <blockquote><p>{c.quote}</p></blockquote>
              {c.quoteAttribution && <figcaption>{c.quoteAttribution}</figcaption>}
            </figure>
          )}
        </div>
      </div>
    </section>
  )
}
