// One-off: copies the old single audioPage.engineer into audioPage.engineers[0].
//
// Run (Node 22.18+ strips the types itself, no build step):
//   SANITY_WRITE_TOKEN=<editor token> SANITY_STUDIO_PROJECT_ID=riowycjq npm run migrate:audio-engineers
//   add --dry-run to print what would change without writing.
//
// The token comes from the environment only. Never commit it. Create one at
// sanity.io/manage > API > Tokens with Editor access, and revoke it after.
//
// Safe to re-run: a document whose engineers list already has an entry is
// left alone, and the old field is kept (hidden in the studio) so nothing is
// lost. Patches the published document and, if one exists, the open draft,
// so a later publish of the draft does not undo the move.

import { createClient } from '@sanity/client'

const token = process.env.SANITY_WRITE_TOKEN
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.VITE_SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')

if (!token || !projectId) {
  console.error('Set SANITY_WRITE_TOKEN and SANITY_STUDIO_PROJECT_ID (e.g. riowycjq) in the environment.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false })

type Doc = { _id: string; _rev: string; engineer?: Record<string, unknown> | null; engineers?: unknown[] | null }

const docs = await client.fetch<Doc[]>(`*[_id in ["audioPage", "drafts.audioPage"]]{ _id, _rev, engineer, engineers }`)
if (docs.length === 0) {
  console.error('No audioPage document found. Nothing to do.')
  process.exit(1)
}

let changed = 0
for (const doc of docs) {
  const hasOld = doc.engineer && Object.keys(doc.engineer).some(k => !k.startsWith('_'))
  if (!hasOld) { console.log(`${doc._id}: no old engineer, skipped.`); continue }
  if (Array.isArray(doc.engineers) && doc.engineers.length > 0) { console.log(`${doc._id}: engineers already has ${doc.engineers.length}, skipped.`); continue }

  const entry = { ...doc.engineer, _type: 'engineerProfile', _key: 'migrated-engineer-1' }
  console.log(`${doc._id}: engineers[0] = ${String((doc.engineer as { name?: string }).name ?? '(no name)')}${dryRun ? ' (dry run, not written)' : ''}`)
  if (!dryRun) {
    // ifRevisionId: fails rather than overwrite an edit made since the read.
    await client.patch(doc._id).ifRevisionId(doc._rev).set({ engineers: [entry] }).commit()
  }
  changed++
}
console.log(dryRun ? `Dry run: ${changed} document(s) would change.` : `Done: ${changed} document(s) updated.`)
