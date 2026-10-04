// Short membership section for a studio page: heading, one-line intro, three
// perks and a link to /membership on one side; the founding line and the
// track's "Best value" plan card (the same card as /membership) on the other.
// Copy and plans come from the same sources as /membership
// (useMembershipData); the choices live in lib/membershipTeaser.js.

import type { MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Headline from './Headline'
import { FoundingLine, PlanCard, PlanFootnote } from './PlanCards'
import { useFoundingStatus } from '../hooks/useFoundingStatus'
import { useMembershipData } from '../hooks/useMembershipData'
import { teaserModel } from '../lib/membershipTeaser.js'
import { fillTerms, foundingPriceFor, planValue, producerRoom, type Track } from '../lib/membershipPlans.js'
import { BG, BORDER, F_BODY, MUTED, MUTED_LT, TEXT, btnSecondary, sectionLabel } from '../styles'

export default function MembershipTeaser({ track }: { track: Track }) {
  const { content, plans } = useMembershipData()
  const founding = useFoundingStatus()
  const navigate = useNavigate()

  // Holds its space while the copy loads so the page does not jump.
  if (!content) return <section className="section" style={{ background: BG, borderBottom: `1px solid ${BORDER}`, minHeight: '480px' }} aria-busy="true" />

  const m = teaserModel({ track, content, plans: plans?.plans, founding })
  const plan = plans?.plans.find(p => p.key === m.heroKey)
  // The same room rate as /membership's "What members save", so the numbers match.
  const rate = plans?.source === 'cue' ? producerRoom(plans.plans, plans.rooms)?.rate ?? null : null
  const value = plan ? planValue(plan, rate, founding) : null
  const foundingPrice = plan ? foundingPriceFor(plan, founding) : null
  const isFounding = m.track === 'dj' ? foundingPrice != null : m.founding.remaining !== 0
  const compareHref = `${m.seeHref}#savings`
  const goCompare = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    navigate(compareHref)
  }

  return (
    <section id="membership" className="section" style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
      <style>{`
        .mt-wrap { max-width: 1040px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 40px; align-items: center; }
        .mt-perks { display: grid; gap: 14px; margin: 28px 0 32px; padding: 0; list-style: none; }
        .mt-perks li { display: flex; gap: 12px; align-items: flex-start; }
        .mt-perks .mt-mark { margin-top: 1px; width: 22px; height: 22px; font-family: var(--pc-body); font-size: 12px; font-weight: 700; }
        .mt-plan { width: 100%; max-width: 440px; justify-self: center; }
        @media (min-width: 900px) { .mt-wrap { grid-template-columns: 1.1fr 1fr; gap: 64px; } .mt-plan { justify-self: end; } }
      `}</style>
      <div className="mt-wrap pc-scope">
        <div>
          {m.eyebrow && <span style={sectionLabel}>{m.eyebrow}</span>}
          <h2 className="mh" style={{ fontSize: 'clamp(30px, 5vw, 48px)', color: TEXT, margin: '0 0 14px', letterSpacing: '-0.02em', lineHeight: 1.08 }}>
            <Headline text={m.heading} />
          </h2>
          {m.intro && <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED_LT, margin: 0, lineHeight: 1.6, maxWidth: '560px' }}>{m.intro}</p>}

          {m.perks.length > 0 && (() => {
            const List = m.perksAreSteps ? 'ol' : 'ul'
            return (
              <List className="mt-perks">
                {m.perks.map((p, i) => (
                  <li key={p.title}>
                    <span className="pc-check mt-mark" aria-hidden="true">
                      {m.perksAreSteps ? i + 1 : (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.2 5 8.6l4.5-5" /></svg>
                      )}
                    </span>
                    <span style={{ fontFamily: F_BODY, fontSize: '15px', lineHeight: 1.4 }}>
                      <span style={{ display: 'block', fontWeight: 700, color: TEXT }}>{p.title}</span>
                      {p.body && <span style={{ display: 'block', marginTop: '3px', color: MUTED, fontSize: '14px', lineHeight: 1.55 }}>{p.body}</span>}
                    </span>
                  </li>
                ))}
              </List>
            )
          })()}

          <Link to={m.seeHref} style={btnSecondary}>See all plans</Link>
        </div>

        <div className="mt-plan">
          {m.founding.show && <FoundingLine note={m.founding.note} remaining={m.founding.remaining} cap={m.founding.cap} />}
          {plan && value ? (
            <div className="pc-fade">
              <PlanCard
                plan={plan}
                price={foundingPrice ?? plan.monthlyPrice}
                value={value}
                hero
                heroLabel={m.bestValueLabel}
                joinHref={m.joinHref}
                joinLabel={m.planJoinLabel}
                compare={value.vs === 'public' ? { href: compareHref, label: m.compareLabel, onClick: goCompare } : null}
              />
              <PlanFootnote lines={[fillTerms(isFounding ? m.foundingTerms : m.terms, plan), m.creditLine]} />
            </div>
          ) : (
            <div className="pc-card" style={{ minHeight: '420px', pointerEvents: 'none' }} aria-busy="true" aria-label="Loading plans" />
          )}
        </div>
      </div>
    </section>
  )
}
