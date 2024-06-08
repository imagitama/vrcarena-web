import { useEffect, useState, useRef } from 'react'
import createAlgoliaSearchClient, {
  SearchClient,
  SearchIndex,
} from 'algoliasearch'
import { Hit } from '@algolia/client-search'
import { AssetCategory } from '../modules/assets'

export const Indexes = {
  Assets: `${process.env.NODE_ENV === 'development' ? 'dev' : 'prod'}_ASSETS`,
}

const appId = process.env.REACT_APP_ALGOLIA_APP_ID || ''
const apiKey = process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY || ''

let client: SearchClient

interface AlgoliaAssetRecord {
  title: string
  // display only
  slug: string
  thumbnailUrl: string
  isAdult: boolean
  category: string // AssetCategory
  species: string[]
  // joined data
  authorName: string
  speciesNames: string[]
  // searchable only
  description: string
}

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

        const { hits } = await indexRef.current.search<AlgoliaAssetRecord>(
          keywords,
          {
            filters,
            offset: 0,
            length: limit,
          }
        )

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
