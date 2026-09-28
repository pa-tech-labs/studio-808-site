// Short membership section for a studio page: heading, one-line intro, price
// line, three perks, and buttons to /membership and to Cue's join page. Copy
// and plans come from the same sources as /membership (useMembershipData);
// the choices live in lib/membershipTeaser.js.

import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import Headline from './Headline'
import { FoundingBadge, FoundingCounter, useFoundingStatus } from './FoundingBadge'
import { useMembershipData } from '../hooks/useMembershipData'
import { teaserModel } from '../lib/membershipTeaser.js'
import type { Track } from '../lib/membershipPlans.js'
import { ACCENT, BG, BORDER, F_BODY, MUTED, MUTED_LT, SURF, TEXT, btnPrimary, btnSecondary, sectionLabel } from '../styles'

const joinButton: CSSProperties = { ...btnPrimary, background: ACCENT, color: '#fff', fontWeight: 700, textAlign: 'center' }

export default function MembershipTeaser({ track }: { track: Track }) {
  const { content, plans } = useMembershipData()
  const founding = useFoundingStatus()

  // Holds its space while the copy loads so the page does not jump.
  if (!content) return <section className="section" style={{ background: BG, borderBottom: `1px solid ${BORDER}`, minHeight: '480px' }} aria-busy="true" />

  const m = teaserModel({ track, content, plans: plans?.plans, founding })

  return (
    <section id="membership" className="section" style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
      <style>{`
        .mt-perks { display: grid; grid-template-columns: 1fr; gap: 12px; margin: 28px 0 32px; padding: 0; list-style: none; }
        .mt-actions { display: flex; flex-wrap: wrap; gap: 12px; }
        @media (min-width: 760px) { .mt-perks { grid-template-columns: repeat(3, 1fr); } }
      `}</style>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        {m.eyebrow && <span style={sectionLabel}>{m.eyebrow}</span>}
        <h2 className="mh" style={{ fontSize: 'clamp(30px, 5vw, 48px)', color: TEXT, margin: '0 0 14px', letterSpacing: '-0.02em', lineHeight: 1.08 }}>
          <Headline text={m.heading} />
        </h2>
        {m.intro && <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED_LT, margin: '0 0 22px', lineHeight: 1.6, maxWidth: '640px' }}>{m.intro}</p>}

        {m.founding.show && <div><FoundingBadge remaining={m.founding.remaining} label={m.founding.label} /></div>}
        <p style={{ fontFamily: F_BODY, fontSize: '18px', fontWeight: 700, color: TEXT, margin: '0 0 4px', minHeight: '1.4em' }}>{m.priceLine}</p>
        {m.founding.show && <FoundingCounter remaining={m.founding.remaining} cap={m.founding.cap} />}
        {m.creditLine && <p style={{ fontFamily: F_BODY, fontSize: '13px', color: MUTED, margin: '4px 0 0', lineHeight: 1.6, maxWidth: '640px' }}>{m.creditLine}</p>}

        {m.perks.length > 0 && (
          <ul className="mt-perks">
            {m.perks.map(p => (
              <li key={p.title} style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px 20px' }}>
                <p style={{ fontFamily: F_BODY, fontSize: '15px', fontWeight: 700, color: TEXT, margin: p.body ? '0 0 6px' : 0, lineHeight: 1.4 }}>{p.title}</p>
                {p.body && <p style={{ fontFamily: F_BODY, fontSize: '13.5px', color: MUTED, margin: 0, lineHeight: 1.6 }}>{p.body}</p>}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-actions">
          <a href={m.joinHref} style={joinButton}>{m.joinLabel}</a>
          <Link to={m.seeHref} style={btnSecondary}>See membership</Link>
        </div>
      </div>
    </section>
  )
}
