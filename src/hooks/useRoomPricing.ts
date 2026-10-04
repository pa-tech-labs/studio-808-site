// A room's live price list from Cue (the tiers endpoint's rooms[].bands and
// min_booking_hours, access-hub #548), found by the room's name ("Studio 4").
// Shares useMembershipData's one Cue read per page load. `bands` is empty
// until Cue answers, and stays empty when Cue sends none: callers then show
// the Sanity price, so a price never comes from a stale copy when Cue has one.

import { useMembershipData } from './useMembershipData'
import { memberHoursWeek, plansForTrack, type MembershipRoom, type PriceBand } from '../lib/membershipPlans.js'

export type RoomPricing = {
  room: MembershipRoom | null
  bands: PriceBand[]
  minBookingHours: number | null
  /** "Evenings and weekends" when the room has producer-only hours, else null. */
  membersOnlyWhen: string | null
}

const EMPTY: RoomPricing = { room: null, bands: [], minBookingHours: null, membersOnlyWhen: null }

export function useRoomPricing(roomName: string | null | undefined): RoomPricing {
  const { plans } = useMembershipData()
  if (!plans || plans.source !== 'cue' || !roomName) return EMPTY
  const key = roomName.trim().toLowerCase()
  const room = plans.rooms.find(r => r.name.trim().toLowerCase() === key) ?? null
  if (!room) return { ...EMPTY, minBookingHours: plans.minBookingHours }
  const week = memberHoursWeek(room, plansForTrack(plans.plans, 'producer').map(p => p.key))
  const membersOnlyWhen = week.hasEvenings && week.hasWeekends ? 'Evenings and weekends'
    : week.hasWeekends ? 'Weekends' : week.hasEvenings ? 'Evenings' : null
  return { room, bands: room.bands, minBookingHours: plans.minBookingHours, membersOnlyWhen }
}
