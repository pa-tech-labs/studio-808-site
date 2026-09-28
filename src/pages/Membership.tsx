// /membership: Studio 808's two memberships (DJ and producer), inside the
// site's own layout. Mirrors Cue's membership page (book.studio-808.com),
// where people actually sign up: every Join button goes there, with the
// chosen track pre-selected.
//
// Copy comes from the Sanity "membershipPage" singleton, falling back to the
// bundled copy in lib/membershipPageContent.js when it is missing or
// unreachable. Plan names and prices come from Cue's public tiers endpoint,
// falling back to the tiers stored on the singleton (lib/membershipPlans.js).

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import SEO from '../components/SEO'
import Headline from '../components/Headline'
import { FoundingBadge, FoundingCounter, useFoundingStatus, type FoundingStatus } from '../components/FoundingBadge'
import { ACCENT, BG, BORDER, BORDER_SM, F_BODY, MUTED, MUTED_LT, SURF, TEXT, btnPrimary, sectionLabel } from '../styles'
import { getMembershipPage, sanityImageUrl, type SanityImage } from '../lib/sanity'
import { membershipPageContent, type MembershipPageContent, type MembershipImage, type TrackCopy } from '../lib/membershipPageContent.js'
import {
  fetchCueTiers, fillTerms, formatPounds, foundingPriceFor, joinUrl, mapSanityTiers, mergePlans, perHourLabel,
  plansForTrack, priceFromLabel, type MembershipPlan, type Track,
} from '../lib/membershipPlans.js'

const FALLBACK_IMAGES = {
  producer: '/images/studios/studio4-production-1.jpg',
  socials: '/images/studios/studio3-prodj-1.jpg',
}

/** The one red button on the page: every Join. */
const joinButton: CSSProperties = { ...btnPrimary, background: ACCENT, color: '#fff', fontWeight: 700, textAlign: 'center' }

const imageUrl = (image: MembershipImage | null | undefined, width: number) =>
  sanityImageUrl(image as SanityImage | undefined, width)

const SANITY_WAIT_MS = 3000

const trackFrom = (value: string | null): Track => (value === 'producer' ? 'producer' : 'dj')

type Plans = { plans: MembershipPlan[]; source: 'cue' | 'sanity' }

/** Copy (undefined while loading) and plans (undefined until Cue answers or gives up). */
function useMembershipData() {
  const [content, setContent] = useState<MembershipPageContent>()
  const [plans, setPlans] = useState<Plans>()

  useEffect(() => {
    let live = true
    // The Sanity client retries failed requests with backoff, so an outage
    // would hold the page blank for a long time. Past the cap, the bundled
    // copy is shown and a late answer is ignored rather than swapped in.
    const cap = new Promise<null>(resolve => setTimeout(() => resolve(null), SANITY_WAIT_MS))
    const doc = Promise.race([getMembershipPage().catch(() => null), cap])
    doc.then(d => { if (live) setContent(d ?? membershipPageContent) })
    Promise.all([doc, fetchCueTiers()]).then(([d, cue]) => {
      if (!live) return
      const stored = d?.tiers?.length ? d.tiers : membershipPageContent.tiers
      const merged = mergePlans(cue, mapSanityTiers(stored))
      if (import.meta.env.DEV && merged.source === 'sanity') console.info('[membership] Cue tiers unavailable, showing Sanity tiers')
      setPlans(merged)
    })
    return () => { live = false }
  }, [])

  return { content, plans }
}

