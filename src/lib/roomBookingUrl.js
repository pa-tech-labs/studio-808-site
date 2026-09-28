// The one place a room-specific booking link is built.
//
// The booking page (book.studio-808.com, run on Cue) opens on a given room
// when the link carries ?room=<slug>. The slug is the room's "Booking link"
// in Cue > Rooms (studio-1 .. studio-4), stored per studio in Sanity as
// cueRoomSlug. It follows the room NUMBER, never the customer-facing name.
//
// Plain JS with a .d.ts beside it, so the React pages, the Sanity schema and
// the api/chat.js serverless function all share this one file.

/** The plain booking page. Every room link falls back to exactly this. */
export const BOOKING_PAGE_URL = 'https://book.studio-808.com/book'

/**
 * Lowercase letters, digits and hyphens, 1 to 40 characters. Mirrors the
 * venues_slug_format_check constraint on the booking side, so a slug Sanity
 * accepts is always one the booking page can match.
 */
export const CUE_ROOM_SLUG_PATTERN = /^[a-z0-9-]{1,40}$/

/**
 * `base` with ?room=<slug> added. A missing or malformed slug returns `base`
 * untouched: a plain booking page is always better than the wrong room.
 * Any query string or hash already on `base` (UTM tags, tracking) is kept.
 */
export function roomBookingUrl(slug, base = BOOKING_PAGE_URL) {
  const s = typeof slug === 'string' ? slug.trim() : ''
  if (!CUE_ROOM_SLUG_PATTERN.test(s)) return base
  const url = new URL(base)
  url.searchParams.set('room', s)
  return url.toString()
}
