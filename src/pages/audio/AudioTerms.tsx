// The service terms (/terms on voice.studio-808.com, /audio/terms elsewhere)
// from audioPage.terms, inside the AudioLayout shell. No terms in Sanity, no
// page: back to the audio home page.

import { Navigate, useOutletContext } from 'react-router-dom'
import type { AudioPageData } from '../../lib/audioPage'
import AudioHead from './AudioHead'
import BlockContent from './sections/Blocks'
import { audioPath, currentHost } from '../../lib/audioHost.js'
import { hasTerms } from './sections/has'

function formatDate(iso: string | null | undefined): string | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)))
}

export default function AudioTerms() {
  const data = useOutletContext<AudioPageData>()
  const page = data.page
  if (!hasTerms(page)) return <Navigate to={audioPath(currentHost())} replace />
  const updated = formatDate(page?.termsUpdated)

  return (
    <article className="a8-legal" aria-labelledby="a8-legal-title">
      <AudioHead data={data} route="terms" />
      <div className="a8-wrap">
        <header className="a8-legal-head">
          <h1 id="a8-legal-title" className="a8-h1">Service terms</h1>
          {updated && <p className="a8-legal-updated">Last updated <time dateTime={page?.termsUpdated ?? undefined}>{updated}</time></p>}
        </header>
        <BlockContent value={page?.terms} className="a8-prose a8-legal-body" />
      </div>
    </article>
  )
}
