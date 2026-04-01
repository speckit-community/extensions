const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/extensions'
export const SITE_URL = `https://speckit-community.github.io${BASE_PATH}`
export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`

export const DEFAULT_SEO = {
  titleTemplate: '%s | SpecKit Extensions',
  defaultTitle: 'SpecKit Extensions — Browse Community Extensions',
  description:
    'Discover community extensions for Spec Kit, the specification-driven development toolkit. Browse, search, and install extensions to enhance your SDD workflow.',
  canonical: SITE_URL,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'SpecKit Extensions',
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'SpecKit Extensions — Community Extension Catalog',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    cardType: 'summary_large_image',
  },
  additionalLinkTags: [
    {
      rel: 'icon',
      href: `${BASE_PATH}/favicon.webp`,
    },
  ],
}
