// FAQ (#faq) from audioPage.faqs. Native <details>/<summary>, one open at a
// time (handled here rather than with the `name` attribute, which would close
// the previous answer instantly and cut its animation). Opening and closing
// animate the answer's height and opacity (220ms easeOutQuart); under
// reduced motion they snap.
//
// Markup stays plain (question in <summary>, answer in a <p>) because the
// FAQPage JSON-LD will be built from the same audioPage.faqs data.

import { useRef, type MouseEvent } from 'react'
import type { AudioPageData } from '../../../lib/audioPage'
import { prefersReducedMotion } from '../../../hooks/useInView'
import { AUDIO_ANCHORS } from '../anchors'
import { hasFaqs } from './has'

const DURATION = 220
const EASE = 'cubic-bezier(0.25, 1, 0.5, 1)'

function animateOpen(details: HTMLDetailsElement, body: HTMLElement) {
  details.open = true
  const h = body.scrollHeight
  body.animate(
    [{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }],
    { duration: DURATION, easing: EASE },
  )
}

function animateClose(details: HTMLDetailsElement, body: HTMLElement) {
  const h = body.scrollHeight
  const a = body.animate(
    [{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0 }],
    { duration: DURATION * 0.8, easing: EASE },
  )
  a.onfinish = () => { details.open = false }
}

export default function FAQ({ data }: { data: AudioPageData }) {
  const listRef = useRef<HTMLDivElement>(null)
  if (!hasFaqs(data.page)) return null
  const faqs = (data.page?.faqs ?? []).filter(f => f.question && f.answer)

  const onSummary = (e: MouseEvent<HTMLElement>) => {
    const details = e.currentTarget.parentElement as HTMLDetailsElement
    const body = details.querySelector<HTMLElement>('.a8-faq-a')
    // Let the browser handle it natively when motion is reduced.
    if (!body || prefersReducedMotion() || !('animate' in body)) {
      if (!details.open) closeOthers(details, false)
      return
    }
    e.preventDefault()
    if (details.open) {
      animateClose(details, body)
    } else {
      closeOthers(details, true)
      animateOpen(details, body)
    }
  }

  const closeOthers = (keep: HTMLDetailsElement, animate: boolean) => {
    listRef.current?.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(d => {
      if (d === keep) return
      const b = d.querySelector<HTMLElement>('.a8-faq-a')
      if (animate && b) animateClose(d, b)
      else d.open = false
    })
  }

  return (
    <section id={AUDIO_ANCHORS.faq} className="a8-sec a8-faq" aria-labelledby="a8-faq-title">
      <div className="a8-wrap a8-faq-grid">
        <header className="a8-sec-head">
          <h2 id="a8-faq-title" className="a8-h2">Questions</h2>
        </header>
        <div className="a8-faq-list" ref={listRef}>
          {faqs.map((f, i) => (
            <details key={f._key ?? i}>
              <summary onClick={onSummary}>{f.question}</summary>
              <div className="a8-faq-a"><p>{f.answer}</p></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
