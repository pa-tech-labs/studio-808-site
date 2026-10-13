type Env = Record<string, string | undefined> | null | undefined
export const REDIRECT_HOSTS: string[]
export const APP_SHELL: '/index.html'
export function subdomainLive(env: Env): boolean
export function audioRedirectTarget(requestUrl: string, host: string | null | undefined, env: Env): string | null
export function audioMiddlewareAction(requestUrl: string, host: string | null | undefined, env: Env): { redirect: string } | { rewrite: string } | null
