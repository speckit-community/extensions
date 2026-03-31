import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import {
  Extension,
  ExtensionManifest,
  ExtensionDependency,
} from '../data/extensions'
import { Badges } from './Badges'
import { formatDistance, parseISO, format } from 'date-fns'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTerminal,
  faBolt,
  faBug,
  faCode,
  faShieldHalved,
  faCheckCircle,
  faExclamationTriangle,
  faScaleBalanced,
  faLock,
  faGear,
  faCube,
  faPuzzlePiece,
} from '@fortawesome/free-solid-svg-icons'

/** Extend the default GitHub-like sanitisation schema to allow attributes commonly used in README files. */
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div || []), 'align'],
    p: [...(defaultSchema.attributes?.p || []), 'align'],
    h1: [...(defaultSchema.attributes?.h1 || []), 'align'],
    h2: [...(defaultSchema.attributes?.h2 || []), 'align'],
    h3: [...(defaultSchema.attributes?.h3 || []), 'align'],
    h4: [...(defaultSchema.attributes?.h4 || []), 'align'],
    h5: [...(defaultSchema.attributes?.h5 || []), 'align'],
    h6: [...(defaultSchema.attributes?.h6 || []), 'align'],
    td: [...(defaultSchema.attributes?.td || []), 'align'],
    th: [...(defaultSchema.attributes?.th || []), 'align'],
    img: [...(defaultSchema.attributes?.img || []), 'align', 'width', 'height'],
  },
}

const TAB_KEYS = [
  'readme',
  'provides',
  'versions',
  'dependencies',
  'dependents',
  'security',
] as const
type TabKey = (typeof TAB_KEYS)[number]

const TAB_LABELS: Record<TabKey, string> = {
  readme: 'Readme',
  provides: 'Provides',
  versions: 'Versions',
  dependencies: 'Dependencies',
  dependents: 'Dependents',
  security: 'Security',
}

interface ExtensionTabsProps {
  extension: Extension
  dependents: Extension[]
  readmeContent: string | null
  manifest: ExtensionManifest | null
}

/* ─── Tab Bar ──────────────────────────────────────────── */
export const ExtensionTabs: React.FC<ExtensionTabsProps> = ({
  extension,
  dependents,
  readmeContent,
  manifest,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as TabKey
      if (TAB_KEYS.includes(hash)) return hash
    }
    return 'readme'
  })

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace('#', '') as TabKey
      if (TAB_KEYS.includes(hash)) setActiveTab(hash)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <div>
      {/* Tab navigation */}
      <nav className="flex flex-col sm:flex-row sm:border-b" role="tablist">
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
            className={`tab-button px-4 py-2 text-sm font-medium transition-colors text-left ${
              activeTab === key
                ? 'border-l-4 sm:border-l-0 sm:border-b-2 border-sk-primary text-sk-primary bg-gray-50 sm:bg-transparent'
                : 'border-l-4 sm:border-l-0 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 sm:hover:border-b-2'
            }`}
          >
            {TAB_LABELS[key]}
          </button>
        ))}
      </nav>

      {/* Tab panels */}
      <div className="py-4">
        {activeTab === 'readme' && (
          <ReadmePanel extension={extension} readmeContent={readmeContent} />
        )}
        {activeTab === 'provides' && (
          <ProvidesPanel manifest={manifest} extension={extension} />
        )}
        {activeTab === 'versions' && <VersionsPanel extension={extension} />}
        {activeTab === 'dependencies' && (
          <DependenciesPanel extension={extension} manifest={manifest} />
        )}
        {activeTab === 'dependents' && (
          <DependentsPanel dependents={dependents} />
        )}
        {activeTab === 'security' && <SecurityPanel extension={extension} />}
      </div>
    </div>
  )
}

