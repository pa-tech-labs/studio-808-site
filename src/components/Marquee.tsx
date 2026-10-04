// The slow band of equipment and genre names under the home hero. Pure CSS:
// the list is printed twice and the pair slides left by half its width, so
// it loops without a seam. Pauses on hover and from its own button (for
// keyboard and touch); under prefers-reduced-motion it does not move at all
// and the list simply wraps.

import { useState } from 'react'

export default function Marquee({ items, label }: { items: string[]; label: string }) {
  const [paused, setPaused] = useState(false)
  if (items.length === 0) return null
  const row = (copy: boolean) => (
    <ul className="s8-mq-row" aria-hidden={copy || undefined}>
      {items.map((item, i) => <li key={`${item}-${i}`} className={i % 2 ? 's8-mq-alt' : undefined}>{item}</li>)}
    </ul>
  )
  return (
    <section className={`s8-mq${paused ? ' s8-mq-paused' : ''}`} aria-label={label}>
      <style>{CSS}</style>
      <div className="s8-mq-track" style={{ animationDuration: `${Math.max(40, items.length * 5)}s` }}>
        {row(false)}
        {row(true)}
      </div>
      <button type="button" className="s8-mq-toggle" onClick={() => setPaused(p => !p)} aria-pressed={paused} aria-label={paused ? 'Play the scrolling list' : 'Pause the scrolling list'}>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="currentColor">
          {paused ? <path d="M3 1.5v9l7.5-4.5z" /> : <><rect x="2.5" y="1.5" width="2.5" height="9" rx="0.5" /><rect x="7" y="1.5" width="2.5" height="9" rx="0.5" /></>}
        </svg>
      </button>
    </section>
  )
}

const CSS = `
  .s8-mq { position: relative; overflow: hidden; background: #0d0d0d; border-top: 1px solid rgba(240,237,232,0.08); padding: 20px 0;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
  .s8-mq-track { display: flex; width: max-content; animation: s8-mq 60s linear infinite; }
  .s8-mq:hover .s8-mq-track, .s8-mq-paused .s8-mq-track { animation-play-state: paused; }
  @keyframes s8-mq { to { transform: translateX(-50%); } }
  .s8-mq-row { display: flex; align-items: baseline; list-style: none; margin: 0; padding: 0; }
  .s8-mq-row li { display: inline-flex; align-items: center; white-space: nowrap; font-family: 'DM Sans', system-ui, sans-serif; font-weight: 700; font-size: clamp(18px, 2.2vw, 26px); letter-spacing: -0.01em; color: #f0ede8; }
  .s8-mq-row li.s8-mq-alt { font-family: 'DM Serif Display', Georgia, serif; font-style: italic; font-weight: 400; color: rgba(240,237,232,0.72); }
  .s8-mq-row li::after { content: ''; width: 6px; height: 6px; border-radius: 999px; background: #e8355a; margin: 0 clamp(18px, 2.4vw, 32px); }
  .s8-mq-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; border: 1px solid rgba(240,237,232,0.18); background: rgba(13,13,13,0.9); color: #f0ede8; cursor: pointer; opacity: 0; transition: opacity 160ms ease; }
  .s8-mq:hover .s8-mq-toggle, .s8-mq-toggle:focus-visible, .s8-mq-paused .s8-mq-toggle { opacity: 1; }
  .s8-mq-toggle:focus-visible { outline: 2px solid #f0ede8; outline-offset: 2px; }
  @media (hover: none) { .s8-mq-toggle { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) {
    .s8-mq { -webkit-mask-image: none; mask-image: none; padding: 20px 16px; }
    .s8-mq-track { animation: none; width: auto; justify-content: center; }
    .s8-mq-row { flex-wrap: wrap; justify-content: center; row-gap: 8px; }
    .s8-mq-row[aria-hidden] { display: none; }
    .s8-mq-toggle { display: none; }
  }
`
