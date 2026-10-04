// Shared parts of the studio pages (/dj-studio, /main-production-studio):
// the room hero, the equipment spec grid and the sticky "Book this studio"
// bar on phones. Styles in StudioParts.css; motion reuses index.css
// (.s8-zoom, .s8-seq, .rv via Reveal) and is off under reduced motion.

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import Reveal from './Reveal'
import './StudioParts.css'

/**
 * A room's hero: its photo with a bottom-up scrim and film grain, the room
 * as the headline ("Studio 4") and its role as the serif subline
 * ("Producer"). `level` 1 for a page's own hero, 2 for a room inside a page.
 */
export function StudioHero({ id, image, imageAlt, room, role, eyebrow, lede, meta, actions, level = 1 }: {
  id?: string
  image: string
  imageAlt: string
  room: string
  role: string
  eyebrow?: ReactNode
  lede?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  level?: 1 | 2
}) {
  const Title = level === 1 ? 'h1' : 'h2'
  const seq = (s: number) => ({ '--s': s } as CSSProperties)
  return (
    <section id={id} className={`sh-hero${level === 2 ? ' sh-hero-sub' : ''}`} style={{ scrollMarginTop: '72px' }} data-nav-hero={level === 1 || undefined}>
      <div className="sh-media">
        <img className="s8-zoom" src={image} alt={imageAlt} fetchPriority={level === 1 ? 'high' : 'auto'} loading={level === 1 ? 'eager' : 'lazy'} />
      </div>
      <span className="s8-grain" aria-hidden="true" />
      <div className="sh-inner" data-nav-hero-content>
        {eyebrow && <div className="s8-seq" style={seq(0)}>{eyebrow}</div>}
        <Title className="sh-title s8-seq" style={seq(1)}>{room}</Title>
        {role && <p className="sh-role s8-subline s8-seq" style={seq(2)}>{role}</p>}
        {lede && <p className="sh-lede s8-seq" style={seq(3)}>{lede}</p>}
        {meta && <div className="sh-meta s8-seq" style={seq(3)}>{meta}</div>}
        {actions && <div className="sh-actions s8-seq" style={seq(4)}>{actions}</div>}
      </div>
    </section>
  )
}

/** The equipment list as a two-column spec grid, rows revealing 70ms apart. */
export function SpecGrid({ items, heading = 'Equipment', level = 3 }: { items: string[]; heading?: string; level?: 2 | 3 }) {
  if (items.length === 0) return null
  const Heading = level === 2 ? 'h2' : 'h3'
  return (
    <>
      <Heading className="spec-head">{heading}</Heading>
      <ul className="spec-grid">
        {items.map((item, i) => <Reveal key={item} as="li" index={i}>{item}</Reveal>)}
      </ul>
    </>
  )
}

export type StickyRoom = { id: string; room: string; price: string; href: string }

/**
 * Phones only: a bar pinned to the bottom with the Book button for the room
 * on screen. It shows while any room's section is in view (so it stays out
 * of the way of the page header, the membership block and the footer) and,
 * on a page with several rooms, follows the one taking up most of the
 * screen. While it shows, --s8-bottom-bar lifts the chat button above it.
 */
export function StickyBook({ rooms }: { rooms: StickyRoom[] }) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const ratios = new Map<string, number>()
    const io = new IntersectionObserver(entries => {
      for (const e of entries) ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)
      let best: string | null = null
      let max = 0
      for (const [id, r] of ratios) if (r > max) { max = r; best = id }
      setActive(max > 0 ? best : null)
    // Only the middle band of the screen counts, so the bar waits until a
    // room fills the view rather than peeking in at the bottom edge.
    }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: '-35% 0px -35% 0px' })
    for (const r of rooms) {
      const el = document.getElementById(r.id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [rooms])

  const room = rooms.find(r => r.id === active) ?? null
  const shown = room ?? rooms[0]

  useEffect(() => {
    const root = document.documentElement
    if (room && window.matchMedia('(max-width: 639px)').matches) root.style.setProperty('--s8-bottom-bar', '76px')
    else root.style.removeProperty('--s8-bottom-bar')
    return () => { root.style.removeProperty('--s8-bottom-bar') }
  }, [room])

  if (!shown) return null
  return (
    <>
      <div className="sb-pad" aria-hidden="true" />
      <div className={`sb-bar${room ? ' sb-on' : ''}`} inert={!room}>
        <span className="sb-text">
          <span className="sb-room">{shown.room}</span>
          {shown.price && <span className="sb-price">{shown.price}</span>}
        </span>
        <a href={shown.href} className="s8-btn">Book this studio<span className="s8-sr">: {shown.room}</span></a>
      </div>
    </>
  )
}
