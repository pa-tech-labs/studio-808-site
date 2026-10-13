// Vercel Routing Middleware (the successor to Edge Middleware; it runs on the
// Node.js runtime, as Vercel now recommends over the deprecated Edge
// runtime). For /audio paths only.
//
// Vercel runs it AFTER vercel.json's own routes (just before the filesystem),
// so vercel.json must not end www or apex /audio requests itself: it used to
// rewrite them to the app shell, and the middleware never ran. This file now
// owns them:
//   AUDIO_SUBDOMAIN_LIVE=true  301 to voice.studio-808.com, path and query kept
//   otherwise                  rewrite to the app shell (/index.html)
// Every other host (previews, localhost) passes through unchanged. The
// decision lives in src/lib/audioRedirect.js (tested).

import { next, rewrite } from '@vercel/functions'
import { audioMiddlewareAction } from './src/lib/audioRedirect.js'

export const config = {
  matcher: ['/audio', '/audio/:path*'],
  runtime: 'nodejs',
}

export default function middleware(request: Request) {
  const action = audioMiddlewareAction(request.url, request.headers.get('host') ?? new URL(request.url).host, process.env)
  if (action && 'redirect' in action) return new Response(null, { status: 301, headers: { Location: action.redirect } })
  if (action) return rewrite(new URL(action.rewrite, request.url))
  return next()
}
