import { useState, useRef } from 'react'
import { BORDER } from '../styles'

interface Props {
  images: string[]
  alt: string
}

const btnBase: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '36px',
  height: '36px',
  background: 'rgba(0,0,0,0.55)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '50%',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  zIndex: 2,
  transition: 'background 0.15s',
  lineHeight: 1,
}

export default function StudioCarousel({ images, alt }: Props) {
  const [idx, setIdx] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const prev = () => setIdx(i => (i - 1 + images.length) % images.length)
  const next = () => setIdx(i => (i + 1) % images.length)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 40) delta < 0 ? next() : prev()
    touchStartX.current = null
  }

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        aspectRatio: '4/3',
        background: 'rgba(240,237,232,0.04)',
        border: `1px solid ${BORDER}`,
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <img
        src={images[idx]}
        alt={`${alt} — photo ${idx + 1} of ${images.length}`}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      {images.length > 1 && (
        <>
          {/* Prev arrow */}
          <button
            onClick={prev}
            aria-label="Previous photo"
            style={{ ...btnBase, left: '10px' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.78)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Next arrow */}
          <button
            onClick={next}
            aria-label="Next photo"
            style={{ ...btnBase, right: '10px' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.78)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2L10 7L5 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dot indicators */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '6px',
            zIndex: 2,
          }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Go to photo ${i + 1}`}
                style={{
                  width: i === idx ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '999px',
                  background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'width 0.2s, background 0.2s',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
