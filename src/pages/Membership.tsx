// /membership: Studio 808's two memberships (DJ and producer), inside the
// site's own layout. Mirrors Cue's membership page (book.studio-808.com),
// where people actually sign up: every Join button goes there, with the
// chosen track pre-selected.
//
// Copy comes from the Sanity "membershipPage" singleton, falling back to the
// bundled copy in lib/membershipPageContent.js when it is missing or
// unreachable. Plan names, prices and perks come from Cue's public tiers
// endpoint, falling back to the tiers stored on the singleton
// (lib/membershipPlans.js). The same endpoint returns the producer room's
// public rate and hours, which drive "What members save" and the
// members-only hours strip; both stay hidden when Cue leaves them out.
//
// Motion: one hero sequence on load, a once-only scroll reveal on sections
// and cards, count-ups on the savings figures. All of it is CSS plus the
// IntersectionObserver in hooks/useInView.ts, and none of it runs under
// prefers-reduced-motion.

import { useEffect, useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import SEO from '../components/SEO'
import Headline from '../components/Headline'
import { FoundingLine, PlanCard, PlanFootnote, TermToggle } from '../components/PlanCards'
import { useFoundingStatus, type FoundingStatus } from '../hooks/useFoundingStatus'
import { ACCENT, BG, BORDER, BORDER_SM, F_BODY, F_HEAD, MUTED, MUTED_LT, SURF, TEXT, sectionLabel } from '../styles'
import Reveal from '../components/Reveal'
import { prefersReducedMotion, useCountUp, useInView } from '../hooks/useInView'
import { useMembershipData, type MembershipPlans } from '../hooks/useMembershipData'
import { sanityImageUrl, type SanityImage } from '../lib/sanity'
import { membershipPageContent, type MembershipImage, type TrackCopy } from '../lib/membershipPageContent.js'
import { fillMinHours } from '../lib/roomPricing.js'
import {
  clock, creditBackLine, fillTerms, formatPounds, foundingPriceFor, heroPlanKey, joinUrl, memberHoursWeek, pickTerm, planSlug,
  planTerms, planValue, plansForTrack, priceFromLabel, producerRoom, producerSavings,
  type MembershipPlan, type MembershipRoom, type SavingsRow, type Span, type Track,
} from '../lib/membershipPlans.js'

const FALLBACK_IMAGES = {
  producer: '/images/studios/studio4-production-1.jpg',
  socials: '/images/studios/studio3-prodj-1.jpg',
}

/** The hero's background, one per track. */
const HERO_IMAGES: Record<Track, string> = {
  dj: '/images/studios/studio3-prodj-2.jpg',
  producer: '/images/studios/studio4-production-1.jpg',
}

const imageUrl = (image: MembershipImage | null | undefined, width: number) =>
  sanityImageUrl(image as SanityImage | undefined, width)

const trackFrom = (value: string | null): Track => (value === 'producer' ? 'producer' : 'dj')

type Plans = MembershipPlans

export default function Membership() {
  const { content, plans } = useMembershipData()
  const founding = useFoundingStatus()
  const [params, setParams] = useSearchParams()
  const track = trackFrom(params.get('type'))
  // Producer plans show one minimum term at a time; ?term=3 or ?term=6 deep-links either.
  const term = pickTerm(plans?.plans, track, params.get('term'))
  const { hash } = useLocation()

  const setParam = (key: string, value: string) =>
    setParams(prev => {
      const next = new URLSearchParams(prev)
      next.set(key, value)
      return next
    }, { replace: true, preventScrollReset: true })
  const selectTrack = (t: Track) => setParam('type', t)
  const selectTerm = (m: number) => setParam('term', String(m))

  // A #plan-... or #savings link lands once the plans have loaded, on arrival
  // or when the hash changes in place. A plan card on the other term switches
  // the toggle to it first.
  const landed = useRef('')
  useEffect(() => {
    if (!plans || !content || !hash || landed.current === hash) return
    landed.current = hash
    const id = decodeURIComponent(hash.slice(1))
    const plan = plansForTrack(plans.plans, track).find(p => planSlug(p) === id)
    if (plan && plan.commitmentMonths !== term) selectTerm(plan.commitmentMonths)
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, content, hash])

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
          <section className="mp-hero" data-nav-hero style={{ borderBottom: `1px solid ${BORDER}` }}>
            <div className="mp-hero-media" aria-hidden="true">
              <img key={track} className="mp-hero-bg" src={HERO_IMAGES[track]} alt="" />
            </div>
            <div data-nav-hero-content style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
              {c.eyebrow && <span className="mp-seq" style={{ ...sectionLabel, '--s': 0 } as CSSProperties}>{c.eyebrow}</span>}
              {c.heading && (
                <h1 className="mh" style={{ fontSize: 'clamp(36px, 7vw, 60px)', color: TEXT, margin: '0 0 18px', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
                  <HeroHeading text={c.heading} />
                </h1>
              )}
              {c.intro && <p className="mp-seq" style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED_LT, lineHeight: 1.6, margin: '0 auto', maxWidth: '560px', '--s': 3 } as CSSProperties}>{c.intro}</p>}

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
                  {copy.perksLabel && <Reveal style={{ textAlign: 'center' }}><span style={sectionLabel}>{copy.perksLabel}</span></Reveal>}
                  <div className="mp-grid3">
                    {copy.perks!.map((p, i) => (
                      <Reveal key={p._key ?? p.title ?? i} index={i}>
                        <PerkCardView index={i} icon={p.icon} title={p.title} body={fillMinHours(p.body, plans?.minBookingHours)} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {track === 'producer' && plans && <ProducerBlocks plans={plans} />}

          {/* Plans */}
          <section id="plans" className="mp-section" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ maxWidth: '920px', margin: '0 auto' }}>
              <Reveal style={{ textAlign: 'center', marginBottom: '28px' }}>
                {copy.planLabel && <span style={sectionLabel}>{copy.planLabel}</span>}
                {copy.planIntro && <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, lineHeight: 1.6, margin: '0 auto', maxWidth: '520px' }}>{copy.planIntro}</p>}
              </Reveal>
              <PlanList track={track} term={term} onTerm={selectTerm} plans={plans} copy={copy} founding={founding} />
            </div>
          </section>

          {/* Your set, on our socials */}
          {showSocials && c.socials && (
            <section className="mp-section" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <Reveal className="mp-split" style={{ maxWidth: '1040px', margin: '0 auto' }}>
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
                  className="mp-media"
                  style={{ aspectRatio: '16 / 9', objectPosition: 'center 45%' }}
                />
              </Reveal>
            </section>
          )}

          {/* FAQ */}
          {(copy.faq?.length ?? 0) > 0 && (
            <section className="mp-section" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
                <Reveal style={{ marginBottom: '32px' }}>
                  {copy.faqLabel && <span style={sectionLabel}>{copy.faqLabel}</span>}
                  {copy.faqHeading && (
                    <h2 className="mh" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: TEXT, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                      <Headline text={copy.faqHeading} />
                    </h2>
                  )}
                </Reveal>
                <div className="mp-grid2">
                  {copy.faq!.map((f, i) => (
                    <Reveal key={f._key ?? f.q ?? i} index={i % 2}>
                      <div className="mp-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontFamily: F_BODY, fontSize: '16px', fontWeight: 700, color: TEXT, margin: '0 0 8px', lineHeight: 1.4 }}>{f.q}</h3>
                        <p style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, margin: 0, lineHeight: 1.65 }}>{f.a}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Join */}
          {copy.cta && (
            <section className="mp-cta" style={{ textAlign: 'center' }}>
              <Reveal style={{ maxWidth: '640px', margin: '0 auto' }}>
                {copy.cta.heading && (
                  <h2 className="mh" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: TEXT, margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    <Headline text={copy.cta.heading} />
                  </h2>
                )}
                {copy.cta.body && <p style={{ fontFamily: F_BODY, fontSize: '16px', color: MUTED, margin: '0 0 28px', lineHeight: 1.65 }}>{copy.cta.body}</p>}
                <a href={joinUrl(track)} className="mp-btn" style={{ fontSize: '15px', padding: '16px 32px' }}>
                  {copy.cta.buttonLabel || 'Join now'}
                </a>
              </Reveal>
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
    <div className="mp-selector mp-seq" role="group" aria-label="Choose a membership" style={{ '--s': 4 } as CSSProperties}>
      {(['dj', 'producer'] as const).map(t => {
        const active = track === t
        return (
          <button
            key={t}
            type="button"
            onClick={() => onSelect(t)}
            aria-pressed={active}
            className="mp-choice"
            style={{
              background: active ? 'rgba(240,237,232,0.1)' : 'rgba(13,13,13,0.55)',
              borderColor: active ? 'rgba(240,237,232,0.6)' : BORDER_SM,
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
  if (!image) return <Reveal>{text}</Reveal>
  return (
    <Reveal className="mp-split">
      {text}
      <img src={image} alt={copy.imageAlt || ''} className="mp-media" style={{ aspectRatio: '3 / 2' }} />
    </Reveal>
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
    <div className="mp-card" style={{ padding: '24px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(240,237,232,0.06)', border: `1px solid ${BORDER_SM}`, marginBottom: '16px', fontFamily: F_BODY, fontWeight: 700, color: TEXT }}>
        {icon ? <Icon name={icon} color={TEXT} /> : index + 1}
      </div>
      {title && <h3 style={{ fontFamily: F_BODY, fontSize: '16px', fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>{title}</h3>}
      {body && <p style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, margin: 0, lineHeight: 1.6 }}>{body}</p>}
    </div>
  )
}

function PlanList({ track, term, onTerm, plans, copy, founding }: {
  track: Track
  term: number
  onTerm: (m: number) => void
  plans: Plans | undefined
  copy: TrackCopy
  founding: FoundingStatus
}) {
  if (!plans) {
    return (
      <div className="pc-scope pc-grid" aria-busy="true" aria-label="Loading plans">
        {[0, 1].map(i => <div key={i} className="pc-card" style={{ minHeight: '420px', pointerEvents: 'none' }} />)}
      </div>
    )
  }
  const list = plansForTrack(plans.plans, track)
  if (list.length === 0) {
    return <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, textAlign: 'center' }}>No plans are open right now. Check back soon.</p>
  }

  // The room rate behind "Save £X/mo vs public": the same Cue data as "What
  // members save", so the two always agree, and absent whenever that block is.
  const rate = plans.source === 'cue' ? producerRoom(plans.plans, plans.rooms)?.rate ?? null : null
  const heroKey = heroPlanKey(plans.plans, track)
  const terms = planTerms(plans.plans, track)
  const remaining = track === 'dj' ? founding.dj : founding.producer
  const cap = track === 'dj' ? founding.djCap : founding.producerCap
  // DJ founding is a locked discount; producer founding is recognition at the standard price.
  const isFounding = track === 'dj' ? list.some(p => foundingPriceFor(p, founding) != null) : remaining !== 0

  const compareClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById('savings')
    if (!target) return
    e.preventDefault()
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(history.state, '', '#savings')
  }
  const card = (p: MembershipPlan) => {
    const value = planValue(p, rate)
    return (
      <PlanCard
        plan={p}
        price={foundingPriceFor(p, founding) ?? p.monthlyPrice}
        value={value}
        creditLine={creditBackLine(copy.creditBackLine, value.credit)}
        hero={p.key === heroKey}
        heroLabel={copy.bestValueLabel || 'Best value'}
        joinHref={joinUrl(p.track)}
        joinLabel={copy.joinLabel || 'Join Now'}
        compare={value.saving != null ? { href: '#savings', label: copy.compareLabel || 'Compare plans', onClick: compareClick } : null}
      />
    )
  }
  const grid = (items: MembershipPlan[]) => (
    <div className="pc-grid">
      {items.map((p, i) => <Reveal key={p.key} index={i}>{card(p)}</Reveal>)}
    </div>
  )

  return (
    <div key={track} className="pc-scope pc-fade">
      <FoundingLine note={isFounding ? copy.foundingPriceNote : null} remaining={remaining} cap={cap} />
      {terms.length > 1 ? (
        <>
          <TermToggle terms={terms} value={term} onChange={onTerm} label="Minimum term" />
          {/* Every term stays in the page, so each card is linkable; the one on show crossfades in. */}
          <div className="pc-stack">
            {terms.map(m => (
              <div key={m} className={`pc-pane${m === term ? ' pc-pane-on' : ''}`} inert={m !== term}>
                {grid(list.filter(p => p.commitmentMonths === m))}
              </div>
            ))}
          </div>
        </>
      ) : grid(list)}
      <PlanFootnote lines={[fillTerms(isFounding ? copy.foundingTerms : copy.standardTerms, { commitmentMonths: term }), copy.creditLine]} />
    </div>
  )
}

/** The hero heading, revealed in two beats: the lead, then the serif tail. */
function HeroHeading({ text }: { text: string }) {
  const m = text.match(/^(.*?)\*(.+)\*\s*$/)
  if (!m) return <span className="mp-seq" style={{ '--s': 1 } as CSSProperties}>{text}</span>
  return (
    <>
      <span className="mp-seq" style={{ '--s': 1 } as CSSProperties}>{m[1].trimEnd()}</span>
      {m[1].endsWith(' ') ? ' ' : null}
      <em className="mp-seq" style={{ '--s': 2 } as CSSProperties}>{m[2]}</em>
    </>
  )
}

/** The producer page's two data blocks, each hidden when Cue gave no room data. */
function ProducerBlocks({ plans }: { plans: Plans }) {
  if (plans.source !== 'cue') return null
  const room = producerRoom(plans.plans, plans.rooms)
  if (!room) return null
  const producerTierIds = plansForTrack(plans.plans, 'producer').map(p => p.key)
  return (
    <>
      <SavingsBlock plans={plans.plans} room={room} />
      <MemberHoursBlock room={room} producerTierIds={producerTierIds} />
    </>
  )
}

const money = (n: number) => formatPounds(Math.round(n * 100) / 100)
/** A counting figure in the shape of its final value: whole pounds stay whole, pence keep two places. */
const countMoney = (value: number, final: number) => formatPounds(Number.isInteger(final) ? Math.round(value) : Math.round(value * 100) / 100).replace(/^£(\d+)\.(\d)$/, '£$1.$20')
const termLabel = (r: SavingsRow) => `${r.hoursPerMonth} hours a month${r.commitmentMonths > 0 ? `, ${r.commitmentMonths}-month plan` : ''}`

function SavingsBlock({ plans, room }: { plans: MembershipPlan[]; room: MembershipRoom }) {
  const { rate, rows, featuredKey } = producerSavings(plans, room.rate)
  if (!rate || rows.length === 0) return null
  const featured = rows.find(r => r.key === featuredKey) ?? rows[0]
  const rest = rows.filter(r => r !== featured)
  return (
    <section id="savings" className="mp-section" aria-labelledby="mp-save-h" style={{ borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <Reveal style={{ marginBottom: '32px', maxWidth: '640px' }}>
          <h2 id="mp-save-h" className="mh" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: TEXT, margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            What members save
          </h2>
          <p className="mp-subline">Every plan, priced against what the same hours cost the public in {room.name || 'the studio'}.</p>
        </Reveal>
        <Reveal>
          <SavingsCard row={featured} rate={rate} featured />
        </Reveal>
        {rest.length > 0 && (
          <div className="mp-grid3" style={{ marginTop: '16px' }}>
            {rest.map((r, i) => <Reveal key={r.key} index={i}><SavingsCard row={r} rate={rate} /></Reveal>)}
          </div>
        )}
        <Reveal as="p" className="mp-footnote">
          Savings based on {room.name || 'the studio'}'s peak public rate of {money(rate)}/hr.
        </Reveal>
      </div>
    </section>
  )
}

function SavingsCard({ row, rate, featured = false }: { row: SavingsRow; rate: number; featured?: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const month = useCountUp(row.savingPerMonth, inView)
  const hour = useCountUp(row.savingPerHour, inView)
  const pct = useCountUp(row.percent, inView)
  const memberShare = Math.max(0.02, Math.min(1, row.memberPrice / row.publicCost))
  return (
    <div ref={ref} className={`mp-card mp-save${featured ? ' mp-save-hero' : ''}${inView ? ' mp-save-in' : ''}`}>
      <div className="mp-save-head">
        {featured && <span className="mp-pick">Our pick</span>}
        <h3 style={{ fontFamily: F_BODY, fontSize: featured ? '17px' : '15px', fontWeight: 700, color: TEXT, margin: 0, lineHeight: 1.35 }}>{termLabel(row)}</h3>
        <p className="mp-save-big">
          <span aria-hidden="true">{countMoney(month, row.savingPerMonth)}</span>
          <span className="mp-sr">{money(row.savingPerMonth)}</span>
          <span className="mp-save-unit"> saved a month</span>
        </p>
      </div>

      <div className="mp-save-body">
        <dl className="mp-bars">
          <div>
            <dt>{row.hoursPerMonth} hours at the public rate</dt>
            <dd>{money(row.publicCost)}</dd>
            <span className="mp-bar" aria-hidden="true"><span className="mp-bar-fill mp-bar-public" /></span>
          </div>
          <div>
            <dt>Member price</dt>
            <dd>{money(row.memberPrice)}</dd>
            <span className="mp-bar" aria-hidden="true"><span className="mp-bar-fill mp-bar-member" style={{ '--w': memberShare } as CSSProperties} /></span>
          </div>
        </dl>
        <dl className="mp-stats">
          <div>
            <dt>Your rate</dt>
            <dd>{money(row.perHour)}/hr</dd>
          </div>
          <div>
            <dt>Saved per hour</dt>
            <dd><span aria-hidden="true">{countMoney(hour, row.savingPerHour)}</span><span className="mp-sr">{money(row.savingPerHour)}</span></dd>
          </div>
          <div>
            <dt>Saving</dt>
            <dd><span aria-hidden="true">{Math.round(pct)}%</span><span className="mp-sr">{row.percent}%</span></dd>
          </div>
        </dl>
      </div>
      <span className="mp-sr">Public rate {money(rate)} an hour.</span>
    </div>
  )
}

function MemberHoursBlock({ room, producerTierIds }: { room: MembershipRoom; producerTierIds: string[] }) {
  const week = memberHoursWeek(room, producerTierIds)
  if (!week.axis || (!week.hasEvenings && !week.hasWeekends)) return null
  const [from, to] = [Math.floor(week.axis[0] / 60) * 60, Math.ceil(week.axis[1] / 60) * 60]
  const pos = (m: number) => ((m - from) / (to - from)) * 100
  const ticks: number[] = []
  for (let m = from; m <= to; m += 60) ticks.push(m)
  const heading = week.hasEvenings && week.hasWeekends
    ? 'Evenings and weekends are members only'
    : week.hasWeekends ? 'Weekends are members only' : 'Evenings are members only'
  const range = ([a, b]: Span) => `${clock(a)} to ${clock(b)}`
  const segLabel = ([a, b]: Span) => `${clock(a)}-${clock(b)}`

  return (
    <section className="mp-section" aria-labelledby="mp-hours-h" style={{ borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <Reveal style={{ marginBottom: '28px', maxWidth: '640px' }}>
          <h2 id="mp-hours-h" className="mh" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: TEXT, margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {heading}
          </h2>
          <p className="mp-subline">Members get more access to {room.name || 'the studio'}.</p>
        </Reveal>

        <Reveal className="mp-card mp-card-static mp-week">
          <div className="mp-key" aria-hidden="true">
            <span><i className="mp-swatch mp-swatch-public" />Public hours</span>
            <span><i className="mp-swatch mp-swatch-member" />Members only</span>
          </div>
          <div className="mp-week-grid">
            <div className="mp-week-row mp-ticks" aria-hidden="true">
              <span />
              <span className="mp-track">
                {ticks.map((m, i) => (
                  <span key={m} className={`mp-tick${i % 2 === 0 ? ' mp-tick-2' : ''}${i % 4 === 0 ? ' mp-tick-4' : ''}`} style={{ left: `${pos(m)}%` }}>{clock(m)}</span>
                ))}
              </span>
            </div>
            <ul className="mp-week-list">
              {week.days.map((d, i) => (
                <Reveal as="li" key={d.day} index={i} className="mp-week-row">
                  <span className="mp-day" aria-hidden="true">{d.short}</span>
                  <span className="mp-track" aria-hidden="true">
                    {d.public && (
                      <span className="mp-seg mp-seg-public" style={{ left: `${pos(d.public[0])}%`, width: `${pos(d.public[1]) - pos(d.public[0])}%` }}>
                        {pos(d.public[1]) - pos(d.public[0]) > 30 && <span>{segLabel(d.public)}</span>}
                      </span>
                    )}
                    {d.members.map(r => (
                      <span key={r[0]} className="mp-seg mp-seg-member" style={{ left: `${pos(r[0])}%`, width: `${pos(r[1]) - pos(r[0])}%` }}>
                        {pos(r[1]) - pos(r[0]) > 30 && <span>{segLabel(r)}</span>}
                      </span>
                    ))}
                  </span>
                  <span className="mp-sr">
                    {d.long}: {d.public ? `public ${range(d.public)}` : 'closed to the public'}
                    {d.members.length > 0 ? `. Members only ${d.members.map(range).join(' and ')}.` : '.'}
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
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
// One card radius (12px), one pill radius (999px), one shadow (--mp-shadow,
// with the reveal styles in index.css).
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)'
const CSS = `
  .mp-hero { position: relative; overflow: hidden; padding: 120px 16px 48px; }
  .mp-hero-media { position: absolute; inset: 0; }
  .mp-hero-media::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(13,13,13,0.8) 0%, rgba(13,13,13,0.86) 55%, ${BG} 100%); }
  .mp-hero-bg { width: 100%; height: 100%; object-fit: cover; display: block; transform-origin: 50% 40%; animation: mp-zoom 18s ${EASE_OUT} both; }
  @keyframes mp-zoom { from { transform: scale(1.12); } to { transform: scale(1); } }
  .mp-seq { display: inline-block; animation: mp-rise 700ms ${EASE_OUT} both; animation-delay: calc(var(--s, 0) * 110ms + 120ms); }
  p.mp-seq, .mp-selector.mp-seq { display: block; }
  .mp-selector.mp-seq { display: grid; }
  @keyframes mp-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

  .mp-section { padding: 56px 16px; }
  #savings, #plans, .pc-card { scroll-margin-top: 136px; }
  .mp-cta { padding: 72px 16px 88px; }
  .mp-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 480px; margin: 32px auto 0; }
  .mp-choice { cursor: pointer; font-family: ${F_BODY}; color: ${TEXT}; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; border: 1px solid; border-radius: 12px; padding: 18px 12px; backdrop-filter: blur(6px); transition: border-color 200ms ease, background-color 200ms ease; }
  .mp-grid2, .mp-grid3 { display: grid; grid-template-columns: 1fr; gap: 16px; }
  .mp-grid3 { margin-top: 4px; }
  .mp-split { display: grid; grid-template-columns: 1fr; gap: 28px; align-items: center; }
  .mp-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
  .mp-selector button:focus-visible, main a:focus-visible { outline: 2px solid ${TEXT}; outline-offset: 3px; }
  .mp-subline { font-family: ${F_HEAD}; font-style: italic; font-size: clamp(18px, 2.4vw, 22px); line-height: 1.45; color: ${MUTED_LT}; margin: 0; max-width: 60ch; }
  .mp-footnote { font-family: ${F_BODY}; font-size: 13px; color: ${MUTED}; margin: 20px 0 0; line-height: 1.6; }

  /* Reveal: fade and rise once, siblings 70ms apart */
  .mp-grid2 > .rv, .mp-grid3 > .rv { display: flex; flex-direction: column; }
  .mp-grid2 > .rv > .mp-card, .mp-grid3 > .rv > .mp-card { flex: 1; }

  /* Cards, media, pills, buttons */
  .mp-card { background: ${SURF}; border: 1px solid ${BORDER}; border-radius: 12px; box-shadow: var(--mp-shadow); transition: transform 220ms ${EASE_OUT}, border-color 220ms ease; }
  .mp-media { display: block; width: 100%; object-fit: cover; border-radius: 12px; border: 1px solid ${BORDER}; box-shadow: var(--mp-shadow); }
  .mp-btn { position: relative; isolation: isolate; overflow: hidden; display: inline-block; background: ${ACCENT}; color: ${BG}; border: none; border-radius: 999px; padding: 13px 28px; font-family: ${F_BODY}; font-size: 14px; font-weight: 700; line-height: 1; text-align: center; text-decoration: none; white-space: nowrap; cursor: pointer; }
  .mp-btn::before { content: ''; position: absolute; inset: 0; z-index: -1; background: ${TEXT}; transform: scaleX(0); transform-origin: left center; transition: transform 300ms ${EASE_OUT}; }
  .mp-pick { display: inline-block; align-self: flex-start; font-family: ${F_BODY}; font-size: 12px; font-weight: 700; color: ${BG}; background: ${ACCENT}; border-radius: 999px; padding: 5px 12px; margin-bottom: 12px; }
  @media (hover: hover) and (pointer: fine) {
    .mp-card:not(.mp-card-static):hover { transform: translateY(-4px); border-color: rgba(232,53,90,0.7); }
    .mp-btn:hover::before { transform: scaleX(1); }
    .mp-choice:hover { border-color: rgba(240,237,232,0.45) !important; }
  }
  .mp-btn:focus-visible::before { transform: scaleX(1); }

  /* What members save */
  .mp-save { padding: 24px; display: grid; gap: 20px; }
  .mp-save-head { display: flex; flex-direction: column; }
  .mp-save-big { margin: 10px 0 0; font-family: ${F_BODY}; font-weight: 700; font-size: 40px; line-height: 1; letter-spacing: -0.02em; color: ${TEXT}; font-variant-numeric: tabular-nums; }
  .mp-save-hero .mp-save-big { font-size: clamp(52px, 11vw, 88px); }
  .mp-save-unit { font-family: ${F_HEAD}; font-style: italic; font-weight: 400; font-size: 18px; letter-spacing: 0; color: ${MUTED_LT}; }
  .mp-save-hero { border-color: rgba(232,53,90,0.45); background: linear-gradient(180deg, rgba(232,53,90,0.07), rgba(232,53,90,0) 60%), ${SURF}; }
  .mp-bars { margin: 0; display: grid; gap: 14px; }
  .mp-bars > div { display: grid; grid-template-columns: 1fr auto; row-gap: 6px; font-family: ${F_BODY}; font-size: 13px; }
  .mp-bars dt { color: ${MUTED_LT}; }
  .mp-bars dd { margin: 0; color: ${TEXT}; font-weight: 700; font-variant-numeric: tabular-nums; }
  .mp-bar { grid-column: 1 / -1; height: 10px; border-radius: 999px; background: rgba(240,237,232,0.06); overflow: hidden; }
  .mp-bar-fill { display: block; height: 100%; border-radius: 999px; transform-origin: left center; transform: scaleX(0); transition: transform 900ms ${EASE_OUT}; }
  .mp-bar-public { background: rgba(240,237,232,0.32); }
  .mp-bar-member { background: ${ACCENT}; transition-delay: 150ms; }
  .mp-save-in .mp-bar-public { transform: scaleX(1); }
  .mp-save-in .mp-bar-member { transform: scaleX(var(--w)); }
  .mp-stats { margin: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; border-top: 1px solid ${BORDER}; padding-top: 16px; }
  .mp-stats dt { font-family: ${F_BODY}; font-size: 12px; color: ${MUTED}; margin-bottom: 4px; }
  .mp-stats dd { margin: 0; font-family: ${F_BODY}; font-size: 17px; font-weight: 700; color: ${TEXT}; font-variant-numeric: tabular-nums; }

  /* Members-only hours */
  .mp-week { padding: 20px 16px; }
  .mp-key { display: flex; flex-wrap: wrap; gap: 8px 20px; font-family: ${F_BODY}; font-size: 13px; color: ${MUTED_LT}; margin-bottom: 18px; }
  .mp-key span { display: inline-flex; align-items: center; gap: 8px; }
  .mp-swatch { display: inline-block; width: 22px; height: 10px; border-radius: 999px; }
  .mp-swatch-public, .mp-seg-public { background: rgba(240,237,232,0.2); }
  .mp-swatch-member, .mp-seg-member { background: ${ACCENT}; }
  .mp-week-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
  .mp-week-row { display: grid; grid-template-columns: 36px 1fr; gap: 10px; align-items: center; }
  .mp-day { font-family: ${F_BODY}; font-size: 13px; font-weight: 700; color: ${TEXT}; }
  .mp-track { position: relative; display: block; height: 30px; border-radius: 8px; background: rgba(240,237,232,0.03); }
  .mp-ticks .mp-track { height: 18px; background: none; margin-bottom: 4px; }
  .mp-tick { position: absolute; top: 0; transform: translateX(-50%); font-family: ${F_BODY}; font-size: 11px; color: ${MUTED_LT}; font-variant-numeric: tabular-nums; white-space: nowrap; }
  /* Ticks: every 4 hours on phones, every 2 from 640px */
  .mp-tick { display: none; }
  .mp-tick-4 { display: block; }
  .mp-tick:first-child { transform: none; }
  .mp-tick:last-child { transform: translateX(-100%); }
  .mp-seg { position: absolute; top: 0; bottom: 0; border-radius: 8px; display: flex; align-items: center; padding: 0 10px; overflow: hidden; transform-origin: left center; transform: scaleX(0); transition: transform 700ms ${EASE_OUT}; transition-delay: calc(var(--rv-i, 0) * 70ms + 120ms); }
  .rv-in .mp-seg { transform: scaleX(1); }
  .mp-seg > span { font-family: ${F_BODY}; font-size: 12px; font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .mp-seg-public > span { color: ${TEXT}; }
  .mp-seg-member > span { color: ${BG}; }

  @media (max-width: 359px) { .mp-selector { grid-template-columns: 1fr; } }
  @media (min-width: 640px) {
    .mp-hero { padding: 152px 24px 64px; }
    .mp-section { padding: 80px 24px; }
    .mp-cta { padding: 100px 24px; }
    .mp-grid2 { grid-template-columns: 1fr 1fr; }
    .mp-tick-2 { display: block; }
    .mp-week { padding: 28px; }
    .mp-week-row { grid-template-columns: 48px 1fr; gap: 14px; }
  }
  @media (min-width: 900px) {
    .mp-grid3 { grid-template-columns: repeat(3, 1fr); }
    .mp-split { grid-template-columns: 1fr 1fr; gap: 48px; }
    .mp-save { padding: 28px; }
    .mp-save-hero { grid-template-columns: 1fr 1.1fr; gap: 40px; align-items: center; padding: 36px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .mp-hero-bg, .mp-seq { animation: none; }
    .mp-card, .mp-btn::before, .mp-choice { transition: none; }
    .mp-card:not(.mp-card-static):hover { transform: none; }
    .mp-bar-fill, .mp-seg { transition: none; }
  }
`
