export declare const CUE_API: string
export declare const CONTACT_FORM_ID: string
export declare function tokenUrl(formId: string, api?: string): string
export declare function submitUrl(formId: string, api?: string): string
export interface FormGuard {
  renderToken: string
  honeypotField: string
  turnstileSiteKey: string | null
  turnstileField: string
  minFillMs: number
}
export declare function fetchFormGuard(formId: string, opts?: { api?: string; fetchImpl?: typeof fetch }): Promise<FormGuard>
export declare function buildSubmission(
  fields: Record<string, unknown>,
  guard: FormGuard,
  opts?: { honeypotValue?: string; turnstileToken?: string | null },
): Record<string, unknown>
export type SubmitResult = 'sent' | 'turnstile' | 'rate_limited' | 'error'
export declare function readSubmitResult(res: Response): Promise<SubmitResult>
export declare const RETRY_MESSAGES: Record<'turnstile' | 'rate_limited' | 'error' | 'not_ready' | 'check_pending', string>
