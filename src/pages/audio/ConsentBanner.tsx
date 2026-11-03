// The Studio 808 Voice cookie banner (UK GDPR / PECR). Shown only when a
// Google tag is configured (analytics.ts), and only in the Voice shell.
// Accept and Reject sit side by side at the same size; nothing loads until
// Accept. The choice is kept for six months (lib/voiceTracking.js), and
// "Cookie settings" in the footer reopens the banner to change it. State
// lives in useVoiceConsent, held by AudioLayout.

import { useEffect, useRef } from 'react'
import type { ConsentChoice } from '../../lib/voiceTracking.js'

const PRIVACY_URL = 'https://www.studio-808.com/privacy'

export default function ConsentBanner({ open, choice, choose }: {
  open: boolean; choice: ConsentChoice | null; choose: (c: ConsentChoice) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  // Reopened from the footer: move focus in so keyboard users land on it.
  useEffect(() => {
    if (open && choice !== null) ref.current?.focus()
  }, [open, choice])

  if (!open) return null
  return (
    <div ref={ref} className="a8-consent-banner" role="region" aria-label="Cookie choice" aria-describedby="a8-consent-text" tabIndex={-1}>
      <p id="a8-consent-text">
        Can we use Google Analytics and Google Ads cookies? They show us how people find this page and which ads lead to enquiries. Nothing is set unless you accept.{' '}
        <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">Privacy policy</a>
      </p>
      <div className="a8-consent-actions">
        <button type="button" className="a8-btn a8-btn-quiet a8-btn-sm" onClick={() => choose('denied')}>Reject</button>
        <button type="button" className="a8-btn a8-btn-quiet a8-btn-sm" onClick={() => choose('granted')}>Accept</button>
      </div>
      {choice && <p className="a8-consent-now">Currently: {choice === 'granted' ? 'accepted' : 'rejected'}.</p>}
    </div>
  )
}
