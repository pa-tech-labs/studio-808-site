import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// Every route change lands at the top of the new page. A location with a hash
// (#savings, #plan-...) lands on that anchor instead; when the anchor is not
// rendered yet (data still loading) a new page starts at the top and the
// page's own hash handler lands it later. A search-only change on the same
// path (/membership's ?type= and ?term= toggles) does not scroll at all.
//
// Plain JS without JSX so node's test runner can import it. Runs in a layout
// effect with instant scrolling, so the new page is never painted at the old
// position or seen sliding (html has scroll-behavior: smooth, which an
// explicit 'instant' overrides). `location` is the location the routes
// render, which differs from the URL while the Studio finder overlay is open
// over a page; opening or closing the overlay is not a page change.
export default function ScrollToTop({ location } = {}) {
  const current = useLocation()
  const { pathname, hash } = location ?? current
  const lastPath = useRef(null)

  // The browser restoring the old offset on back/forward would fight this.
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
  }, [])

  useLayoutEffect(() => {
    const newPage = lastPath.current !== pathname
    lastPath.current = pathname
    const target = hash ? document.getElementById(anchorId(hash)) : null
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' })
    else if (newPage) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}

function anchorId(hash) {
  try {
    return decodeURIComponent(hash.slice(1))
  } catch {
    return hash.slice(1)
  }
}
