import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { SITE_URL } from '../lib/seo'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { GetStaticProps } from 'next'
import { buildSearchIndex, SearchIndexEntry } from '../data/extensions'
import Fuse from 'fuse.js'
import { ExtensionCard } from '../components/ExtensionCard'

interface SearchPageProps {
  searchIndex: SearchIndexEntry[]
}

const Search: NextPage<SearchPageProps> = ({ searchIndex }) => {
  const [searchResults, setSearchResults] = useState<SearchIndexEntry[]>([])

  const router = useRouter()
  const searchQuery = router.query.q

  const getSearchQuery = (): string | null => {
    if (!searchQuery || typeof searchQuery !== 'string') {
      return null
    }
    return searchQuery
  }

  const [searchQueryInput, setSearchQueryInput] = useState<string>(
    getSearchQuery() || ''
  )

  const fuseIndex = new Fuse(searchIndex, {
    includeScore: true,
    threshold: 0.4,
    keys: ['name', 'description', 'tags', 'author', 'id'],
  })

  useEffect(() => {
    if (!searchQuery || typeof searchQuery !== 'string') {
      return
    }
    const results = fuseIndex.search(searchQuery)
    setSearchResults(results.map((n) => n.item))
  }, [searchQuery])
  useEffect(() => {
    setSearchQueryInput(getSearchQuery() || '')
  }, [searchQuery])

  const handleSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.push({
      pathname: '/search',
      query: { ...router.query, q: searchQueryInput },
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NextSeo
        title="Search Extensions"
        description="Search the SpecKit community extensions catalog."
        canonical={`${SITE_URL}/search`}
        noindex={true}
        nofollow={true}
      />
      <Header />
      <main className="m-4 l:m-0 flex-1">
        <div className="max-w-4xl w-4xl mx-auto mt-8 flex flex-col items-center">
          <form onSubmit={handleSubmitSearch} className="contents">
            <input
              type="text"
              id="search-navbar"
              autoFocus
              className="my-6 h-12 block p-2 pl-10 w-full max-w-xl text-gray-900 bg-white rounded-lg border border-gray-300 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search for extensions..."
              value={searchQueryInput}
              onChange={(e) => setSearchQueryInput(e.target.value)}
            />
          </form>
          <div className="w-full max-w-4xl">
            <h1 className="font-bold text-lg">
              Search results
              {getSearchQuery() && searchResults && (
                <span className="text-gray-600 font-normal ml-2">
                  ({searchResults.length}{' '}
                  {searchResults.length === 1 ? 'extension' : 'extensions'})
                </span>
              )}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              {searchResults && searchResults.length ? (
                searchResults.map((ext) => (
                  <ExtensionCard
                    key={ext.id}
                    id={ext.id}
                    name={ext.name}
                    description={ext.description}
                    author={ext.author}
                    version={ext.version}
                    tags={ext.tags}
                    updatedAt={ext.updatedAt}
                    verified={ext.verified}
                    showUpdatedAt={false}
                  />
                ))
              ) : (
                <div className="text-gray-600">
                  {getSearchQuery() ? (
                    <p>
                      No results for &quot;
                      <span className="text-black">{router.query.q}</span>
                      &quot;. Try a different search term.
                    </p>
                  ) : (
                    <p>Enter a search term to find extensions.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const searchIndex = await buildSearchIndex()

  return {
    props: {
      searchIndex,
    },
  }
}

export default Search
