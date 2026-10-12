import type { AudioClip, AudioClipType, AudioMediaType } from './audioPage'

export interface ClipGroup { type: AudioClipType; label: string; clips: AudioClip[] }
export type ShowreelTab = 'all' | AudioClipType

export const CLIP_GROUPS: { type: AudioClipType; label: string }[]
export const CLIP_TYPE_TAGS: Record<AudioClipType, string>

export function mediaTypeOf(clip: Pick<AudioClip, 'mediaType'> | null | undefined): AudioMediaType
export function groupOf(clip: Pick<AudioClip, 'clipType'> | null | undefined): AudioClipType
export function mediaUrlOf(clip: AudioClip | null | undefined): string | null
export function compareClips(a: AudioClip, b: AudioClip): number
export function visibleClips(clips: AudioClip[] | null | undefined): AudioClip[]
export function groupClips(clips: AudioClip[] | null | undefined): ClipGroup[]
export function allClipsInOrder(groups: ClipGroup[]): AudioClip[]
export function clipsForTab(groups: ClipGroup[], tab: ShowreelTab): AudioClip[]
export function nextClipId(list: AudioClip[], id: string | null): string | null

export type PlayerStatus = 'idle' | 'playing' | 'paused' | 'ended'
export interface PlayerState {
  activeId: string | null
  status: PlayerStatus
  wantsPlay: boolean
  started: string[]
  played: string[]
}
export type PlayerAction =
  | { type: 'select'; id: string; play?: boolean }
  | { type: 'playing'; id: string }
  | { type: 'paused'; id: string }
  | { type: 'ended'; id: string }

export const initialPlayerState: PlayerState
export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState
export function isFirstPlay(state: PlayerState, id: string): boolean

export function parsePeaks(json: unknown): number[][] | null
export function formatTime(seconds: number | null | undefined): string
