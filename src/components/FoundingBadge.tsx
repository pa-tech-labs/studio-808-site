// Founding badge + live counter for the membership sections - a port of the
// booking app's FoundingBadge/FoundingCounter pattern, themed to THIS site's
// tokens (red accent, editorial styling), not MDS mint. Counts are fetched
// live from the booking backend's founding-status endpoint (CORS-permitted
// for this origin, scoped to that one read-only route). Fallback rule: if
// the fetch fails the number is HIDDEN and the badge stays - never a stale
// or made-up count. Everything disappears at 0 remaining.

import { useEffect, useState } from 'react'
import { ACCENT, F_BODY } from '../styles'

const STATUS_URL =
  'https://book.studio-808.com/api/membership/founding-status?tenant_id=fcf37158-bb9e-4cc3-8573-f39e8cfe06b7'

export interface FoundingStatus {
  dj: number | null       // remaining dj-track places; null = unknown (fetch failed)
  producer: number | null // remaining producer places; null = unknown
}

export function useFoundingStatus(): FoundingStatus {
  const [status, setStatus] = useState<FoundingStatus>({ dj: null, producer: null })
  useEffect(() => {
    let cancelled = false
    fetch(STATUS_URL)
      .then(r => (r.ok ? r.json() : null))
      .then(b => {
        if (cancelled || !b) return
        setStatus({
          dj: Number.isFinite(Number(b.remaining)) ? Number(b.remaining) : null,
          producer: Number.isFinite(Number(b.producer?.remaining)) ? Number(b.producer.remaining) : null,
        })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])
  return status
}

// Badge: shown while the pool is not KNOWN to be full (null = unknown keeps it).
export function FoundingBadge({ remaining, label }: { remaining: number | null; label: string }) {
  if (remaining === 0) return null
  return (
    <>
      <style>{`
        @keyframes s8FoundingGlow {
          0%, 100% { box-shadow: 0 0 6px 0 rgba(232, 53, 90, 0.22); }
          50%      { box-shadow: 0 0 14px 2px rgba(232, 53, 90, 0.42); }
        }
        .s8-founding-badge { animation: s8FoundingGlow 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .s8-founding-badge { animation: none; } }
      `}</style>
      <span
        className="s8-founding-badge"
        style={{
          display: 'inline-block', fontFamily: F_BODY, fontSize: '10.5px', fontWeight: 700,
          letterSpacing: '0.09em', textTransform: 'uppercase', fontVariant: 'small-caps',
          color: ACCENT, border: '1px solid rgba(232,53,90,0.45)', borderRadius: '999px',
          padding: '4px 11px', marginBottom: '12px',
        }}
      >
        {label}
      </span>
    </>
  )
}

// Counter: needs a REAL number - hidden when unknown (never fabricate) or 0.
export function FoundingCounter({ remaining, cap }: { remaining: number | null; cap: number }) {
  if (remaining == null || remaining <= 0) return null
  return (
    <p style={{ fontFamily: F_BODY, fontSize: '13px', color: ACCENT, fontWeight: 700, margin: '2px 0 10px' }}>
      {remaining} of {cap} founding places left
    </p>
  )
}
