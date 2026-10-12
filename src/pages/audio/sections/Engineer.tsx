// The engineers, from audioPage.engineers (falling back to the old single
// audioPage.engineer until its content has been moved). One engineer keeps
// the photo-beside-text layout; two or more sit side by side on desktop and
// stack on mobile. Each: headshot, name, role, bio and a compact run of
// credits separated by thin dividers.

import type { AudioEngineer, AudioPageData } from '../../../lib/audioPage'
import { audioImageSrcSet, audioImageUrl } from '../image'
import BlockContent from './Blocks'
import { engineersOf, hasEngineer } from './has'

export default function Engineer({ data }: { data: AudioPageData }) {
  if (!hasEngineer(data.page)) return null
  const engineers = engineersOf(data.page)
  const single = engineers.length === 1
  const heading = data.page?.engineersHeading || (single ? engineers[0].name : 'The people on the desk')

  return (
    <section className={`a8-sec a8-eng${single ? '' : ' a8-eng-many'}`} aria-labelledby="a8-eng-title">
      <div className="a8-wrap">
        {(!single || data.page?.engineersHeading) && (
          <header className="a8-sec-head">
            <h2 id="a8-eng-title" className="a8-h2">{heading}</h2>
          </header>
        )}
        <div className={single ? '' : 'a8-eng-list'}>
          {engineers.map((e, i) => (
            <Profile key={e._key ?? i} e={e} titled={single && !data.page?.engineersHeading} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Profile({ e, titled }: { e: AudioEngineer & { _key?: string }; titled: boolean }) {
  const photo = audioImageUrl(e.headshot, 640, 800)
  const credits = (e.credits ?? []).filter(Boolean)
  const Name = titled ? 'h2' : 'h3'
  return (
    <article className={`a8-eng-grid${photo ? '' : ' a8-eng-nophoto'}`}>
      {photo && (
        <img
          className="a8-eng-photo"
          src={photo}
          srcSet={audioImageSrcSet(e.headshot, [320, 480, 640, 960], 4 / 5) ?? undefined}
          sizes="(min-width: 1024px) 420px, (min-width: 768px) 40vw, 100vw"
          alt={e.headshot?.alt || [e.name, e.role].filter(Boolean).join(', ') || 'Engineer'}
          width={640}
          height={800}
          loading="lazy"
          decoding="async"
        />
      )}
      <div>
        <Name id={titled ? 'a8-eng-title' : undefined} className={titled ? 'a8-h2' : 'a8-eng-name'}>{e.name}</Name>
        {e.role && <p className="a8-eng-role">{e.role}</p>}
        <BlockContent value={e.bio} />
        {credits.length > 0 && (
          <div className="a8-eng-credits">
            <p className="a8-h3">Credits</p>
            <ul>
              {credits.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}
      </div>
    </article>
  )
}
