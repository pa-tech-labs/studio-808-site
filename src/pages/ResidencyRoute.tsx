import { Navigate } from 'react-router-dom'
import Residency from './Residency'
import { useResidencyEnabled } from '../lib/residency'

/** /residency: the Residency page when enabled in Sanity, otherwise off to /membership. */
export default function ResidencyRoute() {
  const enabled = useResidencyEnabled()
  if (enabled === null) return null
  if (!enabled) return <Navigate to="/membership" replace />
  return <Residency />
}
