import type { NextPage } from 'next'
import Head from 'next/head'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import {
  buildSearchIndex,
  getRecentlyUpdated,
  getTopExtensionsByStars,
  enrichExtensionsWithReleases,
  SearchIndexEntry,
  Extension,
} from '../data/extensions'
import { ExtensionCard } from '../components/ExtensionCard'
import { GetStaticProps } from 'next'

interface HomePageProps {
  searchIndex: SearchIndexEntry[]
  recentExtensions: Extension[]
  featuredExtensions: Extension[]
}

const Home: NextPage<HomePageProps> = ({ searchIndex, recentExtensions, featuredExtensions }) => {
  const router = useRouter()
  const [searchQueryInput, setSearchQueryInput] = useState<string>('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  const handleSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.push({
      pathname: '/search',
      query: { ...router.query, q: searchQueryInput },
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>SpecKit Extensions</title>
        <link rel="icon" href="/favicon.webp" />
      </Head>

      <Header />
      <main className="m-4 l:m-0 flex-1">
        <div className="max-w-4xl w-4xl mx-auto mt-8 flex flex-col items-center">
          <form onSubmit={handleSubmitSearch} className="contents">
            <input
              ref={searchRef}
              type="text"
              id="search-navbar"
              className="my-6 h-12 block p-2 pl-10 w-full max-w-xl text-gray-900 bg-white rounded-lg border border-gray-300 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Search ${searchIndex.length} extensions...`}
              onChange={(e) => setSearchQueryInput(e.target.value)}
            />
          </form>
          {searchIndex.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <p className="text-lg">No extensions in the catalog yet.</p>
              <p className="mt-2">
                Check back soon or{' '}
                <a
                  href="https://github.com/github/spec-kit/blob/main/extensions/README.md"
                  className="text-link-color hover:text-link-color-hover underline"
                >
                  submit an extension
                </a>
                .
              </p>
            </div>
          ) : (
            <div className="w-full max-w-4xl flex flex-col gap-8 md:grid md:grid-cols-2 md:flex-row">
              {featuredExtensions.length > 0 && (
                <div>
                  <h2 className="font-bold text-lg">Highlighted extensions</h2>
                  <div className="grid grid-cols-1 gap-8 mt-4">
                    {featuredExtensions.map((ext) => (
                      <ExtensionCard
                        key={ext.id}
                        id={ext.id}
                        name={ext.name}
                        description={ext.description}
                        author={ext.author}
                        version={ext.version}
                        releaseVersion={ext.releaseVersion}
                        tags={ext.tags}
                        updatedAt={ext.updated_at}
                        verified={ext.verified}
                        showUpdatedAt={false}
                        stars={ext.stars}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h2 className="font-bold text-lg">Recently updated</h2>
                <div className="grid grid-cols-1 gap-8 mt-4">
                  {recentExtensions.map((ext) => (
                    <ExtensionCard
                      key={ext.id}
                      id={ext.id}
                      name={ext.name}
                      description={ext.description}
                      author={ext.author}
                      version={ext.version}
                      releaseVersion={ext.releaseVersion}
                      tags={ext.tags}
                      updatedAt={ext.updated_at}
                      verified={ext.verified}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const [searchIndex, recentRaw, featuredRaw] = await Promise.all([
    buildSearchIndex(),
    getRecentlyUpdated(10),
    getTopExtensionsByStars(6),
  ])
  const [recentExtensions, featuredExtensions] = await Promise.all([
    enrichExtensionsWithReleases(recentRaw),
    enrichExtensionsWithReleases(featuredRaw),
  ])

  return {
    props: {
      searchIndex,
      recentExtensions,
      featuredExtensions,
    },
  }
}

export default Home
