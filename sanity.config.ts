import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

const STUDIO_FINDER_ID = 'studioFinder'

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
      // Studio finder is a singleton: one fixed item that opens the one
      // document, instead of a list you could add a second one to.
      structure: S =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Studio finder')
              .id(STUDIO_FINDER_ID)
              .child(S.document().schemaType('studioFinder').documentId(STUDIO_FINDER_ID)),
            S.divider(),
            ...S.documentTypeListItems().filter(item => item.getId() !== 'studioFinder'),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    // No "create new Studio finder" from the global + menu.
    templates: templates => templates.filter(t => t.schemaType !== 'studioFinder'),
  },
  document: {
    // No duplicate or delete on the singleton.
    actions: (actions, { schemaType }) =>
      schemaType === 'studioFinder'
        ? actions.filter(a => !['duplicate', 'delete', 'unpublish'].includes(a.action ?? ''))
        : actions,
  },
})
