/** A @sanity/image-url builder's .image(), loosely typed: only the chain below is used. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ImageFor = (image: any) => any
export function makeAudioImageUrl(imageFor: ImageFor): (image: unknown, width: number, height?: number) => string | null
