// Showreel (#work), the centrepiece of /audio. Cleared clips only, grouped by
// type (src/lib/showreel.js), with a now-playing panel, a playlist and a
// sticky mini-player. One clip at a time: only the active clip has a media
// element, metadata-only until it plays, and selecting another replaces it.
//
// Keyboard (anywhere in the section): Space plays or pauses, Left and Right
// seek 5 seconds, Enter on a row picks that clip.
//
// Deep links: ?work=<slug> (src/lib/showreel.js CLIP_GROUPS) opens the
// section on that filter with its first clip loaded, e.g.
// voice.studio-808.com/?work=games#work. Clicking a filter rewrites the
// parameter in place (replaceState, no reload, hash kept); "All" removes it.
//
// Analytics: window events 'audio:play' (first play of each clip) and
// 'audio:complete' (a clip finished), detail { clipId, title, mediaType }.

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type KeyboardEvent } from 'react'
import type { AudioClip, AudioPageData } from '../../../lib/audioPage'
import {
  allClipsInOrder, clipsForTab, groupClips, initialPlayerState, isFirstPlay, mediaTypeOf, nextClipId, paramForTab,
  playerReducer, tabFromParam, WORK_PARAM, type ClipGroup, type ShowreelTab,
} from '../../../lib/showreel.js'
import { AUDIO_ANCHORS } from '../anchors'
import NowPlaying from './showreel/NowPlaying'
import Playlist from './showreel/Playlist'
import { clipThumb, playMedia, releaseMedia, seekMedia } from './showreel/media'
import MiniPlayer from './showreel/MiniPlayer'
import './showreel/showreel.css'

const ADVANCE_GAP_MS = 400
const SEEK_STEP = 5

function emit(name: 'audio:play' | 'audio:complete', clip: AudioClip) {
  window.dispatchEvent(new CustomEvent(name, { detail: { clipId: clip._id, title: clip.title, mediaType: mediaTypeOf(clip) } }))
}

/** The tab the page URL asks for. "all" when prerendering (no window). */
function tabFromUrl(groups: ClipGroup[]): ShowreelTab {
  if (typeof window === 'undefined') return 'all'
  return tabFromParam(groups, new URLSearchParams(window.location.search).get(WORK_PARAM))
}

/** Write the tab into ?work= without a reload or a new history entry. */
function writeTabToUrl(tab: ShowreelTab) {
  const url = new URL(window.location.href)
  const param = paramForTab(tab)
  if (param) url.searchParams.set(WORK_PARAM, param)
  else url.searchParams.delete(WORK_PARAM)
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url)
}

const finite = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0)

