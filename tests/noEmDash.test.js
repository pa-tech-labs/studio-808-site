// Run: npm test
//
// House style: no em dashes in anything the site shows (copy, page titles,
// alt text, labels). Code comments are fine; everything else under src/ and
// index.html is checked. Studio names stored in Sanity may still contain one;
// lib/studioName.js splits them so it is never printed.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const EM_DASH = '—'

function files(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return files(path)
    return /\.(tsx?|jsx?|css|html)$/.test(name) && !/\.test\.js$/.test(name) ? [path] : []
  })
}

/** The line with comments removed: whole-line comments, JSX comments and trailing // comments. */
function code(line) {
  const t = line.trim()
  if (/^(\/\/|\/\*|\*|\{\/\*)/.test(t)) return ''
  return line.replace(/\{\/\*.*?\*\/\}/g, '').replace(/\/\*.*?\*\//g, '').replace(/(^|\s)\/\/\s.*$/, '')
}

test('no em dashes in shipped copy', () => {
  const hits = []
  for (const file of [...files('src'), 'index.html']) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (code(line).includes(EM_DASH)) hits.push(`${file}:${i + 1}: ${line.trim().slice(0, 100)}`)
    })
  }
  assert.deepEqual(hits, [])
})
