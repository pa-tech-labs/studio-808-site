// Membership plan cards, shared by /membership and the studio pages'
// membership teasers: the card, the one founding line per view, the term
// toggle and the footnote under the grid. The numbers come from
// lib/membershipPlans.js (planValue, foundingSummary); styles live in
// PlanCards.css under .pc-scope.

import type { CSSProperties, MouseEvent } from 'react'
import { useInView } from '../hooks/useInView'
import {
  formatPounds, foundingSummary, planDisplayName, planSlug, termLabel,
  type MembershipPlan,
} from '../lib/membershipPlans.js'
import './PlanCards.css'

export type PlanValue = { perHour: number | null; saving: number | null; vs: 'public' | 'founding' | null }

export function PlanCard({ plan, price, value, hero, heroLabel, joinHref, joinLabel, compare }: {
  plan: MembershipPlan
  /** The price shown: the founding price while it is on offer, else the standard one. */
  price: number
  value: PlanValue
  hero: boolean
  heroLabel: string
  joinHref: string
  joinLabel: string
  /** The "Compare plans" link, left out when there is nothing to compare against. */
  compare?: { href: string; label: string; onClick?: (e: MouseEvent<HTMLAnchorElement>) => void } | null
}) {
  const title = planDisplayName(plan)
  const term = termLabel(plan.commitmentMonths)
  const discounted = price < plan.monthlyPrice
  const titleId = `${planSlug(plan)}-title`
  return (
    <article id={planSlug(plan)} className={`pc-card${hero ? ' pc-hero' : ''}`} aria-labelledby={titleId}>
      {hero && heroLabel && <span className="pc-best">{heroLabel}</span>}
      <div className="pc-head">
        <h3 id={titleId} className="pc-title">{title}</h3>
        {term && <span className="pc-term">{term}</span>}
      </div>

      <p className="pc-price">
        <span className="pc-amount">{formatPounds(price)}</span>
        <span className="pc-per">/mo</span>
        {discounted && <span className="pc-was"><span className="pc-sr">Standard price </span>{formatPounds(plan.monthlyPrice)}</span>}
      </p>
      {(value.perHour != null || value.saving != null) && (
        <p className="pc-value">
          {value.perHour != null && <span className="pc-rate">{formatPounds(value.perHour)}/hr <span>effective</span></span>}
          {value.saving != null && (
            <span className="pc-save">
              Save {formatPounds(value.saving)}/mo {value.vs === 'public' ? 'vs public' : 'with the founding price'}
            </span>
          )}
        </p>
      )}

      {plan.included.length > 0 && (
        <ul className="pc-perks">
          {plan.included.map(item => (
            <li key={item}>
              <span className="pc-check" aria-hidden="true">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.2 5 8.6l4.5-5" /></svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      )}

      <div className="pc-actions">
        <a href={joinHref} className="pc-join">
          {joinLabel}<span className="pc-sr">: {title}{term ? `, ${term} plan` : ''}</span>
        </a>
        {compare && <a href={compare.href} className="pc-compare" onClick={compare.onClick}>{compare.label}</a>}
      </div>
    </article>
  )
}

/** The founding line, once per view: the note, places left, and a bar of places taken. */
export function FoundingLine({ note, remaining, cap }: { note: string | null | undefined; remaining: number | null; cap: number }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const f = foundingSummary(note, remaining, cap)
  if (!f.show) return null
  return (
    <div ref={ref} className={`pc-founding${inView ? ' pc-founding-in' : ''}`}>
      <p>{f.label}{f.count && <>, <strong>{f.count}</strong></>}</p>
      {f.taken != null && (
        <div className="pc-founding-bar" role="img" aria-label={`${f.taken} of ${f.cap} founding places taken`}>
          {Array.from({ length: f.cap }, (_, i) => (
            <span key={i} className={i < f.taken! ? 'pc-taken' : undefined}>
              <span style={{ '--i': i } as CSSProperties} />
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** The 3-month / 6-month switch. Sticky under the nav on phones. */
export function TermToggle({ terms, value, onChange, label }: { terms: number[]; value: number; onChange: (m: number) => void; label: string }) {
  const at = Math.max(0, terms.indexOf(value))
  return (
    <div className="pc-termbar pc-termbar-sticky">
      <div className="pc-toggle" role="group" aria-label={label} style={{ '--n': terms.length, '--at': at } as CSSProperties}>
        <span className="pc-thumb" aria-hidden="true" />
        {terms.map(m => (
          <button key={m} type="button" aria-pressed={m === value} onClick={() => onChange(m)}>
            {termLabel(m)}
          </button>
        ))}
      </div>
    </div>
  )
}

/** The fine print, once under the grid instead of on every card. */
export function PlanFootnote({ lines }: { lines: (string | null | undefined)[] }) {
  const shown = lines.map(l => (l ?? '').trim()).filter(Boolean)
  if (shown.length === 0) return null
  return <div className="pc-footnote">{shown.map(l => <p key={l}>{l}</p>)}</div>
}
