import path from 'path'
import { promises as fs } from 'fs'

// ---- TypeScript Interfaces (T009) ----

export interface ToolRequirement {
  name: string
  version?: string
  required: boolean
}

export interface ExtensionDependency {
  id: string
  version?: string
  required: boolean
}

export interface ExtensionRequires {
  speckit_version: string
  extensions?: ExtensionDependency[]
  tools?: ToolRequirement[]
}

export interface ExtensionProvides {
  commands: number
  hooks: number
}

export interface Extension {
  id: string
  name: string
  description: string
  author: string
  version: string
  download_url: string
  repository: string
  homepage?: string
  documentation?: string
  changelog?: string
  license: string
  requires: ExtensionRequires
  provides: ExtensionProvides
  tags: string[]
  verified: boolean
  downloads: number
  stars: number
  created_at: string
  updated_at: string
  releaseVersion?: string
  releasePublishedAt?: string
}

export interface Catalog {
  schema_version: string
  updated_at: string
  catalog_url: string
  extensions: Record<string, Extension>
}

export interface SearchIndexEntry {
  id: string
  name: string
  description: string
  author: string
  version: string
  tags: string[]
  updatedAt: string
  verified: boolean
  commands: number
  hooks: number
  license: string
}

// ---- Extension Manifest (extension.yml) Interfaces ----

export interface ManifestCommand {
  name: string
  file: string
  description: string
  aliases?: string[] | null
}

export interface ManifestConfig {
  name: string
  template?: string | null
  description: string
  required?: boolean
}

export interface ManifestHook {
  event: string
  command: string
  optional: boolean
  prompt?: string | null
  description: string
}

export interface ExtensionManifest {
  commands: ManifestCommand[]
  hooks: ManifestHook[]
  config: ManifestConfig[]
  requiredCommands: string[]
}

// ---- Data Loading Functions ----

const CATALOG_PATH = path.join(
  process.cwd(),
  'data',
  'spec-kit',
  'extensions',
  'catalog.community.json'
)

let catalogCache: Catalog | null = null

/** T010: Load and validate catalog.community.json */
export async function loadCatalog(): Promise<Catalog> {
  if (catalogCache) return catalogCache

  let raw: string
  try {
    raw = await fs.readFile(CATALOG_PATH, 'utf-8')
  } catch (err) {
    throw new Error(
      `Failed to read catalog file at ${CATALOG_PATH}: ${err instanceof Error ? err.message : err}`
    )
  }

  let catalog: Catalog
  try {
    catalog = JSON.parse(raw)
  } catch {
    throw new Error(
      `Failed to parse catalog JSON at ${CATALOG_PATH}: file contains malformed JSON`
    )
  }

  if (!catalog.extensions || typeof catalog.extensions !== 'object') {
    throw new Error(
      `Invalid catalog: missing or invalid "extensions" field in ${CATALOG_PATH}`
    )
  }

  if (catalog.schema_version && catalog.schema_version !== '1.0') {
    console.warn(
      `Warning: catalog schema_version "${catalog.schema_version}" is not "1.0". Proceeding, but some fields may not render correctly.`
    )
  }

  catalogCache = catalog
  return catalog
}

/** T011: List all extensions sorted alphabetically by name */
export async function listExtensions(): Promise<Extension[]> {
  const catalog = await loadCatalog()
  return Object.values(catalog.extensions).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}

/** T012: Get a single extension by ID */
export async function getExtension(id: string): Promise<Extension | undefined> {
  const catalog = await loadCatalog()
  return catalog.extensions[id]
}

/** T013: Build search index for Fuse.js */
export async function buildSearchIndex(): Promise<SearchIndexEntry[]> {
  const catalog = await loadCatalog()
  return Object.values(catalog.extensions).map((ext) => ({
    id: ext.id,
    name: ext.name,
    description: ext.description,
    author: ext.author,
    version: ext.version,
    tags: ext.tags,
    updatedAt: ext.updated_at,
    verified: ext.verified,
    commands: ext.provides.commands,
    hooks: ext.provides.hooks,
    license: ext.license,
  }))
}

/** T014: Get recently updated extensions */
export async function getRecentlyUpdated(count: number): Promise<Extension[]> {
  const catalog = await loadCatalog()
  return Object.values(catalog.extensions)
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, count)
}

// ---- GitHub Stars (live at build time) ----

