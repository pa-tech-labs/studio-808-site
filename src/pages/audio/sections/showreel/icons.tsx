// The showreel's glyphs: one 16px grid, 1.5px strokes or solid fills.

const base = { width: 16, height: 16, viewBox: '0 0 16 16', 'aria-hidden': true, focusable: false } as const

export const PlayIcon = ({ size = 16 }: { size?: number }) => (
  <svg {...base} width={size} height={size} fill="currentColor"><path d="M4.5 2.6v10.8a.6.6 0 0 0 .9.5l8.6-5.4a.6.6 0 0 0 0-1L5.4 2.1a.6.6 0 0 0-.9.5z" /></svg>
)

export const PauseIcon = ({ size = 16 }: { size?: number }) => (
  <svg {...base} width={size} height={size} fill="currentColor"><rect x="3.5" y="2.5" width="3" height="11" rx="0.6" /><rect x="9.5" y="2.5" width="3" height="11" rx="0.6" /></svg>
)

export const WaveIcon = () => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 7v2M5 4.5v7M8 2.5v11M11 5v6M14 7v2" /></svg>
)

export const FilmIcon = () => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1" /><path d="M6.5 6v4l3.5-2z" fill="currentColor" stroke="none" /></svg>
)

export const SpeakerIcon = ({ muted }: { muted: boolean }) => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 6h2.5L8.5 3v10L5 10H2.5z" fill="currentColor" stroke="none" />
    {muted ? <path d="M11 6l3.5 4M14.5 6L11 10" /> : <path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.8a6 6 0 0 1 0 8.4" />}
  </svg>
)

export const FullscreenIcon = () => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" /></svg>
)

export const TickIcon = () => (
  <svg {...base} width={12} height={12} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7" /></svg>
)
