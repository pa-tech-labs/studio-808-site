import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

// Replace with your actual Sanity project ID from https://sanity.io/manage
// Also set SANITY_STUDIO_PROJECT_ID in your .env file for the CLI
const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID ?? 'REPLACE_WITH_PROJECT_ID'

export default defineConfig({
  name: 'studio-808',
  title: 'Studio 808',
  projectId: PROJECT_ID,
  dataset: 'production',
  plugins: [
    structureTool(),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
