export const REDIRECT_HOSTS: string[]
export function subdomainLive(env: Record<string, string | undefined> | null | undefined): boolean
export function audioRedirectTarget(requestUrl: string, host: string | null | undefined, env: Record<string, string | undefined> | null | undefined): string | null
