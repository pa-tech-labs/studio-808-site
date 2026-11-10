import type { CSSProperties } from 'react'
import { F_BODY, MUTED } from '../styles'

// "Powered by [Console lockup]", linking to getconsole.app.
//
// The lockup is the canonical cream horizontal lockup copied from the
// console-site repo (public/brand/console/). Rules from its brand.md:
//   - horizontal lockup is never smaller than 20px tall
//   - clear space of a quarter of the mark's height on every side
//
// The SVG's viewBox is "0 -723 4384.5 821.5": y=0 is the wordmark baseline,
// the mark is 723 units tall and the artwork runs 98.5 units below the
// baseline. We use those numbers to sit the wordmark on the text baseline.
const VB_W = 4384.5
const VB_H = 821.5
const MARK_H = 723
const BELOW_BASELINE = 98.5
const MIN_HEIGHT = 20

interface Props {
  /** Rendered lockup height in px. Clamped to the 20px brand minimum. */
  height?: number
  /** "Powered by" font size in px. */
  fontSize?: number
  style?: CSSProperties
}

export default function PoweredByConsole({ height = MIN_HEIGHT, fontSize = 12, style }: Props) {
  const h = Math.max(height, MIN_HEIGHT)
  const scale = h / VB_H
  const clear = Math.ceil((MARK_H * scale) / 4)

  return (
    <a
      href="https://getconsole.app"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontFamily: F_BODY,
        fontSize: `${fontSize}px`,
        lineHeight: 1,
        color: MUTED,
        textDecoration: 'none',
        display: 'inline-block',
        padding: `${clear}px`,
        ...style,
      }}
    >
      Powered by
      <img
        src="/brand/console/console-lockup-horizontal-cream.svg"
        alt="Console"
        width={Math.round(VB_W * scale * 100) / 100}
        height={h}
        style={{
          display: 'inline-block',
          height: `${h}px`,
          width: 'auto',
          marginLeft: `${clear}px`,
          verticalAlign: `${-(BELOW_BASELINE * scale).toFixed(2)}px`,
        }}
      />
    </a>
  )
}
