import React from 'react'
import Link from 'next/link'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { Badges } from './Badges'

export interface ExtensionCardProps {
  id: string
  name: string
  description: string
  author: string
  version: string
  releaseVersion?: string
  tags: string[]
  updatedAt: string
  verified: boolean
  showUpdatedAt?: boolean
  stars?: number
}

export const ExtensionCard: React.FC<ExtensionCardProps> = ({
  id,
  name,
  version,
  releaseVersion,
  updatedAt,
  verified,
  showUpdatedAt = true,
  stars,
}) => {
  const timeAgo = (() => {
    try {
      return formatDistanceToNow(parseISO(updatedAt), { addSuffix: true })
    } catch {
      return ''
    }
  })()

  return (
    <Link href={`/${id}`}>
      <div className="w-full h-24 border rounded flex flex-col items-center justify-center shadow-sm hover:shadow-lg">
        <div className="w-full p-4 flex justify-between">
          <div>
            <div className="font-bold">{name}</div>
            <div className="flex items-center gap-2">
              {releaseVersion || version}
              <Badges verified={verified} />
            </div>
          </div>
          <div className="flex flex-col items-end justify-between">
            {stars != null && (
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <svg
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                </svg>
                {stars}
              </div>
            )}
            {showUpdatedAt && timeAgo && (
              <div className="text-gray-500" suppressHydrationWarning>
                updated {timeAgo}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
