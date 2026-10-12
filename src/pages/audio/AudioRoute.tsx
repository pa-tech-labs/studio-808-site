import { Navigate, Route, Routes } from 'react-router-dom'
import AudioLayout from './AudioLayout'
import AudioHome from './AudioHome'
import AudioTerms from './AudioTerms'
import { useAudioPage } from './useAudioPage'

/**
 * /audio/*: the 808 Audio route tree. Gated like the Studio finder: nothing
 * while loading, then off to the home page unless the 808 Audio page is
 * switched on in Sanity (it is off by default).
 */
export default function AudioRoute() {
  const data = useAudioPage()
  if (data === undefined) return <div style={{ minHeight: '100dvh', background: '#0f0f0e' }} />
  if (!data?.page?.enabled) return <Navigate to="/" replace />
  return (
    <Routes>
      <Route element={<AudioLayout data={data} />}>
        <Route index element={<AudioHome />} />
        <Route path="terms" element={<AudioTerms />} />
        <Route path="*" element={<Navigate to="/audio" replace />} />
      </Route>
    </Routes>
  )
}