export default function Membership() {
  const { content, plans } = useMembershipData()
  const founding = useFoundingStatus()
  const [params, setParams] = useSearchParams()
  const track = trackFrom(params.get('type'))

  const selectTrack = (t: Track) =>
    setParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('type', t)
      return next
    }, { replace: true, preventScrollReset: true })

  const c = content ?? membershipPageContent
  const copy: TrackCopy = (track === 'dj' ? c.dj : c.producer) ?? {}
  const showSocials = (c.socials?.showFor ?? ['dj']).includes(track)

  return (
    <>
      <SEO
        title={c.seoTitle || 'Membership | Studio 808 Chelmsford'}
        description={c.seoDescription || c.intro || 'Studio 808 membership for DJs and producers.'}
        canonical="/membership"
      />
      <style>{CSS}</style>

      {!content ? (
        <div style={{ minHeight: '100vh', background: BG }} aria-busy="true" />
      ) : (
        <main style={{ background: BG }}>
          {/* Hero */}
          <section className="mp-hero" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
              {c.eyebrow && <span style={sectionLabel}>{c.eyebrow}</span>}
              {c.heading && (
                <h1 className="mh" style={{ fontSize: 'clamp(36px, 7vw, 60px)', color: TEXT, margin: '0 0 18px', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
                  <Headline text={c.heading} />
                </h1>
              )}
              {c.intro && <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED_LT, lineHeight: 1.6, margin: '0 auto', maxWidth: '560px' }}>{c.intro}</p>}

              <Selector
                track={track}
                onSelect={selectTrack}
                labels={{ dj: c.selector?.djLabel || "I'm a DJ", producer: c.selector?.producerLabel || "I'm a producer" }}
                prices={plans ? { dj: priceFromLabel(plans.plans, 'dj'), producer: priceFromLabel(plans.plans, 'producer') } : null}
              />
            </div>
          </section>

          {/* Track intro + perks cards */}
          <section className="mp-section" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
              <TrackIntro copy={copy} image={track === 'producer' ? imageUrl(copy.image, 1200) ?? FALLBACK_IMAGES.producer : imageUrl(copy.image, 1200)} />
              {(copy.perks?.length ?? 0) > 0 && (
                <div style={{ marginTop: '48px' }}>
                  {copy.perksLabel && <div style={{ textAlign: 'center' }}><span style={sectionLabel}>{copy.perksLabel}</span></div>}
                  <div className="mp-grid3">
                    {copy.perks!.map((p, i) => <PerkCardView key={p._key ?? p.title ?? i} index={i} icon={p.icon} title={p.title} body={p.body} />)}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Plans */}
          <section id="plans" className="mp-section" style={{ background: SURF, borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ maxWidth: '920px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                {copy.planLabel && <span style={sectionLabel}>{copy.planLabel}</span>}
                {copy.planIntro && <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, lineHeight: 1.6, margin: '0 auto', maxWidth: '520px' }}>{copy.planIntro}</p>}
              </div>
              <PlanList track={track} plans={plans} copy={copy} founding={founding} />
            </div>
          </section>

          {/* Your set, on our socials */}
          {showSocials && c.socials && (
            <section className="mp-section" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <div className="mp-split" style={{ maxWidth: '1040px', margin: '0 auto' }}>
                <div>
                  {c.socials.eyebrow && <span style={sectionLabel}>{c.socials.eyebrow}</span>}
                  {c.socials.heading && (
                    <h2 className="mh" style={{ fontSize: 'clamp(28px, 5vw, 40px)', color: TEXT, margin: '0 0 14px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                      <Headline text={c.socials.heading} />
                    </h2>
                  )}
                  {c.socials.body && <p style={{ fontFamily: F_BODY, fontSize: '16px', color: MUTED, lineHeight: 1.65, margin: 0 }}>{c.socials.body}</p>}
                </div>
                <img
                  src={imageUrl(c.socials.image, 1200) ?? FALLBACK_IMAGES.socials}
                  alt={c.socials.imageAlt || 'A DJ on the decks at Studio 808'}
                  loading="lazy"
                  style={{ display: 'block', width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', objectPosition: 'center 45%', borderRadius: '12px', border: `1px solid ${BORDER}` }}
                />
              </div>
            </section>
          )}

          {/* FAQ */}
          {(copy.faq?.length ?? 0) > 0 && (
            <section className="mp-section" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
                <div style={{ marginBottom: '32px' }}>
                  {copy.faqLabel && <span style={sectionLabel}>{copy.faqLabel}</span>}
                  {copy.faqHeading && (
                    <h2 className="mh" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: TEXT, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                      <Headline text={copy.faqHeading} />
                    </h2>
                  )}
                </div>
                <div className="mp-grid2">
                  {copy.faq!.map((f, i) => (
                    <div key={f._key ?? f.q ?? i} style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '24px' }}>
                      <h3 style={{ fontFamily: F_BODY, fontSize: '16px', fontWeight: 700, color: TEXT, margin: '0 0 8px', lineHeight: 1.4 }}>{f.q}</h3>
                      <p style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, margin: 0, lineHeight: 1.65 }}>{f.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Join */}
          {copy.cta && (
            <section className="mp-cta" style={{ textAlign: 'center' }}>
              <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                {copy.cta.heading && (
                  <h2 className="mh" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: TEXT, margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    <Headline text={copy.cta.heading} />
                  </h2>
                )}
                {copy.cta.body && <p style={{ fontFamily: F_BODY, fontSize: '16px', color: MUTED, margin: '0 0 28px', lineHeight: 1.65 }}>{copy.cta.body}</p>}
                <a href={joinUrl(track)} style={{ ...joinButton, fontSize: '15px', padding: '16px 32px' }}>
                  {copy.cta.buttonLabel || 'Join now'}
                </a>
              </div>
            </section>
          )}
        </main>
      )}
    </>
  )
}

function Selector({ track, onSelect, labels, prices }: {
  track: Track
  onSelect: (t: Track) => void
  labels: Record<Track, string>
  prices: Record<Track, string> | null
}) {
  return (
    <div className="mp-selector" role="group" aria-label="Choose a membership">
      {(['dj', 'producer'] as const).map(t => {
        const active = track === t
        return (
          <button
            key={t}
            type="button"
            onClick={() => onSelect(t)}
            aria-pressed={active}
            style={{
              cursor: 'pointer', fontFamily: F_BODY, color: TEXT, textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              background: active ? 'rgba(240,237,232,0.08)' : 'transparent',
              border: `1px solid ${active ? 'rgba(240,237,232,0.6)' : BORDER_SM}`,
              borderRadius: '14px', padding: '18px 12px', transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <Icon name={t === 'dj' ? 'disc' : 'sliders'} color={active ? TEXT : MUTED} />
            <span style={{ fontSize: '16px', fontWeight: 700 }}>{labels[t]}</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: MUTED, minHeight: '1.2em' }}>{prices?.[t] ?? ''}</span>
          </button>
        )
      })}
    </div>
  )
}

function TrackIntro({ copy, image }: { copy: TrackCopy; image: string | null }) {
  const text = (
    <div style={{ textAlign: image ? 'left' : 'center', maxWidth: image ? undefined : '640px', margin: image ? undefined : '0 auto' }}>
      {copy.heading && (
        <h2 className="mh" style={{ fontSize: 'clamp(30px, 6vw, 48px)', color: TEXT, margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.08 }}>
          <Headline text={copy.heading} />
        </h2>
      )}
      {copy.intro && <p style={{ fontFamily: F_BODY, fontSize: '16px', color: MUTED_LT, lineHeight: 1.65, margin: 0 }}>{copy.intro}</p>}
      {(copy.highlight || (copy.stats?.length ?? 0) > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px', justifyContent: image ? 'flex-start' : 'center' }}>
          {copy.highlight && <Pill icon="tag">{copy.highlight}</Pill>}
          {copy.stats?.map(s => <Pill key={s}>{s}</Pill>)}
        </div>
      )}
    </div>
  )
  if (!image) return text
  return (
    <div className="mp-split">
      {text}
      <img src={image} alt={copy.imageAlt || ''} style={{ display: 'block', width: '100%', aspectRatio: '3 / 2', objectFit: 'cover', borderRadius: '12px', border: `1px solid ${BORDER}` }} />
    </div>
  )
}

function Pill({ icon, children }: { icon?: string; children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: F_BODY, fontSize: '13px', fontWeight: 600, color: TEXT, border: `1px solid ${BORDER_SM}`, borderRadius: '999px', padding: '8px 14px', lineHeight: 1.3, textAlign: 'left' }}>
      {icon && <Icon name={icon} size={15} color={TEXT} />}
      {children}
    </span>
  )
}

function PerkCardView({ index, icon, title, body }: { index: number; icon?: string | null; title?: string | null; body?: string | null }) {
  return (
    <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '24px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(240,237,232,0.06)', border: `1px solid ${BORDER_SM}`, marginBottom: '16px', fontFamily: F_BODY, fontWeight: 700, color: TEXT }}>
        {icon ? <Icon name={icon} color={TEXT} /> : index + 1}
      </div>
      {title && <h3 style={{ fontFamily: F_BODY, fontSize: '16px', fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>{title}</h3>}
      {body && <p style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, margin: 0, lineHeight: 1.6 }}>{body}</p>}
    </div>
  )
}

function PlanList({ track, plans, copy, founding }: { track: Track; plans: Plans | undefined; copy: TrackCopy; founding: FoundingStatus }) {
  if (!plans) {
    return (
      <div className="mp-grid2" aria-busy="true" aria-label="Loading plans">
        {[0, 1].map(i => <div key={i} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '12px', minHeight: '360px' }} />)}
      </div>
    )
  }
  const list = plansForTrack(plans.plans, track)
  if (list.length === 0) {
    return <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, textAlign: 'center' }}>No plans are open right now. Check back soon.</p>
  }
  // Producer plans group by minimum term, as on Cue: a 3-month column and a 6-month column.
  if (track === 'producer') {
    const terms = [...new Set(list.map(p => p.commitmentMonths))]
    return (
      <div className="mp-grid2">
        {terms.map(m => (
          <div key={m} style={{ display: 'grid', gap: '16px', alignContent: 'start' }}>
            {m > 0 && <p style={{ fontFamily: F_BODY, fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, margin: '0 0 -4px' }}>{m}-month commitment</p>}
            {list.filter(p => p.commitmentMonths === m).map(p => <PlanCard key={p.key} plan={p} copy={copy} founding={founding} />)}
          </div>
        ))}
      </div>
    )
  }
  return <div className="mp-grid2">{list.map(p => <PlanCard key={p.key} plan={p} copy={copy} founding={founding} />)}</div>
}

