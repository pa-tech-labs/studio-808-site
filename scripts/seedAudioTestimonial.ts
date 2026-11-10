// Creates the first Studio 808 Voice testimonial (Dominic Gribben, Hachette)
// in Sanity, published and cleared, from src/lib/audioTestimonialSeed.js.
//
// Run (Node 22.18+ strips the types itself, no build step):
//   SANITY_WRITE_TOKEN=<editor token> SANITY_STUDIO_PROJECT_ID=riowycjq npm run seed:audio-testimonial
//
// The token comes from the environment only. Never commit it. Create one at
// sanity.io/manage > API > Tokens with Editor access, and revoke it after.
//
// Uses a fixed document id and createIfNotExists, so a re-run never
// duplicates it or overwrites edits made in the studio. Pass --force to
// replace it with the seed copy anyway. Publishing it triggers the "Rebuild
// Voice site" webhook once that webhook's filter includes audioTestimonial.

import { createClient } from '@sanity/client'
import { AUDIO_TESTIMONIAL_SEED, AUDIO_TESTIMONIAL_SEED_ID } from '../src/lib/audioTestimonialSeed.js'

const token = process.env.SANITY_WRITE_TOKEN
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.VITE_SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET ?? 'production'
const force = process.argv.includes('--force')

if (!token || !projectId) {
  console.error('Set SANITY_WRITE_TOKEN and SANITY_STUDIO_PROJECT_ID (e.g. riowycjq) in the environment.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false })

const doc = { _id: AUDIO_TESTIMONIAL_SEED_ID, _type: 'audioTestimonial', ...AUDIO_TESTIMONIAL_SEED }

const existing = await client.fetch<{ _id: string } | null>('*[_id == $id][0]{ _id }', { id: doc._id })
if (existing && !force) {
  console.log(`Testimonial ${doc._id} already exists; left as it is. Re-run with --force to replace it with the seed copy.`)
  process.exit(0)
}

await (force ? client.createOrReplace(doc) : client.createIfNotExists(doc))
console.log(`Testimonial ${doc._id} ${existing ? 'replaced' : 'created'} (published, cleared). It shows on the Voice page after the next build.`)
