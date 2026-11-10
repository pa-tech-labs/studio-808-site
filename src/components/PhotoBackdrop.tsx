// A photo that emerges from the page ground behind a section: the photo, a veil
// of the page black on top of it (one or more linear fades), then fine film
// grain that only shows where the photo does. Same treatment as the Console
// marketing site's SectionBackdrop (console-site PR #16).
//
// Use inside a section that is `position: relative; isolation: isolate`. The
// layer sits at z-index -1 in that stacking context, under the section's copy.
//
// Images are pre-processed files named `${src}-${width}.avif|.jpg` (see
// public/podcast/). They are decorative: alt="" inside an aria-hidden layer.
//
// Fades: each stop is [position, visible], where position is a % (number) or
// any CSS length, and visible is the share of the photo that shows there
// (0 = solid page black, 1 = the photo untouched). Several fades multiply.
// Copy contrast depends on these stops, so measure after changing them.
//
// Motion: the photo eases from a 6% zoom to rest the first time it scrolls into
// view (the site's --s8-ease). Nothing is scroll-linked, and under
// prefers-reduced-motion it does not move at all.

import { useId } from 'react'
import { useInView } from '../hooks/useInView'
import './PhotoBackdrop.css'

export type FadeStop = [position: number | string, visible: number]

export interface Fade {
  /** CSS linear-gradient direction, e.g. 'to right', 'to bottom'. */
  direction: string
  stops: FadeStop[]
}

export interface BackdropLayout {
  /** object-position of the photo: the focal point to keep in frame. */
  focal?: string
  fades?: Fade[]
  /** Layer box inside the section. Defaults to the whole section. */
  top?: string
  height?: string
  left?: string
  width?: string
  /** Hide the layer (and skip loading its image) at this size. */
  hidden?: boolean
}

interface Props {
  /** Base path without size or extension, e.g. '/podcast/brick'. */
  src: string
  /** Widths that exist on disk, ascending. */
  widths?: number[]
  sizes?: string
  /** Layout below `wide.minWidth` (or always, without `wide`). */
  base: BackdropLayout
  /** Layout from `minWidth` px up. */
  wide?: BackdropLayout & { minWidth: number }
  grain?: boolean
  /** Page ground the photo fades into, as "r, g, b". */
  ground?: string
}

const pos = (p: number | string) => (typeof p === 'number' ? `${p}%` : p)

const gradients = (fades: Fade[] | undefined, color: (visible: number) => string) =>
  fades?.length
    ? fades.map(f => `linear-gradient(${f.direction}, ${f.stops.map(([p, v]) => `${color(v)} ${pos(p)}`).join(', ')})`).join(', ')
    : 'none'

function vars(l: BackdropLayout, ground: string) {
  if (l.hidden) return 'display:none;'
  const veil = gradients(l.fades, v => `rgba(${ground}, ${+(1 - v).toFixed(3)})`)
  const mask = gradients(l.fades, v => `rgba(0, 0, 0, ${+v.toFixed(3)})`)
  return [
    'display:block',
    `--pb-top:${l.top ?? '0px'}`,
    `--pb-h:${l.height ?? '100%'}`,
    `--pb-left:${l.left ?? '0px'}`,
    `--pb-w:${l.width ?? '100%'}`,
    `--pb-focal:${l.focal ?? '50% 50%'}`,
    `--pb-veil:${veil}`,
    `--pb-mask:${mask === 'none' ? 'linear-gradient(#000, #000)' : mask}`,
  ].join(';') + ';'
}

export default function PhotoBackdrop({
  src,
  widths = [800, 1200, 2048],
  sizes = '100vw',
  base,
  wide,
  grain = true,
  ground = '13, 13, 13',
}: Props) {
  const cls = `pb-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const { ref, inView } = useInView<HTMLDivElement>('0px')
  const srcSet = (ext: string) => widths.map(w => `${src}-${w}.${ext} ${w}w`).join(', ')
  const css = `.${cls}{${vars(base, ground)}}` +
    (wide ? `@media (min-width:${wide.minWidth}px){.${cls}{${vars(wide, ground)}}}` : '')

  return (
    <>
      <style>{css}</style>
      <div ref={ref} aria-hidden="true" className={`pb ${cls}${inView ? ' pb-in' : ''}`}>
        <picture>
          <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
          <img
            src={`${src}-${widths[Math.min(1, widths.length - 1)]}.jpg`}
            srcSet={srcSet('jpg')}
            sizes={sizes}
            alt=""
            loading="lazy"
            decoding="async"
            className="pb-photo"
          />
        </picture>
        <div className="pb-veil" />
        {grain && <div className="pb-grain" />}
      </div>
    </>
  )
}
