// Decorative waveform low in the hero: the shape of spoken word (syllable
// clusters, short gaps between words, longer breaths between phrases), not a
// music meter. A slow playhead sweeps across it. Not the player; hidden from
// assistive tech. Motion lives in audio.css and stops under reduced motion.

import { useMemo } from 'react'

const BARS = 160
const PITCH = 10
const BAR_W = 4
const H = 100

/** Small seeded PRNG so the shape is the same on every render and server. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Bar amplitudes 0..1 shaped like speech. */
function speechAmplitudes(seed = 808): number[] {
  const rnd = mulberry32(seed)
  const out: number[] = []
  let wordsLeft = 3 + Math.floor(rnd() * 4)
  while (out.length < BARS) {
    const len = 3 + Math.floor(rnd() * 7)
    const peak = 0.45 + rnd() * 0.55
    for (let i = 0; i < len && out.length < BARS; i++) {
      const hump = Math.sin(((i + 0.5) / len) * Math.PI)
      out.push(Math.max(0.06, peak * hump * (0.7 + rnd() * 0.3)))
    }
    wordsLeft--
    const gap = wordsLeft === 0 ? 4 + Math.floor(rnd() * 4) : 1 + Math.floor(rnd() * 2)
    if (wordsLeft === 0) wordsLeft = 3 + Math.floor(rnd() * 4)
    for (let i = 0; i < gap && out.length < BARS; i++) out.push(0.03)
  }
  return out
}

function barsPath(amps: number[]): string {
  return amps.map((a, i) => {
    const h = Math.max(2, a * H)
    const x = i * PITCH + (PITCH - BAR_W) / 2
    const y = (H - h) / 2
    return `M${x} ${y.toFixed(1)}h${BAR_W}v${h.toFixed(1)}h-${BAR_W}z`
  }).join('')
}

export default function Waveform() {
  const d = useMemo(() => barsPath(speechAmplitudes()), [])
  const viewBox = `0 0 ${BARS * PITCH} ${H}`
  return (
    <div className="a8-wave" aria-hidden="true">
      <div className="a8-wave-draw" style={{ position: 'absolute', inset: 0 }}>
        <svg viewBox={viewBox} preserveAspectRatio="none" focusable="false">
          <path className="a8-wave-base" d={d} />
        </svg>
        <div className="a8-wave-played">
          <svg viewBox={viewBox} preserveAspectRatio="none" focusable="false">
            <path className="a8-wave-lit" d={d} />
          </svg>
        </div>
      </div>
      <div className="a8-wave-head" />
    </div>
  )
}
