import type { NextPage } from 'next'
import Head from 'next/head'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { ExtensionCard } from '../components/ExtensionCard'
import {
  listExtensions,
  enrichExtensionsWithReleases,
  Extension,
} from '../data/extensions'
import { GetStaticProps } from 'next'

interface AllExtensionsProps {
  extensions: Extension[]
}

const AllExtensions: NextPage<AllExtensionsProps> = ({ extensions }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>All Extensions - SpecKit Extensions</title>
        <meta
          name="description"
          content="Browse all SpecKit community extensions"
        />
      </Head>

      <Header />
      <main className="m-4 flex-1">
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-2xl font-bold mb-6">
            All Extensions
            <span className="text-gray-500 font-normal text-lg ml-2">
              ({extensions.length})
            </span>
          </h1>
          {extensions.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {extensions.map((ext) => (
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
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const extensions = await listExtensions()
  const enriched = await enrichExtensionsWithReleases(extensions)

  return {
    props: {
      extensions: enriched,
    },
  }
}

export default AllExtensions