function PlanCard({ plan, copy, founding }: { plan: MembershipPlan; copy: TrackCopy; founding: FoundingStatus }) {
  const remaining = plan.track === 'dj' ? founding.dj : founding.producer
  const cap = plan.track === 'dj' ? founding.djCap : founding.producerCap
  // DJ founding is a locked discount; producer founding is recognition at the standard price.
  const foundingPrice = foundingPriceFor(plan, founding)
  const isFounding = plan.track === 'dj' ? foundingPrice != null : remaining !== 0
  const terms = fillTerms(isFounding ? copy.foundingTerms : copy.standardTerms, plan)
  const perHour = perHourLabel(plan)

  return (
    <div style={{ background: BG, border: `1px solid ${isFounding ? 'rgba(232,53,90,0.35)' : BORDER}`, borderRadius: '12px', padding: '28px 24px', display: 'flex', flexDirection: 'column' }}>
      {isFounding && copy.foundingBadgeLabel && <div><FoundingBadge remaining={remaining} label={copy.foundingBadgeLabel} /></div>}
      <h3 style={{ fontFamily: F_BODY, fontSize: '18px', fontWeight: 700, color: TEXT, margin: '0 0 8px', lineHeight: 1.3 }}>{plan.name}</h3>
      <p style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '40px', color: TEXT, margin: '0 0 4px', lineHeight: 1 }}>
        {formatPounds(foundingPrice ?? plan.monthlyPrice)}
        <span style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED }}>/mo</span>
        {foundingPrice != null && (
          <span style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, textDecoration: 'line-through', marginLeft: '8px' }}>
            <span className="mp-sr">Standard price </span>{formatPounds(plan.monthlyPrice)}
          </span>
        )}
      </p>
      {isFounding && copy.foundingPriceNote && <p style={{ fontFamily: F_BODY, fontSize: '13px', fontWeight: 600, color: TEXT, margin: '6px 0 2px' }}>{copy.foundingPriceNote}</p>}
      {isFounding && <FoundingCounter remaining={remaining} cap={cap} />}
      {perHour && <p style={{ fontFamily: F_BODY, fontSize: '13px', color: MUTED, margin: '4px 0 0' }}>{perHour}</p>}
      {plan.included.length > 0 && (
        <ul style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED_LT, margin: '16px 0 14px', padding: 0, listStyle: 'none', display: 'grid', gap: '8px' }}>
          {plan.included.map(item => (
            <li key={item} style={{ display: 'flex', gap: '10px', lineHeight: 1.5 }}>
              <span aria-hidden="true" style={{ color: TEXT, flexShrink: 0 }}>✓</span>{item}
            </li>
          ))}
        </ul>
      )}
      {copy.creditLine && <p style={{ fontFamily: F_BODY, fontSize: '12.5px', color: MUTED, margin: '0 0 6px', lineHeight: 1.6 }}>{copy.creditLine}</p>}
      {terms && <p style={{ fontFamily: F_BODY, fontSize: '12.5px', color: MUTED, margin: '0 0 22px', lineHeight: 1.6 }}>{terms}</p>}
      <a href={joinUrl(plan.track)} style={{ ...joinButton, marginTop: 'auto', display: 'block' }}>
        {copy.joinLabel || 'Join Now'}
        <span className="mp-sr">: {plan.name}</span>
      </a>
    </div>
  )
}

