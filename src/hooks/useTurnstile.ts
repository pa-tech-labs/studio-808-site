// Cloudflare Turnstile for the site's own forms that post to Cue
// (src/lib/cueForm.js). Managed mode is set on the widget in the Cloudflare
// dashboard: Cloudflare decides per visitor whether to pass silently or show
// a checkbox. No site key = nothing loads and the token stays null.

import { useCallback, useEffect, useRef, useState } from 'react'

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}
declare global { interface Window { turnstile?: TurnstileApi } }

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let loading: Promise<TurnstileApi> | null = null

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = SRC
      s.async = true
      s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile missing')))
      s.onerror = () => { loading = null; reject(new Error('turnstile failed to load')) }
      document.head.appendChild(s)
    })
  }
  return loading
}

export type TurnstileStatus = 'off' | 'loading' | 'ready' | 'verified' | 'error'

export function useTurnstile(siteKey: string | null) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const apiRef = useRef<TurnstileApi | null>(null)
  const widgetRef = useRef<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<Exclude<TurnstileStatus, 'off'>>('loading')

  useEffect(() => {
    if (!siteKey) return
    let live = true
    loadTurnstile()
      .then(api => {
        if (!live || !containerRef.current || widgetRef.current) return
        apiRef.current = api
        widgetRef.current = api.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'dark',            // the card is dark
          size: 'flexible',         // fills the form column, like the inputs
          appearance: 'always',
          'refresh-expired': 'auto',
          callback: (t: string) => { setToken(t); setStatus('verified') },
          'expired-callback': () => { setToken(null); setStatus('ready') },
          'timeout-callback': () => { setToken(null); setStatus('ready') },
          'error-callback': () => { setToken(null); setStatus('error') },
        })
        setStatus('ready')
      })
      .catch(() => { if (live) setStatus('error') })
    return () => {
      live = false
      if (widgetRef.current && apiRef.current) {
        try { apiRef.current.remove(widgetRef.current) } catch { /* already gone */ }
      }
      widgetRef.current = null
    }
  }, [siteKey])

  const reset = useCallback(() => {
    setToken(null)
    if (widgetRef.current && apiRef.current) {
      try { apiRef.current.reset(widgetRef.current); setStatus('ready') } catch { /* ignore */ }
    }
  }, [])

  return { containerRef, token, status: (siteKey ? status : 'off') as TurnstileStatus, reset }
}
