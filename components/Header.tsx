import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCubes,
  faMagnifyingGlass,
  faPuzzlePiece,
  faSquareArrowUpRight,
} from '@fortawesome/free-solid-svg-icons'

interface HeaderProps {
  minHeight?: string
  showSearch?: boolean
}

export const DOCS_LINK = 'https://github.com/github/spec-kit#readme'
export const SUBMIT_EXTENSION_LINK =
  'https://github.com/github/spec-kit/blob/main/extensions/README.md'

export const Header: React.FC<HeaderProps> = ({
  minHeight = '100px',
  showSearch = true,
}) => {
  const router = useRouter()
  const [searchQueryInput, setSearchQueryInput] = useState<string>('')

  const handleSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.push({
      pathname: '/search',
      query: { ...router.query, q: searchQueryInput },
    })
  }

  const searchInput = useRef<HTMLInputElement>(null)

  return (
    <header>
      <nav
        style={{ minHeight: minHeight }}
        className="flex border-gray-200 px-2 sm:px-4 py-2.5 bg-sk-primary"
      >
        <div className="container flex flex-wrap justify-evenly gap-4 flex-col sm:flex-row items-center mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center cursor-pointer">
              <FontAwesomeIcon
                icon={faPuzzlePiece}
                className="text-white h-6 w-6"
              />
              <span className="self-center text-2xl font-normal whitespace-nowrap text-white cursor-pointer pl-2">
                SpecKit Extensions
              </span>
            </Link>
          </div>
          <div className="hidden lg:flex items-center w-full md:flex md:w-auto md:order-2">
            <ul className="hidden lg:flex flex-col items-center mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
              <li>
                <form
                  onSubmit={handleSubmitSearch}
                  onClick={() => searchInput.current!.focus()}
                  className="flex items-center justify-center gap-3 pr-4 pl-4 cursor-pointer border-2 border-white border-opacity-50 min-w-8 h-10 rounded-full group focus-within:border-opacity-80"
                >
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="text-white align-middle"
                  />
                  <input
                    ref={searchInput}
                    placeholder="Search"
                    className="bg-transparent transition-all w-16 group-focus-within:w-60 outline-0 text-white placeholder-white placeholder-opacity-50 group-focus-within:placeholder-opacity-10"
                    onChange={(e) => setSearchQueryInput(e.target.value)}
                  ></input>
                </form>
              </li>
              <li>
                <Link
                  href={'/all-extensions'}
                  className="text-white hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-gray-300 md:p-0"
                >
                  <FontAwesomeIcon icon={faCubes} className="mr-1" />
                  Browse
                </Link>
              </li>

              <span className="ml-10 h-1.5 w-1.5 bg-white opacity-50"></span>
              <li>
                <a
                  href={DOCS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2 pr-4 pl-3 text-white border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-gray-300 md:p-0"
                >
                  Documentation
                  <FontAwesomeIcon
                    icon={faSquareArrowUpRight}
                    className="translate-y-[-5px] translate-x-1 h-2"
                  />
                </a>
              </li>
              <li>
                <a
                  href={SUBMIT_EXTENSION_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2 pr-4 pl-3 text-white border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-gray-300 md:p-0"
                >
                  Submit Extension
                  <FontAwesomeIcon
                    icon={faSquareArrowUpRight}
                    className="translate-y-[-5px] translate-x-1 h-2"
                  />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}
