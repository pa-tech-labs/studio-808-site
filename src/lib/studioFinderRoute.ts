import type { Location } from 'react-router-dom'

// The wizard is an overlay with its own URL. Opening it from a page pushes
// /find-your-studio with that page as `backgroundLocation`, so App keeps the
// page rendered underneath and closing is a plain history back. A direct
// visit to /find-your-studio has no background and renders over Home.

export const FINDER_PATH = '/find-your-studio'

export interface FinderLinkState { backgroundLocation: Location }

/** Link state that keeps `from` rendered behind the overlay. */
export function finderLinkState(from: Location): FinderLinkState {
  return { backgroundLocation: from }
}

export function backgroundOf(location: Location): Location | undefined {
  const state = location.state as Partial<FinderLinkState> | null
  return state?.backgroundLocation
}
