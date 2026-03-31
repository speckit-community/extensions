import React from 'react'
import Link from 'next/link'

const CATALOG_UI_REPO_LINK =
  'https://github.com/speckit-community/extensions'

export const Footer: React.FC = () => {
  return (
    <footer className="flex flex-col bg-sk-primary-dark text-white items-center justify-center gap-2 p-6 bottom-2">
      {/* Non-affiliation disclaimer */}
      <div className="text-center text-xs text-gray-300 max-w-2xl">
        This website is a community-maintained catalog of Spec Kit extensions.
        It is not hosted, maintained, or affiliated with GitHub, Inc. Extensions
        listed here are independently developed by community members.
      </div>

      {/* Trademark notice */}
      <div className="text-center text-xs text-gray-300 max-w-2xl">
        &ldquo;Spec Kit&rdquo; is a project of GitHub, Inc. This website is not
        affiliated with or endorsed by GitHub, Inc.
      </div>

      {/* Issue routing */}
      <div className="text-center text-xs text-gray-300 max-w-2xl">
        <strong>Website/Catalog issues:</strong>{' '}
        <a
          href={`${CATALOG_UI_REPO_LINK}/issues`}
          className="underline hover:text-gray-200"
        >
          Open an issue
        </a>
        {' · '}
        <strong>Extension issues:</strong> Contact the extension author via the
        repository link on the extension&apos;s detail page.
      </div>

      {/* About link */}
      <div className="text-center text-xs text-gray-300">
        <Link href="/about" className="underline hover:text-gray-200">
          About This Catalog
        </Link>
      </div>
    </footer>
  )
}
