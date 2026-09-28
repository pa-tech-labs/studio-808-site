// Creates the "Studio finder" singleton in Sanity from studioFinderSeedContent.js.
//
// Run (Node 22.18+ strips the types itself, no build step):
//   SANITY_WRITE_TOKEN=<editor token> SANITY_STUDIO_PROJECT_ID=riowycjq npm run seed:studio-finder
//
// The token comes from the environment only. Never commit it. Create one at
// sanity.io/manage > API > Tokens with Editor access, and revoke it after.
//
// Refuses to overwrite an existing singleton, so edits made in the hosted
// studio are never lost to a re-run. Pass --force to replace it anyway.
// Studios are resolved by sortOrder (1 to 4); a missing one stops the seed
// before anything is written.

import { createClient } from '@sanity/client'
import { questions, rules, singleton } from './studioFinderSeedContent.js'

const token = process.env.SANITY_WRITE_TOKEN
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.VITE_SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET ?? 'production'
const force = process.argv.includes('--force')

if (!token || !projectId) {
  console.error('Set SANITY_WRITE_TOKEN and SANITY_STUDIO_PROJECT_ID (e.g. riowycjq) in the environment.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false })

type StudioRow = { _id: string; name: string; sortOrder: number }

const studios = await client.fetch<StudioRow[]>(
  `*[_type == "studio" && !(_id in path("drafts.**"))]{ _id, name, sortOrder }`,
)

const bySortOrder = new Map<number, StudioRow>()
for (const s of studios) {
  if (bySortOrder.has(s.sortOrder)) {
    console.error(`Two studio documents share sortOrder ${s.sortOrder}: ${bySortOrder.get(s.sortOrder)!.name} and ${s.name}. Fix that first.`)
    process.exit(1)
  }
  bySortOrder.set(s.sortOrder, s)
}

const unresolved = [...new Set(rules.map(r => r.studioSortOrder))].filter(n => !bySortOrder.has(n))
if (unresolved.length) {
  console.error(`No studio document with sortOrder ${unresolved.join(', ')}. Nothing written.`)
  process.exit(1)
}

const existing = await client.fetch<{ _id: string } | null>(`*[_id == "studioFinder"][0]{ _id }`)
if (existing && !force) {
  console.error('A Studio finder document already exists. Re-run with --force to replace it (this discards edits made in the studio).')
  process.exit(1)
}

const doc = {
  ...singleton,
  questions,
  rules: rules.map(({ studioSortOrder, ...rule }) => ({
    ...rule,
    _type: 'rule',
    addOns: rule.addOns ?? [],
    studio: { _type: 'reference', _ref: bySortOrder.get(studioSortOrder)!._id },
  })),
}

await client.createOrReplace(doc)

console.log('Studio finder written. Rules resolve to:')
for (const r of rules) {
  const s = bySortOrder.get(r.studioSortOrder)!
  const when = r.conditions.length ? r.conditions.map(c => `${c.questionKey}=${c.equals}`).join(' and ') : '(fallback)'
  console.log(`  ${when.padEnd(32)} -> ${s.name}`)
}
