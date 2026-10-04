// Studio names in Sanity read "Studio 1 — Performer": the room, a dash, the
// role. The pages show them apart (room as the headline, role as the serif
// subline) and never print the dash. Plain JS with a .d.ts beside it, so the
// node:test suite can check it.

const SEPARATOR = /\s+[\u2014\u2013-]\s+/

/**
 * { room, role } from a studio document. `role` prefers the tagline field,
 * then the tail of the name; `room` is the head of the name, or "Studio N"
 * from the number when the name is missing.
 */
export function splitStudioName(studio) {
  const name = String(studio?.name ?? '').trim()
  const [head, ...tail] = name.split(SEPARATOR)
  const number = String(studio?.studioNumber ?? '').trim().replace(/^0+(?=\d)/, '')
  const room = head || (number ? `Studio ${number}` : '')
  const role = String(studio?.tagline ?? '').trim() || tail.join(' ').trim()
  return { room, role }
}

/** "Studio 1, Performer": the name with the dash replaced, for alt text and labels. */
export function studioLabel(studio) {
  const { room, role } = splitStudioName(studio)
  return [room, role].filter(Boolean).join(', ')
}

/** "01" from "1" or "01": the key the bundled images use. */
export function studioKey(studioNumber) {
  const n = String(studioNumber ?? '').trim()
  return /^\d+$/.test(n) ? n.padStart(2, '0') : n
}
