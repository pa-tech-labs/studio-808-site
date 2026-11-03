// Build-time only: the Studio 808 Voice pages rendered to HTML, so crawlers
// and link previews see the real copy without running JavaScript.
// scripts/buildAudio.js builds this with `vite build --ssr` and writes the
// result in front of #root (see scripts/audioPrerender.js); AudioLayout
// removes it the moment the app has rendered the same page.
//
// The markup is not hydrated: the app renders from scratch as usual, so the
// two only need to look the same, not match node for node.

import { renderToString } from 'react-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import { Route, Routes, StaticRouter } from 'react-router-dom'
import type { AudioPageData } from '../../lib/audioPage'
import AudioLayout from './AudioLayout'
import AudioHome from './AudioHome'
import AudioTerms from './AudioTerms'

/** The body of one route ('home' or 'terms') as served on `host`. */
export function renderAudioBody(data: AudioPageData, route: 'home' | 'terms', host: string): string {
  const g = globalThis as { __AUDIO_PRERENDER_HOST__?: string }
  g.__AUDIO_PRERENDER_HOST__ = host
  try {
    return renderToString(
      <HelmetProvider context={{}}>
        <StaticRouter location={route === 'terms' ? '/terms' : '/'}>
          <Routes>
            <Route element={<AudioLayout data={data} />}>
              <Route index element={<AudioHome />} />
              <Route path="terms" element={<AudioTerms />} />
            </Route>
          </Routes>
        </StaticRouter>
      </HelmetProvider>,
    )
  } finally {
    delete g.__AUDIO_PRERENDER_HOST__
  }
}
