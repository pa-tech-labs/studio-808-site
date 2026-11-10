// Which testimonials the Studio 808 Voice page shows, in plain JS so it can be
// unit tested (audioTestimonials.test.js). The page query returns every
// audioTestimonial with its `cleared` flag; this decides what is public.

/** The default section heading, used when audioPage.testimonialsHeading is empty. */
export const TESTIMONIALS_HEADING = 'What clients say'

const filled = s => typeof s === 'string' && s.trim().length > 0

/**
 * The testimonials to show, in their query order: none when the page has
 * switched the section off (showTestimonials false; a missing value counts as
 * on), otherwise every cleared one with both a quote and a name.
 */
export function visibleTestimonials(data) {
  if (!data?.page || data.page.showTestimonials === false) return []
  const list = Array.isArray(data.testimonials) ? data.testimonials : []
  return list.filter(t => t && t.cleared === true && filled(t.quote) && filled(t.name))
}

/** The section heading: the page's own, else the default. */
export function testimonialsHeading(page) {
  return filled(page?.testimonialsHeading) ? page.testimonialsHeading.trim() : TESTIMONIALS_HEADING
}

/** "Role, Company", either part optional; empty when neither is set. */
export function testimonialByline(t) {
  return [t?.role, t?.company].filter(filled).map(s => s.trim()).join(', ')
}
