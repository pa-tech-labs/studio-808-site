// Sanity block content (Portable Text) in the /audio typography. Links open
// external sites in a new tab; headings stay inside the page's outline.

import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableText as Blocks } from '../../../lib/audioPage'

const external = (href: string) => /^https?:\/\//.test(href) && !/^https?:\/\/([a-z0-9-]+\.)*studio-808\.com/i.test(href)

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    link: ({ value, children }) => {
      const href = typeof value?.href === 'string' ? value.href : ''
      if (!href) return <>{children}</>
      return external(href)
        ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
        : <a href={href}>{children}</a>
    },
  },
}

export default function BlockContent({ value, className = 'a8-prose' }: { value: Blocks | null | undefined; className?: string }) {
  if (!Array.isArray(value) || value.length === 0) return null
  return <div className={className}><PortableText value={value} components={components} /></div>
}
