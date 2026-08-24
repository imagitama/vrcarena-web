import { useEffect, useState, useRef } from 'react'
import { algoliasearch, type SearchClient } from 'algoliasearch'
import { Hit } from '@algolia/client-search'
import { AssetCategory } from '@/modules/assets'
import { AlgoliaAssetRecord } from '@/algolia'

export const Indexes = {
  Assets: `${process.env.NODE_ENV === 'development' ? 'dev' : 'prod'}_ASSETS`,
}

const appId = process.env.REACT_APP_ALGOLIA_APP_ID || ''
const apiKey = process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY || ''

let client: SearchClient

export interface AssetSearchResult {
  id: string
  title: string
  // display only
  slug: string
  thumbnailurl: string
  isadult: boolean
  category: AssetCategory
  species: string[]
  // joined data
  authorname: string
  speciesnames: string[]
  // searchable only
  description: string
}

const mapHitsToAssetSearchResults = (
  hits: Hit<AlgoliaAssetRecord>[]
): AssetSearchResult[] =>
  hits.map((hit) => ({
    id: hit.objectID,
    title: hit.title,
    // display only
    slug: hit.slug,
    thumbnailurl: hit.thumbnailUrl,
    isadult: hit.isAdult,
    category: hit.category as AssetCategory,
    species: hit.species,
    // joined data
    authorname: hit.authorName,
    speciesnames: hit.speciesNames,
    // searchable only
    description: hit.description,
  }))

interface AlgoliaApiError {
  name: string // ApiError
  message: string // "This operation cannot be processed, the application is blocked. Contact us to unblock it."
  status: number // 403
}

export enum ErrorCode {
  InvalidClient = 'invalid-client',
  ApiError = 'api-error',
  Unknown = 'unknown',
}

class InvalidClientError extends Error {}

export default <T>(
  indexName: string,
  keywords: string,
  filters?: string,
  limit?: number
): [boolean, null | ErrorCode, T[] | null] => {
  const [results, setResults] = useState<T[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | ErrorCode>(null)
  const timerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    async function doIt() {
      try {
        if (!client) {
          if (!appId || !apiKey) throw new InvalidClientError()

          client = algoliasearch(appId, apiKey)
        }

        if (!keywords) {
          return
        }

        setIsLoading(true)
        setLastErrorCode(null)

        console.debug(`useAlgoliaSearch searching with algolia`, {
          keywords,
          filters,
        })

        const { hits } = await client.searchSingleIndex<AlgoliaAssetRecord>({
          indexName,
          searchParams: {
            query: keywords,
            filters,
            offset: 0,
            length: limit,
          },
        })

        console.debug(`useAlgoliaSearch searching with algolia complete`, {
          hits,
        })

        // TODO: do generically
        const newResults = mapHitsToAssetSearchResults(hits) as unknown as T[]

        setResults(newResults)
        setIsLoading(false)
        setLastErrorCode(null)
      } catch (err) {
        console.error(err)
        setIsLoading(false)
        setLastErrorCode(
          err && (err as AlgoliaApiError).status
            ? ErrorCode.ApiError
            : err instanceof InvalidClientError
            ? ErrorCode.InvalidClient
            : ErrorCode.Unknown
        )
      }
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => doIt(), 500)
  }, [indexName, keywords, filters])

  return [isLoading, lastErrorCode, results]
}
