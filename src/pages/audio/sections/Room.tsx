// The room (#studio) from audioPage.room: heading and text, a gallery that
// opens in a lightbox, then the kit: gear list and specs. Quiet and factual,
// for producers checking what they will be recording on.

import { useRef, useState } from 'react'
import type { AudioPageData } from '../../../lib/audioPage'
import { AUDIO_ANCHORS } from '../anchors'
import { audioImageSrcSet, audioImageUrl } from '../image'
import { hasRoom } from './has'

export default function Room({ data }: { data: AudioPageData }) {
  const r = data.page?.room
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  if (!r || !hasRoom(data.page)) return null

  const gallery = (r.gallery ?? []).filter(g => audioImageUrl(g, 400)).slice(0, 5)
  const gear = (r.gearList ?? []).filter(Boolean)
  const specs = (r.specs ?? []).filter(s => s.label && s.value)

  const show = (i: number) => {
    setOpen(i)
    if (!dialogRef.current?.open) dialogRef.current?.showModal()
  }
  const step = (d: number) => setOpen(i => (i === null ? 0 : (i + d + gallery.length) % gallery.length))
  const current = open === null ? null : gallery[open]
  const altOf = (g: { alt?: string | null }, i: number) => g.alt || `${r.heading || 'The room'}, photo ${i + 1} of ${gallery.length}`

  return (
    <section id={AUDIO_ANCHORS.studio} className="a8-sec a8-room" aria-labelledby="a8-room-title">
      <div className="a8-wrap">
        <header className="a8-sec-head">
          <h2 id="a8-room-title" className="a8-h2">{r.heading || 'The room'}</h2>
          {r.body && <p className="a8-lead">{r.body}</p>}
        </header>

        {gallery.length > 0 && (
          <ul className="a8-gallery" data-count={gallery.length}>
            {gallery.map((g, i) => (
              <li key={g._key ?? i}>
                <button type="button" onClick={() => show(i)} aria-label={`View larger: ${altOf(g, i)}`}>
                  <img
                    src={audioImageUrl(g, i === 0 ? 1200 : 700, i === 0 ? 900 : 525)!}
                    srcSet={audioImageSrcSet(g, i === 0 ? [600, 900, 1200, 1600] : [360, 540, 700, 1000], 4 / 3) ?? undefined}
                    sizes={i === 0 ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 50vw'}
                    alt={altOf(g, i)}
                    width={i === 0 ? 1200 : 700}
                    height={i === 0 ? 900 : 525}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}

        {(gear.length > 0 || specs.length > 0) && (
          <div className="a8-kit">
            {specs.length > 0 && (
              <div>
                <h3 className="a8-h3">Specs</h3>
                <dl className="a8-specs">
                  {specs.map((s, i) => (
                    <div key={s._key ?? i}><dt>{s.label}</dt><dd>{s.value}</dd></div>
                  ))}
                </dl>
              </div>
            )}
            {gear.length > 0 && (
              <div>
                <h3 className="a8-h3">Gear</h3>
                <ul className="a8-gear">
                  {gear.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {gallery.length > 0 && (
        <dialog
          ref={dialogRef}
          className="a8-lightbox"
          aria-label="Photos of the room"
          onClose={() => setOpen(null)}
          onClick={e => { if (e.target === e.currentTarget) dialogRef.current?.close() }}
          onKeyDown={e => {
            if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
            if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
          }}
        >
          {current && (
            <figure>
              <img key={open} src={audioImageUrl(current, 1800)!} alt={altOf(current, open ?? 0)} decoding="async" />
              <figcaption>
                <span>{current.alt}</span>
                <span className="a8-lightbox-count">{(open ?? 0) + 1} of {gallery.length}</span>
              </figcaption>
            </figure>
          )}
          <div className="a8-lightbox-bar">
            {gallery.length > 1 && (
              <>
                <button type="button" className="a8-icon-btn" onClick={() => step(-1)} aria-label="Previous photo">
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
                </button>
                <button type="button" className="a8-icon-btn" onClick={() => step(1)} aria-label="Next photo">
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5" /></svg>
                </button>
              </>
            )}
            <button type="button" className="a8-icon-btn" onClick={() => dialogRef.current?.close()} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /></svg>
            </button>
          </div>
        </dialog>
      )}
    </section>
  )
}