const ICON_PATHS: Record<string, ReactNode> = {
  mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8" /></>,
  megaphone: <><path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1z" /><path d="M17 8a5 5 0 0 1 0 8M7 14l1 5h3l-1-5" /></>,
  tag: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
  disc: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2" /></>,
  sliders: <><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></>,
}

function Icon({ name, size = 22, color }: { name: string; size?: number; color: string }) {
  const path = ICON_PATHS[name]
  if (!path) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      {path}
    </svg>
  )
}

// Mobile first: one column and a 16px gutter by default, widening from 640px and 900px.
const CSS = `
  .mp-hero { padding: 120px 16px 48px; }
  .mp-section { padding: 56px 16px; }
  .mp-cta { padding: 72px 16px 88px; }
  .mp-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 480px; margin: 32px auto 0; }
  .mp-grid2, .mp-grid3 { display: grid; grid-template-columns: 1fr; gap: 16px; }
  .mp-grid3 { margin-top: 4px; }
  .mp-split { display: grid; grid-template-columns: 1fr; gap: 28px; align-items: center; }
  .mp-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
  .mp-selector button:focus-visible, main a:focus-visible { outline: 2px solid ${TEXT}; outline-offset: 3px; }
  @media (max-width: 359px) { .mp-selector { grid-template-columns: 1fr; } }
  @media (min-width: 640px) {
    .mp-hero { padding: 152px 24px 64px; }
    .mp-section { padding: 80px 24px; }
    .mp-cta { padding: 100px 24px; }
    .mp-grid2 { grid-template-columns: 1fr 1fr; }
  }
  @media (min-width: 900px) {
    .mp-grid3 { grid-template-columns: repeat(3, 1fr); }
    .mp-split { grid-template-columns: 1fr 1fr; gap: 48px; }
  }
`
