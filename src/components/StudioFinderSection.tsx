// Home page entry to the "Find your studio" wizard. Renders nothing while the
// Sanity singleton is loading, missing or disabled.

import { Link, useLocation } from 'react-router-dom'
import { BORDER, F_BODY, MUTED, SURF, TEXT, btnPrimary } from '../styles'
import { useStudioFinder } from '../hooks/useStudioFinder'
import { FINDER_PATH, finderLinkState } from '../lib/studioFinderRoute'
import Headline from './Headline'

export default function StudioFinderSection() {
  const finder = useStudioFinder()
  const location = useLocation()
  if (!finder) return null

  return (
    <section style={{ background: SURF, borderTop: `1px solid ${BORDER}`, padding: '56px 16px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        {finder.heading && (
          <h2 className="mh" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: TEXT, lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 14px' }}>
            <Headline text={finder.heading} />
          </h2>
        )}
        {finder.intro && (
          <p style={{ fontFamily: F_BODY, fontSize: '16px', color: MUTED, lineHeight: 1.65, margin: '0 auto 28px', maxWidth: '520px' }}>{finder.intro}</p>
        )}
        <Link to={FINDER_PATH} state={finderLinkState(location)} style={{ ...btnPrimary, fontSize: '15px', padding: '15px 32px' }}>
          {finder.ctaLabel || 'Find your studio'}
        </Link>
      </div>
    </section>
  )
}
