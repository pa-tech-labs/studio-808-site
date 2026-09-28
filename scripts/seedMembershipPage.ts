// Creates the "Membership page" singleton in Sanity from the copy in
// src/lib/membershipPageContent.js (taken from Cue's live membership page).
//
// Run (Node 22.18+ strips the types itself, no build step):
//   SANITY_WRITE_TOKEN=<editor token> SANITY_STUDIO_PROJECT_ID=riowycjq npm run seed:membership-page
//
// The token comes from the environment only. Never commit it. Create one at
// sanity.io/manage > API > Tokens with Editor access, and revoke it after.
//
// Refuses to overwrite an existing singleton, so edits made in the hosted
// studio are never lost to a re-run. Pass --force to replace it anyway.
// Also uploads the page's two images (the Studio 4 photo in public/ and the
// DJ photo from Studio 808's brand kit on Cue) so they can be swapped in the
// studio; a failed upload is reported and the page shows its local fallback.

import { readFile } from 'node:fs/promises'
import { createClient } from '@sanity/client'
import { membershipPageContent } from '../src/lib/membershipPageContent.js'

const token = process.env.SANITY_WRITE_TOKEN
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.VITE_SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET ?? 'production'
const force = process.argv.includes('--force')

if (!token || !projectId) {
  console.error('Set SANITY_WRITE_TOKEN and SANITY_STUDIO_PROJECT_ID (e.g. riowycjq) in the environment.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false })

const existing = await client.fetch<{ _id: string } | null>(`*[_id == "membershipPage"][0]{ _id }`)
if (existing && !force) {
  console.error('A Membership page document already exists. Re-run with --force to replace it (this discards edits made in the studio).')
  process.exit(1)
}

const IMAGES = {
  producer: { file: new URL('../public/images/studios/studio4-production-1.jpg', import.meta.url), filename: 'studio4-production-1.jpg' },
  socials: { url: 'https://assets.lumentry.app/brand/fcf37158-bb9e-4cc3-8573-f39e8cfe06b7/images/1785743735674-dj-studio-booth-green-live.jpg', filename: 'dj-studio-booth-green-live.jpg' },
}

async function upload(source: { file?: URL; url?: string; filename: string }) {
  try {
    const body = source.file
      ? await readFile(source.file)
      : Buffer.from(await (await fetch(source.url!)).arrayBuffer())
    const asset = await client.assets.upload('image', body, { filename: source.filename })
    return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
  } catch (err) {
    console.warn(`  Could not upload ${source.filename} (${err instanceof Error ? err.message : err}); the page will use its fallback image.`)
    return undefined
  }
}

const [producerImage, socialsImage] = await Promise.all([upload(IMAGES.producer), upload(IMAGES.socials)])

const doc = {
  ...membershipPageContent,
  producer: { ...membershipPageContent.producer, ...(producerImage ? { image: producerImage } : {}) },
  socials: { ...membershipPageContent.socials, ...(socialsImage ? { image: socialsImage } : {}) },
}

await client.createOrReplace(doc)

console.log(`Membership page written${existing ? ' (replaced)' : ''}.`)
console.log(`  Images: producer ${producerImage ? 'uploaded' : 'fallback'}, socials ${socialsImage ? 'uploaded' : 'fallback'}`)
console.log(`  Fallback tiers: ${doc.tiers.map(t => `${t.name} £${t.monthlyPrice}`).join(', ')}`)