/* ─── Provides Panel ───────────────────────────────────── */
const ProvidesPanel: React.FC<{
  manifest: ExtensionManifest | null
  extension: Extension
}> = ({ manifest, extension }) => {
  const hasCommands = manifest && manifest.commands.length > 0
  const hasHooks = manifest && manifest.hooks.length > 0
  const hasConfig = manifest && manifest.config.length > 0
  const hasManifestDetail = hasCommands || hasHooks || hasConfig

  if (!hasManifestDetail) {
    return (
      <div className="space-y-4">
        <div className="flex gap-6">
          <div className="flex items-center gap-2 text-gray-700">
            <FontAwesomeIcon icon={faTerminal} className="text-sk-primary" />
            <span>
              <strong>{extension.provides.commands}</strong> command
              {extension.provides.commands !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <FontAwesomeIcon icon={faBolt} className="text-sk-primary" />
            <span>
              <strong>{extension.provides.hooks}</strong> hook
              {extension.provides.hooks !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-400">
          Detailed manifest data is not available for this extension.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Commands provided */}
      {hasCommands && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faTerminal} className="text-sk-primary" />
            Commands ({manifest!.commands.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4 font-medium">Command</th>
                  <th className="py-2 pr-4 font-medium">Description</th>
                  <th className="py-2 font-medium">File</th>
                </tr>
              </thead>
              <tbody>
                {manifest!.commands.map((cmd) => (
                  <tr
                    key={cmd.name}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-2 pr-4">
                      <code className="text-xs font-mono text-sk-primary-dark">
                        {cmd.name}
                      </code>
                      {cmd.aliases && cmd.aliases.length > 0 && (
                        <div className="mt-0.5">
                          {cmd.aliases.map((alias) => (
                            <span
                              key={alias}
                              className="inline-block mr-1 text-[10px] font-mono text-gray-400 bg-gray-100 rounded px-1"
                            >
                              {alias}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {cmd.description}
                    </td>
                    <td className="py-2 font-mono text-xs text-gray-400">
                      {cmd.file}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hooks */}
      {hasHooks && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faBolt} className="text-sk-primary" />
            Hooks ({manifest!.hooks.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4 font-medium">Event</th>
                  <th className="py-2 pr-4 font-medium">Command</th>
                  <th className="py-2 pr-4 font-medium">Description</th>
                  <th className="py-2 font-medium">Required</th>
                </tr>
              </thead>
              <tbody>
                {manifest!.hooks.map((hook) => (
                  <tr
                    key={hook.event}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-2 pr-4">
                      <code className="text-xs font-mono text-purple-700 bg-purple-50 rounded px-1.5 py-0.5">
                        {hook.event}
                      </code>
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-gray-600">
                      {hook.command}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {hook.description}
                    </td>
                    <td className="py-2">
                      {hook.optional ? (
                        <span className="text-gray-400 text-xs">Optional</span>
                      ) : (
                        <span className="text-red-600 text-xs font-medium">
                          Required
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Config files */}
      {hasConfig && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faGear} className="text-sk-primary" />
            Configuration Files
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4 font-medium">File</th>
                  <th className="py-2 pr-4 font-medium">Description</th>
                  <th className="py-2 font-medium">Required</th>
                </tr>
              </thead>
              <tbody>
                {manifest!.config.map((cfg) => (
                  <tr
                    key={cfg.name}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-2 pr-4 font-mono text-xs">{cfg.name}</td>
                    <td className="py-2 pr-4 text-gray-600">
                      {cfg.description}
                    </td>
                    <td className="py-2">
                      {cfg.required ? (
                        <span className="text-red-600 text-xs font-medium">
                          Required
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Optional</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Readme Panel ─────────────────────────────────────── */
const ReadmePanel: React.FC<{
  extension: Extension
  readmeContent: string | null
}> = ({ extension, readmeContent }) => {
  const repoUrl = extension.repository?.replace(/\/$/, '') || ''

  if (readmeContent) {
    return (
      <div className="prose prose-sm max-w-none prose-headings:border-b prose-headings:pb-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
          components={{
            img: ({ src, alt, ...props }) => {
              let resolvedSrc = typeof src === 'string' ? src : ''
              if (resolvedSrc && !resolvedSrc.startsWith('http')) {
                resolvedSrc = `${repoUrl}/raw/main/${resolvedSrc.replace(/^\.?\//, '')}`
              }
              return (
                <img
                  src={resolvedSrc}
                  alt={typeof alt === 'string' ? alt : ''}
                  loading="lazy"
                  {...props}
                />
              )
            },
            a: ({ href, children, ...props }) => {
              let resolvedHref = typeof href === 'string' ? href : ''
              if (
                resolvedHref &&
                !resolvedHref.startsWith('http') &&
                !resolvedHref.startsWith('#')
              ) {
                resolvedHref = `${repoUrl}/blob/main/${resolvedHref.replace(/^\.?\//, '')}`
              }
              return (
                <a href={resolvedHref} {...props}>
                  {children}
                </a>
              )
            },
          }}
        >
          {readmeContent}
        </ReactMarkdown>
      </div>
    )
  }

  // Fallback when README could not be fetched
  const readmeUrl =
    extension.documentation ||
    (repoUrl ? `${repoUrl}/blob/main/README.md` : null)

  return (
    <div className="prose max-w-none">
      <p className="text-gray-700 text-base mb-4">{extension.description}</p>
      {readmeUrl && (
        <a
          href={readmeUrl}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sk-primary bg-opacity-10 text-sk-primary hover:bg-opacity-20 rounded-md transition-colors text-sm font-medium"
        >
          Read full documentation &rarr;
        </a>
      )}
    </div>
  )
}

/* ─── Versions Panel ───────────────────────────────────── */
const VersionsPanel: React.FC<{ extension: Extension }> = ({ extension }) => {
  const displayVersion = extension.releaseVersion || extension.version
  const displayDate = extension.releasePublishedAt || extension.updated_at
  const isFromRelease = !!extension.releaseVersion

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="py-2 pr-4 font-medium">Version</th>
            <th className="py-2 pr-4 font-medium">Released</th>
            <th className="py-2 pr-4 font-medium">Source</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-3 pr-4">
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium">{displayVersion}</span>
                <Badges verified={extension.verified} />
              </div>
            </td>
            <td className="py-3 pr-4 text-gray-600" suppressHydrationWarning>
              {format(parseISO(displayDate), 'MMM d, yyyy')}
              <span className="text-gray-400 ml-1" suppressHydrationWarning>
                (
                {formatDistance(parseISO(displayDate), new Date(), {
                  addSuffix: true,
                })}
                )
              </span>
            </td>
            <td className="py-3 pr-4">
              {isFromRelease ? (
                <span className="text-[11px] text-green-700 bg-green-50 rounded-full px-2 py-0.5 font-medium">
                  GitHub Release
                </span>
              ) : (
                <span className="text-[11px] text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 font-medium">
                  Catalog
                </span>
              )}
            </td>
            <td className="py-3 text-right">
              {extension.changelog && (
                <a
                  href={extension.changelog}
                  className="text-link-color hover:text-link-color-hover text-xs"
                >
                  Changelog
                </a>
              )}
            </td>
          </tr>
          {isFromRelease && extension.version !== extension.releaseVersion && (
            <tr className="border-b border-gray-100 hover:bg-gray-50 text-gray-400">
              <td className="py-3 pr-4">
                <span className="font-mono">{extension.version}</span>
              </td>
              <td className="py-3 pr-4" suppressHydrationWarning>
                {format(parseISO(extension.updated_at), 'MMM d, yyyy')}
              </td>
              <td className="py-3 pr-4">
                <span className="text-[11px] text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 font-medium">
                  Catalog
                </span>
              </td>
              <td className="py-3"></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Dependencies Panel ───────────────────────────────── */
const DependenciesPanel: React.FC<{
  extension: Extension
  manifest: ExtensionManifest | null
}> = ({ extension, manifest }) => {
  const hasExtensions =
    extension.requires.extensions && extension.requires.extensions.length > 0
  const hasTools =
    extension.requires.tools && extension.requires.tools.length > 0
  const hasRequiredCommands = manifest && manifest.requiredCommands.length > 0

  return (
    <div className="space-y-6">
      {/* SpecKit version requirement */}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sk-primary bg-opacity-10 px-3 py-1">
        <FontAwesomeIcon icon={faCube} className="text-sk-primary text-xs" />
        <span className="text-sm font-medium text-sk-primary">SpecKit</span>
        <code className="text-sm font-mono font-semibold text-sk-primary-dark">
          {extension.requires.speckit_version}
        </code>
      </span>

      {/* Extension dependencies */}
      {hasExtensions && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faPuzzlePiece} className="text-sk-primary" />
            Required Extensions
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4 font-medium">Extension</th>
                <th className="py-2 pr-4 font-medium">Version</th>
                <th className="py-2 font-medium">Required</th>
              </tr>
            </thead>
            <tbody>
              {extension.requires.extensions!.map((dep) => (
                <tr
                  key={dep.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-2 pr-4">
                    <Link
                      href={`/${dep.id}`}
                      className="font-mono text-link-color hover:text-link-color-hover"
                    >
                      {dep.id}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-gray-600">
                    {dep.version || 'any'}
                  </td>
                  <td className="py-2">
                    {dep.required ? (
                      <span className="text-red-600 text-xs font-medium">
                        Required
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Optional</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Required commands */}
      {hasRequiredCommands && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faTerminal} className="text-sk-primary" />
            Required Commands
          </h3>
          <div className="flex flex-wrap gap-2">
            {manifest!.requiredCommands.map((cmd) => (
              <code
                key={cmd}
                className="text-xs font-mono text-sk-primary-dark bg-gray-50 border border-gray-200 rounded px-2 py-1"
              >
                {cmd}
              </code>
            ))}
          </div>
        </div>
      )}

      {/* Tool dependencies */}
      {hasTools && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Required Tools
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4 font-medium">Tool</th>
                <th className="py-2 pr-4 font-medium">Version</th>
                <th className="py-2 font-medium">Required</th>
              </tr>
            </thead>
            <tbody>
              {extension.requires.tools!.map((tool) => (
                <tr
                  key={tool.name}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-2 pr-4 font-mono">{tool.name}</td>
                  <td className="py-2 pr-4 text-gray-600">
                    {tool.version || 'any'}
                  </td>
                  <td className="py-2">
                    {tool.required ? (
                      <span className="text-red-600 text-xs font-medium">
                        Required
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Optional</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── Dependents Panel ─────────────────────────────────── */
const DependentsPanel: React.FC<{ dependents: Extension[] }> = ({
  dependents,
}) => {
  if (dependents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm">No known dependents.</p>
      </div>
    )
  }

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="py-2 pr-4 font-medium">Extension</th>
            <th className="py-2 pr-4 font-medium">Version</th>
            <th className="py-2 font-medium">Author</th>
          </tr>
        </thead>
        <tbody>
          {dependents.map((dep) => (
            <tr
              key={dep.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="py-2 pr-4">
                <Link
                  href={`/${dep.id}`}
                  className="text-link-color hover:text-link-color-hover font-medium"
                >
                  {dep.name}
                </Link>
              </td>
              <td className="py-2 pr-4 font-mono text-gray-600">
                {dep.version}
              </td>
              <td className="py-2 text-gray-600">{dep.author}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Security Panel ───────────────────────────────────── */
const SecurityPanel: React.FC<{ extension: Extension }> = ({ extension }) => {
  const isGitHub = extension.repository?.includes('github.com')
  const repoUrl = extension.repository?.replace(/\/$/, '')

  return (
    <div>
      <div className="flex items-start gap-3 p-4 rounded-md bg-gray-50">
        <FontAwesomeIcon
          icon={extension.verified ? faCheckCircle : faExclamationTriangle}
          className={`mt-0.5 ${extension.verified ? 'text-green-600' : 'text-yellow-500'}`}
        />
        <div>
          <h3 className="font-semibold text-sm">
            {extension.verified ? 'Verified Extension' : 'Community Extension'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {extension.verified
              ? 'This extension has been reviewed by the catalog maintainers for quality and compatibility.'
              : 'This extension is independently maintained by its author(s). The catalog maintainers have not verified this extension. Use at your own discretion.'}
          </p>
          {repoUrl && (
            <div className="flex items-center gap-3 mt-3 text-sm">
              {isGitHub && (
                <a
                  href={`${repoUrl}/issues`}
                  className="inline-flex items-center gap-1.5 text-link-color hover:text-link-color-hover"
                >
                  <FontAwesomeIcon icon={faBug} className="w-3.5" />
                  Report Issue
                </a>
              )}
              <a
                href={repoUrl}
                className="inline-flex items-center gap-1.5 text-link-color hover:text-link-color-hover"
              >
                <FontAwesomeIcon icon={faCode} className="w-3.5" />
                View Source
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
