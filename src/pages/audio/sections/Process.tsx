// Process from audioPage.process: a horizontal stepper on desktop, vertical
// on mobile, joined by a hairline. A genuine sequence, so it is numbered.
// The steps fade in once (opacity only) when they first scroll into view.

import type { CSSProperties } from 'react'
import type { AudioPageData } from '../../../lib/audioPage'
import { useInView } from '../../../hooks/useInView'
import { hasProcess } from './has'

export default function Process({ data }: { data: AudioPageData }) {
  const { ref, inView } = useInView<HTMLOListElement>()
  if (!hasProcess(data.page)) return null
  const steps = (data.page?.process ?? []).filter(s => s.title)

  return (
    <section className="a8-sec a8-process" aria-labelledby="a8-process-title">
      <div className="a8-wrap">
        <header className="a8-sec-head">
          <h2 id="a8-process-title" className="a8-h2">How it works</h2>
        </header>
        <ol ref={ref} className="a8-steps" data-in={inView} style={{ '--a8-steps': steps.length } as CSSProperties}>
          {steps.map((s, i) => (
            <li key={s._key ?? i} style={{ '--i': i } as CSSProperties}>
              <span className="a8-step-num" aria-hidden="true">{s.step ?? i + 1}</span>
              <h3 className="a8-step-title">{s.title}</h3>
              {s.description && <p className="a8-step-text">{s.description}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
