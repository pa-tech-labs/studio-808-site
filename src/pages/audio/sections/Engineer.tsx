// The engineer, from audioPage.engineer: headshot, name, role, bio and a
// compact run of credits separated by thin dividers.

import type { AudioPageData } from '../../../lib/audioPage'
import { audioImageUrl } from '../image'
import BlockContent from './Blocks'
import { hasEngineer } from './has'

export default function Engineer({ data }: { data: AudioPageData }) {
  const e = data.page?.engineer
  if (!e || !hasEngineer(data.page)) return null
  const photo = audioImageUrl(e.headshot, 640, 800)
  const credits = (e.credits ?? []).filter(Boolean)

  return (
    <section className="a8-sec a8-eng" aria-labelledby="a8-eng-title">
      <div className={`a8-wrap a8-eng-grid${photo ? '' : ' a8-eng-nophoto'}`}>
        {photo && <img className="a8-eng-photo" src={photo} alt={e.headshot?.alt ?? (e.name ? `${e.name}, ${e.role ?? 'engineer'}` : '')} width={640} height={800} loading="lazy" decoding="async" />}
        <div>
          <h2 id="a8-eng-title" className="a8-h2">{e.name}</h2>
          {e.role && <p className="a8-eng-role">{e.role}</p>}
          <BlockContent value={e.bio} />
          {credits.length > 0 && (
            <div className="a8-eng-credits">
              <h3 className="a8-h3">Credits</h3>
              <ul>
                {credits.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
