import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { Header, DOCS_LINK } from '../components/Header'
import { Footer } from '../components/Footer'
import { Badges } from '../components/Badges'
import { CopyCode } from '../components/CopyCode'
import { ExtensionTabs } from '../components/ExtensionTabs'
import {
  listExtensions,
  getExtension,
  getDependents,
  fetchRepoStars,
  fetchLatestRelease,
  Extension,
  ExtensionManifest,
} from '../data/extensions'
import { formatDistance, parseISO, format } from 'date-fns'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBook,
  faBug,
  faCodeBranch,
  faExclamationTriangle,
  faGlobe,
  faFileLines,
  faStar,
  faScaleBalanced,
  faCalendar,
  faCube,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

interface ExtensionDetailProps {
  extension: Extension
  dependents: Extension[]
  readmeContent: string | null
  manifest: ExtensionManifest | null
}

const getMaintainerFromRepo = (
  repository: string
): { name: string; url: string } | null => {
  try {
    const match = repository.match(/github\.com\/([^/]+)/)
    if (match) {
      return { name: match[1], url: `https://github.com/${match[1]}` }
    }
  } catch {
    // ignore
  }
  return null
}

const ExtensionDetail: NextPage<ExtensionDetailProps> = ({
  extension,
  dependents,
  readmeContent,
  manifest,
}) => {
  const maintainer = getMaintainerFromRepo(extension.repository)

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{`SpecKit Extensions | ${extension.name}`}</title>
        <meta name="description" content={extension.description} />
      </Head>

      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto mt-8 px-4">
          {/* ── Header area ─────────────────────────────── */}
          <div className="mb-6 border-l-4 border-sk-primary bg-gray-50 rounded-r-md px-5 py-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{extension.id}</h1>
              <span className="text-lg text-gray-500">
                v{extension.releaseVersion || extension.version}
              </span>
              <Badges verified={extension.verified} />
            </div>
            <p className="text-gray-600 mt-1">{extension.description}</p>
            {extension.tags.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-2">
                {extension.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="text-sm font-medium text-green-600 hover:text-green-800"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ── Community/Verified notice ──────────────── */}
          {extension.verified ? (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4">
              <FontAwesomeIcon icon={faStar} className="w-3.5 flex-shrink-0" />
              <span>
                Verified extension — reviewed for quality and compatibility.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-3.5 flex-shrink-0" />
              <span>
                Community extension — Independently maintained. Use at your own discretion.{' '}
                <a
                  href="#security"
                  onClick={() => (window.location.hash = 'security')}
                  className="underline hover:text-amber-900"
                >
                  Learn more
                </a>
              </span>
            </div>
          )}

          {/* ── Two-column layout ───────────────────────── */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column: Tabs */}
            <div className="flex-1 min-w-0">
              <ExtensionTabs
                extension={extension}
                dependents={dependents}
                readmeContent={readmeContent}
                manifest={manifest}
              />
            </div>

            {/* Right column: Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="space-y-6">
                {/* Stats */}
                <SidebarSection title="Stats">
                  <div className="space-y-1.5 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="w-4 text-gray-400"
                      />
                      <span>
                        {extension.stars.toLocaleString()} star
                        {extension.stars !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </SidebarSection>

                {/* Version */}
                <SidebarSection title="Version">
                  <div className="space-y-1.5 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faCube}
                        className="w-4 text-gray-400"
                      />
                      <span className="font-mono">
                        {extension.releaseVersion || extension.version}
                      </span>
                      {extension.releaseVersion && (
                        <span className="text-[10px] text-green-600 bg-green-50 rounded-full px-1.5 py-0.5 font-medium">
                          release
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faCalendar}
                        className="w-4 text-gray-400"
                      />
                      <span suppressHydrationWarning>
                        Updated{' '}
                        {formatDistance(
                          parseISO(extension.updated_at),
                          new Date(),
                          { addSuffix: true }
                        )}
                      </span>
                    </div>
                  </div>
                </SidebarSection>

                {/* Install */}
                <SidebarSection title="Install">
                  <p className="text-xs text-gray-500 mb-1">
                    Using the{' '}
                    <a
                      href={DOCS_LINK}
                      className="text-link-color hover:text-link-color-hover"
                    >
                      Specify CLI
                    </a>
                  </p>
                  <code className="block text-xs bg-gray-50 rounded p-2 font-mono break-all">
                    specify extension add --from {extension.download_url}
                  </code>
                </SidebarSection>

                {/* Links */}
                <SidebarSection title="Links">
                  <div className="space-y-1.5 text-sm">
                    {extension.homepage && (
                      <SidebarLink
                        icon={faGlobe}
                        href={extension.homepage}
                        label="Homepage"
                      />
                    )}
                    {extension.repository && (
                      <SidebarLink
                        icon={faCodeBranch}
                        href={extension.repository}
                        label="Repository"
                      />
                    )}
                    {extension.documentation && (
                      <SidebarLink
                        icon={faBook}
                        href={extension.documentation}
                        label="Documentation"
                      />
                    )}
                    {extension.changelog && (
                      <SidebarLink
                        icon={faFileLines}
                        href={extension.changelog}
                        label="Changelog"
                      />
                    )}
                    {extension.repository &&
                      extension.repository.includes('github.com') && (
                        <SidebarLink
                          icon={faBug}
                          href={`${extension.repository.replace(/\/$/, '')}/issues`}
                          label="Report Issue"
                        />
                      )}
                  </div>
                </SidebarSection>

                {/* Owners */}
                {maintainer && (
                  <SidebarSection title="Owners">
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://github.com/${maintainer.name}.png?size=32`}
                        alt={maintainer.name}
                        className="w-6 h-6 rounded-full"
                        loading="lazy"
                      />
                      <a
                        href={maintainer.url}
                        className="text-sm text-link-color hover:text-link-color-hover"
                      >
                        {maintainer.name}
                      </a>
                    </div>
                  </SidebarSection>
                )}

                {/* License */}
                <SidebarSection title="License">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FontAwesomeIcon
                      icon={faScaleBalanced}
                      className="w-4 text-gray-400"
                    />
                    <span>{extension.license}</span>
                  </div>
                </SidebarSection>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="flex-grow" />
      <Footer />
    </div>
  )
}

/* ─── Sidebar helpers ──────────────────────────────────── */

const SidebarSection: React.FC<{
  title: string
  children: React.ReactNode
}> = ({ title, children }) => (
  <div>
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
      {title}
    </h3>
    {children}
  </div>
)

const SidebarLink: React.FC<{
  icon: typeof faGlobe
  href: string
  label: string
}> = ({ icon, href, label }) => (
  <a
    href={href}
    className="flex items-center gap-2 text-link-color hover:text-link-color-hover"
    title={href}
  >
    <FontAwesomeIcon icon={icon} className="w-4" />
    {label}
  </a>
)

/* ─── Data fetching ────────────────────────────────────── */

export const getStaticPaths: GetStaticPaths = async () => {
  const extensions = await listExtensions()
  const paths = extensions.map((ext) => ({
    params: { extension: ext.id },
  }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.extension as string
  let extension = await getExtension(id)

  if (!extension) {
    return { notFound: true }
  }

  const [dependents, liveStars, releaseInfo] = await Promise.all([
    getDependents(id),
    fetchRepoStars(extension.repository),
    fetchLatestRelease(extension.repository),
  ])
  if (liveStars !== null) {
    extension = { ...extension, stars: liveStars }
  }
  if (releaseInfo) {
    extension = {
      ...extension,
      releaseVersion: releaseInfo.version,
      releasePublishedAt: releaseInfo.publishedAt,
    }
  }

  // Fetch README content from the documentation URL at build time
  let readmeContent: string | null = null
  if (extension.documentation) {
    try {
      const rawUrl = extension.documentation
        .replace('github.com', 'raw.githubusercontent.com')
        .replace('/blob/', '/')
      const res = await fetch(rawUrl, { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        readmeContent = await res.text()
      }
    } catch {
      // Silently fail — the tab will show a fallback
    }
  }

  // Fetch extension.yml manifest for rich command/hook/config details
  let manifest: ExtensionManifest | null = null
  const repoUrl = extension.repository?.replace(/\/$/, '') || ''
  if (repoUrl.includes('github.com')) {
    const rawBase = repoUrl.replace('github.com', 'raw.githubusercontent.com')
    // Try root-level, then {id}/ subdirectory (multi-extension repos)
    for (const ymlPath of ['extension.yml', `${id}/extension.yml`]) {
      try {
        const res = await fetch(`${rawBase}/main/${ymlPath}`, {
          signal: AbortSignal.timeout(5000),
        })
        if (res.ok) {
          const yaml = await import('js-yaml')
          const parsed = yaml.load(await res.text()) as Record<string, unknown>
          const provides = (parsed.provides ?? {}) as Record<string, unknown>
          const hooks = (parsed.hooks ?? {}) as Record<
            string,
            Record<string, unknown>
          >
          const requires = (parsed.requires ?? {}) as Record<string, unknown>

          // Normalise required commands array
          const rawReqCmds = Array.isArray(requires.commands)
            ? requires.commands
            : []
          const requiredCommands = rawReqCmds.map(String)

          // Normalise commands array
          const rawCmds = Array.isArray(provides.commands)
            ? provides.commands
            : []
          const commands = rawCmds.map((c: Record<string, unknown>) => ({
            name: String(c.name ?? ''),
            file: String(c.file ?? ''),
            description: String(c.description ?? ''),
            aliases: Array.isArray(c.aliases) ? c.aliases.map(String) : null,
          }))

          // Normalise config array
          const rawConfig = Array.isArray(provides.config)
            ? provides.config
            : []
          const config = rawConfig.map((c: Record<string, unknown>) => ({
            name: String(c.name ?? ''),
            template: c.template ? String(c.template) : null,
            description: String(c.description ?? ''),
            required: c.required === true,
          }))

          // Normalise hooks from object-keyed format
          const hookList = Object.entries(hooks)
            .filter(([key]) => key !== 'schema_version')
            .map(([event, h]) => ({
              event,
              command: String(h.command ?? ''),
              optional: h.optional !== false,
              prompt: h.prompt ? String(h.prompt) : null,
              description: String(h.description ?? ''),
            }))

          manifest = { commands, hooks: hookList, config, requiredCommands }
          break
        }
      } catch {
        // try next path or give up
      }
    }
  }

  return {
    props: { extension, dependents, readmeContent, manifest },
  }
}

export default ExtensionDetail
