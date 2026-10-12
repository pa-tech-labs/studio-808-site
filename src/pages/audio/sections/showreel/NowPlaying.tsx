// The now-playing panel: the active clip's one media element (an <audio>
// under a wavesurfer waveform, or a 16:9 <video>), its transport, and the
// clip's details. Only this clip's media is ever loaded, metadata first.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from 'react'
import WaveSurfer from 'wavesurfer.js'
import type { AudioClip } from '../../../../lib/audioPage'
import { formatTime, mediaTypeOf, mediaUrlOf } from '../../../../lib/showreel.js'
import { audioImageUrl } from '../../image'
import { usePeaks } from './usePeaks'
import { toggleMuted } from './media'
import { FullscreenIcon, PauseIcon, PlayIcon, SpeakerIcon } from './icons'

interface Props {
  clip: AudioClip
  media: HTMLMediaElement | null
  setMedia: (el: HTMLMediaElement | null) => void
  playing: boolean
  current: number
  duration: number
  onToggle: () => void
  onSeek: (seconds: number) => void
  panelRef: Ref<HTMLDivElement>
}

export default function NowPlaying(props: Props) {
  const { clip, panelRef } = props
  const video = mediaTypeOf(clip) === 'video'
  return (
    <div className="a8-now" ref={panelRef}>
      {/* Keyed on the clip: a new clip fades in (opacity, plus a small rise
          when motion is allowed). */}
      <div className="a8-now-in" key={clip._id}>
        {video ? <VideoStage {...props} /> : <AudioStage {...props} />}
        <ClipDetails clip={clip} />
      </div>
    </div>
  )
}

function AudioStage({ clip, media, setMedia, playing, current, duration, onToggle, onSeek }: Props) {
  const waveRef = useRef<HTMLDivElement>(null)
  const peaks = usePeaks(clip)
  const waveDuration = clip.durationSeconds || peaks?.duration || duration
  const ready = Boolean(peaks && waveDuration && media)

  // Wavesurfer only ever draws from peaks plus a duration, against our own
  // <audio>. Given a URL without peaks it would download the whole file into
  // a blob and swap the element's source, which delays playback.
  useEffect(() => {
    if (!ready || !waveRef.current || !media || !peaks) return
    const ws = WaveSurfer.create({
      container: waveRef.current,
      media,
      peaks: peaks.peaks,
      duration: waveDuration,
      height: 'auto',
      // Opaque: wavesurfer paints progress over the bars with source-in, so
      // a translucent wave colour would make the progress translucent too.
      // #4a4946 is rgba(240, 237, 232, 0.24) over the surface.
      waveColor: '#4a4946',
      progressColor: '#9fb4c6',
      cursorWidth: 0,
      barWidth: 2,
      barGap: 2,
      barRadius: 1,
      interact: false,
      hideScrollbar: true,
    })
    return () => ws.destroy()
  }, [ready, media, peaks, waveDuration])

  return (
    <div className="a8-stage">
      <audio ref={setMedia} src={mediaUrlOf(clip) ?? undefined} preload="metadata" />
      <div className="a8-wavebox" data-ready={ready}>
        <div className="a8-wavebox-wave" ref={waveRef} aria-hidden="true" />
        <Scrub current={current} duration={duration} onSeek={onSeek} overlay />
      </div>
      <Transport playing={playing} current={current} duration={duration} onToggle={onToggle} title={clip.title} />
    </div>
  )
}

function VideoStage({ clip, media, setMedia, playing, current, duration, onToggle, onSeek }: Props) {
  const [muted, setMuted] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const poster = audioImageUrl(clip.posterImage, 1280, 720) ?? audioImageUrl(clip.coverImage, 1280, 720) ?? undefined

  useEffect(() => {
    if (!media) return
    const sync = () => setMuted(media.muted)
    media.addEventListener('volumechange', sync)
    return () => media.removeEventListener('volumechange', sync)
  }, [media])

  const fullscreen = () => {
    const v = media as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    if (!v) return
    if (frameRef.current?.requestFullscreen) frameRef.current.requestFullscreen().catch(() => {})
    else v.webkitEnterFullscreen?.()
  }

  return (
    <div className="a8-stage">
      <div className="a8-video" ref={frameRef}>
        <video
          ref={setMedia}
          src={mediaUrlOf(clip) ?? undefined}
          poster={poster}
          preload="metadata"
          playsInline
          onClick={onToggle}
          aria-label={clip.title}
        />
        {!playing && current === 0 && (
          <button type="button" className="a8-video-big" onClick={onToggle} aria-label={`Play ${clip.title}`}>
            <PlayIcon size={22} />
          </button>
        )}
      </div>
      <Scrub current={current} duration={duration} onSeek={onSeek} />
      <Transport playing={playing} current={current} duration={duration} onToggle={onToggle} title={clip.title}>
        <button type="button" className="a8-icon-btn" onClick={() => { if (media) toggleMuted(media) }} aria-pressed={muted} aria-label={muted ? 'Unmute' : 'Mute'}>
          <SpeakerIcon muted={muted} />
        </button>
        <button type="button" className="a8-icon-btn" onClick={fullscreen} aria-label="Full screen">
          <FullscreenIcon />
        </button>
      </Transport>
    </div>
  )
}

/** A range input: invisible over the waveform, a thin line under the video. */
function Scrub({ current, duration, onSeek, overlay = false }: { current: number; duration: number; onSeek: (s: number) => void; overlay?: boolean }) {
  const pct = duration ? Math.min(100, (current / duration) * 100) : 0
  return (
    <input
      type="range"
      className={overlay ? 'a8-scrub a8-scrub-overlay' : 'a8-scrub'}
      min={0}
      max={duration || 0}
      step="any"
      value={Math.min(current, duration || 0)}
      onChange={e => onSeek(Number(e.target.value))}
      disabled={!duration}
      aria-label="Seek"
      aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
      style={{ '--a8-pct': `${pct}%` } as CSSProperties}
    />
  )
}

function Transport({ playing, current, duration, onToggle, title, children }: {
  playing: boolean; current: number; duration: number; onToggle: () => void; title: string; children?: ReactNode
}) {
  return (
    <div className="a8-transport">
      <button type="button" className="a8-play" onClick={onToggle} aria-label={`${playing ? 'Pause' : 'Play'} ${title}`}>
        {playing ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
      </button>
      <span className="a8-clock"><span>{formatTime(current)}</span><span className="a8-clock-sep" aria-hidden="true">/</span><span className="a8-clock-total">{formatTime(duration)}</span></span>
      {children && <span className="a8-transport-extra">{children}</span>}
    </div>
  )
}

function ClipDetails({ clip }: { clip: AudioClip }) {
  const facts = [
    { k: 'Client', v: clip.client },
    { k: 'Talent', v: clip.talent },
    { k: 'Engineer', v: clip.engineer },
  ].filter(f => f.v)
  return (
    <div className="a8-details">
      <h3 className="a8-details-title">{clip.title}</h3>
      {clip.production && <p className="a8-details-prod">{clip.production}</p>}
      {facts.length > 0 && (
        <dl className="a8-facts">
          {facts.map(f => (
            <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>
          ))}
        </dl>
      )}
      {clip.description && <p className="a8-details-desc">{clip.description}</p>}
      {clip.transcript && (
        <details className="a8-transcript">
          <summary>Transcript</summary>
          <p>{clip.transcript}</p>
        </details>
      )}
    </div>
  )
}
