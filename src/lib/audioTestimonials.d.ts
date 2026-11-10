import type { AudioPage, AudioPageData, AudioTestimonial } from './audioPage'

export const TESTIMONIALS_HEADING: string
export function visibleTestimonials(data: AudioPageData | null | undefined): AudioTestimonial[]
export function testimonialsHeading(page: AudioPage | null | undefined): string
export function testimonialByline(t: Pick<AudioTestimonial, 'role' | 'company'> | null | undefined): string
