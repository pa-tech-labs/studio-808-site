// Renders CMS heading text in the site's mixed heading style: a *starred*
// tail becomes the DM Serif Display italic <em> that .mh styles, e.g.
// "Not sure which *studio?*". Text without stars renders as it is.

export default function Headline({ text }: { text: string }) {
  const m = text.match(/^(.*?)\*(.+)\*\s*$/)
  if (!m) return <>{text}</>
  return <>{m[1]}<em>{m[2]}</em></>
}
