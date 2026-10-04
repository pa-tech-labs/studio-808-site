// Scroll-reveal and count-up, site-wide. One IntersectionObserver per
// element, disconnected the first time it is seen, so every reveal runs once.
// Under prefers-reduced-motion, or without IntersectionObserver, elements are
// "in view" from the start and numbers show their final value.

import { useEffect, useRef, useState } from 'react'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const canObserve = () => typeof window !== 'undefined' && 'IntersectionObserver' in window

/** True once the element has scrolled into view, and from then on. */
export function useInView<T extends Element>(rootMargin = '0px 0px -10% 0px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(() => prefersReducedMotion() || !canObserve())
  useEffect(() => {
    if (inView || !ref.current) return
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        setInView(true)
        io.disconnect()
      }
    }, { rootMargin, threshold: 0.12 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [inView, rootMargin])
  return { ref, inView }
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/** Counts from 0 to `target` over `ms` once `run` turns true. Final value at once under reduced motion. */
export function useCountUp(target: number, run: boolean, ms = 1100) {
  const reduce = prefersReducedMotion()
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!run || reduce) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      setValue(target * easeOut(t))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, run, ms, reduce])
  return reduce ? target : value
}
