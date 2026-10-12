export interface AudioEnquiryValue {
  name: string
  company: string
  email: string
  phone: string
  projectType: string
  length: string
  deadline: string
  message: string
  consent: boolean
}
export type AudioEnquiryField = keyof AudioEnquiryValue
export type AudioEnquiryErrors = Partial<Record<AudioEnquiryField, string>>

export const ENQUIRY_LIMITS: Record<'name' | 'company' | 'email' | 'phone' | 'projectType' | 'length' | 'message', number>
export const HONEYPOT_FIELD: 'website'

export function isHoneypot(body: unknown): boolean
export function isIsoDate(s: string): boolean
export function validateAudioEnquiry(
  body: unknown,
  opts?: { projectTypes?: string[] | null; today?: string },
): { ok: boolean; errors: AudioEnquiryErrors; value: AudioEnquiryValue }
export function oneLine(s: unknown): string
export function enquirySubject(v: AudioEnquiryValue): string
export function enquiryText(v: AudioEnquiryValue): string
export const ENQUIRY_ORIGINS: string[]
export function requestOrigin(headers: Record<string, unknown> | null | undefined): string
export function isAllowedEnquiryOrigin(origin: string | null | undefined, env?: { VERCEL_ENV?: string; VERCEL_URL?: string }): boolean
