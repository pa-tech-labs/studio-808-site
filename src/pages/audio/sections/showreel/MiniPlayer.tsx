// Sticky mini-player along the bottom of the viewport, shown once something
// has played and the now-playing panel is scrolled out of view. It drives the
// same media element as the panel, so a video keeps playing (and is heard)
// while the visitor reads on. Slides up from below; opacity only under
// reduced motion.

import type { CSSProperties } from 'react'
import type { AudioClip } from '../../../../lib/audioPage'
import { ClipThumb } from './Playlist'
import { PauseIcon, PlayIcon } from './icons'

export default function MiniPlayer({ clip, visible, playing, current, duration, onToggle, onShowPanel }: {
  clip: AudioClip | null
  visible: boolean
  playing: boolean
  current: number
  duration: number
  onToggle: () => void
  onShowPanel: () => void
}) {
  const pct = duration ? Math.min(1, current / duration) : 0
  return (
    <div className="a8-mini" data-visible={visible} inert={!visible} aria-hidden={!visible}>
      <span className="a8-mini-progress" style={{ '--a8-progress': pct } as CSSProperties} aria-hidden="true" />
      {clip && (
        <div className="a8-wrap a8-mini-in">
          <button type="button" className="a8-mini-show" onClick={onShowPanel} aria-label={`Show the player for ${clip.title}`}>
            <ClipThumb clip={clip} size={40} playing={playing} />
            <span className="a8-mini-text">
              <span className="a8-mini-title">{clip.title}</span>
              {clip.client && <span className="a8-mini-client">{clip.client}</span>}
            </span>
          </button>
          <button type="button" className="a8-play a8-play-sm" onClick={onToggle} aria-label={`${playing ? 'Pause' : 'Play'} ${clip.title}`}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <a className="a8-mini-back" href="#work">Back to work</a>
        </div>
      )}
    </div>
  )
}
