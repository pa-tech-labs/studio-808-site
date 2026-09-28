import { useEffect } from 'react'

/** Sends the browser to another site, replacing the current history entry. */
export default function ExternalRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to)
  }, [to])
  return null
}
