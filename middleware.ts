// Vercel Routing Middleware (the successor to Edge Middleware; it runs on the
// Node.js runtime, as Vercel now recommends over the deprecated Edge
// runtime). It runs before vercel.json's routes, for /audio paths only.
//
// When AUDIO_SUBDOMAIN_LIVE is "true" in the Vercel environment, the main
// site's /audio paths (www and apex) answer 301 to audio.studio-808.com.
// Otherwise the request passes through and vercel.json serves /audio on www
// as before. The decision lives in src/lib/audioRedirect.js (tested).

import { next } from '@vercel/functions'
import { audioRedirectTarget } from './src/lib/audioRedirect.js'

export const config = {
  matcher: ['/audio', '/audio/:path*'],
  runtime: 'nodejs',
}

export default function middleware(request: Request) {
  const target = audioRedirectTarget(request.url, request.headers.get('host') ?? new URL(request.url).host, process.env)
  if (target) return new Response(null, { status: 301, headers: { Location: target } })
  return next()
}