const starsCache = new Map<string, number>()

/** Fetch stargazers_count for a GitHub repo. Returns null on failure. */
export async function fetchRepoStars(repoUrl: string): Promise<number | null> {
  const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/)
  if (!match) return null

  const ownerRepo = match[1].replace(/\.git$/, '').replace(/\/$/, '')
  if (starsCache.has(ownerRepo)) return starsCache.get(ownerRepo)!

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    }
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    }
    const res = await fetch(`https://api.github.com/repos/${ownerRepo}`, {
      headers,
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      const count =
        typeof data.stargazers_count === 'number' ? data.stargazers_count : 0
      starsCache.set(ownerRepo, count)
      return count
    }
  } catch {
    // timeout or network error — fall back to catalog value
  }
  return null
}

/** Get top extensions by live GitHub star count */
export async function getTopExtensionsByStars(
  count: number
): Promise<Extension[]> {
  const catalog = await loadCatalog()
  const extensions = Object.values(catalog.extensions)

  // Fetch stars for all unique repos in parallel
  const uniqueRepos = Array.from(new Set(extensions.map((e) => e.repository)))
  await Promise.all(uniqueRepos.map((repo) => fetchRepoStars(repo)))

  // Apply live stars to extensions
  const withLiveStars = extensions.map((ext) => {
    const match = ext.repository.match(/github\.com\/([^/]+\/[^/]+)/)
    if (match) {
      const ownerRepo = match[1].replace(/\.git$/, '').replace(/\/$/, '')
      const live = starsCache.get(ownerRepo)
      if (live !== undefined) {
        return { ...ext, stars: live }
      }
    }
    return ext
  })

  return withLiveStars
    .sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name))
    .slice(0, count)
}

// ---- GitHub Releases (live at build time) ----

interface ReleaseInfo {
  version: string
  publishedAt: string
}

const releaseCache = new Map<string, ReleaseInfo | null>()

/** Fetch the latest release tag and date for a GitHub repo. Returns null on failure. */
export async function fetchLatestRelease(
  repoUrl: string
): Promise<ReleaseInfo | null> {
  const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/)
  if (!match) return null

  const ownerRepo = match[1].replace(/\.git$/, '').replace(/\/$/, '')
  if (releaseCache.has(ownerRepo)) return releaseCache.get(ownerRepo)!

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    }
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    }
    const res = await fetch(
      `https://api.github.com/repos/${ownerRepo}/releases/latest`,
      { headers, signal: AbortSignal.timeout(5000) }
    )
    if (res.ok) {
      const data = await res.json()
      const tag = typeof data.tag_name === 'string' ? data.tag_name : ''
      const version = tag.replace(/^v/i, '')
      const publishedAt =
        typeof data.published_at === 'string' ? data.published_at : ''
      if (version) {
        const info: ReleaseInfo = { version, publishedAt }
        releaseCache.set(ownerRepo, info)
        return info
      }
    }
  } catch {
    // timeout or network error — fall back to catalog value
  }
  releaseCache.set(ownerRepo, null)
  return null
}

/** Enrich a list of extensions with latest GitHub release info (parallel fetch). */
export async function enrichExtensionsWithReleases(
  extensions: Extension[]
): Promise<Extension[]> {
  const uniqueRepos = Array.from(new Set(extensions.map((e) => e.repository)))
  await Promise.all(uniqueRepos.map((repo) => fetchLatestRelease(repo)))

  return extensions.map((ext) => {
    const match = ext.repository.match(/github\.com\/([^/]+\/[^/]+)/)
    if (match) {
      const ownerRepo = match[1].replace(/\.git$/, '').replace(/\/$/, '')
      const release = releaseCache.get(ownerRepo)
      if (release) {
        return {
          ...ext,
          releaseVersion: release.version,
          releasePublishedAt: release.publishedAt,
        }
      }
    }
    return ext
  })
}

/** Get extensions that declare a dependency on the given extension */
export async function getDependents(extensionId: string): Promise<Extension[]> {
  const catalog = await loadCatalog()
  const target = catalog.extensions[extensionId]
  if (!target) return []

  return Object.values(catalog.extensions).filter((ext) => {
    if (ext.id === extensionId) return false
    if (!ext.requires.extensions) return false
    return ext.requires.extensions.some((dep) => dep.id === extensionId)
  })
}
