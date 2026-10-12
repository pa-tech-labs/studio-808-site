import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AudioLayout from './AudioLayout'
import AudioHome from './AudioHome'
import AudioTerms from './AudioTerms'
import AudioNotFound from './AudioNotFound'
import { useAudioPage } from './useAudioPage'
import { MAIN_ORIGIN, audioPath, currentHost, isAudioHost } from '../../lib/audioHost.js'

/**
 * The Studio 808 Voice route tree: /audio/* on the main site, the root of
 * voice.studio-808.com. Gated like the Studio finder: nothing while loading,
 * then away to the Studio 808 home page unless the Studio 808 Voice page is switched
 * on in Sanity (it is off by default).
 */
export default function AudioRoute() {
  const data = useAudioPage()
  const host = currentHost()
  const onSubdomain = isAudioHost(host)
  const off = data !== undefined && !data?.page?.enabled

  // On the subdomain "/" is this tree, so the home page is on the main site.
  useEffect(() => {
    if (off && onSubdomain) window.location.replace(`${MAIN_ORIGIN}/`)
  }, [off, onSubdomain])

  if (data === undefined || (off && onSubdomain)) return <div style={{ minHeight: '100dvh', background: '#0f0f0e' }} />
  if (off) return <Navigate to="/" replace />
  return (
    <Routes>
      <Route element={<AudioLayout data={data!} />}>
        <Route index element={<AudioHome />} />
        <Route path="terms" element={<AudioTerms />} />
        <Route path="*" element={onSubdomain ? <AudioNotFound /> : <Navigate to={audioPath(host)} replace />} />
      </Route>
    </Routes>
  )
}
