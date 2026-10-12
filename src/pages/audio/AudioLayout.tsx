// The /audio shell: its own header and footer, never the main site's Nav or
// Footer, and no links into the DJ side of the site. App.tsx leaves the main
// chrome off for every /audio path; this renders inside it via AudioRoute.

import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import type { AudioPageData } from '../../lib/audioPage'
import { AUDIO_ANCHORS } from './anchors'
import './audio.css'

const NAV = [
  { label: 'Work', id: AUDIO_ANCHORS.work },
  { label: 'Studio', id: AUDIO_ANCHORS.studio },
  { label: 'Rates', id: AUDIO_ANCHORS.rates },
  { label: 'FAQ', id: AUDIO_ANCHORS.faq },
]

export default function AudioLayout({ data }: { data: AudioPageData }) {
  return (
    <div className="a8">
      <a className="a8-skip" href="#a8-main">Skip to content</a>
      <AudioHeader />
      <main id="a8-main">
        <Outlet context={data} />
      </main>
      <AudioFooter footer={data.page?.footer} />
    </div>
  )
}

function AudioHeader() {
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
        <Link to="/audio" className="a8-mark" aria-label="808 Audio, back to the top">
          <span>808 Audio</span>
          <span className="a8-mark-tally" aria-hidden="true" />
        </Link>
        <nav className="a8-nav" aria-label="808 Audio">
          <ul>
            {NAV.map(item => (
              <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>
            ))}
          </ul>
        </nav>
        <a className="a8-btn a8-btn-solid a8-btn-sm" href={`#${AUDIO_ANCHORS.enquire}`}>Get a quote</a>
      </div>
    </header>
  )
}

function AudioFooter({ footer }: { footer: NonNullable<AudioPageData['page']>['footer'] | undefined }) {
  const links = (footer?.links ?? []).filter(l => l.label && l.href)
  return (
    <footer className="a8-footer">
      <div className="a8-wrap a8-footer-in">
        <address>
          <p className="a8-footer-company">{footer?.companyLine || '808 Audio'}</p>
          {/* PLACEHOLDER: legal entity line (registered company name and number)
              goes here once the trading entity for 808 Audio is confirmed. */}
          {footer?.addressLine && <p>{footer.addressLine}</p>}
          {footer?.phone && <a href={`tel:${footer.phone.replace(/[^\d+]/g, '')}`}>{footer.phone}</a>}
          {footer?.email && <a href={`mailto:${footer.email}`}>{footer.email}</a>}
        </address>
        {links.length > 0 && (
          <nav aria-label="Footer">
            <ul>
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
