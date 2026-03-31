import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

const SPECKIT_REPO_LINK = 'https://github.com/github/spec-kit'
const CATALOG_UI_REPO_LINK = 'https://github.com/speckit-community/extensions'

const About: NextPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>About This Catalog | SpecKit Extensions</title>
        <meta
          name="description"
          content="Learn about the SpecKit Community Extensions Catalog, how extensions are managed, and how to report issues."
        />
      </Head>

      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto mt-8 px-4 pb-12">
          <h1 className="text-3xl font-bold mb-6">About This Catalog</h1>

          <div className="space-y-8">
            {/* What is Spec Kit? */}
            <section>
              <h2 className="text-xl font-semibold mb-2">What is Spec Kit?</h2>
              <p className="text-gray-700">
                Spec Kit is a specification-driven development toolkit created
                and maintained by{' '}
                <a
                  href={SPECKIT_REPO_LINK}
                  className="text-link-color hover:text-link-color-hover underline"
                >
                  GitHub, Inc
                </a>
                . It helps teams define, plan, and implement software features
                through structured specifications, implementation plans, and
                task breakdowns.
              </p>
            </section>

            {/* What are community extensions? */}
            <section>
              <h2 className="text-xl font-semibold mb-2">
                What are community extensions?
              </h2>
              <p className="text-gray-700">
                Community extensions are independently developed add-ons for
                Spec Kit created by community members. They extend Spec Kit with
                additional functionality such as custom templates, workflows,
                integrations, and tooling. Each extension is maintained by its
                author(s).{' '}
                <strong>
                  Users should review an extension&apos;s source code and
                  documentation before installing it.
                </strong>
              </p>
            </section>

            {/* Verified vs. Community */}
            <section>
              <h2 className="text-xl font-semibold mb-2">
                What is the difference between verified and community
                extensions?
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>Verified Extensions</strong> have been reviewed by the
                  catalog maintainers for quality and compatibility.
                </p>
                <p>
                  <strong>Community Extensions</strong> have not yet been
                  reviewed. They are independently maintained and should be
                  evaluated by users before use.
                </p>
              </div>
            </section>

            {/* How to report issues */}
            <section>
              <h2 className="text-xl font-semibold mb-2">
                How do I report issues?
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>Website or catalog issues</strong> (e.g., broken
                  pages, incorrect data, UI problems): Open an issue on the{' '}
                  <a
                    href={`${CATALOG_UI_REPO_LINK}/issues`}
                    className="text-link-color hover:text-link-color-hover underline"
                  >
                    catalog repository
                  </a>
                  .
                </p>
                <p>
                  <strong>Extension-specific issues</strong> (e.g., bugs in an
                  extension, feature requests): Contact the extension author
                  directly. You can find the author&apos;s repository link on
                  the extension&apos;s detail page — use the &ldquo;Report
                  Issue&rdquo; link in the sidebar or Security tab to navigate
                  to their issue tracker.
                </p>
              </div>
            </section>

            {/* GitHub affiliation */}
            <section>
              <h2 className="text-xl font-semibold mb-2">
                Is this website affiliated with GitHub?
              </h2>
              <p className="text-gray-700">
                No. This website is a community-maintained catalog of Spec Kit
                extensions. It is not hosted, maintained, or affiliated with
                GitHub, Inc. &ldquo;Spec Kit&rdquo; is a project of GitHub, Inc.
                but this catalog website is independently operated and is not
                endorsed by GitHub, Inc.
              </p>
            </section>

            {/* Useful links */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Useful Links</h2>
              <ul className="list-disc list-inside space-y-1.5 text-gray-700">
                <li>
                  <a
                    href={SPECKIT_REPO_LINK}
                    className="text-link-color hover:text-link-color-hover underline"
                  >
                    Spec Kit Repository
                  </a>{' '}
                  — The official Spec Kit project on GitHub
                </li>
                <li>
                  <a
                    href={CATALOG_UI_REPO_LINK}
                    className="text-link-color hover:text-link-color-hover underline"
                  >
                    Catalog Source Code
                  </a>{' '}
                  — The source code for this website
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-link-color hover:text-link-color-hover underline"
                  >
                    Browse Extensions
                  </Link>{' '}
                  — Explore the full catalog of community extensions
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <div className="flex-grow" />
      <Footer />
    </div>
  )
}

export default About
