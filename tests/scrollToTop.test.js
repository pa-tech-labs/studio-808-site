// Run: npm test
//
// ScrollToTop mounted in a real memory router, in jsdom: a path change lands
// at the top, a hash lands on its anchor, and a search-only change (the
// /membership toggles) leaves the scroll alone.

import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/' })
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.IS_REACT_ACT_ENVIRONMENT = true

// react-dom decides at load time whether it has a DOM, so load it after jsdom.
const { createElement: h, act } = await import('react')
const { createRoot } = await import('react-dom/client')
const { createMemoryRouter, RouterProvider, Outlet } = await import('react-router-dom')
const { default: ScrollToTop } = await import('../src/components/ScrollToTop.js')

// jsdom has no scrollRestoration; give it the browser default.
window.history.scrollRestoration = 'auto'
let calls = []
window.scrollTo = opts => calls.push({ top: opts.top, behavior: opts.behavior })
window.HTMLElement.prototype.scrollIntoView = function (opts) {
  calls.push({ anchor: this.id, behavior: opts.behavior })
}

function Page({ anchors = [] }) {
  return h('main', null, ...anchors.map(id => h('section', { id, key: id })))
}

async function mount(initial) {
  const router = createMemoryRouter([
    {
      element: h('div', null, h(ScrollToTop), h(Outlet)),
      children: [
        { path: '/', element: h(Page) },
        { path: '/dj-studio', element: h(Page) },
        { path: '/membership', element: h(Page, { anchors: ['savings', 'plan-producer-8h-6m'] }) },
      ],
    },
  ], { initialEntries: [initial] })
  const root = createRoot(document.getElementById('root'))
  await act(async () => root.render(h(RouterProvider, { router })))
  const go = to => act(async () => { await router.navigate(to) })
  return { go, unmount: () => act(() => root.unmount()) }
}

beforeEach(() => { calls = [] })

test('a pathname change scrolls instantly to 0,0, and back/forward is left to it', async () => {
  const app = await mount('/')
  calls = []
  await app.go('/dj-studio')
  assert.deepEqual(calls, [{ top: 0, behavior: 'instant' }])
  calls = []
  await app.go(-1)
  assert.deepEqual(calls, [{ top: 0, behavior: 'instant' }])
  assert.equal(window.history.scrollRestoration, 'manual')
  await app.unmount()
})

test('a location with a hash scrolls instantly to that anchor instead of the top', async () => {
  const app = await mount('/dj-studio')
  calls = []
  await app.go('/membership#savings')
  assert.deepEqual(calls, [{ anchor: 'savings', behavior: 'instant' }])
  calls = []
  await app.go('/membership#plan-producer-8h-6m')
  assert.deepEqual(calls, [{ anchor: 'plan-producer-8h-6m', behavior: 'instant' }])
  calls = []
  // An anchor that has not rendered yet: a new page still starts at the top.
  await app.go('/#studios')
  assert.deepEqual(calls, [{ top: 0, behavior: 'instant' }])
  await app.unmount()
})

test('a search-only change on the same pathname does not scroll', async () => {
  const app = await mount('/membership?type=producer')
  calls = []
  await app.go('/membership?type=dj')
  await app.go('/membership?type=dj&term=3')
  assert.deepEqual(calls, [])
  await app.unmount()
})
