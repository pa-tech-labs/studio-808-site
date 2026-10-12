import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

// Singletons: one document each, with the document id equal to the type name.
const SINGLETONS = [
  { type: 'studioFinder', title: 'Studio finder' },
  { type: 'membershipPage', title: 'Membership page' },
  { type: 'audioPage', title: '808 Audio page' },
]
const SINGLETON_TYPES = new Set(SINGLETONS.map(s => s.type))

// 808 Audio's documents, grouped in one folder instead of the general list.
const AUDIO_LISTS = [
  { type: 'audioClip', title: 'Clips' },
  { type: 'audioCredit', title: 'Credits' },
]
const GROUPED_TYPES = new Set([...SINGLETON_TYPES, ...AUDIO_LISTS.map(l => l.type)])

// Replace with your actual Sanity project ID from https://sanity.io/manage
// Also set SANITY_STUDIO_PROJECT_ID in your .env file for the CLI
const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID ?? 'REPLACE_WITH_PROJECT_ID'

export default defineConfig({
  name: 'studio-808',
  title: 'Studio 808',
  projectId: PROJECT_ID,
  dataset: 'production',
  plugins: [
    structureTool({
      // Each singleton is one fixed item that opens its one document,
      // instead of a list you could add a second one to.
      structure: S =>
        S.list()
          .title('Content')
          .items([
            ...SINGLETONS.map(({ type, title }) =>
              S.listItem()
                .title(title)
                .id(type)
                .child(S.document().schemaType(type).documentId(type)),
            ),
            S.listItem()
              .title('808 Audio')
              .id('audio')
              .child(
                S.list()
                  .title('808 Audio')
                  .items(AUDIO_LISTS.map(({ type, title }) =>
                    S.listItem()
                      .title(title)
                      .id(type)
                      .child(S.documentTypeList(type).title(title).defaultOrdering([{ field: 'order', direction: 'asc' }])),
                  )),
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(item => !GROUPED_TYPES.has(item.getId() ?? '')),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    // No "create new" for a singleton from the global + menu.
    templates: templates => templates.filter(t => !SINGLETON_TYPES.has(t.schemaType)),
  },
  document: {
    // No duplicate or delete on a singleton.
    actions: (actions, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? actions.filter(a => !['duplicate', 'delete', 'unpublish'].includes(a.action ?? ''))
        : actions,
  },
})
