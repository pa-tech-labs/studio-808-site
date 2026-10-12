import type { CSSProperties } from 'react'
import type { AudioClip } from '../../../../lib/audioPage'
import { CLIP_TYPE_TAGS, formatTime, groupOf, mediaTypeOf } from '../../../../lib/showreel.js'
import { clipThumb } from './media'
import { FilmIcon, TickIcon, WaveIcon } from './icons'

/** Deterministic dark two-tone tile for a clip with no image. */
function gradientFor(id: string): CSSProperties {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360
  return { background: `linear-gradient(135deg, hsl(${h} 16% 24%), hsl(${(h + 48) % 360} 12% 11%))` }
}

export function ClipThumb({ clip, size, playing = false }: { clip: AudioClip; size: number; playing?: boolean }) {
  const src = clipThumb(clip, size * 2)
  return (
    <span className="a8-thumb" style={src ? undefined : gradientFor(clip._id)}>
      {src && <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" />}
      {playing && (
        <span className="a8-eq" aria-hidden="true"><i /><i /><i /></span>
      )}
    </span>
  )
}

export default function Playlist({ clips, activeId, playing, played, onSelect }: {
  clips: AudioClip[]
  activeId: string | null
  playing: boolean
  played: string[]
  onSelect: (id: string) => void
}) {
  return (
    <ol className="a8-list" aria-label="Clips">
      {clips.map(clip => {
        const active = clip._id === activeId
        const video = mediaTypeOf(clip) === 'video'
        const byline = [clip.production, clip.client].filter(Boolean)
        return (
          <li key={clip._id}>
            <button
              type="button"
              className="a8-row"
              aria-current={active ? 'true' : undefined}
              onClick={() => onSelect(clip._id)}
            >
              <ClipThumb clip={clip} size={52} playing={active && playing} />
              <span className="a8-row-main">
                <span className="a8-row-title">
                  <span className="a8-row-kind" title={video ? 'Video' : 'Audio'}>{video ? <FilmIcon /> : <WaveIcon />}</span>
                  <span className="s8-sr">{video ? 'Video: ' : 'Audio: '}</span>
                  {clip.title}
                </span>
                {byline.length > 0 && <span className="a8-row-by">{byline.join(', ')}</span>}
                {clip.talent && <span className="a8-row-talent">{clip.talent}</span>}
              </span>
              <span className="a8-row-meta">
                <span className="a8-row-time">
                  {played.includes(clip._id) && <span className="a8-row-played"><TickIcon /><span className="s8-sr">Played, </span></span>}
                  {clip.durationSeconds ? formatTime(clip.durationSeconds) : ''}
                </span>
                <span className="a8-tag">{CLIP_TYPE_TAGS[groupOf(clip)]}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
