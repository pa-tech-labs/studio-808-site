export const AUDIO_HOST: 'audio.studio-808.com'
export const AUDIO_ORIGIN: 'https://audio.studio-808.com'
export const MAIN_ORIGIN: 'https://www.studio-808.com'

export type AudioPageName = 'home' | 'terms'

export function isAudioHost(host: string | null | undefined): boolean
export function audioBasePath(host: string | null | undefined): '' | '/audio'
export function audioPath(host: string | null | undefined, page?: AudioPageName, hash?: string): string
export function audioPageOf(host: string | null | undefined, pathname: string | null | undefined): AudioPageName | null
export function currentHost(): string
