// Process from audioPage.process: a horizontal stepper on desktop, vertical
// on mobile, joined by a hairline. A genuine sequence, so it is numbered.
// The steps fade in once (opacity only) when they first scroll into view.
//
// With a cleared session video (audioPage.sessionVideo) the section becomes
// "How a session works": the video and its transcript on one side, the
// heading, intro and steps (vertical at every width) on the other. The
// video alone is enough to render the section; so are the steps alone.

import type { CSSProperties } from 'react'
import type { AudioPageData } from '../../../lib/audioPage'
import { useInView } from '../../../hooks/useInView'
import { AUDIO_ANCHORS } from '../anchors'
import { hasProcess, sessionVideoOf } from './has'
import SessionVideo from './SessionVideo'

export default function Process({ data }: { data: AudioPageData }) {
  const { ref, inView } = useInView<HTMLOListElement>()
  const video = sessionVideoOf(data.page)
  if (!video && !hasProcess(data.page)) return null
  const steps = (data.page?.process ?? []).filter(s => s.title)
  const heading = video ? video.heading?.trim() || 'How a session works' : 'How it works'

  const list = steps.length > 0 && (
    <ol ref={ref} className={`a8-steps${video ? ' a8-steps-v' : ''}`} data-in={inView} style={{ '--a8-steps': steps.length } as CSSProperties}>
      {steps.map((s, i) => (
        <li key={s._key ?? i} style={{ '--i': i } as CSSProperties}>
          <span className="a8-step-num" aria-hidden="true">{s.step ?? i + 1}</span>
          <h3 className="a8-step-title">{s.title}</h3>
          {s.description && <p className="a8-step-text">{s.description}</p>}
        </li>
      ))}
    </ol>
  )

  return (
    <section id={AUDIO_ANCHORS.process} className="a8-sec a8-process" aria-labelledby="a8-process-title">
      <div className={`a8-wrap${video ? ' a8-session' : ''}`}>
        <header className="a8-sec-head">
          <h2 id="a8-process-title" className="a8-h2">{heading}</h2>
          {video?.intro && <p className="a8-lead">{video.intro}</p>}
        </header>
        {video && <SessionVideo video={video} title={heading} />}
        {list}
      </div>
    </section>
  )
}
