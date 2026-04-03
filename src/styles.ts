import type React from 'react'

export const BG   = '#0d0d0d'
export const SURF = '#161616'
export const TEXT = '#f0ede8'
export const MUTED = 'rgba(240,237,232,0.5)'
export const MUTED_LT = 'rgba(240,237,232,0.65)'
export const BORDER = 'rgba(240,237,232,0.08)'
export const BORDER_SM = 'rgba(240,237,232,0.14)'
export const ACCENT = '#e8355a'

export const F_HEAD = '"DM Serif Display", Georgia, serif'
export const F_BODY = '"DM Sans", system-ui, sans-serif'

export const sectionLabel: React.CSSProperties = {
  fontFamily: F_BODY,
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  border: '1px solid rgba(240,237,232,0.2)',
  borderRadius: '999px',
  padding: '4px 12px',
  color: 'rgba(240,237,232,0.55)',
  display: 'inline-block',
  marginBottom: '20px',
}

/** White pill — primary CTA */
export const btnPrimary: React.CSSProperties = {
  background: '#f0ede8',
  color: '#0d0d0d',
  border: 'none',
  borderRadius: '999px',
  padding: '13px 28px',
  fontFamily: F_BODY,
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
  lineHeight: 1,
  whiteSpace: 'nowrap' as const,
}

/** Outline pill — secondary CTA */
export const btnSecondary: React.CSSProperties = {
  background: 'transparent',
  color: TEXT,
  border: '1px solid rgba(240,237,232,0.3)',
  borderRadius: '999px',
  padding: '13px 28px',
  fontFamily: F_BODY,
  fontSize: '14px',
  fontWeight: 500,
  textDecoration: 'none',
  display: 'inline-block',
  lineHeight: 1,
  whiteSpace: 'nowrap' as const,
}

export const cardStyle: React.CSSProperties = {
  background: SURF,
  border: `1px solid ${BORDER}`,
  borderRadius: '12px',
  overflow: 'hidden',
}

