export interface StudioNameSource { name?: string | null; tagline?: string | null; studioNumber?: string | null }
export declare function splitStudioName(studio: StudioNameSource | null | undefined): { room: string; role: string }
export declare function studioLabel(studio: StudioNameSource | null | undefined): string
export declare function studioKey(studioNumber: string | number | null | undefined): string
