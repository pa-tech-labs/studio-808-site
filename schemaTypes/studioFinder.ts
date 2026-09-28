import { defineType, defineField, defineArrayMember } from 'sanity'

// "Find your studio" wizard. A SINGLETON: one document, id "studioFinder",
// pinned in the desk by sanity.config.ts. Everything the wizard asks, and
// which studio each set of answers leads to, lives here, so it can change
// without a deploy.
//
// Answers are matched on option VALUE, never label, so a label can be
// reworded freely. Change a value and every showIf and rule that names it
// must change with it.

const conditionFields = [
  defineField({
    name: 'questionKey',
    title: 'Question key',
    type: 'string',
    description: 'The key of an earlier question, e.g. purpose',
    validation: r => r.required(),
  }),
  defineField({
    name: 'equals',
    title: 'Answer value',
    type: 'string',
    description: 'The option value that must have been chosen, e.g. dj',
    validation: r => r.required(),
  }),
]

const condition = defineArrayMember({
  type: 'object',
  name: 'condition',
  fields: conditionFields,
  preview: {
    select: { k: 'questionKey', v: 'equals' },
    prepare: ({ k, v }) => ({ title: `${k ?? '?'} = ${v ?? '?'}` }),
  },
})

type RuleValue = { conditions?: unknown[] }

export default defineType({
  name: 'studioFinder',
  title: 'Studio finder',
  type: 'document',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      description: 'Off hides the home page section, the nav link and /find-your-studio.',
      initialValue: false,
    }),
    defineField({ name: 'heading', title: 'Heading', type: 'string', description: 'Home page section heading.' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2, description: 'Home page section text under the heading.' }),
    defineField({
      name: 'ctaLabel',
      title: 'Button label',
      type: 'string',
      description: 'The home page button that opens the wizard.',
      initialValue: 'Find your studio',
    }),

    defineField({
      name: 'questions',
      title: 'Questions',
      type: 'array',
      description: 'Asked in this order, one per screen.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'question',
          fields: [
            defineField({
              name: 'key',
              title: 'Key',
              type: 'string',
              description: 'Short id used by conditions and rules, e.g. purpose. The key "tutor" is the tutor question: a "yes" answer opens the tutor form.',
              validation: r => r.required().regex(/^[a-z][a-z0-9_]*$/, { name: 'lowercase key' }),
            }),
            defineField({ name: 'title', title: 'Question', type: 'string', validation: r => r.required() }),
            defineField({ name: 'helper', title: 'Helper text (optional)', type: 'string' }),
            defineField({
              name: 'options',
              title: 'Answers',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'option',
                  fields: [
                    defineField({ name: 'label', title: 'Label', type: 'string', validation: r => r.required() }),
                    defineField({
                      name: 'value',
                      title: 'Value',
                      type: 'string',
                      description: 'What conditions and rules match on, e.g. vinyl.',
                      validation: r => r.required().regex(/^[a-z0-9_-]+$/, { name: 'lowercase value' }),
                    }),
                    defineField({ name: 'helper', title: 'Helper text (optional)', type: 'string' }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'value' } },
                }),
              ],
              validation: r => r.required().min(2),
            }),
            defineField({
              name: 'showIf',
              title: 'Only show if (optional)',
              type: 'array',
              description: 'Shown only when ALL of these earlier answers match. Leave empty to always show.',
              of: [condition],
            }),
            defineField({ name: 'skippable', title: 'Can be skipped', type: 'boolean', initialValue: false }),
          ],
          preview: { select: { title: 'title', subtitle: 'key' } },
        }),
      ],
      validation: r => r.required().min(1).custom((qs: { key?: string }[] | undefined) => {
        const keys = (qs ?? []).map(q => q?.key).filter(Boolean)
        const dup = keys.find((k, i) => keys.indexOf(k) !== i)
        return dup ? `Two questions share the key "${dup}".` : true
      }),
    }),

    defineField({
      name: 'rules',
      title: 'Rules',
      type: 'array',
      description: 'Checked in order; the FIRST rule whose conditions all match wins. The last rule must have no conditions: it is the fallback.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'rule',
          fields: [
            defineField({
              name: 'conditions',
              title: 'When (all must match)',
              type: 'array',
              description: 'Leave empty only on the last rule (the fallback).',
              of: [condition],
            }),
            defineField({
              name: 'studio',
              title: 'Studio',
              type: 'reference',
              to: [{ type: 'studio' }],
              validation: r => r.required(),
            }),
            defineField({ name: 'reason', title: 'Reason (one line on the result)', type: 'string' }),
            defineField({
              name: 'addOns',
              title: 'Add-ons',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'Small chips on the result, e.g. Recording and streaming bolt-on.',
            }),
            defineField({ name: 'memberLine', title: 'Member line (optional)', type: 'string', description: 'e.g. Members from £X/hr' }),
          ],
          preview: {
            select: { studio: 'studio.name', c0k: 'conditions.0.questionKey', c0v: 'conditions.0.equals', c1k: 'conditions.1.questionKey' },
            prepare: ({ studio, c0k, c0v, c1k }) => ({
              title: studio ?? '(no studio)',
              subtitle: c0k ? `${c0k} = ${c0v}${c1k ? ' and more' : ''}` : 'Fallback',
            }),
          },
        }),
      ],
      validation: r => r.required().min(1).custom((rules: RuleValue[] | undefined) => {
        const list = rules ?? []
        if (list.length === 0) return true
        const isFallback = (x: RuleValue) => !x?.conditions || x.conditions.length === 0
        if (!isFallback(list[list.length - 1])) return 'The last rule must have no conditions (the fallback).'
        const early = list.slice(0, -1).findIndex(isFallback)
        if (early !== -1) return `Rule ${early + 1} has no conditions, so every rule after it can never match. Only the last rule may be the fallback.`
        return true
      }),
    }),

    defineField({
      name: 'tutor',
      title: 'Tutor',
      type: 'object',
      fields: [
        defineField({ name: 'enabled', title: 'Enabled', type: 'boolean', description: 'Off hides the tutor question and form.', initialValue: false }),
        defineField({ name: 'questionCopy', title: 'Tutor question', type: 'string', description: 'Replaces the title of the question keyed "tutor".' }),
        defineField({ name: 'formTitle', title: 'Form title', type: 'string' }),
        defineField({ name: 'formIntro', title: 'Form intro', type: 'text', rows: 2 }),
        defineField({ name: 'successMessage', title: 'Success message', type: 'text', rows: 2 }),
      ],
    }),

    defineField({
      name: 'result',
      title: 'Result screen',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Your studio' }),
        defineField({ name: 'bookLabel', title: 'Book button label', type: 'string', initialValue: 'Book this studio' }),
        defineField({ name: 'restartLabel', title: 'Start again label', type: 'string', initialValue: 'Start again' }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Studio finder' }) },
})
