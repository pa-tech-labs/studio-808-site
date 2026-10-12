// A path on audio.studio-808.com that is not / or /terms, reached in the app
// (the server answers such paths with the static 404 page, dist/audio/404.html,
// built by scripts/buildAudio.js with the same words).

import { Link } from 'react-router-dom'

export default function AudioNotFound() {
  return (
    <section className="a8-legal" aria-labelledby="a8-404-title">
      <div className="a8-wrap">
        <header className="a8-legal-head">
          <h1 id="a8-404-title" className="a8-h1">Page not found</h1>
          <p className="a8-legal-updated">There is nothing at this address.</p>
        </header>
        <p><Link className="a8-btn a8-btn-solid" to="/">Back to 808 Audio</Link></p>
      </div>
    </section>
  )
}
