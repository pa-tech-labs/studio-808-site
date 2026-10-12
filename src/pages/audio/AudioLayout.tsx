// The Studio 808 Voice shell: its own header and footer, never the main site's Nav
// or Footer, and no links into the DJ side of the site. App.tsx leaves the
// main chrome off for the audio tree; this renders inside it via AudioRoute.
// Paths come from lib/audioHost.js: / and /terms on voice.studio-808.com,
// /audio and /audio/terms elsewhere.

import { useEffect, useState, type MouseEvent } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import type { AudioPageData } from '../../lib/audioPage'
import { AUDIO_ANCHORS, scrollToAnchor } from './anchors'
import { forwardAudioAnalytics } from './analytics'
import { audioPageOf, audioPath, currentHost } from '../../lib/audioHost.js'
import { hasEnquiry, hasFaqs, hasRates, hasRoom, hasShowreel, hasTerms } from './sections/has'
import './audio.css'
import './sections/sections.css'

// Header links, each shown only when its section renders.
const NAV = [
  { label: 'Work', id: AUDIO_ANCHORS.work, has: hasShowreel },
  { label: 'Studio', id: AUDIO_ANCHORS.studio, has: (d: AudioPageData) => hasRoom(d.page) },
  { label: 'Rates', id: AUDIO_ANCHORS.rates, has: (d: AudioPageData) => hasRates(d.page) },
  { label: 'FAQ', id: AUDIO_ANCHORS.faq, has: (d: AudioPageData) => hasFaqs(d.page) },
]

export default function AudioLayout({ data }: { data: AudioPageData }) {
  useEffect(() => forwardAudioAnalytics(), [])
  const { pathname } = useLocation()
  const host = currentHost()
  const onHome = audioPageOf(host, pathname) === 'home'
  const nav = NAV.filter(n => n.has(data))
  const quote = hasEnquiry(data.page)

  // Every in-page "#..." link (header, hero buttons, mini-player) scrolls
  // smoothly to its section below the sticky header.
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as HTMLElement).closest('a')
    const href = a?.getAttribute('href') ?? ''
    if (!href.startsWith('#') || href.length < 2) return
    if (href === '#a8-main') return
    if (scrollToAnchor(decodeURIComponent(href.slice(1)))) e.preventDefault()
  }

  return (
    <div className="a8" onClick={onClick}>
      <a className="a8-skip" href="#a8-main">Skip to content</a>
      <AudioHeader nav={nav} quote={quote} onHome={onHome} />
      <main id="a8-main">
        <Outlet context={data} />
      </main>
      <AudioFooter footer={data.page?.footer} terms={hasTerms(data.page)} />
    </div>
  )
}

/** On the home page a link is "#id"; elsewhere in the shell (terms) it goes back to home#id. */
function AnchorLink({ id, onHome, className, children }: { id: string; onHome: boolean; className?: string; children: string }) {
  return onHome
    ? <a className={className} href={`#${id}`}>{children}</a>
    : <Link className={className} to={{ pathname: audioPath(currentHost()), hash: `#${id}` }}>{children}</Link>
}

function AudioHeader({ nav, quote, onHome }: { nav: typeof NAV; quote: boolean; onHome: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="a8-header" data-scrolled={scrolled}>
      <div className="a8-wrap a8-header-in">
        <Link to={audioPath(currentHost())} className="a8-mark" aria-label="Studio 808 Voice, back to the top">
          {/* The Studio 808 logo, as on the main site, plus "Voice". */}
          <img className="a8-mark-logo" src="/images/logo.png" alt="" width={662} height={307} decoding="async" />
          <span className="a8-mark-word" aria-hidden="true">
            Voice
            <span className="a8-mark-tally" />
          </span>
        </Link>
        <nav className="a8-nav" aria-label="Studio 808 Voice" data-count={nav.length}>
          {nav.length > 0 && (
            <ul>
              {nav.map(item => (
                <li key={item.id}><AnchorLink id={item.id} onHome={onHome}>{item.label}</AnchorLink></li>
              ))}
            </ul>
          )}
        </nav>
        {quote && <AnchorLink id={AUDIO_ANCHORS.enquire} onHome={onHome} className="a8-btn a8-btn-solid a8-btn-sm">Get a quote</AnchorLink>}
      </div>
    </header>
  )
}

function AudioFooter({ footer, terms }: { footer: NonNullable<AudioPageData['page']>['footer'] | undefined; terms: boolean }) {
  const links = (footer?.links ?? []).filter(l => l.label && l.href)
  return (
    <footer className="a8-footer">
      <div className="a8-wrap a8-footer-in">
        <address>
          <p className="a8-footer-company">{footer?.companyLine || 'Studio 808 Voice'}</p>
          {/* PLACEHOLDER: legal entity line (registered company name and number)
              goes here once the trading entity for Studio 808 Voice is confirmed. */}
          {footer?.addressLine && <p>{footer.addressLine}</p>}
          <p className="a8-footer-local">Recording studio in Chelmsford, Essex</p>
          {footer?.phone && <a href={`tel:${footer.phone.replace(/[^\d+]/g, '')}`}>{footer.phone}</a>}
          {footer?.email && <a href={`mailto:${footer.email}`}>{footer.email}</a>}
        </address>
        {(links.length > 0 || terms) && (
          <nav aria-label="Footer">
            <ul>
              {terms && <li><Link to={audioPath(currentHost(), 'terms')}>Service terms</Link></li>}
              {links.map((l, i) => (
                <li key={l._key ?? i}><a href={l.href!}>{l.label}</a></li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </footer>
  )
}
