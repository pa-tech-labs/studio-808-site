export type Answers = Record<string, string>

export interface FinderCondition { questionKey: string; equals: string }

export interface FinderOption { label: string; value: string; helper?: string | null }

export interface FinderQuestion {
  key: string
  title: string
  helper?: string | null
  options: FinderOption[]
  showIf?: FinderCondition[] | null
  skippable?: boolean | null
}

export interface FinderRule<S = unknown> {
  conditions?: FinderCondition[] | null
  studio: S | null
  reason?: string | null
  addOns?: string[] | null
  memberLine?: string | null
}

export interface VisibilityOptions { tutorEnabled?: boolean }

export declare const TUTOR_QUESTION_KEY: string
export declare const TUTOR_YES: string
export declare const DAYS: readonly string[]
export declare const EMAIL_RE: RegExp

export declare function conditionsMatch(conditions: FinderCondition[] | null | undefined, answers: Answers): boolean
export declare function visibleQuestions(questions: FinderQuestion[], answers: Answers, opts?: VisibilityOptions): FinderQuestion[]
export declare function pruneAnswers(questions: FinderQuestion[], answers: Answers, opts?: VisibilityOptions): Answers
export declare function nextQuestion(questions: FinderQuestion[], answers: Answers, opts?: VisibilityOptions): FinderQuestion | null
export declare function progress(questions: FinderQuestion[], answers: Answers, opts?: VisibilityOptions): { answered: number; total: number }
export declare function withoutLastAnswer(questions: FinderQuestion[], answers: Answers, opts?: VisibilityOptions): Answers
export declare function matchRule<S>(rules: FinderRule<S>[], answers: Answers): FinderRule<S> | null
export declare function resultBookingUrl(studio: { cueRoomSlug?: string | null } | null | undefined): string
export declare function studioPageHref(studio: { pageHref?: string | null; sortOrder?: number | null } | null | undefined): string
export declare function encodeAnswers(answers: Answers): string
export declare function decodeAnswers(hash: string | null | undefined): Answers

export interface TutorRequestInput {
  name?: unknown
  email?: unknown
  phone?: unknown
  preferredDays?: unknown
  studio?: unknown
  answers?: unknown
}
export interface TutorRequest {
  name: string
  email: string
  phone: string | null
  preferredDays: string[]
  studio: string | null
  answers: { question: string; answer: string }[]
}
export declare function validateTutorRequest(input: TutorRequestInput | null | undefined): {
  ok: boolean
  errors: Partial<Record<'name' | 'email' | 'phone' | 'preferredDays', string>>
  value: TutorRequest
}
