// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  mediaTypeOf, mediaUrlOf, visibleClips, groupClips, clipsForTab, nextClipId,
  playerReducer, initialPlayerState, isFirstPlay, parsePeaks, formatTime,
} from './showreel.js'

const clip = (id, extra = {}) => ({ _id: id, title: id, cleared: true, audioUrl: `/${id}.mp3`, ...extra })

test('a missing or unknown mediaType is audio', () => {
  assert.equal(mediaTypeOf({}), 'audio')
  assert.equal(mediaTypeOf({ mediaType: null }), 'audio')
  assert.equal(mediaTypeOf({ mediaType: 'vinyl' }), 'audio')
  assert.equal(mediaTypeOf(undefined), 'audio')
  assert.equal(mediaTypeOf({ mediaType: 'video' }), 'video')
})

test('the media URL follows the media type', () => {
  assert.equal(mediaUrlOf({ audioUrl: '/a.mp3', videoUrl: '/v.mp4' }), '/a.mp3')
  assert.equal(mediaUrlOf({ mediaType: 'video', audioUrl: '/a.mp3', videoUrl: '/v.mp4' }), '/v.mp4')
  assert.equal(mediaUrlOf({ mediaType: 'video', audioUrl: '/a.mp3' }), null)
})

test('only cleared clips with media show', () => {
  const shown = visibleClips([
    clip('a'),
    clip('b', { cleared: false }),
    clip('c', { cleared: undefined }),
    clip('d', { audioUrl: null }),
    clip('e', { mediaType: 'video', audioUrl: null, videoUrl: '/e.mp4' }),
    null,
  ])
  assert.deepEqual(shown.map(c => c._id), ['a', 'e'])
  assert.deepEqual(visibleClips(undefined), [])
})

test('groups come in page order, empty groups dropped, unknown types in other', () => {
  const groups = groupClips([
    clip('pod', { clipType: 'podcast' }),
    clip('book', { clipType: 'audiobook' }),
    clip('mystery', { clipType: 'jingle' }),
    clip('none'),
    clip('ad', { clipType: 'commercial' }),
  ])
  assert.deepEqual(groups.map(g => g.type), ['audiobook', 'commercial', 'podcast', 'other'])
  assert.deepEqual(groups.at(-1).clips.map(c => c._id), ['mystery', 'none'])
})

test('within a group: featured first, then order, missing order last', () => {
  const [g] = groupClips([
    clip('o3', { clipType: 'audiobook', order: 3 }),
    clip('none', { clipType: 'audiobook' }),
    clip('o1', { clipType: 'audiobook', order: 1 }),
    clip('feat9', { clipType: 'audiobook', order: 9, featured: true }),
  ])
  assert.deepEqual(g.clips.map(c => c._id), ['feat9', 'o1', 'o3', 'none'])
})

test('no cleared clips, no groups', () => {
  assert.deepEqual(groupClips([clip('a', { cleared: false })]), [])
  assert.deepEqual(groupClips([]), [])
})

test('tabs and next clip', () => {
  const groups = groupClips([
    clip('b1', { clipType: 'broadcast', order: 1 }),
    clip('a1', { clipType: 'audiobook', order: 1 }),
    clip('a2', { clipType: 'audiobook', order: 2 }),
  ])
  const all = clipsForTab(groups, 'all')
  assert.deepEqual(all.map(c => c._id), ['a1', 'a2', 'b1'])
  assert.deepEqual(clipsForTab(groups, 'broadcast').map(c => c._id), ['b1'])
  assert.deepEqual(clipsForTab(groups, 'podcast'), [])
  assert.equal(nextClipId(all, 'a2'), 'b1')
  assert.equal(nextClipId(all, 'b1'), null)
  assert.equal(nextClipId(clipsForTab(groups, 'audiobook'), 'a2'), null)
  assert.equal(nextClipId(all, 'missing'), null)
})

test('one clip at a time: selecting another replaces the active clip', () => {
  let s = playerReducer(initialPlayerState, { type: 'select', id: 'a', play: true })
  assert.equal(s.activeId, 'a')
  assert.equal(s.wantsPlay, true)
  s = playerReducer(s, { type: 'playing', id: 'a' })
  assert.equal(s.status, 'playing')

  s = playerReducer(s, { type: 'select', id: 'b', play: true })
  assert.equal(s.activeId, 'b')
  assert.equal(s.status, 'idle', 'the new clip starts from idle; the old one is gone')

  // Late events from the replaced clip are ignored.
  s = playerReducer(s, { type: 'playing', id: 'a' })
  assert.equal(s.activeId, 'b')
  assert.equal(s.status, 'idle')
  s = playerReducer(s, { type: 'ended', id: 'a' })
  assert.deepEqual(s.played, [])
})

test('first play, pause and the played tick', () => {
  let s = playerReducer(initialPlayerState, { type: 'select', id: 'a', play: true })
  assert.equal(isFirstPlay(s, 'a'), true)
  s = playerReducer(s, { type: 'playing', id: 'a' })
  assert.equal(isFirstPlay(s, 'a'), false)
  s = playerReducer(s, { type: 'paused', id: 'a' })
  assert.equal(s.status, 'paused')
  s = playerReducer(s, { type: 'playing', id: 'a' })
  s = playerReducer(s, { type: 'ended', id: 'a' })
  assert.equal(s.status, 'ended')
  assert.deepEqual(s.played, ['a'])
  // The media element fires pause after ended; ended stays.
  s = playerReducer(s, { type: 'paused', id: 'a' })
  assert.equal(s.status, 'ended')
  // Selecting the same clip again just asks to play.
  s = playerReducer(s, { type: 'select', id: 'a', play: true })
  assert.equal(s.activeId, 'a')
  assert.equal(s.wantsPlay, true)
  assert.deepEqual(s.started, ['a'])
})

test('peaks: plain arrays, { data } and audiowaveform output', () => {
  assert.deepEqual(parsePeaks([0.5, -1, 0.25]), [[0.5, 1, 0.25]])
  assert.deepEqual(parsePeaks({ data: [2, 4] }), [[0.5, 1]])
  assert.deepEqual(parsePeaks({ bits: 8, channels: 1, data: [-10, 20, -64, 32] }), [[20 / 64, 1]])
  assert.equal(parsePeaks([]), null)
  assert.equal(parsePeaks([0, 0]), null)
  assert.equal(parsePeaks({ nope: true }), null)
  assert.equal(parsePeaks(['a']), null)
})

test('time formats as m:ss', () => {
  assert.equal(formatTime(0), '0:00')
  assert.equal(formatTime(5.9), '0:05')
  assert.equal(formatTime(75), '1:15')
  assert.equal(formatTime(NaN), '0:00')
  assert.equal(formatTime(undefined), '0:00')
})
