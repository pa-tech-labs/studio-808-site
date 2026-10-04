// Once-only scroll reveal for /membership: fades and lifts its children the
// first time they scroll into view (hooks/useInView.ts). The .rv styles live
// with the page's CSS.

import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useInView } from '../hooks/useInView'

/**
 * Fades and lifts its children in the first time they scroll into view.
 * `index` staggers siblings (70ms apart, capped so a long list never waits).
 */
export default function Reveal({ as: Tag = 'div', index = 0, className = '', style, children }: {
  as?: ElementType
  index?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const { ref, inView } = useInView<HTMLElement>()
  return (
    <Tag
      ref={ref}
      className={`rv${inView ? ' rv-in' : ''}${className ? ` ${className}` : ''}`}
      style={{ ...style, '--rv-i': Math.min(index, 6) } as CSSProperties}
    >
      {children}
    </Tag>
  )
}

