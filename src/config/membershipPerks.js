// Default "What's included" lists for /membership plan cards, by membership
// type. A plan shows its tier's own perks (Cue's membership_tiers.perks); a
// tier whose perks array is empty gets the list for its type from here. This
// is the only place these defaults live, so they can move into Cue's admin
// later without touching the page.
//
// Placeholders are filled from the plan: {hours} is hours per month, {months}
// the minimum term, {room} the plan's room name. A line whose placeholder has
// no value (no hours on a DJ plan, say) is dropped rather than shown blank.

export const DEFAULT_PERKS = {
  dj: [
    'Monthly booking credit, spent at member rates',
    'Member pricing on every room',
    'Members-only late-night hours',
  ],
  producer: [
    '{hours} hours a month in {room}',
    'Members-only hours the public cannot book',
    'Extra hours at the member overflow rate when you run past your allowance',
  ],
}
