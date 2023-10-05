import { useEffect, useState, useRef } from 'react'
import createAlgoliaSearchClient, {
  SearchClient,
  SearchIndex
} from 'algoliasearch'
import { Hit } from '@algolia/client-search'

export const Indexes = {
  Assets: `${process.env.NODE_ENV === 'development' ? 'dev' : 'prod'}_ASSETS`
}

const appId = process.env.REACT_APP_ALGOLIA_APP_ID || ''
const apiKey = process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY || ''

let client: SearchClient

interface AssetHit {
  title: string
  description: string
  thumbnailUrl: string
  isAdult: boolean
  category: string
}

export interface AssetSearchResult extends AssetHit {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  isAdult: boolean
  category: string
}

const mapHitsToAssetSearchResults = (hits: Hit<AssetHit>[]) =>
  hits.map(hit => ({
    ...hit,
    id: hit.objectID,
    objectID: undefined
  }))

export default (
  indexName: string,
  keywords: string,
  filters?: string,
  limit?: number
): [boolean, boolean, AssetSearchResult[] | null] => {
  const [results, setResults] = useState<AssetSearchResult[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isErrored, setIsErrored] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()
  const indexRef = useRef<SearchIndex>()

  useEffect(() => {
    if (!client) {
      client = createAlgoliaSearchClient(appId, apiKey)
    }

    if (!indexRef.current) {
      indexRef.current = client.initIndex(indexName)
    }

    async function doIt() {
      try {
        if (!indexRef.current) {
          throw new Error('No index')
        }

        if (!keywords) {
          return
        }

        setIsLoading(true)
        setIsErrored(false)

        console.debug(`Algolia Search`, keywords, filters)

        const { hits } = await indexRef.current.search<AssetHit>(keywords, {
          filters,
          offset: 0,
          length: limit
        })

        console.debug(`Algolia Search complete`, hits)

        const newResults = mapHitsToAssetSearchResults(hits)

        setResults(newResults)
        setIsLoading(false)
        setIsErrored(false)
      } catch (err) {
        console.error(err)
        setIsLoading(false)
        setIsErrored(true)
      }
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => doIt(), 500)
  }, [indexName, keywords, filters])

  return [isLoading, isErrored, results]
}
