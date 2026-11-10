// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TESTIMONIALS_HEADING, testimonialByline, testimonialsHeading, visibleTestimonials } from './audioTestimonials.js'

const t = (over = {}) => ({ _id: 't1', quote: 'Lovely session.', name: 'A Person', cleared: true, ...over })

test('only cleared testimonials with a quote and a name show', () => {
  const data = {
    page: {},
    testimonials: [
      t({ _id: 'a' }),
      t({ _id: 'b', cleared: false }),
      t({ _id: 'c', cleared: null }),
      t({ _id: 'd', quote: '   ' }),
      t({ _id: 'e', name: '' }),
      t({ _id: 'f' }),
    ],
  }
  assert.deepEqual(visibleTestimonials(data).map(x => x._id), ['a', 'f'])
})

test('the page toggle: off hides the section, missing counts as on', () => {
  const testimonials = [t()]
  assert.equal(visibleTestimonials({ page: { showTestimonials: false }, testimonials }).length, 0)
  assert.equal(visibleTestimonials({ page: { showTestimonials: true }, testimonials }).length, 1)
  assert.equal(visibleTestimonials({ page: {}, testimonials }).length, 1)
})

test('no page or no testimonials: nothing to show', () => {
  assert.deepEqual(visibleTestimonials({ page: null, testimonials: [t()] }), [])
  assert.deepEqual(visibleTestimonials({ page: {}, clips: [], credits: [] }), [])
  assert.deepEqual(visibleTestimonials(null), [])
})

test('heading falls back to the default', () => {
  assert.equal(testimonialsHeading({}), TESTIMONIALS_HEADING)
  assert.equal(testimonialsHeading({ testimonialsHeading: '  ' }), TESTIMONIALS_HEADING)
  assert.equal(testimonialsHeading({ testimonialsHeading: 'Kind words' }), 'Kind words')
})

test('byline joins role and company, either optional', () => {
  assert.equal(testimonialByline({ role: 'Producer', company: 'Hachette' }), 'Producer, Hachette')
  assert.equal(testimonialByline({ role: '', company: 'Hachette' }), 'Hachette')
  assert.equal(testimonialByline({ role: 'Producer' }), 'Producer')
  assert.equal(testimonialByline({}), '')
})
