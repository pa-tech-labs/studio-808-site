// Services from audioPage.services: a two-column grid of outlined cards
// (one column on mobile). No icons: a quiet numbered eyebrow instead.

import type { AudioPageData } from '../../../lib/audioPage'
import { hasServices } from './has'

export default function Services({ data }: { data: AudioPageData }) {
  if (!hasServices(data.page)) return null
  const services = (data.page?.services ?? []).filter(s => s.title)

  return (
    <section className="a8-sec a8-services" aria-labelledby="a8-services-title">
      <div className="a8-wrap">
        <header className="a8-sec-head">
          <h2 id="a8-services-title" className="a8-h2">What we record</h2>
        </header>
        <ul className="a8-cards a8-cards-2">
          {services.map((s, i) => (
            <li key={s._key ?? i} className="a8-card">
              <p className="a8-card-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="a8-card-title">{s.title}</h3>
              {s.description && <p className="a8-card-text">{s.description}</p>}
              {s.typicalUse && (
                <p className="a8-card-use"><span>Typical use</span>{s.typicalUse}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
