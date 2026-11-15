// Membership plan cards, shared by /membership and the studio pages'
// membership teasers: the card, the one founding line per view, the term
// toggle and the footnote under the grid. The numbers come from
// lib/membershipPlans.js (planValue, foundingSummary); styles live in
// PlanCards.css under .pc-scope.

import type { CSSProperties, MouseEvent } from 'react'
import { useInView } from '../hooks/useInView'
import {
  CUE_MEMBERSHIP_URL, formatPounds, foundingSummary, planDisplayName, planSlug, termLabel,
  type DjCardModel, type MembershipPlan,
} from '../lib/membershipPlans.js'
import './PlanCards.css'

export type PlanValue = { perHour: number | null; saving: number | null; credit: number | null }

export function PlanCard({ plan, price, value, creditLine, hero, heroLabel, joinHref, joinLabel, compare }: {
  plan: MembershipPlan
  /** The price shown: the founding price while it is on offer, else the standard one.
   *  Null when Cue could not be reached: the card links to Cue's live prices instead. */
  price: number | null
  value: PlanValue
  /** The DJ card's line under the price, "£25 credit back every month, ...". */
  creditLine?: string
  hero: boolean
  heroLabel: string
  joinHref: string
  joinLabel: string
  /** The "Compare plans" link, left out when there is nothing to compare against. */
  compare?: { href: string; label: string; onClick?: (e: MouseEvent<HTMLAnchorElement>) => void } | null
}) {
  const title = planDisplayName(plan)
  const term = termLabel(plan.commitmentMonths)
  const discounted = price != null && price < plan.monthlyPrice
  const titleId = `${planSlug(plan)}-title`
  return (
    <article id={planSlug(plan)} className={`pc-card${hero ? ' pc-hero' : ''}`} aria-labelledby={titleId}>
      {hero && heroLabel && <span className="pc-best">{heroLabel}</span>}
      <div className="pc-head">
        <h3 id={titleId} className="pc-title">{title}</h3>
        {term && <span className="pc-term">{term}</span>}
      </div>

      {price == null ? <PricesLink /> : (
        <p className="pc-price">
          <span className="pc-amount">{formatPounds(price)}</span>
          <span className="pc-per">/mo</span>
          {discounted && <span className="pc-was"><span className="pc-sr">Standard price </span>{formatPounds(plan.monthlyPrice)}</span>}
        </p>
      )}
      {(value.perHour != null || value.saving != null || creditLine) && (
        <p className="pc-value">
          {value.perHour != null && <span className="pc-rate">{formatPounds(value.perHour)}/hr <span>effective</span></span>}
          {value.saving != null && <span className="pc-save">Save {formatPounds(value.saving)}/mo vs public</span>}
          {creditLine && <span className="pc-save">{creditLine}</span>}
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

/** In place of a price when Cue's live prices could not be loaded. */
function PricesLink() {
  return (
    <p className="pc-price pc-price-off">
      <a href={CUE_MEMBERSHIP_URL} className="pc-prices-link">See current prices</a>
    </p>
  )
}

/**
 * A DJ plan card, one of a set: rolling monthly or prepaid for a term. Every
 * line comes from djCardModel (lib/membershipPlans.js), so nothing here knows
 * a plan's name or price. `price` false (Cue unreachable) swaps the price
 * block for the "See current prices" link. The meter along the top shows the
 * months the plan covers out of the longest term on offer.
 */
export function DjPlanCard({ plan, model, showPrice, meterMonths, hero, heroLabel, joinHref, joinLabel }: {
  plan: MembershipPlan
  model: DjCardModel
  showPrice: boolean
  meterMonths: number
  hero: boolean
  heroLabel: string
  joinHref: string
  joinLabel: string
}) {
  const titleId = `${planSlug(plan)}-title`
  const covered = Math.min(model.termMonths, meterMonths)
  const termText = model.prepaid ? `${model.termMonths} months, paid once` : 'Month to month'
  return (
    <article id={planSlug(plan)} className={`pc-card pc-dj${hero ? ' pc-hero' : ''}`} aria-labelledby={titleId}>
      <div className="pc-dj-top">
        <div className="pc-meter" aria-hidden="true" style={{ '--n': meterMonths } as CSSProperties}>
          {Array.from({ length: meterMonths }, (_, i) => (
            <span key={i} className={i < covered ? 'pc-on' : model.prepaid ? undefined : 'pc-repeat'} style={{ '--i': i } as CSSProperties} />
          ))}
        </div>
        {hero && heroLabel && <span className="pc-best pc-best-inline">{heroLabel}</span>}
      </div>
      <p className="pc-dj-term">{termText}</p>
      <h3 id={titleId} className="pc-title">{plan.name}</h3>

      {showPrice ? (
        <div className="pc-dj-price">
          <p className="pc-price">
            <span className="pc-amount">{model.headline.amount}</span>
            <span className="pc-per">{model.headline.unit}</span>
            {model.was && <span className="pc-was"><span className="pc-sr">Standard price </span>{model.was}</span>}
          </p>
          {model.subline && <p className="pc-dj-sub">{model.subline}</p>}
        </div>
      ) : <PricesLink />}

      <ul className="pc-perks pc-dj-perks">
        {model.credit && (
          <li className="pc-dj-credit">
            <Check />
            <span><strong>{model.credit.amount}</strong><span className="pc-sr">. </span><span className="pc-dj-note">{model.credit.note}</span></span>
          </li>
        )}
        {model.discount && <li className="pc-dj-credit"><Check /><span><strong>{model.discount}</strong></span></li>}
        {model.perks.map(item => <li key={item}><Check />{item}</li>)}
      </ul>

      <div className="pc-actions">
        {showPrice && model.saving && <p className="pc-dj-saving">{model.saving}</p>}
        {model.terms && <p className="pc-dj-terms">{model.terms}</p>}
        <a href={joinHref} className="pc-join">
          {joinLabel}<span className="pc-sr">: {plan.name}</span>
        </a>
      </div>
    </article>
  )
}

function Check() {
  return (
    <span className="pc-check" aria-hidden="true">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.2 5 8.6l4.5-5" /></svg>
    </span>
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