export default function Showreel({ data }: { data: AudioPageData }) {
  const groups = useMemo(() => groupClips(data.clips), [data.clips])
  const all = useMemo(() => allClipsInOrder(groups), [groups])
  const [tab, setTab] = useState<ShowreelTab>(() => tabFromUrl(groups))
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState, s => ({
    ...s,
    activeId: clipsForTab(groups, tab)[0]?._id ?? all[0]?._id ?? null,
  }))
  const [media, setMedia] = useState<HTMLMediaElement | null>(null)
  const [time, setTime] = useState({ current: 0, duration: 0 })
  const [panelInView, setPanelInView] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)
  const advanceTimer = useRef<number | undefined>(undefined)

  const active = all.find(c => c._id === state.activeId) ?? null
  const visibleList = clipsForTab(groups, tab)
  const playing = state.status === 'playing'

  // Latest values for media event handlers, without re-subscribing.
  const latest = useRef({ state, tab, groups })
  useEffect(() => { latest.current = { state, tab, groups } })

  const select = useCallback((id: string, play: boolean) => {
    window.clearTimeout(advanceTimer.current)
    dispatch({ type: 'select', id, play })
  }, [])

  // Wire the active clip's media element to the player state.
  useEffect(() => {
    if (!media || !active) return
    const clip = active
    const id = clip._id
    const sync = () => setTime({ current: media.currentTime, duration: finite(media.duration) || clip.durationSeconds || 0 })
    const onPlay = () => {
      if (isFirstPlay(latest.current.state, id)) emit('audio:play', clip)
      dispatch({ type: 'playing', id })
    }
    const onPause = () => dispatch({ type: 'paused', id })
    const onEnded = () => {
      const wasPlaying = latest.current.state.status === 'playing'
      dispatch({ type: 'ended', id })
      emit('audio:complete', clip)
      const { groups: g, tab: t } = latest.current
      const next = nextClipId(clipsForTab(g, t), id)
      // Advance within the current group, after a short gap. A video only
      // hands on if it was actually playing through to the end.
      if (next && (mediaTypeOf(clip) === 'audio' || wasPlaying)) {
        advanceTimer.current = window.setTimeout(() => dispatch({ type: 'select', id: next, play: true }), ADVANCE_GAP_MS)
      }
    }
    const events: [string, () => void][] = [
      ['play', onPlay], ['pause', onPause], ['ended', onEnded],
      ['timeupdate', sync], ['loadedmetadata', sync], ['durationchange', sync], ['seeked', sync],
    ]
    events.forEach(([e, fn]) => media.addEventListener(e, fn))
    sync()
    return () => {
      events.forEach(([e, fn]) => media.removeEventListener(e, fn))
      // This element is on its way out: stop it and drop its download.
      releaseMedia(media)
    }
  }, [media, active])

  // Start the newly selected clip once its element exists.
  useEffect(() => {
    if (!media || !state.wantsPlay) return
    playMedia(media).catch(() => dispatch({ type: 'paused', id: state.activeId ?? '' }))
  }, [media, state.wantsPlay, state.activeId])

  useEffect(() => () => window.clearTimeout(advanceTimer.current), [])

  // A ?work= deep link with #work: the prerendered body the browser scrolled
  // to has been swapped for the app, so land on the section again.
  useEffect(() => {
    if (window.location.hash !== `#${AUDIO_ANCHORS.work}`) return
    if (!new URLSearchParams(window.location.search).has(WORK_PARAM)) return
    document.getElementById(AUDIO_ANCHORS.work)?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [])

  // Pick a filter, as before, and put it in the URL.
  const chooseTab = (next: ShowreelTab) => {
    setTab(next)
    writeTabToUrl(next)
  }

  const toggle = useCallback(() => {
    if (!media) return
    if (media.paused) {
      playMedia(media).catch(() => {})
    } else {
      media.pause()
    }
  }, [media])

  const seekTo = useCallback((s: number) => {
    if (!media) return
    const max = finite(media.duration) || time.duration
    seekMedia(media, Math.max(0, Math.min(max || s, s)))
    setTime(t => ({ ...t, current: media.currentTime }))
  }, [media, time.duration])

  const onRow = (id: string) => {
    if (id === state.activeId && state.status !== 'idle') toggle()
    else select(id, true)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const el = e.target as HTMLElement
    if (el.closest('summary, textarea, input:not([type="range"])')) return
    if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); toggle() }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); seekTo((media?.currentTime ?? 0) - SEEK_STEP) }
    else if (e.key === 'ArrowRight') { e.preventDefault(); seekTo((media?.currentTime ?? 0) + SEEK_STEP) }
  }

  // Is the panel on screen? The mini-player shows when it is not.
  useEffect(() => {
    const el = panelRef.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => setPanelInView(entry.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [active])

  // Lock screen and headset controls.
  useEffect(() => {
    if (!active || !('mediaSession' in navigator)) return
    const art = clipThumb(active, 512)
    navigator.mediaSession.metadata = new MediaMetadata({
      title: active.title,
      artist: [active.talent, active.client].filter(Boolean).join(', ') || 'Studio 808 Voice',
      album: active.production || 'Studio 808 Voice',
      artwork: art ? [{ src: art, sizes: '512x512' }] : [],
    })
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => { media?.play().catch(() => {}) }],
      ['pause', () => media?.pause()],
      ['seekbackward', () => seekTo((media?.currentTime ?? 0) - SEEK_STEP)],
      ['seekforward', () => seekTo((media?.currentTime ?? 0) + SEEK_STEP)],
      ['nexttrack', () => { const n = nextClipId(clipsForTab(groups, tab), active._id); if (n) select(n, true) }],
    ]
    handlers.forEach(([a, h]) => { try { navigator.mediaSession.setActionHandler(a, h) } catch { /* unsupported action */ } })
    return () => handlers.forEach(([a]) => { try { navigator.mediaSession.setActionHandler(a, null) } catch { /* unsupported action */ } })
  }, [active, media, seekTo, select, groups, tab])

  useEffect(() => {
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = playing ? 'playing' : state.status === 'paused' ? 'paused' : 'none'
  }, [playing, state.status])

  if (groups.length === 0 || !active) return null

  const intro = data.page?.showreelIntro
  const miniVisible = state.started.length > 0 && !panelInView
    && (playing || (state.status === 'paused' && time.current > 0))

  const showPanel = () => panelRef.current?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  })

  return (
    <section id={AUDIO_ANCHORS.work} className="a8-reel" aria-labelledby="a8-reel-title" onKeyDown={onKeyDown}>
      <div className="a8-wrap">
        <header className="a8-reel-head">
          <h2 id="a8-reel-title">{intro?.heading || 'Selected work'}</h2>
          {intro?.body && <p>{intro.body}</p>}
        </header>
        <p className="s8-sr" id="a8-reel-keys">Space plays or pauses. Left and right arrows skip back or forward 5 seconds. Enter on a clip plays it.</p>

        {groups.length > 1 && (
          <div className="a8-tabs" role="group" aria-label="Filter clips">
            {[{ type: 'all' as const, label: 'All' }, ...groups].map(g => (
              <button key={g.type} type="button" className="a8-tab" aria-pressed={tab === g.type} onClick={() => chooseTab(g.type)}>
                {g.label}
              </button>
            ))}
          </div>
        )}

        <div className="a8-reel-grid" aria-describedby="a8-reel-keys">
          <NowPlaying
            clip={active}
            media={media}
            setMedia={setMedia}
            playing={playing}
            current={time.current}
            duration={time.duration || active.durationSeconds || 0}
            onToggle={toggle}
            onSeek={seekTo}
            panelRef={panelRef}
          />
          <Playlist clips={visibleList} activeId={state.activeId} playing={playing} played={state.played} onSelect={onRow} />
        </div>
      </div>

      <MiniPlayer
        clip={active}
        visible={miniVisible}
        playing={playing}
        current={time.current}
        duration={time.duration || active.durationSeconds || 0}
        onToggle={toggle}
        onShowPanel={showPanel}
      />
    </section>
  )
}
