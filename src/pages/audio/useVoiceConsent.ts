// The visitor's cookie choice for the Studio 808 Voice shell, read from and
// saved to localStorage (lib/voiceTracking.js). Accepting loads Google's tag;
// rejecting, including later from "Cookie settings", withdraws it.

import { useCallback, useEffect, useState } from 'react'
import { CONSENT_KEY, consentRecord, readConsent, type ConsentChoice } from '../../lib/voiceTracking.js'
import { loadGoogleTag, revokeGoogleTag, trackingConfigured } from './analytics'

function stored(): ConsentChoice | null {
  try { return readConsent(window.localStorage.getItem(CONSENT_KEY)) } catch { return null }
}

/** The visitor's choice, whether the banner is open, and the actions behind it. */
export function useVoiceConsent() {
  // Only in the browser: the prerendered page (scripts/buildAudio.js) never
  // contains the banner, and the app renders fresh rather than hydrating.
  const [initial] = useState<ConsentChoice | null>(() => (trackingConfigured && typeof window !== 'undefined' ? stored() : null))
  const [choice, setChoice] = useState(initial)
  const [open, setOpen] = useState(() => trackingConfigured && typeof window !== 'undefined' && initial === null)

  useEffect(() => {
    if (initial === 'granted') loadGoogleTag()
  }, [initial])

  const choose = useCallback((next: ConsentChoice) => {
    try { window.localStorage.setItem(CONSENT_KEY, consentRecord(next)) } catch { /* private mode: applies to this visit only */ }
    setChoice(next)
    setOpen(false)
    if (next === 'granted') loadGoogleTag()
    else revokeGoogleTag()
  }, [])

  return { enabled: trackingConfigured, choice, open, reopen: () => setOpen(true), choose }
}

