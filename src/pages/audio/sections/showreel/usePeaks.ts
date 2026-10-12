// Waveform data for the active audio clip, without ever blocking playback.
//
// Playback always streams through the clip's <audio> element. The waveform
// is drawn from peaks: the clip's pre-generated peaks file when it has one
// (no decoding at all), otherwise a decode of a separate fetch of the file,
// in parallel. Clips are short (15-60s), so the second request is small and
// usually served from the HTTP cache the <audio> element shares.

import { useEffect, useState } from 'react'
import { parsePeaks } from '../../../../lib/showreel.js'
import type { AudioClip } from '../../../../lib/audioPage'

const POINTS = 800

export interface PeaksResult { peaks: number[][]; duration: number | null }

async function fromPeaksFile(url: string, signal: AbortSignal): Promise<PeaksResult | null> {
  const res = await fetch(url, { signal })
  if (!res.ok) return null
  const peaks = parsePeaks(await res.json())
  return peaks ? { peaks, duration: null } : null
}

async function fromDecode(url: string, signal: AbortSignal): Promise<PeaksResult | null> {
  const res = await fetch(url, { signal })
  if (!res.ok) return null
  const buf = await res.arrayBuffer()
  const Ctx = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext
  if (!Ctx) return null
  const audio = await new Ctx(1, 1, 44100).decodeAudioData(buf)
  const data = audio.getChannelData(0)
  const step = Math.max(1, Math.floor(data.length / POINTS))
  const out: number[] = []
  for (let i = 0; i < data.length; i += step) {
    let max = 0
    for (let j = i; j < i + step && j < data.length; j++) {
      const v = Math.abs(data[j])
      if (v > max) max = v
    }
    out.push(max)
  }
  const peaks = parsePeaks(out)
  return peaks ? { peaks, duration: audio.duration } : null
}

/** null while loading or when there is nothing to draw. */
export function usePeaks(clip: AudioClip | null): PeaksResult | null {
  const [result, setResult] = useState<{ id: string; value: PeaksResult | null } | null>(null)
  const id = clip?._id ?? null
  const peaksUrl = clip?.peaksUrl ?? null
  const audioUrl = clip?.audioUrl ?? null

  useEffect(() => {
    if (!id || !audioUrl) return
    const ctl = new AbortController()
    ;(async () => {
      let value: PeaksResult | null = null
      try { if (peaksUrl) value = await fromPeaksFile(peaksUrl, ctl.signal) } catch { value = null }
      if (!value && !ctl.signal.aborted) {
        try { value = await fromDecode(audioUrl, ctl.signal) } catch { value = null }
      }
      if (!ctl.signal.aborted) setResult({ id, value })
    })()
    return () => ctl.abort()
  }, [id, peaksUrl, audioUrl])

  return result && result.id === id ? result.value : null
}
