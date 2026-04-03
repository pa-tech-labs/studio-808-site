import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  canonical?: string
  image?: string
}

const BASE = 'https://www.studio-808.com'
const DEFAULT_IMAGE = `${BASE}/images/studios/studio3-prodj-1.jpg`

export default function SEO({ title, description, canonical, image }: SEOProps) {
  const ogImage = image ? `${BASE}${image}` : DEFAULT_IMAGE
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={`${BASE}${canonical}`} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      {canonical && <meta property="og:url" content={`${BASE}${canonical}`} />}
    </Helmet>
  )
}
