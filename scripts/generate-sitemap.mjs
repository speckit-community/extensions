import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/extensions'
const SITE_URL = `https://speckit-community.github.io${BASE_PATH}`

const catalogPath = join(ROOT, 'data', 'spec-kit', 'extensions', 'catalog.community.json')
const catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'))
const extensions = Object.values(catalog.extensions)
const today = new Date().toISOString().split('T')[0]

const staticPages = [
  { loc: '', changefreq: 'daily', priority: '1.0', lastmod: today },
  { loc: '/all-extensions', changefreq: 'weekly', priority: '0.6', lastmod: today },
  { loc: '/about', changefreq: 'monthly', priority: '0.3', lastmod: today },
]

const extensionPages = extensions.map((ext) => {
  const lastmod = ext.updated_at
    ? ext.updated_at.split('T')[0]
    : today
  return {
    loc: `/${ext.id}`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod,
  }
})

const allPages = [...staticPages, ...extensionPages]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

const outPath = join(ROOT, 'public', 'sitemap.xml')
writeFileSync(outPath, sitemap, 'utf-8')
console.log(`✅ Sitemap generated with ${allPages.length} URLs → ${outPath}`)
