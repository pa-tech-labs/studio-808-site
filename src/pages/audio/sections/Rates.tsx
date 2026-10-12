// Rates (#rates) from audioPage.rates: intro, tier cards (the featured tier
// gets the accent outline) and the VAT note. Prices are free text, shown as
// written in Sanity.

import type { AudioPageData } from '../../../lib/audioPage'
import { AUDIO_ANCHORS } from '../anchors'
import { hasRates } from './has'

export default function Rates({ data }: { data: AudioPageData }) {
  const r = data.page?.rates
  if (!r || !hasRates(data.page)) return null
  const tiers = (r.tiers ?? []).filter(t => t.name)

  return (
    <section id={AUDIO_ANCHORS.rates} className="a8-sec a8-rates" aria-labelledby="a8-rates-title">
      <div className="a8-wrap">
        <header className="a8-sec-head">
          <h2 id="a8-rates-title" className="a8-h2">Rates</h2>
          {r.intro && <p className="a8-lead">{r.intro}</p>}
        </header>
        <ul className="a8-cards a8-tiers" data-count={tiers.length}>
          {tiers.map((t, i) => (
            <li key={t._key ?? i} className="a8-card a8-tier" data-featured={t.featured ? 'true' : undefined}>
              <h3 className="a8-card-title">{t.name}</h3>
              {(t.price || t.unit) && (
                <p className="a8-tier-price">
                  {t.price && <span className="a8-tier-amount">{t.price}</span>}
                  {t.unit && <span className="a8-tier-unit">{t.unit}</span>}
                </p>
              )}
              {(t.includes ?? []).filter(Boolean).length > 0 && (
                <ul className="a8-tier-includes">
                  {(t.includes ?? []).filter(Boolean).map((x, j) => <li key={j}>{x}</li>)}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <p className="a8-vat">{r.vatNote || 'All prices exclusive of VAT at 20%'}</p>
      </div>
    </section>
  )
}
