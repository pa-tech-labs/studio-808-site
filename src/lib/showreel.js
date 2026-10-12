// The Studio 808 Voice showreel's logic, kept free of React and the DOM so it can be
// tested with node --test: which clips show, how they group and sort, the
// one-clip-at-a-time player state, and reading a peaks file.

/** Group order on the page, and each group's tab label. */
export const CLIP_GROUPS = [
  { type: 'audiobook', label: 'Audiobooks' },
  { type: 'broadcast', label: 'Broadcast' },
  { type: 'commercial', label: 'Commercials' },
  { type: 'elearning', label: 'eLearning' },
  { type: 'podcast', label: 'Podcasts' },
  { type: 'other', label: 'Other' },
]

/** One tag per clip type, as shown on a playlist row. */
export const CLIP_TYPE_TAGS = {
  audiobook: 'Audiobook',
  broadcast: 'Broadcast',
  commercial: 'Commercial',
  elearning: 'eLearning',
  podcast: 'Podcast',
  other: 'Other',
}

const KNOWN_TYPES = new Set(CLIP_GROUPS.map(g => g.type))

/** "audio" or "video". A missing or unknown value is audio. */
export function mediaTypeOf(clip) {
  return clip?.mediaType === 'video' ? 'video' : 'audio'
}

/** The clip's group. A missing or unknown clipType goes to "other". */
export function groupOf(clip) {
  return KNOWN_TYPES.has(clip?.clipType) ? clip.clipType : 'other'
}

/** The clip's playable URL for its media type, or null. */
export function mediaUrlOf(clip) {
  return (mediaTypeOf(clip) === 'video' ? clip?.videoUrl : clip?.audioUrl) || null
}

/** Featured first, then by order (missing order last), then by title. */
export function compareClips(a, b) {
  const f = Number(Boolean(b.featured)) - Number(Boolean(a.featured))
  if (f) return f
  const ao = typeof a.order === 'number' ? a.order : Infinity
  const bo = typeof b.order === 'number' ? b.order : Infinity
  if (ao !== bo) return ao < bo ? -1 : 1
  return String(a.title ?? '').localeCompare(String(b.title ?? ''))
}

/** Clips that may show: cleared, and with media for their type. */
export function visibleClips(clips) {
  return (clips ?? []).filter(c => c && c.cleared === true && mediaUrlOf(c))
}

/**
 * Cleared clips grouped in page order, each group sorted. Empty groups are
 * left out, so the result is exactly the tabs to show (after "All").
 */
export function groupClips(clips) {
  const visible = visibleClips(clips)
  return CLIP_GROUPS
    .map(g => ({ ...g, clips: visible.filter(c => groupOf(c) === g.type).sort(compareClips) }))
    .filter(g => g.clips.length > 0)
}

/** Every visible clip in page order: group by group, each group sorted. */
export function allClipsInOrder(groups) {
  return groups.flatMap(g => g.clips)
}

/** The clips a tab shows: "all", or one group's type. */
export function clipsForTab(groups, tab) {
  if (tab === 'all') return allClipsInOrder(groups)
  return groups.find(g => g.type === tab)?.clips ?? []
}

/** The clip after `id` in `list`, or null at the end. */
export function nextClipId(list, id) {
  const i = list.findIndex(c => c._id === id)
  return i >= 0 && i < list.length - 1 ? list[i + 1]._id : null
}

// ── Player state ────────────────────────────────────────────────────────────
//
// One clip at a time. `activeId` is the only clip with media loaded; selecting
// another replaces it, so there is never a second clip playing. `status` is
// that one clip's state. `started` records clips that have played at least
// once (for the first-play event), `played` clips that reached the end (the
// session-only tick). `wantsPlay` asks the view to start the new clip once
// its media is ready.

export const initialPlayerState = Object.freeze({
  activeId: null,
  status: 'idle',
  wantsPlay: false,
  started: [],
  played: [],
})

const add = (list, id) => (list.includes(id) ? list : [...list, id])

export function playerReducer(state, action) {
  switch (action.type) {
    case 'select': {
      if (action.id === state.activeId) {
        return action.play ? { ...state, wantsPlay: true } : state
      }
      return { ...state, activeId: action.id, status: 'idle', wantsPlay: Boolean(action.play) }
    }
    case 'playing':
      if (action.id !== state.activeId) return state
      return { ...state, status: 'playing', wantsPlay: false, started: add(state.started, action.id) }
    case 'paused':
      if (action.id !== state.activeId || state.status === 'ended') return state
      return { ...state, status: 'paused', wantsPlay: false }
    case 'ended':
      if (action.id !== state.activeId) return state
      return { ...state, status: 'ended', wantsPlay: false, played: add(state.played, action.id) }
    default:
      return state
  }
}

/** True the first time a clip reports playing (before the reducer records it). */
export function isFirstPlay(state, id) {
  return !state.started.includes(id)
}

// ── Peaks ───────────────────────────────────────────────────────────────────

/**
 * Peaks JSON to wavesurfer's `peaks` option ([channel]), normalised to 0..1.
 * Accepts a plain array of numbers, { data: [...] } or audiowaveform output
 * ({ bits, data } with min/max pairs). Null when it is not usable.
 */
export function parsePeaks(json) {
  let data = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : null
  if (!data || data.length === 0 || !data.every(n => typeof n === 'number' && Number.isFinite(n))) return null
  // audiowaveform: interleaved min/max per point; keep the larger magnitude.
  if (!Array.isArray(json) && typeof json.bits === 'number' && (json.channels ?? 1) === 1) {
    const pairs = []
    for (let i = 0; i + 1 < data.length; i += 2) pairs.push(Math.max(Math.abs(data[i]), Math.abs(data[i + 1])))
    data = pairs
  }
  const max = Math.max(...data.map(Math.abs))
  if (!max) return null
  return [data.map(n => Math.abs(n) / max)]
}

/** Seconds as m:ss. */
export function formatTime(seconds) {
  const s = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
